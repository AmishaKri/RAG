from fastapi import FastAPI
# from fastapi.middleware.cors import CORSMiddleware
from app.modules.auth.router import router as auth_router

app = FastAPI() 


# CORS setup (Frontend connect karne ke liye)
# app.add_middleware(
#     CORSMiddleware,
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# Auth Router include karein
app.include_router(auth_router)

@app.get("/")
def home():
    return {"status": "running", "message": "Server is up and healthy"}