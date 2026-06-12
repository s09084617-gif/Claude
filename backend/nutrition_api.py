from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .auth import get_current_user
from .database import get_db
from .models import NutritionPlan, User
from .schemas import NutritionPlanCreate, NutritionPlanResponse, NutritionPlanUpdate

router = APIRouter()


@router.post(
    "/plans",
    response_model=NutritionPlanResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a nutrition plan",
)
def create_nutrition_plan(
    body: NutritionPlanCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    plan = NutritionPlan(
        user_id=current_user.id,
        title=body.title,
        goal=body.goal,
        calories=body.calories,
        protein_g=body.protein_g,
        carbs_g=body.carbs_g,
        fat_g=body.fat_g,
        meals=body.meals,
        notes=body.notes,
    )
    db.add(plan)
    db.commit()
    db.refresh(plan)
    return plan


@router.get(
    "/plans",
    response_model=List[NutritionPlanResponse],
    summary="List all nutrition plans for the current user",
)
def list_nutrition_plans(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    plans = (
        db.query(NutritionPlan)
        .filter(NutritionPlan.user_id == current_user.id)
        .order_by(NutritionPlan.created_at.desc())
        .all()
    )
    return plans


@router.get(
    "/plans/{plan_id}",
    response_model=NutritionPlanResponse,
    summary="Get a single nutrition plan",
)
def get_nutrition_plan(
    plan_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    plan = db.get(NutritionPlan, plan_id)
    if not plan or plan.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Nutrition plan not found")
    return plan


@router.put(
    "/plans/{plan_id}",
    response_model=NutritionPlanResponse,
    summary="Update a nutrition plan",
)
def update_nutrition_plan(
    plan_id: int,
    body: NutritionPlanUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    plan = db.get(NutritionPlan, plan_id)
    if not plan or plan.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Nutrition plan not found")

    update_data = body.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(plan, field, value)

    db.commit()
    db.refresh(plan)
    return plan


@router.delete(
    "/plans/{plan_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a nutrition plan",
)
def delete_nutrition_plan(
    plan_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    plan = db.get(NutritionPlan, plan_id)
    if not plan or plan.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Nutrition plan not found")
    db.delete(plan)
    db.commit()
