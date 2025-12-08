import cv2
import numpy as np
import pytesseract
from PIL import Image
import os
from dotenv import load_dotenv
import re
from pdf2image import convert_from_bytes

load_dotenv()

pytesseract.pytesseract.tesseract_cmd = os.getenv("OCR_PATH")
poppler_path = os.getenv("POPPLER_PATH")

def process_file(file_bytes, filename):
    full_text = ""

    if filename.lower().endswith('.pdf'):        
        try:
            pages = convert_from_bytes(file_bytes, poppler_path=poppler_path)
        except Exception as e:
            return f"Error converting PDF: {str(e)}. Check POPPLER_PATH in .env"

        for i, page_img in enumerate(pages):
            print(f"  - Processing page {i+1}/{len(pages)}...")
            
            page_numpy = np.array(page_img)
            
            text_page = image_to_text_logic(page_numpy)
            full_text += f"\n--- Page {i+1} ---\n" + text_page

    else:
        nparr = np.frombuffer(file_bytes, np.uint8)
        img_numpy = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img_numpy is None:
            return "Error: Could not decode image."
            
        full_text = image_to_text_logic(img_numpy)

    if has_thai_characters(full_text):
        final_text = clean_thai_text(full_text)
    else:
        final_text = full_text
        
    return final_text.strip()

def image_to_text_logic(image_numpy):
    gray = cv2.cvtColor(image_numpy, cv2.COLOR_BGR2GRAY)
    
    custom_config = r'--psm 6'
    raw_text = pytesseract.image_to_string(gray, lang='tha+eng', config=custom_config)
    
    return raw_text

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
    certificate = ["certification", "certificate", "รับรอง"]
    text_lower = text.lower()
    if any(word in text_lower for word in invoice_keywords):
        categories["Type"] = "Invoice"
    elif any(word in text_lower for word in contract_keywords):
        categories["Type"] = "Contract"
    elif any(word in text_lower for word in id_card_keywords):
        categories["Type"] = "ID Card"
    elif any(word in text_lower for word in certificate):
        categories["Type"] = "Certificate"
    else:
        categories["Type"] = "General Document"
    return categories