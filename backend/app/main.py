# created by Copilot CLI runtime in VS Code - placeholder

from fastapi import FastAPI
from app.routes.auth import router as auth_router
app=FastAPI()

app.include_router(auth_router)

@app.get("/")
def home():
  return {"Hello": "World"}

# print("AI Project😀😀")