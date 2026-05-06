from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
import os
from dotenv import load_dotenv

from rag_pipeline import RAGPipeline

load_dotenv()

app = FastAPI(title="RAG Study Assistant API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

rag = RAGPipeline()


class ChatRequest(BaseModel):
    question: str
    session_id: Optional[str] = "default"


class ChatResponse(BaseModel):
    answer: str
    sources: List[dict]
    session_id: str


@app.get("/")
def root():
    return {"message": "RAG Study Assistant API is running"}


@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    allowed_types = ["application/pdf", "text/plain", "text/markdown"]
    if file.content_type not in allowed_types and not file.filename.endswith((".pdf", ".txt", ".md")):
        raise HTTPException(status_code=400, detail="Only PDF, TXT, and MD files are supported")

    content = await file.read()
    result = await rag.ingest_document(content, file.filename, file.content_type)
    return {"message": f"Successfully ingested '{file.filename}'", "chunks": result["chunks"]}


@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    if not request.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty")

    result = await rag.query(request.question, request.session_id)
    return ChatResponse(
        answer=result["answer"],
        sources=result["sources"],
        session_id=request.session_id,
    )


@app.delete("/documents")
async def clear_documents():
    await rag.clear_index()
    return {"message": "All documents cleared from index"}


@app.get("/documents/count")
async def get_document_count():
    count = await rag.get_vector_count()
    return {"vector_count": count}


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
