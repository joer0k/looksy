
from fastapi import APIRouter, status, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models import ClothingItem, User
from app.core.dependencies import get_current_active_user
from app.schemas.clothing_item import ClothingItemResponse, ClothingItemCreate, ClothingItemUpdate
router = APIRouter(prefix='/items', tags=['items'])

@router.post("/",response_model=ClothingItemResponse, status_code=status.HTTP_201_CREATED)
async def create_item(data: ClothingItemCreate,
                      current_user: User = Depends(get_current_active_user),
                      db: AsyncSession = Depends(get_db),
                      ) -> ClothingItem:

    clothing_item = ClothingItem(
        **data.model_dump(),
        user_id=current_user.id,
    )

    db.add(clothing_item)
    await db.commit()
    await db.refresh(clothing_item)

    return clothing_item

@router.get("/", response_model=list[ClothingItemResponse], status_code=status.HTTP_200_OK)
async def get_user_items(current_user: User = Depends(get_current_active_user),
                         db: AsyncSession = Depends(get_db)
                         ) -> list[ClothingItem]:
    result = await db.scalars(
        select(ClothingItem)
        .where(ClothingItem.user_id == current_user.id)
        .order_by(ClothingItem.created_at.desc())
    )

    return list(result.all())


@router.get("/{item_id}", response_model=ClothingItemResponse, status_code=status.HTTP_200_OK)
async def get_item_by_id(item_id: int,
                         current_user: User = Depends(get_current_active_user),
                         db: AsyncSession = Depends(get_db),
                         ) -> ClothingItem:
    item = await db.scalar(
        select(ClothingItem).where(
            ClothingItem.id == item_id,
            ClothingItem.user_id == current_user.id,
        )
    )

    if item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                            detail="Item not found")

    return item



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


@router.patch("/{item_id}", status_code=status.HTTP_202_ACCEPTED)
async def update_item(item_id: int,
        data: ClothingItemUpdate,
                      current_user: User = Depends(get_current_active_user),
                      db: AsyncSession = Depends(get_db),
                      ) -> ClothingItem:
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

    return item