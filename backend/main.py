import os

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from sqlalchemy.orm import Session

from .database import Base, engine, get_db
from .generate_episode_api import router as engine_router
from .auth_router import router as auth_router
from .nutrition_api import router as nutrition_router
from .progress_api import router as progress_router
from .analytics_api import router as analytics_router
from .models import Assessment, Episode, Outcome, User, Workout

try:
    Base.metadata.create_all(bind=engine)
except Exception as exc:
    print(f"Warning: could not initialize database: {exc}")

app = FastAPI(title="iBlitz API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(engine_router, prefix="/engine", tags=["engine"])
app.include_router(auth_router, prefix="/auth", tags=["auth"])
app.include_router(nutrition_router, prefix="/nutrition", tags=["nutrition"])
app.include_router(progress_router, prefix="/progress", tags=["progress"])
app.include_router(analytics_router, prefix="/analytics", tags=["analytics"])


@app.get("/")
async def read_root():
    return {"message": "Hello from iblitz backend!", "docs": "/docs"}


@app.get("/health")
async def health_check():
    return {"status": "ok"}


@app.get("/admin", response_class=HTMLResponse)
async def admin_dashboard(db: Session = Depends(get_db)):
    user_count = db.query(User).count()
    assessment_count = db.query(Assessment).count()
    episode_count = db.query(Episode).count()
    outcome_count = db.query(Outcome).count()
    workout_count = db.query(Workout).count()
    html = f"""
    <html>
      <head><title>iblitz Admin</title>
        <style>body{{font-family:Arial,sans-serif;margin:2rem;background:#f7f8fb;}}h1{{color:#1f2937;}}.card{{background:white;border-radius:12px;padding:1rem 1.5rem;margin:.75rem 0;box-shadow:0 10px 30px rgba(15,23,42,.08);}}.card p{{margin:.25rem 0;color:#4b5563;}}a{{color:#2563eb;text-decoration:none;}}</style>
      </head>
      <body>
        <h1>iblitz Admin Dashboard</h1>
        <div class="card"><strong>Users</strong><p>{user_count}</p></div>
        <div class="card"><strong>Assessments</strong><p>{assessment_count}</p></div>
        <div class="card"><strong>Episodes</strong><p>{episode_count}</p></div>
        <div class="card"><strong>Outcomes</strong><p>{outcome_count}</p></div>
        <div class="card"><strong>Workouts</strong><p>{workout_count}</p></div>
        <div class="card"><strong>API</strong><p><a href="/docs">/docs</a> | <a href="/engine/episodes">/episodes</a> | <a href="/engine/workouts">/workouts</a></p></div>
      </body>
    </html>"""
    return html
