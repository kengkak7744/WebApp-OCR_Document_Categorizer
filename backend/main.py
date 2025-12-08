from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel
from database import users_collection, documents_collection
from auth import get_password_hash, verify_password, create_access_token, get_current_user
from ocr_engine import process_image, categorize_text
from datetime import datetime
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

class UserCreate(BaseModel):
    username: str
    password: str

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/register")
async def register(user: UserCreate):
    if users_collection.find_one({"username": user.username}):
        raise HTTPException(status_code=400, detail="Username already registered")
    
    hashed_pass = get_password_hash(user.password)
    users_collection.insert_one({
        "username": user.username,
        "password": hashed_pass
    })
    return {"message": "User created successfully"}

@app.post("/token")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = users_collection.find_one({"username": form_data.username})
    if not user or not verify_password(form_data.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(data={"sub": user["username"]})
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/upload-document")
async def upload_document(
    file: UploadFile = File(...), 
    current_user: dict = Depends(get_current_user)
):
    contents = await file.read()
    
    extracted_text = process_image(contents)
    categories = categorize_text(extracted_text)
    
    doc_data = {
        "owner": current_user["username"],
        "filename": file.filename,
        "upload_date": datetime.now(),
        "extracted_text": extracted_text,
        "categories": categories
    }
    
    result = documents_collection.insert_one(doc_data)
    
    return {
        "id": str(result.inserted_id),
        "status": "success",
        "text_preview": extracted_text[:100] + "...",
        "categories": categories,
        "extracted_text": extracted_text
    }