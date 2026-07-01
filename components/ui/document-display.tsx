// components/ui/document-display.tsx
"use client";

import { useState } from "react";

interface DocumentDisplayProps {
  document: string;
  label?: string;
}

export default function DocumentDisplay({ document, label = "Documento" }: DocumentDisplayProps) {
  const [copied, setCopied] = useState(false);

  const maskDocument = (doc: string) => {
    if (!doc) return "---";
    if (doc.length <= 4) return doc;
    
    const first = doc.charAt(0);
    const last = doc.charAt(doc.length - 1);
    const middle = "*".repeat(doc.length - 2);
    return `${first}${middle}${last}`;
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(document);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (error) {
      console.error("Erro ao copiar:", error);
      alert("Não foi possível copiar o documento");
    }
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-600 font-mono">{maskDocument(document)}</span>
      <button
        onClick={handleCopy}
        className="text-gray-400 hover:text-blue-600 transition-colors"
        title={`Copiar ${label}`}
      >
        {copied ? (
          <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        )}
      </button>
    </div>
  );
}