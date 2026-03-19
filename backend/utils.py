import base64
import io

import numpy as np
from fastapi import HTTPException
from PIL import Image

from config import SUPPORTED_FORMATS


def open_image(data: bytes | Image.Image | np.ndarray) -> Image.Image:
    """Abre una imagen desde bytes, array numpy o instancia PIL."""
    try:
        if isinstance(data, Image.Image):
            return data
        if isinstance(data, np.ndarray):
            return Image.fromarray(data)
        return Image.open(io.BytesIO(data))
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Archivo de imagen inválido") from exc


def save_image_bytes(
    image: Image.Image,
    output_format: str,
    *,
    quality: int | None = None,
    optimize: bool = True,
) -> bytes:
    """Serializa una imagen PIL a bytes en el formato indicado."""
    fmt = output_format.lower()
    if fmt not in SUPPORTED_FORMATS:
        raise HTTPException(status_code=400, detail=f"Formato no soportado: {fmt}")

    image_to_save = image
    pil_format = "JPEG" if fmt in {"jpg", "jpeg"} else fmt.upper()

    if fmt in {"jpeg", "jpg", "webp"} and image.mode in {"RGBA", "LA", "P"}:
        image_to_save = image.convert("RGB")

    save_kwargs: dict[str, int | bool] = {"optimize": optimize}
    if quality is not None and fmt in {"jpeg", "jpg", "webp"}:
        save_kwargs["quality"] = quality
    if fmt == "png":
        save_kwargs["compress_level"] = 9

    buffer = io.BytesIO()
    image_to_save.save(buffer, format=pil_format, **save_kwargs)
    return buffer.getvalue()


def image_to_base64(image: Image.Image, output_format: str) -> dict[str, str]:
    """Convierte una imagen PIL a un dict con base64, mime_type y format."""
    fmt = output_format.lower()
    if fmt not in SUPPORTED_FORMATS:
        raise HTTPException(status_code=400, detail=f"Formato no soportado: {fmt}")

    image_bytes = save_image_bytes(image, fmt)
    encoded = base64.b64encode(image_bytes).decode("utf-8")

    return {
        "base64": encoded,
        "mime_type": SUPPORTED_FORMATS[fmt],
        "format": "jpeg" if fmt in {"jpg", "jpeg"} else fmt,
    }