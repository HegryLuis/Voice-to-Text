"use client";

import { Transcription } from "@prisma/client";

interface TranscriptionListProps {
  transcriptions: Transcription[];
  isPremium: boolean;
}

export default function TranscriptionList({
  transcriptions,
  isPremium,
}: TranscriptionListProps) {
  const cardClasses = isPremium
    ? "bg-white/30 backdrop-blur-lg border border-white/20 text-slate-800 shadow-2xl"
    : "bg-white text-gray-800 shadow-lg";

  const itemCardClasses = isPremium ? "text-slate-800" : "text-gray-700";

  const textColor = isPremium ? "text-slate-800" : "text-gray-700";

  const dateColor = isPremium ? "text-slate-600" : "text-gray-400";

  return (
    <div
      className={`bg-white p-6 md:p-8 rounded-2xl shadow-lg w-full max-w-md flex flex-col h-[550px] ${cardClasses}`}
    >
      <h2 className="h-[10%] text-2xl font-bold mb-5 text-gray-800 text-center">
        Your History
      </h2>

      <div className="max-h-[90%] overflow-y-auto space-y-4 pr-2 -mr-2">
        {transcriptions.length > 0 ? (
          transcriptions.map((item) => (
            <div
              key={item.id}
              className={`p-4 border rounded-md ${itemCardClasses}`}
            >
              <p
                className={`text-gray-600 whitespace-pre-wrap text-sm ${textColor}`}
              >
                {item.text}
              </p>
              <p className={`text-xs text-gray-400 mt-2 ${dateColor}`}>
                {new Date(item.createdAt).toLocaleString()}
              </p>
            </div>
          ))
        ) : (
          <p className="text-gray-500">You have no transcriptions yet.</p>
        )}
      </div>
    </div>
  );
}
