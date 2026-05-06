"use client";
import { FileText, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { Source } from "@/lib/api";

interface Props {
  sources: Source[];
}

export default function SourceCards({ sources }: Props) {
  const [expanded, setExpanded] = useState<number | null>(null);

  if (!sources || sources.length === 0) return null;

  return (
    <div className="mt-3">
      <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide mb-2">
        📚 Sources ({sources.length})
      </p>
      <div className="space-y-1.5">
        {sources.map((src, i) => (
          <div
            key={i}
            className="border border-indigo-100 rounded-lg overflow-hidden bg-indigo-50/40"
          >
            <button
              onClick={() => setExpanded(expanded === i ? null : i)}
              className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-indigo-50 transition-colors"
            >
              <FileText className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
              <span className="text-xs font-medium text-indigo-700 flex-1 truncate">{src.source}</span>
              <span className="text-xs text-indigo-400 flex-shrink-0">chunk #{src.chunk_index + 1}</span>
              {expanded === i ? (
                <ChevronUp className="w-3 h-3 text-indigo-400" />
              ) : (
                <ChevronDown className="w-3 h-3 text-indigo-400" />
              )}
            </button>
            {expanded === i && (
              <div className="px-3 pb-3 pt-1 border-t border-indigo-100">
                <p className="text-xs text-gray-600 leading-relaxed italic">"{src.excerpt}"</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
