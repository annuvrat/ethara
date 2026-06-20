from sqlalchemy.orm import Session
from uuid import UUID
from fastapi import HTTPException, status
from models.customer import Customer
from schemas.customer import CustomerCreate, CustomerResponse

def get_customer(db: Session, customer_id: UUID) -> Customer:
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Customer with ID {customer_id} not found"
        )
    return customer

def get_customer_by_email(db: Session, email: str) -> Customer | None:
    return db.query(Customer).filter(Customer.email == email).first()

def get_customers(db: Session) -> list[Customer]:
    return db.query(Customer).all()

def create_customer(db: Session, customer_data: CustomerCreate) -> Customer:
    # Check if Email is unique
    existing_customer = get_customer_by_email(db, customer_data.email)
    if existing_customer:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Customer with email '{customer_data.email}' already exists"
        )
        
    db_customer = Customer(
        name=customer_data.name,
        email=customer_data.email,
        phone=customer_data.phone
    )
    db.add(db_customer)
    db.commit()
    db.refresh(db_customer)
    return db_customer

def delete_customer(db: Session, customer_id: UUID):
    db_customer = get_customer(db, customer_id)
    customer_data = CustomerResponse.model_validate(db_customer)
    db.delete(db_customer)
    db.commit()
    return customer_data
