from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from PIL import Image

from utils import image_to_base64, open_image

router = APIRouter(prefix="/resize-image", tags=["resize"])


@router.post("")
async def resize_image(
    file: UploadFile = File(...),
    width: int = Form(...),
    height: int = Form(...),
):
    if width <= 0 or height <= 0:
        raise HTTPException(status_code=400, detail="Ancho y alto deben ser mayores a 0")

    image_bytes = await file.read()
    image = open_image(image_bytes)
    resized = image.resize((width, height), Image.Resampling.LANCZOS)
    return image_to_base64(resized, "png")