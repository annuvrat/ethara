from sqlalchemy.orm import Session
from uuid import UUID
from schemas.customer import CustomerCreate
from services import customer_service

def get_customers_controller(db: Session):
    return customer_service.get_customers(db)

def get_customer_by_id_controller(db: Session, customer_id: UUID):
    return customer_service.get_customer(db, customer_id)

def create_customer_controller(db: Session, customer_data: CustomerCreate):
    return customer_service.create_customer(db, customer_data)

def delete_customer_controller(db: Session, customer_id: UUID):
    return customer_service.delete_customer(db, customer_id)
