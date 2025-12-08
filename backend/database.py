from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL")

try:
    client = MongoClient(MONGODB_URL)
    db = client["ocr_document_db"]
    
    users_collection = db["users"]
    documents_collection = db["documents"]

except Exception as e:
    print("❌ Connection failed:", e)