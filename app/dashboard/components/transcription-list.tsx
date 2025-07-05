"use client";

import { Transcription } from "@prisma/client";
import TranscriptionItem from "./transcription-item";

interface TranscriptionListProps {
  transcriptions: Transcription[];
  isPremium: boolean;
}

export default function TranscriptionList({
  transcriptions,
  isPremium,
}: TranscriptionListProps) {
  const cardClasses = isPremium
    ? "bg-white/50 backdrop-blur-xl border border-white/30 shadow-2xl rounded-3xl"
    : "bg-white shadow-lg rounded-2xl";

  return (
    <div
      className={`bg-white p-6 md:p-8 rounded-2xl shadow-lg w-full max-w-md flex flex-col h-[100%] ${cardClasses}`}
    >
      <h2 className="h-[10%] text-2xl font-bold mb-5 text-gray-800 text-center">
        Your History
      </h2>

      <div className="max-h-[90%] overflow-y-auto space-y-4 pr-2 -mr-2">
        {transcriptions.length > 0 ? (
          transcriptions.map((item) => (
            <TranscriptionItem
              key={item.id}
              item={item}
              isPremium={isPremium}
            />

            // <div
            //   key={item.id}
            //   className={`p-4 border rounded-md ${itemCardClasses}`}
            // >
            //   <p
            //     className={`text-gray-600 whitespace-pre-wrap text-sm ${textColor}`}
            //   >
            //     {item.text}
            //   </p>
            //   <p className={`text-xs text-gray-400 mt-2 ${dateColor}`}>
            //     {new Date(item.createdAt).toLocaleString()}
            //   </p>
            // </div>
          ))
        ) : (
          <p className="text-gray-500">You have no transcriptions yet.</p>
        )}
      </div>
    </div>
  );
}
