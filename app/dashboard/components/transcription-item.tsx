"use client";

import { useState } from "react";
import { Transcription } from "@prisma/client";

interface TranscriptionItemProps {
  item: Transcription;
  isPremium: boolean;
}

export default function TranscriptionItem({
  item,
  isPremium,
}: TranscriptionItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const itemCardClasses = isPremium ? "text-slate-800" : "text-gray-700";

  const textColor = isPremium ? "text-slate-800" : "text-gray-700";

  const dateColor = isPremium ? "text-slate-600" : "text-gray-400";

  const characterLimit = 150;
  const isTooLong = item.text.length > characterLimit;

  return (
    <div
      className={`p-4 rounded-xl border transition-all duration-300 ${itemCardClasses}`}
    >
      <p
        className={`whitespace-pre-wrap text-sm leading-relaxed transition-all duration-300 ${textColor} ${
          isTooLong && !isExpanded ? "line-clamp-3" : ""
        }`}
      >
        {item.text}
      </p>

      {isTooLong && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`text-xs font-semibold mt-3 ${"text-blue-400 hover:text-blue-300"}`}
        >
          {isExpanded ? "Show less" : "Show more..."}
        </button>
      )}

      <p className={`text-xs mt-2 text-right ${dateColor}`}>
        {new Date(item.createdAt).toLocaleDateString()}
      </p>
    </div>
  );
}
