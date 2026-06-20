from sqlalchemy.orm import Session
from uuid import UUID
from schemas.product import ProductCreate, ProductUpdate
from services import product_service

def get_products_controller(db: Session):
    return product_service.get_products(db)

def get_product_by_id_controller(db: Session, product_id: UUID):
    return product_service.get_product(db, product_id)

def create_product_controller(db: Session, product_data: ProductCreate):
    return product_service.create_product(db, product_data)

def update_product_controller(db: Session, product_id: UUID, product_data: ProductUpdate):
    return product_service.update_product(db, product_id, product_data)

def delete_product_controller(db: Session, product_id: UUID):
    return product_service.delete_product(db, product_id)
