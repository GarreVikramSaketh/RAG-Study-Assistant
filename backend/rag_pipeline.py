import os
import io
import asyncio
from typing import List, Dict, Any
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_pinecone import PineconeVectorStore
from langchain.chains import ConversationalRetrievalChain
from langchain.memory import ConversationBufferMemory
from langchain.schema import Document
from pinecone import Pinecone, ServerlessSpec
import pdfplumber


class RAGPipeline:
    def __init__(self):
        self.openai_api_key = os.getenv("OPENAI_API_KEY")
        self.pinecone_api_key = os.getenv("PINECONE_API_KEY")
        self.pinecone_index_name = os.getenv("PINECONE_INDEX_NAME", "rag-study-assistant")

        self.embeddings = OpenAIEmbeddings(
            openai_api_key=self.openai_api_key,
            model="text-embedding-ada-002"
        )
        self.llm = ChatOpenAI(
            openai_api_key=self.openai_api_key,
            model_name="gpt-4o-mini",
            temperature=0.2,
        )
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            separators=["\n\n", "\n", ".", "!", "?", ",", " ", ""],
        )
        self.pc = Pinecone(api_key=self.pinecone_api_key)
        self._ensure_index()
        self.vector_store = PineconeVectorStore(
            index_name=self.pinecone_index_name,
            embedding=self.embeddings,
        )
        # Per-session memory
        self.sessions: Dict[str, ConversationBufferMemory] = {}

    def _ensure_index(self):
        existing = [i.name for i in self.pc.list_indexes()]
        if self.pinecone_index_name not in existing:
            self.pc.create_index(
                name=self.pinecone_index_name,
                dimension=1536,
                metric="cosine",
                spec=ServerlessSpec(cloud="aws", region="us-east-1"),
            )

    def _get_memory(self, session_id: str) -> ConversationBufferMemory:
        if session_id not in self.sessions:
            self.sessions[session_id] = ConversationBufferMemory(
                memory_key="chat_history",
                return_messages=True,
                output_key="answer",
            )
        return self.sessions[session_id]

    def _extract_text(self, content: bytes, filename: str, content_type: str) -> str:
        if filename.endswith(".pdf") or content_type == "application/pdf":
            with pdfplumber.open(io.BytesIO(content)) as pdf:
                text = "\n\n".join(
                    page.extract_text() or "" for page in pdf.pages
                )
            return text
        else:
            return content.decode("utf-8", errors="ignore")

    async def ingest_document(self, content: bytes, filename: str, content_type: str) -> Dict[str, Any]:
        loop = asyncio.get_event_loop()
        text = await loop.run_in_executor(None, self._extract_text, content, filename, content_type)

        if not text.strip():
            raise ValueError("Could not extract text from the document")

        chunks = self.text_splitter.split_text(text)
        docs = [
            Document(
                page_content=chunk,
                metadata={"source": filename, "chunk_index": i},
            )
            for i, chunk in enumerate(chunks)
        ]
        await loop.run_in_executor(None, lambda: self.vector_store.add_documents(docs))
        return {"chunks": len(docs)}

    async def query(self, question: str, session_id: str) -> Dict[str, Any]:
        memory = self._get_memory(session_id)
        retriever = self.vector_store.as_retriever(
            search_type="similarity",
            search_kwargs={"k": 5},
        )
        chain = ConversationalRetrievalChain.from_llm(
            llm=self.llm,
            retriever=retriever,
            memory=memory,
            return_source_documents=True,
            verbose=False,
        )
        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(None, lambda: chain({"question": question}))

        sources = []
        seen = set()
        for doc in result.get("source_documents", []):
            src = doc.metadata.get("source", "Unknown")
            chunk_idx = doc.metadata.get("chunk_index", 0)
            key = f"{src}-{chunk_idx}"
            if key not in seen:
                seen.add(key)
                sources.append({
                    "source": src,
                    "chunk_index": chunk_idx,
                    "excerpt": doc.page_content[:200] + "...",
                })

        return {"answer": result["answer"], "sources": sources}

    async def clear_index(self):
        index = self.pc.Index(self.pinecone_index_name)
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(None, lambda: index.delete(delete_all=True))
        self.sessions.clear()

    async def get_vector_count(self) -> int:
        index = self.pc.Index(self.pinecone_index_name)
        stats = index.describe_index_stats()
        return stats.total_vector_count
