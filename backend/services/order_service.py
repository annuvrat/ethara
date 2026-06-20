from sqlalchemy.orm import Session
from uuid import UUID
from fastapi import HTTPException, status
from models.order import Order, OrderItem
from models.product import Product
from models.customer import Customer
from schemas.order import OrderCreate, OrderResponse

def get_order(db: Session, order_id: UUID) -> Order:
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Order with ID {order_id} not found"
        )
    return order

def get_orders(db: Session) -> list[Order]:
    return db.query(Order).all()

def create_order(db: Session, order_data: OrderCreate) -> Order:
    # 1. Validate customer existence
    customer = db.query(Customer).filter(Customer.id == order_data.customer_id).first()
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Customer with ID {order_data.customer_id} not found"
        )

    # 2. Validate product stock and gather pricing
    # To prevent duplicate product entries in the same order leading to race conditions or incorrect checks,
    # we can group requested items by product_id.
    grouped_items: dict[UUID, int] = {}
    for item in order_data.items:
        grouped_items[item.product_id] = grouped_items.get(item.product_id, 0) + item.quantity

    products_to_update: list[tuple[Product, int]] = []
    total_amount = 0.0

    for product_id, quantity in grouped_items.items():
        product = db.query(Product).filter(Product.id == product_id).first()
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product with ID {product_id} not found"
            )
        
        # Check stock sufficiency
        if product.stock < quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient stock for product '{product.name}' (SKU: {product.sku}). "
                       f"Available: {product.stock}, Requested: {quantity}."
            )
        
        total_amount += product.price * quantity
        products_to_update.append((product, quantity))

    # 3. Create the Order
    db_order = Order(
        customer_id=order_data.customer_id,
        total_amount=total_amount
    )
    db.add(db_order)
    db.flush()  # Generate db_order.id

    # 4. Create OrderItems and adjust product stock
    for product, quantity in products_to_update:
        # Create item
        db_item = OrderItem(
            order_id=db_order.id,
            product_id=product.id,
            quantity=quantity,
            price_at_order=product.price
        )
        db.add(db_item)
        
        # Deduct stock
        product.stock -= quantity

    db.commit()
    db.refresh(db_order)
    return db_order

def delete_order(db: Session, order_id: UUID):
    db_order = get_order(db, order_id)
    
    # Eagerly load relationship attributes into memory
    for item in db_order.items:
        _ = item.product
        
    order_data = OrderResponse.model_validate(db_order)
    
    # Restore product stock upon cancellation
    for item in db_order.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if product:
            product.stock += item.quantity
            
    db.delete(db_order)
    db.commit()
    return order_data
