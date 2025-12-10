from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, status
from database import documents_collection
from auth import get_current_user
from datetime import datetime
from services.ocr_service import process_file, categorize_text, extract_data_fields
from services.image_processing import encode_image_to_base64
from typing import Optional
from bson import ObjectId

router = APIRouter()

@router.post("/upload-document")
async def upload_document(
    file: UploadFile = File(...), 
    use_auto_crop: str = Form("true"),
    current_user: dict = Depends(get_current_user)
):
    contents = await file.read()
    is_auto_crop = use_auto_crop.lower() == "true"
    extracted_text, original_img_np, cropped_img_np = process_file(contents, file.filename, is_auto_crop)
    categories = categorize_text(extracted_text)
    doc_type = categories.get("Type", "General Document")
    extracted_data = extract_data_fields(extracted_text, doc_type)
    
    original_b64 = encode_image_to_base64(original_img_np)
    cropped_b64 = encode_image_to_base64(cropped_img_np)

    image_to_save = cropped_b64

    doc_data = {
        "owner": current_user["username"],
        "filename": file.filename,
        "upload_date": datetime.now(),
        "extracted_data": extracted_data,
        "categories": categories,
        "display_image": image_to_save,
    }
    
    result = documents_collection.insert_one(doc_data)
    
    return {
        "id": str(result.inserted_id),
        "status": "success",
        "extracted_text": extracted_text,
        "extracted_data": extracted_data,
        "categories": categories,
        "original_image": original_b64,
        "cropped_image": cropped_b64
    }

@router.get("/documents")
async def get_documents(
    type_filter: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    query = {"owner": current_user["username"]}

    if type_filter and type_filter != "All":
        query["categories.Type"] = type_filter
    
    cursor = documents_collection.find(query).sort("uplload_date", -1)

    documents = []
    for doc in cursor:
        documents.append({
            "id": str(doc["_id"]),
            "filename": doc["filename"],
            "upload_date": doc["upload_date"],
            "categories": doc["categories"],
            "extracted_data": doc.get("extracted_data", ""),
            "display_image": doc.get("display_image") or doc.get("cropped_image")
        })
    return documents

@router.delete("/documents/{doc_id}")
async def delete_document(doc_id: str, current_user: dict = Depends(get_current_user)):
    try:
        result = documents_collection.delete_one({
            "_id": ObjectId(doc_id),
            "owner": current_user["username"]
        })
        if result.deleted_count == 1:
            return {"message": "Document deleted successfully"}
        else:
            raise HTTPException(status_code=404, detail="Document not found or not authorized")
    
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))