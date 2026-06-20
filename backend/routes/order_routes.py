from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from uuid import UUID
from routes.dependencies import get_db
from schemas.order import OrderCreate, OrderResponse
from controllers.order_controller import (
    get_orders_controller,
    get_order_by_id_controller,
    create_order_controller,
    delete_order_controller
)

router = APIRouter(prefix="/orders", tags=["Orders"])

@router.post("", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def create_order(
    order_data: OrderCreate,
    db: Session = Depends(get_db)
):
    return create_order_controller(db, order_data)

@router.get("", response_model=list[OrderResponse])
def get_orders(
    db: Session = Depends(get_db)
):
    return get_orders_controller(db)

@router.get("/{order_id}", response_model=OrderResponse)
def get_order(
    order_id: UUID,
    db: Session = Depends(get_db)
):
    return get_order_by_id_controller(db, order_id)

@router.delete("/{order_id}", response_model=OrderResponse)
def delete_order(
    order_id: UUID,
    db: Session = Depends(get_db)
):
    return delete_order_controller(db, order_id)
