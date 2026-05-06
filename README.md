# 📚 RAG Study Assistant

An AI-powered study tool that lets you upload PDFs and notes, then ask questions — getting answers with **cited sources** from your own content.

## 🧠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| Backend | FastAPI, Python |
| AI/ML | LangChain, OpenAI GPT-4o-mini, text-embedding-ada-002 |
| Vector DB | Pinecone (serverless) |
| File Parsing | pdfplumber |

---

## 🚀 Getting Started

### 1. Clone & Setup

```bash
git clone https://github.com/YOUR_USERNAME/rag-study-assistant.git
cd rag-study-assistant
```

### 2. Get API Keys

- **OpenAI**: https://platform.openai.com/api-keys
- **Pinecone**: https://app.pinecone.io/ → Create account → Get API key

### 3. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate (Mac/Linux)
source venv/bin/activate
# Activate (Windows)
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env and add your API keys

# Run the server
python main.py
```

Backend runs at: http://localhost:8000  
API docs at: http://localhost:8000/docs

### 4. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local if your backend is not on localhost:8000

# Run the dev server
npm run dev
```

Frontend runs at: http://localhost:3000

---

## 📁 Project Structure

```
rag-study-assistant/
├── backend/
│   ├── main.py              # FastAPI routes
│   ├── rag_pipeline.py      # LangChain + Pinecone RAG logic
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx     # Main app layout
│   │   │   ├── layout.tsx
│   │   │   └── globals.css
│   │   ├── components/
│   │   │   ├── ChatWindow.tsx    # Chat UI with markdown rendering
│   │   │   ├── FileUpload.tsx    # Drag-and-drop uploader
│   │   │   └── SourceCards.tsx  # Citation cards with excerpts
│   │   └── lib/
│   │       └── api.ts       # Axios API helpers
│   ├── package.json
│   └── tsconfig.json
└── README.md
```

---

## ✨ Features

- 📄 Upload PDFs, TXT, and Markdown files
- 🔍 Semantic search via Pinecone vector database
- 🤖 GPT-4o-mini answers with conversation memory (per session)
- 📚 Citation cards showing source file + excerpt
- 💬 Multi-turn chat with context
- 🗑️ Clear all indexed documents with one click

---

## 🔧 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/upload` | Upload and index a document |
| POST | `/chat` | Ask a question, get answer + sources |
| GET | `/documents/count` | Number of indexed chunks |
| DELETE | `/documents` | Clear all indexed documents |

---

## 🚢 Deployment

### Backend (Railway / Render)
```bash
# Set environment variables in your hosting dashboard:
OPENAI_API_KEY=sk-...
PINECONE_API_KEY=...
PINECONE_INDEX_NAME=rag-study-assistant
```

### Frontend (Vercel)
```bash
# Set environment variable:
NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app
```

---

## 📤 Git Commands (Push to GitHub)

```bash
# Initialize git (first time)
git init
git add .
git commit -m "feat: initial RAG Study Assistant project"

# Create repo on GitHub then:
git remote add origin https://github.com/YOUR_USERNAME/rag-study-assistant.git
git branch -M main
git push -u origin main

# Future updates:
git add .
git commit -m "feat: your change description"
git push
```

---

## 🎓 Learning Resources

- [LangChain Docs](https://python.langchain.com/docs/get_started/introduction)
- [Pinecone Quickstart](https://docs.pinecone.io/guides/get-started/quickstart)
- [OpenAI Embeddings](https://platform.openai.com/docs/guides/embeddings)
- [Next.js Docs](https://nextjs.org/docs)
