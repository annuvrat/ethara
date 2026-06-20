from pydantic import BaseModel, Field
from uuid import UUID
from datetime import datetime
from typing import List
from schemas.product import ProductResponse

class OrderItemCreate(BaseModel):
    product_id: UUID = Field(..., description="UUID of the product")
    quantity: int = Field(..., gt=0, description="Quantity to order")

class OrderItemResponse(BaseModel):
    id: UUID
    product_id: UUID
    quantity: int
    price_at_order: float
    product: ProductResponse | None = None

    class Config:
        from_attributes = True
        orm_mode = True
        populate_by_name = True

class OrderCreate(BaseModel):
    customer_id: UUID = Field(..., description="UUID of the customer placing the order")
    items: List[OrderItemCreate] = Field(..., min_length=1, description="List of items in the order")

class OrderResponse(BaseModel):
    id: UUID
    customer_id: UUID
    total_amount: float
    created_at: datetime
    items: List[OrderItemResponse]

    class Config:
        from_attributes = True
        orm_mode = True
        populate_by_name = True
