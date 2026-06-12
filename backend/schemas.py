from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, field_validator, EmailStr


class GenerateEpisodeRequest(BaseModel):
    pbf: float
    smm: str
    goal: str
    restriction: Optional[str] = None
    user_id: Optional[int] = None
    username: Optional[str] = None
    assessment_title: Optional[str] = None


class GenerateEpisodeResponse(BaseModel):
    classification: str
    recommendation: str
    program: str
    episode_id: Optional[int] = None
    assessment_id: Optional[int] = None


class GenerateWorkoutRequest(BaseModel):
    program: str
    goal: str
    restriction: Optional[str] = None
    user_id: Optional[int] = None
    username: Optional[str] = None
    episode_id: Optional[int] = None


class WorkoutResponse(BaseModel):
    id: int
    user_id: Optional[int] = None
    episode_id: Optional[int] = None
    program: str
    details: dict
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class OutcomeResponse(BaseModel):
    id: int
    episode_id: int
    name: str
    result: dict
    score: Optional[float]

    class Config:
        from_attributes = True


class EpisodeResponse(BaseModel):
    id: int
    assessment_id: int
    name: str
    sequence: int
    started_at: Optional[datetime]
    completed_at: Optional[datetime]
    outcomes: list[OutcomeResponse] = []

    class Config:
        from_attributes = True


# ── Auth ──────────────────────────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    username: str
    email: EmailStr
    password: str

    @field_validator("username")
    @classmethod
    def username_valid(cls, v: str) -> str:
        v = v.strip()
        if len(v) < 3:
            raise ValueError("Username must be at least 3 characters")
        if len(v) > 50:
            raise ValueError("Username must be 50 characters or fewer")
        return v

    @field_validator("password")
    @classmethod
    def password_valid(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        return v


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: int
    username: str


class UserResponse(BaseModel):
    id: int
    username: str
    email: Optional[str]
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class UpdateProfileRequest(BaseModel):
    username: Optional[str] = None
    email: Optional[str] = None


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str


# ── Nutrition Plans ───────────────────────────────────────────────────────────

class NutritionPlanCreate(BaseModel):
    title: str
    goal: Optional[str] = None
    calories: Optional[int] = None
    protein_g: Optional[float] = None
    carbs_g: Optional[float] = None
    fat_g: Optional[float] = None
    meals: Optional[list] = None
    notes: Optional[str] = None


class NutritionPlanUpdate(BaseModel):
    title: Optional[str] = None
    goal: Optional[str] = None
    calories: Optional[int] = None
    protein_g: Optional[float] = None
    carbs_g: Optional[float] = None
    fat_g: Optional[float] = None
    meals: Optional[list] = None
    notes: Optional[str] = None


class NutritionPlanResponse(BaseModel):
    id: int
    user_id: int
    title: str
    goal: Optional[str]
    calories: Optional[int]
    protein_g: Optional[float]
    carbs_g: Optional[float]
    fat_g: Optional[float]
    meals: Optional[list]
    notes: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


# ── Progress Logs ─────────────────────────────────────────────────────────────

class ProgressLogCreate(BaseModel):
    weight_kg: Optional[float] = None
    pbf: Optional[float] = None
    smm_kg: Optional[float] = None
    notes: Optional[str] = None
    metrics: Optional[dict] = None
    logged_at: Optional[datetime] = None


class ProgressLogResponse(BaseModel):
    id: int
    user_id: int
    logged_at: datetime
    weight_kg: Optional[float]
    pbf: Optional[float]
    smm_kg: Optional[float]
    notes: Optional[str]
    metrics: Optional[dict]
    created_at: datetime

    class Config:
        from_attributes = True


# ── Analytics ─────────────────────────────────────────────────────────────────

class EffectivenessResponse(BaseModel):
    total_episodes: int
    avg_score: Optional[float]
    classification_counts: dict
    recommendation_counts: dict
    program_counts: dict
