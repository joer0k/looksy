from pydantic import BaseModel, ConfigDict, Field
from datetime import datetime

class ClothingItemCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    category: str = Field(min_length=1, max_length=100)
    color: str = Field(min_length=1, max_length=100)
    season: str = Field(min_length=1, max_length=100)


class ClothingItemResponse(BaseModel):
    id: int
    name: str
    category: str
    color: str
    season: str
    user_id: int
    created_at: datetime
    updated_at: datetime
    image_url: str | None = None
    
    model_config = ConfigDict(from_attributes=True)

class ClothingItemUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=120)
    category: str | None = Field(default=None, min_length=1, max_length=50)
    color: str | None = Field(default=None, min_length=1, max_length=50)
    season: str | None = Field(default=None, min_length=1, max_length=50)
