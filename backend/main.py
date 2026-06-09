from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
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
    elif data[:4] == b"%PDF":
        fmt = "pdf"
    else:
        fmt = ext
    return fmt, encrypted

class DetectResponse(BaseModel):
    format: str
    encrypted: bool
    filename: str

@app.post("/detect", response_model=DetectResponse)
async def detect(file: UploadFile = File(...)):
    data = await file.read()
    fmt, encrypted = detect_format(data, file.filename)
    return {
        "format": fmt,
        "encrypted": encrypted,
        "filename": file.filename,
    }


@app.post("/decrypt")
async def decrypt(file: UploadFile = File(...), password: str = Form(...)):
    data = await file.read()
    try:
        with pyzipper.AESZipFile(io.BytesIO(data)) as z:
            z.setpassword(password.encode("utf-8"))
            names = z.namelist()
            out = z.read(names[0])
    except RuntimeError as e:
        raise HTTPException(status_code=400, detail=f"Decryption failed: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid zip file: {str(e)}")
    
    return StreamingResponse(
        io.BytesIO(out),
        media_type="application/octet-stream",
        headers={"Content-Disposition": f"attachment; filename={names[0]}"},
    )

# Helper func - pandoc via subprocess to convert files(stdin -> stdout, no temp files stored)

def run_pandoc(data: bytes, from_fmt: str, to_fmt: str) -> bytes:
    cmd = ["pandoc", "-f", from_fmt, "-t", to_fmt, "-o", "-"]
    if to_fmt == "pdf":
        cmd += ["--pdf-engine=tectonic"]
    result = subprocess.run(
        cmd,
        input=data,
        capture_output=True,
    )
    if result.returncode != 0:
        raise HTTPException(status_code=500, detail=result.stderr.decode())
    return result.stdout

# Helper func - PDF to Docx

def pdf_to_docx_bytes(data: bytes) -> bytes:
    pdf = fitz.open(stream=data, filetype="pdf")
    word_doc = docx.Document() # Empty word doc file
    for page in pdf:
        blocks = page.get_text("blocks")
        for block in blocks:
            para = word_doc.add_paragraph(block[4].strip())
            for run in para.runs:
                run.font.name = "Noto Sans"
    
    buf = io.BytesIO()
    word_doc.save(buf)
    buf.seek(0)
    return buf.read()

CONVERSIONS = {
    ("epub", "docx"), ("docx", "epub"), ("pdf", "docx"), ("docx", "pdf"),
}

@app.post("/convert")
async def convert(file: UploadFile = File(...), target_format: str = Form(...)):
    data = await file.read()
    src_fmt = file.filename.rsplit(".", 1)[-1].lower()
    tgt_fmt = target_format.lower()

    if (src_fmt, tgt_fmt) not in CONVERSIONS:
        raise HTTPException(status_code=400, detail=f"Unsupported: {src_fmt} -> {tgt_fmt}")

    if src_fmt == "pdf" and tgt_fmt == "docx":
        out = pdf_to_docx_bytes(data)
    else:
        out = run_pandoc(data, src_fmt, tgt_fmt)

    out_filename = file.filename.rsplit(".", 1)[0] + f".{tgt_fmt}"
    return StreamingResponse(
        io.BytesIO(out),
        media_type="application/octet-stream",
        headers={"Content-Disposition": f"attachment; filename={out_filename}"},
    )


@app.post("/encrypt")
async def encrypt(file: UploadFile = File(...), password: str = Form(...)):
    data = await file.read()
    buf = io.BytesIO()
    with pyzipper.AESZipFile(buf, "w",
                             compression = pyzipper.ZIP_DEFLATED,
                             encryption = pyzipper.WZ_AES) as z:
        z.setpassword(password.encode("utf-8"))
        z.writestr(file.filename, data)
    buf.seek(0)
    out_name = f"{file.filename}.encrypted.zip"
    return StreamingResponse(
        buf,
        media_type="application/zip",
        headers={"Content-Disposition": f"attachment; filename={out_name}"},
    )