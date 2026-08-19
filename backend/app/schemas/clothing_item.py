from pydantic import BaseModel, ConfigDict, Field
from datetime import datetime

class ClothingItemCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    category: str = Field(min_length=1, max_length=100)
    color: str = Field(min_length=1, max_length=100)
    season: str = Field(min_length=1, max_length=100)
    image_url: str | None


class ClothingItemResponse(BaseModel):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)