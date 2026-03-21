SUPPORTED_FORMATS: dict[str, str] = {
    "png": "image/png",
    "jpeg": "image/jpeg",
    "jpg": "image/jpeg",
    "webp": "image/webp",
    "bmp": "image/bmp",
}
 
ALLOWED_ORIGINS = [
    "http://127.0.0.1:4200",
    "http://localhost:4200",
    "https://octool.vercel.app",
]

ALLOWED_ORIGIN_REGEX = r"https://.*\.vercel\.app"
 