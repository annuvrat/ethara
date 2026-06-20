import uuid
from sqlalchemy import Column, String, Float, Integer, Uuid, CheckConstraint
from sqlalchemy.orm import relationship
from models.base import Base

class Product(Base):
    __tablename__ = "products"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    sku = Column(String, unique=True, nullable=False, index=True)
    price = Column(Float, nullable=False)
    stock = Column(Integer, default=0, nullable=False)

    __table_args__ = (
        CheckConstraint("stock >= 0", name="positive_stock"),
        CheckConstraint("price >= 0", name="positive_price"),
    )

    # Relationships
    order_items = relationship("OrderItem", back_populates="product", cascade="all, delete-orphan")
