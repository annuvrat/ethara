from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from uuid import UUID
from routes.dependencies import get_db
from schemas.customer import CustomerCreate, CustomerResponse
from controllers.customer_controller import (
    get_customers_controller,
    get_customer_by_id_controller,
    create_customer_controller,
    delete_customer_controller
)

router = APIRouter(prefix="/customers", tags=["Customers"])

@router.post("", response_model=CustomerResponse, status_code=status.HTTP_201_CREATED)
def create_customer(
    customer_data: CustomerCreate,
    db: Session = Depends(get_db)
):
    return create_customer_controller(db, customer_data)

@router.get("", response_model=list[CustomerResponse])
def get_customers(
    db: Session = Depends(get_db)
):
    return get_customers_controller(db)

@router.get("/{customer_id}", response_model=CustomerResponse)
def get_customer(
    customer_id: UUID,
    db: Session = Depends(get_db)
):
    return get_customer_by_id_controller(db, customer_id)

@router.delete("/{customer_id}", response_model=CustomerResponse)
def delete_customer(
    customer_id: UUID,
    db: Session = Depends(get_db)
):
    return delete_customer_controller(db, customer_id)
