"use client";

import { Transcription } from "@prisma/client";

interface TranscriptionListProps {
  transcriptions: Transcription[];
  count: number;
  isPremium: boolean;
}

export default function TranscriptionList({
  transcriptions,
  count,
  isPremium,
}: TranscriptionListProps) {
  return (
    <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md mx-auto flex flex-col h-[550px]">
      <h2 className="text-2xl font-bold mb-5 text-gray-800 text-center">
        Your History
      </h2>

      {!isPremium && (
        <p className="text-gray-500 mb-4">
          You have made {count} / 2 free transcriptions.
        </p>
      )}

      <div className="max-h-[400px] overflow-y-auto space-y-4 pr-2 -mr-2">
        {transcriptions.length > 0 ? (
          transcriptions.map((item) => (
            <div key={item.id} className="p-4 border rounded-md">
              <p className="text-gray-600 whitespace-pre-wrap text-sm">
                {item.text}
              </p>
              <p className="text-xs text-gray-400 mt-2">
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
