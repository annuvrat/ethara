from pydantic import BaseModel, EmailStr, Field
from uuid import UUID

class CustomerBase(BaseModel):
    name: str = Field(..., min_length=1, description="Full name")
    email: EmailStr = Field(..., description="Unique email address")
    phone: str | None = Field(None, description="Phone number")

class CustomerCreate(CustomerBase):
    pass

class CustomerResponse(CustomerBase):
    id: UUID

    class Config:
        from_attributes = True
        orm_mode = True
        populate_by_name = True
