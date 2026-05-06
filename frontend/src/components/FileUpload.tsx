"use client";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, CheckCircle, AlertCircle, Loader2, X } from "lucide-react";
import { uploadDocument } from "@/lib/api";
import clsx from "clsx";

interface UploadedFile {
  name: string;
  chunks: number;
  status: "success" | "error";
  error?: string;
}

interface Props {
  onUploadComplete: () => void;
}

export default function FileUpload({ onUploadComplete }: Props) {
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  const onDrop = useCallback(async (accepted: File[]) => {
    setUploading(true);
    for (const file of accepted) {
      try {
        const result = await uploadDocument(file);
        setUploadedFiles((prev) => [
          ...prev,
          { name: file.name, chunks: result.chunks, status: "success" },
        ]);
      } catch (err: any) {
        setUploadedFiles((prev) => [
          ...prev,
          { name: file.name, chunks: 0, status: "error", error: err?.response?.data?.detail || "Upload failed" },
        ]);
      }
    }
    setUploading(false);
    onUploadComplete();
  }, [onUploadComplete]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "text/plain": [".txt"],
      "text/markdown": [".md"],
    },
    multiple: true,
  });

  return (
    <div className="space-y-3">
      <div
        {...getRootProps()}
        className={clsx(
          "border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200",
          isDragActive
            ? "border-indigo-500 bg-indigo-50"
            : "border-indigo-200 bg-white hover:border-indigo-400 hover:bg-indigo-50/50"
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-2">
          {uploading ? (
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          ) : (
            <Upload className="w-8 h-8 text-indigo-400" />
          )}
          <p className="text-sm font-medium text-gray-700">
            {uploading ? "Processing..." : isDragActive ? "Drop files here" : "Drop PDFs, TXT, or MD files"}
          </p>
          <p className="text-xs text-gray-400">or click to browse</p>
        </div>
      </div>

      {uploadedFiles.length > 0 && (
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {uploadedFiles.map((f, i) => (
            <div
              key={i}
              className={clsx(
                "flex items-start gap-2 p-2.5 rounded-lg text-xs",
                f.status === "success" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
              )}
            >
              {f.status === "success" ? (
                <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{f.name}</p>
                {f.status === "success" ? (
                  <p className="text-green-600">{f.chunks} chunks indexed</p>
                ) : (
                  <p className="text-red-600">{f.error}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
