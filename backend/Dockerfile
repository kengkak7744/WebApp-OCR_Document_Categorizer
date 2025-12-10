FROM python:3.13-slim

RUN apt-get update && apt-get install -y \
    tesseract-ocr \
    libtesseract-dev \
    poppler-utils \
    ffmpeg libsm6 libxext6 \
    wget \
    && rm -rf /var/lib/apt/lists/*

RUN mkdir -p /app/tessdata_best

RUN wget -O /app/tessdata_best/tha.traineddata https://github.com/tesseract-ocr/tessdata_best/raw/main/tha.traineddata
RUN wget -O /app/tessdata_best/eng.traineddata https://github.com/tesseract-ocr/tessdata_best/raw/main/eng.traineddata

ENV TESSDATA_PREFIX=/app/tessdata_best
ENV OCR_PATH=/usr/bin/tesseract
ENV POPPLER_PATH=/usr/bin

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD uvicorn main:app --host 0.0.0.0 --port $PORT