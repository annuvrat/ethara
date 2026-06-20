from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import engine
from models.base import Base

# Import all models to ensure SQLAlchemy registers them before creating tables
from models.product import Product
from models.customer import Customer
from models.order import Order, OrderItem

# Import routers
from routes.product_routes import router as product_router
from routes.customer_routes import router as customer_router
from routes.order_routes import router as order_router
from routes.dashboard_routes import router as dashboard_router

app = FastAPI(title="Inventory & Order Management System API")

# Configure CORS to allow frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Automatically create all registered tables on startup
Base.metadata.create_all(bind=engine)

@app.get("/")
def default():
    return {"message": "Welcome to the Inventory & Order Management API!"}

# Include routers
app.include_router(product_router)
app.include_router(customer_router)
app.include_router(order_router)
app.include_router(dashboard_router)