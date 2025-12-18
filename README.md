# 📄 OCR Document Categorizer & Extractor

![Python](https://img.shields.io/badge/Python-3.10-blue) ![FastAPI](https://img.shields.io/badge/FastAPI-0.95-green) ![React](https://img.shields.io/badge/React-18-blue) ![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED) ![Tesseract](https://img.shields.io/badge/Tesseract-OCR-orange)

A powerful web application designed to scan, read, and categorize documents automatically. It utilizes **Tesseract OCR** with enhanced image processing to support **Thai & English** languages accurately. The system automatically detects document types (Invoices, Contracts, ID Cards) and extracts key information using advanced Regular Expressions.

## ✨ Key Features

* **🔍 Multi-Language OCR:** Supports **Thai** and **English** with high accuracy using `tessdata_best` models.
* **🖼️ Advanced Image Processing:**
    * **Auto-Cropping:** Automatically detects document borders and crops the image.
    * **Upscaling:** 2x Upscaling algorithm to improve accuracy for small Thai vowels and tone marks.
    * **Noise Reduction:** Otsu's thresholding for clearer text detection.
* **📂 Intelligent Categorization:** Automatically classifies documents into:
    * `Invoice` / `Receipt`
    * `Contract` / `Agreement`
    * `ID Card` (Thai National ID)
    * `General Document`
* **⛏️ Smart Data Extraction:** Extracts specific fields based on document type:
    * **Dates:** Supports format `DD/MM/YYYY`, `DD-MM-YYYY`, and Thai months (e.g., 25 ม.ค. 2566).
    * **Amounts:** Logic to find the *Max Value* or *Grand Total* in invoices, ignoring sub-totals.
    * **Personal Info:** Names, Emails, Phone numbers, and Thai ID Card numbers.
* **☁️ Cloud Ready:** Dockerized and ready for deployment on **Google Cloud Run**.
* **🗄️ History Tracking:** Stores analysis results and images in MongoDB.

## 🛠 Tech Stack

* **Backend:** Python, FastAPI, OpenCV, Pytesseract, PDF2Image.
* **Frontend:** React.js, TailwindCSS.
* **OCR Engine:** Tesseract 5 (Custom configured for Thai language).
* **Database:** MongoDB Atlas.
* **Infrastructure:** Docker, Google Cloud Platform (Cloud Run).

## 🚀 Installation & Setup

### Option 1: Run with Docker (Recommended)

This method automatically sets up Tesseract and downloads the best language models.

1.  **Clone the repository**
    ```bash
    git clone [https://github.com/kengkak7744/WebApp-OCR_Document_Categorizer.git](https://github.com/kengkak7744/WebApp-OCR_Document_Categorizer.git)
    cd WebApp-OCR_Document_Categorizer
    ```

2.  **Build and Run**
    ```bash
    docker build -t ocr-backend ./backend
    docker run -p 8000:8000 --env MONGODB_URL="your_mongodb_connection_string" ocr-backend
    ```

### Option 2: Run Locally (Manual Setup)

**Prerequisites:**
* Python 3.10+
* Node.js (for Frontend)
* Tesseract OCR installed on your machine.
* **Important:** You must download `tha.traineddata` (best version) and place it in your Tesseract `tessdata` folder.

1.  **Backend Setup**
    ```bash
    cd backend
    pip install -r requirements.txt
    
    # Create .env file
    echo "MONGODB_URL=your_mongodb_url" > .env
    echo "OCR_PATH=C:\Program Files\Tesseract-OCR\tesseract.exe" >> .env
    
    # Run Server
    uvicorn main:app --reload
    ```

2.  **Frontend Setup**
    ```bash
    cd frontend
    npm install
    npm run dev
    ```

## 🧠 How It Works

1.  **Upload:** User uploads an image (JPG/PNG) or PDF.
2.  **Preprocessing:**
    * The image is converted to grayscale.
    * If enabled, the system **Auto-Crops** the document from the background.
    * The image is **Upscaled (2x)** to enhance small characters.
3.  **OCR Processing:** Tesseract reads the text using the `tha+eng` language model.
4.  **Analysis:**
    * **Regex Classification:** Keywords determine the document type.
    * **Data Extraction:** Complex Regex patterns extract dates, prices, and IDs.
5.  **Result:** The extracted text and JSON data are returned to the frontend and saved to MongoDB.