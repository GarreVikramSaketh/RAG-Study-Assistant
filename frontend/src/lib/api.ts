import axios from "axios";

const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
});

export interface Source {
  source: string;
  chunk_index: number;
  excerpt: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
}

export const uploadDocument = async (file: File): Promise<{ message: string; chunks: number }> => {
  const form = new FormData();
  form.append("file", file);
  const { data } = await API.post("/upload", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

export const sendQuestion = async (
  question: string,
  sessionId: string
): Promise<{ answer: string; sources: Source[] }> => {
  const { data } = await API.post("/chat", { question, session_id: sessionId });
  return data;
};

export const clearDocuments = async (): Promise<void> => {
  await API.delete("/documents");
};

export const getDocumentCount = async (): Promise<number> => {
  const { data } = await API.get("/documents/count");
  return data.vector_count;
};
