from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

class UserCreate(BaseModel):
    username: str
    password: str

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], # พอร์ตมาตรฐานของ React Vite
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)