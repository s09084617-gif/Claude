from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .auth import get_current_user
from .database import get_db
from .models import ProgressLog, User
from .schemas import ProgressLogCreate, ProgressLogResponse

router = APIRouter()


@router.post(
    "/logs",
    response_model=ProgressLogResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a progress log entry",
)
def create_progress_log(
    body: ProgressLogCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    log = ProgressLog(
        user_id=current_user.id,
        logged_at=body.logged_at or datetime.utcnow(),
        weight_kg=body.weight_kg,
        pbf=body.pbf,
        smm_kg=body.smm_kg,
        notes=body.notes,
        metrics=body.metrics,
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    return log


@router.get(
    "/logs",
    response_model=List[ProgressLogResponse],
    summary="List progress logs for the current user",
)
def list_progress_logs(
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    logs = (
        db.query(ProgressLog)
        .filter(ProgressLog.user_id == current_user.id)
        .order_by(ProgressLog.logged_at.desc())
        .limit(limit)
        .all()
    )
    return logs


@router.delete(
    "/logs/{log_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a progress log entry",
)
def delete_progress_log(
    log_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    log = db.get(ProgressLog, log_id)
    if not log or log.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Progress log not found")
    db.delete(log)
    db.commit()
