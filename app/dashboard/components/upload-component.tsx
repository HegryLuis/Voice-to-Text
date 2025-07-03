"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface UploadComponentProps {
  isPremium: boolean;
}

export default function UploadComponent({ isPremium }: UploadComponentProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transcription, setTranscription] = useState<string | null>(null);

  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleGetPremium = async () => {
    setIsRedirecting(true);
    setError(null);
    try {
      const response = await fetch("/api/stripe");
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("Could not retrieve payment URL.");
      }
    } catch (err) {
      setError("Failed to redirect to payment page. Please try again.");
      setIsRedirecting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a file first.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setTranscription(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        if (response.status === 402) {
          setError("Free limit reached. Redirecting to payment...");
          await handleGetPremium();
        } else {
          const errorData = await response
            .json()
            .catch(() => ({ message: response.statusText }));
          throw new Error(errorData.message || "Failed to transcribe.");
        }
        return;
      }

      const data = await response.json();
      setTranscription(data.text);

      router.refresh();
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md mx-auto max-h-[500px]">
      <div className="flex justify-between items-start mb-6">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Upload Your Audio
        </h2>
        {!isPremium && (
          <button
            onClick={handleGetPremium}
            disabled={isRedirecting}
            className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-semibold py-2 px-4 rounded-md hover:from-yellow-500 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm shadow-md transition-transform transform hover:scale-105"
          >
            {isRedirecting ? "Redirecting..." : "Get Premium"}
          </button>
        )}
      </div>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <input
            type="file"
            accept="audio/*"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading || !file}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
        >
          {isLoading ? "Transcribing..." : "Transcribe Audio"}
        </button>
      </form>

      {error && <p className="mt-4 text-red-500 text-center">{error}</p>}

      {transcription && (
        <div className="mt-6 p-4 bg-gray-50 rounded-md border max-h-[200px] overflow-y-auto">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Transcription Result:
          </h3>
          <p className="text-gray-600 whitespace-pre-wrap">{transcription}</p>
        </div>
      )}
    </div>
  );
}
