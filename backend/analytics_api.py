from typing import Optional

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from .auth import get_current_user
from .database import get_db
from .models import Assessment, Episode, Outcome, User
from .schemas import EffectivenessResponse

router = APIRouter()


@router.get(
    "/effectiveness",
    response_model=EffectivenessResponse,
    summary="Recommendation effectiveness analytics for the current user",
)
def recommendation_effectiveness(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # All episodes that belong to this user (via assessments)
    episode_ids_subq = (
        db.query(Episode.id)
        .join(Assessment, Assessment.id == Episode.assessment_id)
        .filter(Assessment.user_id == current_user.id)
        .subquery()
    )

    total_episodes: int = (
        db.query(func.count(Episode.id))
        .join(Assessment, Assessment.id == Episode.assessment_id)
        .filter(Assessment.user_id == current_user.id)
        .scalar()
        or 0
    )

    # Outcomes for this user's episodes
    outcomes = (
        db.query(Outcome)
        .filter(Outcome.episode_id.in_(db.query(episode_ids_subq)))
        .all()
    )

    scores = [float(o.score) for o in outcomes if o.score is not None]
    avg_score: Optional[float] = (sum(scores) / len(scores)) if scores else None

    classification_counts: dict = {}
    recommendation_counts: dict = {}
    program_counts: dict = {}

    for outcome in outcomes:
        result = outcome.result or {}
        if isinstance(result, dict):
            classification = result.get("classification")
            if classification:
                classification_counts[classification] = classification_counts.get(classification, 0) + 1

            recommendation = result.get("recommendation")
            if recommendation:
                recommendation_counts[recommendation] = recommendation_counts.get(recommendation, 0) + 1

            program = result.get("program")
            if program:
                program_counts[program] = program_counts.get(program, 0) + 1

    return EffectivenessResponse(
        total_episodes=total_episodes,
        avg_score=round(avg_score, 4) if avg_score is not None else None,
        classification_counts=classification_counts,
        recommendation_counts=recommendation_counts,
        program_counts=program_counts,
    )
