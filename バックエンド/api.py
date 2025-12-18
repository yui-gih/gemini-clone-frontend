from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import google.generativeai as genai
import os
from dotenv import load_dotenv

# .envファイルを読み込む
load_dotenv()

app = FastAPI()

# CORS設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Gemini APIの設定
api_key = os.environ.get("GEMINI_API_KEY")
genai.configure(api_key=api_key)

# 最新のflashモデルを使用
model = genai.GenerativeModel("models/gemini-2.5-flash")


class QuestionRequest(BaseModel):
    question: str


@app.get("/")
def read_root():
    return {"message": "hello"}


@app.post("/ask")
async def ask_gemini(request: QuestionRequest):
    try:
        response = model.generate_content(request.question)
        return {"answer": response.text}
    except Exception as e:
        return {"error": str(e)}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8080)
