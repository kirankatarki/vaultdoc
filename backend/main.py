from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import io
import subprocess
import pyzipper
import fitz
import docx

app = FastAPI(title="epub-docx-converter")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

def detect_format(data: bytes, filename: str) -> tuple[str, bool]:
    ext = filename.rsplit(".", 1)[-1].lower()
    encrypted = False

    if data[:4] == b"PK\x03\x04":
        fmt = "epub" if ext == "epub" else "docx"
        try:
            with pyzipper.AESZipFile(io.BytesIO(data)) as z:
                z.extractall(pwd=None)
        except Exception:
            encrypted = True
    elif data[:4] == b"%pdf":
        fmt = "pdf"
    else:
        fmt = ext
    return fmt, encrypted

@app.post("/detect")
async def detect(file: UploadFile = File(...)):
    data = await file.read()
    fmt, encrypted = detect_format(data, file.filename)
    return {
        "format": fmt,
        "encrypted": encrypted,
        "filename": file.filename,
    }
