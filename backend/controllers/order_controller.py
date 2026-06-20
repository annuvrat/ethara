from sqlalchemy.orm import Session
from uuid import UUID
from schemas.order import OrderCreate
from services import order_service

def get_orders_controller(db: Session):
    return order_service.get_orders(db)

def get_order_by_id_controller(db: Session, order_id: UUID):
    return order_service.get_order(db, order_id)

def create_order_controller(db: Session, order_data: OrderCreate):
    return order_service.create_order(db, order_data)

def delete_order_controller(db: Session, order_id: UUID):
    return order_service.delete_order(db, order_id)
