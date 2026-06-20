from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from routes.dependencies import get_db
from schemas.dashboard import DashboardSummaryResponse
from controllers.dashboard_controller import get_dashboard_summary_controller

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/summary", response_model=DashboardSummaryResponse)
def get_dashboard_summary(
    db: Session = Depends(get_db)
):
    return get_dashboard_summary_controller(db)
