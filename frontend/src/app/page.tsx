"use client";
import { useState, useEffect, useCallback } from "react";
import { BookOpen, Trash2, Database, RefreshCw } from "lucide-react";
import FileUpload from "@/components/FileUpload";
import ChatWindow from "@/components/ChatWindow";
import { clearDocuments, getDocumentCount } from "@/lib/api";

const SESSION_ID = `session-${Date.now()}`;

export default function Home() {
  const [vectorCount, setVectorCount] = useState(0);
  const [clearing, setClearing] = useState(false);

  const refreshCount = useCallback(async () => {
    try {
      const count = await getDocumentCount();
      setVectorCount(count);
    } catch {}
  }, []);

  useEffect(() => {
    refreshCount();
  }, [refreshCount]);

  const handleClear = async () => {
    if (!confirm("Clear all indexed documents? This cannot be undone.")) return;
    setClearing(true);
    try {
      await clearDocuments();
      setVectorCount(0);
    } catch {}
    setClearing(false);
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-80 flex-shrink-0 flex flex-col bg-white border-r border-gray-100 shadow-sm">
        {/* Header */}
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-semibold text-gray-900">RAG Study Assistant</h1>
              <p className="text-xs text-gray-500">AI-powered document Q&A</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="px-5 py-3 border-b border-gray-100 bg-indigo-50/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-indigo-500" />
              <span className="text-xs font-medium text-indigo-700">
                {vectorCount} chunks indexed
              </span>
            </div>
            <button onClick={refreshCount} className="p-1 rounded hover:bg-indigo-100 transition-colors" title="Refresh">
              <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
            </button>
          </div>
        </div>

        {/* Upload */}
        <div className="p-5 flex-1 overflow-y-auto">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Upload Documents</p>
          <FileUpload onUploadComplete={refreshCount} />
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-gray-100">
          <button
            onClick={handleClear}
            disabled={clearing || vectorCount === 0}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-red-200 text-red-600 text-sm hover:bg-red-50 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Trash2 className="w-4 h-4" />
            {clearing ? "Clearing..." : "Clear All Documents"}
          </button>
          <p className="text-xs text-center text-gray-400 mt-3">
            Built with LangChain · Pinecone · OpenAI
          </p>
        </div>
      </aside>

      {/* Chat */}
      <main className="flex-1 flex flex-col min-w-0">
        <ChatWindow sessionId={SESSION_ID} vectorCount={vectorCount} />
      </main>
    </div>
  );
}
