import React from 'react';

/**
 * Renders status/origin badge based on processing mode.
 * Strictly no emojis, relying on monochrome typography and Terminal Green accents.
 */
export default function StatusBadge({ processedBy }) {
  if (!processedBy) return null;

  const isLocal = processedBy.toLowerCase().includes('local');
  const isGemini = processedBy.toLowerCase().includes('gemini') || processedBy.toLowerCase().includes('llm');

  if (isLocal) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono tracking-wider uppercase bg-[#f0f9f1] text-[#297a3a] border border-[#d1ebd5]">
        <span className="w-1.5 h-1.5 rounded-full bg-[#297a3a]"></span>
        Processed by Local OCR
      </span>
    );
  }

  if (isGemini) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono tracking-wider uppercase bg-[#f5f3ff] text-[#6d28d9] border border-[#ddd6fe]">
        <span className="w-1.5 h-1.5 rounded-full bg-[#6d28d9]"></span>
        Processed by Gemini Vision AI
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono tracking-wider uppercase bg-pure text-stone border border-hairline">
      <span className="w-1.5 h-1.5 rounded-full bg-graphite"></span>
      {processedBy}
    </span>
  );
}
