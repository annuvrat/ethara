from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from uuid import UUID
from routes.dependencies import get_db
from schemas.product import ProductCreate, ProductUpdate, ProductResponse
from controllers.product_controller import (
    get_products_controller,
    get_product_by_id_controller,
    create_product_controller,
    update_product_controller,
    delete_product_controller
)

router = APIRouter(prefix="/products", tags=["Products"])

@router.post("", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
def create_product(
    product_data: ProductCreate,
    db: Session = Depends(get_db)
):
    return create_product_controller(db, product_data)

@router.get("", response_model=list[ProductResponse])
def get_products(
    db: Session = Depends(get_db)
):
    return get_products_controller(db)

@router.get("/{product_id}", response_model=ProductResponse)
def get_product(
    product_id: UUID,
    db: Session = Depends(get_db)
):
    return get_product_by_id_controller(db, product_id)

@router.put("/{product_id}", response_model=ProductResponse)
def update_product(
    product_id: UUID,
    product_data: ProductUpdate,
    db: Session = Depends(get_db)
):
    return update_product_controller(db, product_id, product_data)

@router.delete("/{product_id}", response_model=ProductResponse)
def delete_product(
    product_id: UUID,
    db: Session = Depends(get_db)
):
    return delete_product_controller(db, product_id)
