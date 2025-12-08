import cv2
import numpy as np
import pytesseract
from PIL import Image
import os
from dotenv import load_dotenv
import re

load_dotenv()

pytesseract.pytesseract.tesseract_cmd = os.getenv("OCR_PATH")

def process_image(image_bytes):
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)[1]

    custom_config = r'--psm 6'
    
    raw_text = pytesseract.image_to_string(gray, lang='tha+eng', config=custom_config)
    
    if has_thai_characters(raw_text):
        final_text = clean_thai_text(raw_text)
    else:
        final_text = raw_text
        
    return final_text.strip()

def clean_thai_text(text):
    pattern = r'(?<=[\u0E00-\u0E7F])\s+(?=[\u0E00-\u0E7F])'
    return re.sub(pattern, '', text)

def has_thai_characters(text):
    return bool(re.search(r'[\u0E00-\u0E7F]', text))

def categorize_text(text):
    categories = {}
    invoice_keywords = ["ใบเสร็จ", "invoice", "receipt", "tax invoice", "ยอดรวม", "total", "ชำระเงิน", "ใบสำคัญรับเงิน"]
    contract_keywords = ["สัญญา", "contract", "agreement", "บันทึกข้อตกลง", "ลงนาม"]
    id_card_keywords = ["บัตรประจำตัวประชาชน", "identity card", "วันเกิด", "date of birth"]
    text_lower = text.lower()
    if any(word in text_lower for word in invoice_keywords):
        categories["Type"] = "Invoice"
    elif any(word in text_lower for word in contract_keywords):
        categories["Type"] = "Contract"
    elif any(word in text_lower for word in id_card_keywords):
        categories["Type"] = "ID Card"
    else:
        categories["Type"] = "General Document"
    return categories