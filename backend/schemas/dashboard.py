from pydantic import BaseModel
from typing import List
from schemas.product import ProductResponse

class DashboardSummaryResponse(BaseModel):
    total_products: int
    total_customers: int
    total_orders: int
    low_stock_count: int
    low_stock_products: List[ProductResponse]
