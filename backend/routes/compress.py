import base64

from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from config import SUPPORTED_FORMATS
from utils import open_image, save_image_bytes

router = APIRouter(prefix="/pillow-tool", tags=["compress"])


@router.post("")
async def pillow_tool(
    file: UploadFile = File(...),
    target_kb: int = Form(...),
    output_format: str = Form("jpeg"),
):
    if target_kb <= 0:
        raise HTTPException(status_code=400, detail="El peso objetivo debe ser mayor a 0 KB")

    image_bytes = await file.read()
    image = open_image(image_bytes)
    fmt = output_format.lower()

    if fmt not in SUPPORTED_FORMATS:
        raise HTTPException(status_code=400, detail="Formato no soportado")

    target_bytes = target_kb * 1024
    best_bytes: bytes
    quality_used: int | None = None

    if fmt in {"jpeg", "jpg", "webp"}:
        best_bytes = save_image_bytes(image, fmt, quality=95)
        quality_used = 95

        if len(best_bytes) > target_bytes:
            low, high = 5, 95
            while low <= high:
                mid = (low + high) // 2
                candidate = save_image_bytes(image, fmt, quality=mid)
                if len(candidate) <= target_bytes:
                    best_bytes = candidate
                    quality_used = mid
                    low = mid + 1
                else:
                    high = mid - 1

            if quality_used is None:
                quality_used = 5
                best_bytes = save_image_bytes(image, fmt, quality=quality_used)
    else:
        best_bytes = save_image_bytes(image, fmt)

    encoded = base64.b64encode(best_bytes).decode("utf-8")
    return {
        "base64": encoded,
        "mime_type": SUPPORTED_FORMATS[fmt],
        "format": "jpeg" if fmt in {"jpg", "jpeg"} else fmt,
        "original_size_kb": round(len(image_bytes) / 1024, 2),
        "result_size_kb": round(len(best_bytes) / 1024, 2),
        "quality_used": quality_used,
    }