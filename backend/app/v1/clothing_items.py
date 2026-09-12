import asyncio

from fastapi import APIRouter, status, Depends, HTTPException, File, UploadFile
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models import ClothingItem, User
from app.core.dependencies import get_current_active_user
from app.schemas.clothing_item import ClothingItemResponse, ClothingItemCreate, ClothingItemUpdate
from app.services.storage import upload_image, get_image_url


router = APIRouter(prefix='/items', tags=['items'])


ALLOWED_IMAGE_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
]

MAX_IMAGE_SIZE = 5 * 1024 * 1024  # 5 MB

def to_item_response(item: ClothingItem) -> ClothingItemResponse:
    response = ClothingItemResponse.model_validate(item)

    if item.image_key:
        response.image_url = get_image_url(item.image_key)

    return response

@router.post("/",response_model=ClothingItemResponse, status_code=status.HTTP_201_CREATED)
async def create_item(data: ClothingItemCreate,
                      current_user: User = Depends(get_current_active_user),
                      db: AsyncSession = Depends(get_db),
                      ) -> ClothingItemResponse:

    clothing_item = ClothingItem(
        **data.model_dump(),
        user_id=current_user.id,
    )

    db.add(clothing_item)
    await db.commit()
    await db.refresh(clothing_item)

    return to_item_response(clothing_item)

@router.get("/", response_model=list[ClothingItemResponse], status_code=status.HTTP_200_OK)
async def get_user_items(current_user: User = Depends(get_current_active_user),
                         db: AsyncSession = Depends(get_db),
                         category: str | None = None,
                         ) -> list[ClothingItemResponse]:

    query = select(ClothingItem).where(
        ClothingItem.user_id == current_user.id
    )

    if category is not None:
        query = query.where(ClothingItem.category == category)

    query = query.order_by(ClothingItem.created_at.desc())
    result = await db.scalars(query)

    return [to_item_response(item) for item in result.all()]


@router.get("/{item_id}", response_model=ClothingItemResponse, status_code=status.HTTP_200_OK)
async def get_item_by_id(item_id: int,
                         current_user: User = Depends(get_current_active_user),
                         db: AsyncSession = Depends(get_db),
                         ) -> ClothingItemResponse:
    item = await db.scalar(
        select(ClothingItem).where(
            ClothingItem.id == item_id,
            ClothingItem.user_id == current_user.id,
        )
    )

    if item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail="Item not found")

    return to_item_response(item)



@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_item(item_id: int,
                      current_user: User = Depends(get_current_active_user),
                      db: AsyncSession = Depends(get_db),
                      ) -> None:
    item = await db.scalar(
        select(ClothingItem).where(
            ClothingItem.id == item_id,
            ClothingItem.user_id == current_user.id,
        )
    )

    if item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail="Item not found",)

    await db.delete(item)
    await db.commit()


@router.patch("/{item_id}",response_model=ClothingItemResponse, status_code=status.HTTP_202_ACCEPTED)
async def update_item(item_id: int,
        data: ClothingItemUpdate,
                      current_user: User = Depends(get_current_active_user),
                      db: AsyncSession = Depends(get_db),
                      ) -> ClothingItemResponse:
    item = await db.scalar(
        select(ClothingItem).where(
            ClothingItem.id == item_id,
            ClothingItem.user_id == current_user.id,
        )
    )
    if item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail="Item not found",)

    update_data = data.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST,
                            detail="No data provided for update")

    for key, value in update_data.items():
        setattr(item, key, value)

    await db.commit()
    await db.refresh(item)

    return to_item_response(item)


@router.post("/{item_id}/image",response_model=ClothingItemResponse, status_code=status.HTTP_200_OK)
async def upload_item_image(item_id: int,
                            file: UploadFile = File(...),
                            current_user: User = Depends(get_current_active_user),
                            db: AsyncSession = Depends(get_db),
                            ) -> ClothingItemResponse:
    item = await db.scalar(
        select(ClothingItem).where(
            ClothingItem.id == item_id,
            ClothingItem.user_id == current_user.id,
        )
    )

    if item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail="Item not found",)

    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
                            detail="Unsupported media type",)

    content = await file.read(MAX_IMAGE_SIZE + 1)

    if not content:
        raise HTTPException(status_code=400, detail="Empty file")

    if len(content) > MAX_IMAGE_SIZE:
        raise HTTPException(status_code=status.HTTP_413_CONTENT_TOO_LARGE,
                            detail="Image too large",)

    object_key = await asyncio.to_thread(upload_image,
                                         content,
                                         file.filename or "image",
                                         file.content_type)

    item.image_key = object_key

    await db.commit()
    await db.refresh(item)

    return to_item_response(item)
