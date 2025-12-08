from pymongo import MongoClient
import os

MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
client = MongoClient(MONGODB_URL)

db = client["ocr_document_db"]
users_collection = db["users"]
documents_collection = db["documents"]