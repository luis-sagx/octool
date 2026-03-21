from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import ALLOWED_ORIGIN_REGEX, ALLOWED_ORIGINS
from routes import background, base64_tools, compress, convert, resize

app = FastAPI(title="Image Processing API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_origin_regex=ALLOWED_ORIGIN_REGEX,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(background.router)
app.include_router(resize.router)
app.include_router(compress.router)
app.include_router(convert.router)
app.include_router(base64_tools.router)


@app.get("/")
def root():
    return {"message": "API funcionando 🚀"}