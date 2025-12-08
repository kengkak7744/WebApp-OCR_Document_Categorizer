from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import auth_routes, ocr_routes

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_routes.router)
app.include_router(ocr_routes.router)

@app.get("/")
def read_root():
    return {"message": "Web Api is running"}