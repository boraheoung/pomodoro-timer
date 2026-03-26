from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pathlib import Path

from .models import init_db
from .routes import router

app = FastAPI(title="Pomodoro Timer")

BASE_DIR = Path(__file__).parent
app.mount("/static", StaticFiles(directory=BASE_DIR / "static"), name="static")
templates = Jinja2Templates(directory=BASE_DIR / "templates")

app.include_router(router)


@app.on_event("startup")
def startup():
    init_db()


@app.get("/")
def index(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})
