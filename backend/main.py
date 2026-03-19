from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
 
from config import ALLOWED_ORIGINS
 
app = FastAPI(title="Image Processing API", version="1.0.0")
 
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
 
 
@app.get("/")
def root():
    return {"message": "API funcionando 🚀"}