import uuid
from sqlalchemy import Column, String, Uuid
from sqlalchemy.orm import relationship
from models.base import Base

class Customer(Base):
    __tablename__ = "customers"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False, index=True)
    phone = Column(String, nullable=True)

    # Relationships
    orders = relationship("Order", back_populates="customer", cascade="all, delete-orphan")
