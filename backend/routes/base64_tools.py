import base64

from fastapi import APIRouter, File, HTTPException, UploadFile
from pydantic import BaseModel

from utils import image_to_base64, open_image

router = APIRouter(prefix="/base64", tags=["base64"])


class Base64DecodeRequest(BaseModel):
    base64_data: str
    output_format: str = "png"


@router.post("/image-to-base64")
async def image_to_base64_endpoint(file: UploadFile = File(...)):
    image_bytes = await file.read()
    image = open_image(image_bytes)
    return image_to_base64(image, "png")


@router.post("/base64-to-image")
async def base64_to_image(payload: Base64DecodeRequest):
    content = payload.base64_data.strip()
    if "," in content:
        content = content.split(",", 1)[1]

    try:
        decoded = base64.b64decode(content, validate=True)
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Base64 inválido") from exc

    image = open_image(decoded)
    return image_to_base64(image, payload.output_format)