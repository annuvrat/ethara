from sqlalchemy.orm import Session
from models.product import Product
from models.customer import Customer
from models.order import Order

def get_dashboard_summary(db: Session):
    total_products = db.query(Product).count()
    total_customers = db.query(Customer).count()
    total_orders = db.query(Order).count()
    
    # We define low stock as stock <= 10 units
    low_stock_products = db.query(Product).filter(Product.stock <= 10).all()
    
    return {
        "total_products": total_products,
        "total_customers": total_customers,
        "total_orders": total_orders,
        "low_stock_count": len(low_stock_products),
        "low_stock_products": low_stock_products
    }
