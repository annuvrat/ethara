from pydantic import BaseModel, Field
from uuid import UUID

class ProductBase(BaseModel):
    name: str = Field(..., min_length=1, description="Product name")
    sku: str = Field(..., min_length=1, description="Unique product SKU/code")
    price: float = Field(..., ge=0.0, description="Product price (cannot be negative)")
    stock: int = Field(..., ge=0, description="Quantity in stock (cannot be negative)")

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: str | None = Field(None, min_length=1)
    sku: str | None = Field(None, min_length=1)
    price: float | None = Field(None, ge=0.0)
    stock: int | None = Field(None, ge=0)

class ProductResponse(ProductBase):
    id: UUID

    class Config:
        from_attributes = True
        orm_mode = True  # Support both Pydantic v1 and v2 just in case
        populate_by_name = True
