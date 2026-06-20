from sqlalchemy.orm import Session
from services import dashboard_service

def get_dashboard_summary_controller(db: Session):
    return dashboard_service.get_dashboard_summary(db)
