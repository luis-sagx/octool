from fastapi import APIRouter, File, Form, UploadFile

from utils import image_to_base64, open_image

router = APIRouter(prefix="/convert-format", tags=["convert"])


@router.post("")
async def convert_format(
    file: UploadFile = File(...),
    target_format: str = Form(...),
):
    image_bytes = await file.read()
    image = open_image(image_bytes)
    return image_to_base64(image, target_format)