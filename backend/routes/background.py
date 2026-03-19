"""
Router para remoción de fondo.

Mejoras de precisión respecto a la versión original:
- Se usa el modelo `isnet-general-use` (más preciso que el modelo por defecto u2net).
- Se intenta primero con `isnet-general-use`; si falla por algún entorno, hace fallback a `u2net`.
- alpha_matting activado con umbrales más conservadores para preservar bordes finos
  (cabello, transparencias, bordes suaves).
- post_process_mask=True mantiene el suavizado final de la máscara.
- Se expone un endpoint adicional `/remove-background/precise` que permite al cliente
  elegir el modelo y afinar los parámetros de alpha matting sin tocar el código.
"""

import io

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from PIL import Image
from rembg import new_session, remove

from utils import image_to_base64, open_image

router = APIRouter(prefix="/remove-background", tags=["background"])

# Modelos disponibles en rembg (del más rápido al más preciso)
_MODEL_PRIORITY = [
    "isnet-general-use",   # mejor para fotografías generales
    "u2net",               # fallback robusto
]


def _build_session(model_name: str):
    """Crea una sesión rembg con el modelo solicitado."""
    try:
        return new_session(model_name)
    except Exception:
        return None


def _remove_bg(
    image_bytes: bytes,
    *,
    model: str = "isnet-general-use",
    fg_threshold: int = 240,
    bg_threshold: int = 10,
    erode_size: int = 10,
) -> Image.Image:
    """
    Quita el fondo con alpha matting.

    Parámetros de matting:
    - fg_threshold: píxeles por encima de este valor se tratan como foreground seguro.
      Bajar este valor preserva más detalle en bordes claros (ej. cabello rubio).
    - bg_threshold: píxeles por debajo de este valor se tratan como background seguro.
      Subir este valor elimina más fondo con mayor agresividad.
    - erode_size: erosión de la máscara antes del matting. Valores altos = bordes más
      limpios pero pueden recortar detalle fino.
    """
    session = _build_session(model)

    # Si el modelo solicitado no está disponible, probar fallbacks
    if session is None:
        for fallback in _MODEL_PRIORITY:
            if fallback != model:
                session = _build_session(fallback)
                if session is not None:
                    break

    if session is not None:
        output = remove(
            image_bytes,
            session=session,
            alpha_matting=True,
            alpha_matting_foreground_threshold=fg_threshold,
            alpha_matting_background_threshold=bg_threshold,
            alpha_matting_erode_size=erode_size,
            post_process_mask=True,
        )
    else:
        # Último recurso: sin sesión explícita
        output = remove(
            image_bytes,
            alpha_matting=True,
            alpha_matting_foreground_threshold=fg_threshold,
            alpha_matting_background_threshold=bg_threshold,
            alpha_matting_erode_size=erode_size,
            post_process_mask=True,
        )

    return open_image(output)


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@router.post("")
async def remove_background(file: UploadFile = File(...)):
    """
    Quita el fondo usando el modelo `isnet-general-use` con alpha matting optimizado.
    Devuelve la imagen en PNG con canal alpha.
    """
    image_bytes = await file.read()
    if not image_bytes:
        raise HTTPException(status_code=400, detail="No se recibió archivo")

    try:
        image = _remove_bg(image_bytes)
        return image_to_base64(image, "png")
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail="No se pudo quitar el fondo") from exc


@router.post("/precise")
async def remove_background_precise(
    file: UploadFile = File(...),
    model: str = Form("isnet-general-use"),
    fg_threshold: int = Form(240),
    bg_threshold: int = Form(10),
    erode_size: int = Form(10),
):
    """
    Endpoint avanzado: permite ajustar modelo y parámetros de alpha matting.

    Modelos disponibles: isnet-general-use, u2net, u2net_human_seg, silueta, sam
    
    Consejos:
    - Personas/retratos → model=u2net_human_seg
    - Objetos generales → model=isnet-general-use
    - Cabello fino / bordes suaves → bajar fg_threshold (ej. 220) y erode_size (ej. 5)
    - Fondo muy parecido al sujeto → subir bg_threshold (ej. 15-20)
    """
    image_bytes = await file.read()
    if not image_bytes:
        raise HTTPException(status_code=400, detail="No se recibió archivo")

    try:
        image = _remove_bg(
            image_bytes,
            model=model,
            fg_threshold=fg_threshold,
            bg_threshold=bg_threshold,
            erode_size=erode_size,
        )
        return image_to_base64(image, "png")
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail="No se pudo quitar el fondo") from exc