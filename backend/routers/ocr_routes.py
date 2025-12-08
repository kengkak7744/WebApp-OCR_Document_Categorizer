from fastapi import APIRouter, Depends, UploadFile, File
from database import documents_collection
from auth import get_current_user
from datetime import datetime
from services.ocr_service import process_file, categorize_text
from services.image_processing import encode_image_to_base64

router = APIRouter()

@router.post("/upload-document")
async def upload_document(
    file: UploadFile = File(...), 
    current_user: dict = Depends(get_current_user)
):
    contents = await file.read()
    
    extracted_text, original_img_np, cropped_img_np = process_file(contents, file.filename)
    categories = categorize_text(extracted_text)
    
    original_b64 = encode_image_to_base64(original_img_np)
    cropped_b64 = encode_image_to_base64(cropped_img_np)

    doc_data = {
        "owner": current_user["username"],
        "filename": file.filename,
        "upload_date": datetime.now(),
        "extracted_text": extracted_text,
        "categories": categories,
    }
    
    result = documents_collection.insert_one(doc_data)
    
    return {
        "id": str(result.inserted_id),
        "status": "success",
        "extracted_text": extracted_text,
        "categories": categories,
        "original_image": original_b64,
        "cropped_image": cropped_b64
    }