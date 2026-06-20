from sqlalchemy.orm import Session
from uuid import UUID
from fastapi import HTTPException, status
from models.product import Product
from schemas.product import ProductCreate, ProductUpdate, ProductResponse

def get_product(db: Session, product_id: UUID) -> Product:
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with ID {product_id} not found"
        )
    return product

def get_product_by_sku(db: Session, sku: str) -> Product | None:
    return db.query(Product).filter(Product.sku == sku).first()

def get_products(db: Session) -> list[Product]:
    return db.query(Product).all()

def create_product(db: Session, product_data: ProductCreate) -> Product:
    # Check if SKU is unique
    existing_product = get_product_by_sku(db, product_data.sku)
    if existing_product:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Product with SKU '{product_data.sku}' already exists"
        )
    
    db_product = Product(
        name=product_data.name,
        sku=product_data.sku,
        price=product_data.price,
        stock=product_data.stock
    )
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

def update_product(db: Session, product_id: UUID, product_data: ProductUpdate) -> Product:
    db_product = get_product(db, product_id)
    
    update_data = product_data.model_dump(exclude_unset=True)
    
    # If SKU is being updated, check that it's unique
    if "sku" in update_data and update_data["sku"] != db_product.sku:
        existing_product = get_product_by_sku(db, update_data["sku"])
        if existing_product:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Product with SKU '{update_data['sku']}' already exists"
            )
            
    for key, value in update_data.items():
        setattr(db_product, key, value)
        
    db.commit()
    db.refresh(db_product)
    return db_product

def delete_product(db: Session, product_id: UUID):
    db_product = get_product(db, product_id)
    product_data = ProductResponse.model_validate(db_product)
    db.delete(db_product)
    db.commit()
    return product_data
