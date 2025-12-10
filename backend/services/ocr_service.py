import cv2
import numpy as np
import pytesseract
import os
import re
from dotenv import load_dotenv
from pdf2image import convert_from_bytes
from services.image_processing import auto_crop_document

load_dotenv()

tesseract_path = os.getenv("OCR_PATH")
if tesseract_path and os.path.exists(tesseract_path):
    pytesseract.pytesseract.tesseract_cmd = tesseract_path
        
    if 'TESSDATA_PREFIX' not in os.environ:
        tesseract_dir = os.path.dirname(tesseract_path)
        tessdata_dir = os.path.join(tesseract_dir, 'tessdata')
        os.environ['TESSDATA_PREFIX'] = tessdata_dir
        print(f"Set TESSDATA_PREFIX to: {tessdata_dir}")
    else:
        print(f"Using Existing TESSDATA_PREFIX: {os.environ['TESSDATA_PREFIX']}")

poppler_path = os.getenv("POPPLER_PATH")

def clean_thai_text(text):
    pattern = r'(?<=[\u0E00-\u0E7F])\s+(?=[\u0E00-\u0E7F])'
    return re.sub(pattern, '', text)

def has_thai_characters(text):
    return bool(re.search(r'[\u0E00-\u0E7F]', text))

def categorize_text(text):
    invoice_keywords = ["ใบเสร็จ", "invoice", "receipt", "tax invoice", "ยอดรวม", "total", "ชำระเงิน"]
    contract_keywords = ["สัญญา", "contract", "agreement", "บันทึกข้อตกลง", "ลงนาม"]
    id_card_keywords = ["บัตรประจำตัวประชาชน", "identity card", "วันเกิด", "date of birth"]
    text_lower = text.lower()
    categories = {}
    if any(word in text_lower for word in invoice_keywords):
        categories["Type"] = "Invoice"
    elif any(word in text_lower for word in contract_keywords):
        categories["Type"] = "Contract"
    elif any(word in text_lower for word in id_card_keywords):
        categories["Type"] = "ID Card"
    else:
        categories["Type"] = "General Document"
    return categories

def extract_data_fields(text, doc_type):
    info = {
        "DocumentType": doc_type,
        "Date": None,
        "TotalAmount": None,
        "Email": None,
        "Phone": None,
        "ID_Number": None, 
        "Name": None
    }
    
    date_pattern = r'(\d{1,2}\s*[-/—._]\s*\d{1,2}\s*[-/—._]\s*\d{2,4})|(\d{1,2}\s+(?:ม\.ค\.|ก\.พ\.|มี\.ค\.|เม\.ย\.|พ\.ค\.|มิ\.ย\.|ก\.ค\.|ส\.ค\.|ก\.ย\.|ต\.ค\.|พ\.ย\.|ธ\.ค\.|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\s+\d{2,4})'
    date_match = re.search(date_pattern, text, re.IGNORECASE)
    info["Date"] = date_match.group(0) if date_match else "-"

    email_pattern = r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'
    email_match = re.search(email_pattern, text)
    if email_match: info["Email"] = email_match.group(0)
    
    phone_pattern = r'0\d{1,2}[-\s]?\d{3}[-\s]?\d{3,4}'
    phone_match = re.search(phone_pattern, text)
    if phone_match: info["Phone"] = phone_match.group(0)
            
    if doc_type in ["Invoice", "General Document"]:
        amount_pattern = r'(?i)(?<!sub)(?:total|amount|net|grand total|รวมเงิน|สุทธิ|จำนวนเงิน|ราคา|ยอดรวม|ยอด)\b[^0-9\r\n]*?([\d,]+\.?\d{2})'
        
        matches = re.findall(amount_pattern, text)
        
        if matches:
            try:
                values = [float(m.replace(',', '')) for m in matches]
                
                max_value = max(values)
                
                info["TotalAmount"] = "{:,.2f}".format(max_value)
            except:
                info["TotalAmount"] = matches[-1]

    if doc_type == "ID Card":
        id_pattern = r'\d{1}\s?\d{4}\s?\d{5}\s?\d{2}\s?\d{1}'
        id_match = re.search(id_pattern, text)
        info["ID_Number"] = id_match.group(0) if id_match else "-"
    
    if doc_type in ["ID Card", "Contract", "General Document"]:
        name_pattern = r"(นาย|นาง|นางสาว|น\.ส\.|ด\.ช\.|ด\.ญ\.)\s*([^\s]+(?:\s+[^\s]+)?)"
        name_match = re.search(name_pattern, text)
        if name_match:
            name_prefix = name_match.group(1)
            full_name_text = name_match.group(2)
            info["Name"] = f"{name_prefix} {full_name_text}"
        else:
            info["Name"] = "-"

    return info

def image_to_text_logic(image_numpy):
    gray = cv2.cvtColor(image_numpy, cv2.COLOR_BGR2GRAY)
    gray = cv2.resize(gray, None, fx=2, fy=2, interpolation=cv2.INTER_CUBIC)
    thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY | cv2.THRESH_OTSU)[1]
    
    raw_text = pytesseract.image_to_string(thresh, lang='tha+eng', config='--psm 6')
    return raw_text

def process_file(file_bytes, filename, use_auto_crop):
    full_text = ""
    original_img_np = None
    cropped_img_np = None

    if filename.lower().endswith('.pdf'):
        try:
            pages = convert_from_bytes(file_bytes, poppler_path=poppler_path)
            if len(pages) > 0:
                 original_img_np = np.array(pages[0])
                 cropped_img_np = original_img_np
            for i, page_img in enumerate(pages):
                page_numpy = np.array(page_img)
                full_text += f"\n--- Page {i+1} ---\n" + image_to_text_logic(page_numpy)
        except Exception as e:
             return f"Error PDF: {str(e)}", None, None
    else:
        nparr = np.frombuffer(file_bytes, np.uint8)
        original_img_np = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if original_img_np is None: return "Error decoding", None, None

        if use_auto_crop:
            cropped_img_np = auto_crop_document(original_img_np)
        else:
            cropped_img_np = original_img_np

        full_text = image_to_text_logic(cropped_img_np)

    if has_thai_characters(full_text):
        final_text = clean_thai_text(full_text)
    else:
        final_text = full_text
        
    return final_text.strip(), original_img_np, cropped_img_np