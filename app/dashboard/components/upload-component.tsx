"use client";

import { useRouter } from "next/navigation";
import React, { useState, useRef } from "react";

const supportedLanguages = [
  { code: "auto", name: "Auto" },
  { code: "en", name: "English" },
  { code: "uk", name: "Ukrainian" },
  // ...
];

interface UploadComponentProps {
  isPremium: boolean;
  count: number;
}

export default function UploadComponent({
  isPremium,
  count,
}: UploadComponentProps) {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [transcription, setTranscription] = useState<string | null>(null);
  const [language, setLanguage] = useState("auto");

  const [isLoading, setIsLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

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
    } catch {
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
    formData.append("language", language);

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
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;

    if (files && files[0]) {
      if (files[0].type.startsWith("audio/")) {
        setFile(files[0]);
      } else {
        setError("Please, drop an audio file");
      }
    }
  };

  const cardClasses = isPremium
    ? "bg-white/50 backdrop-blur-xl border border-white/30 shadow-2xl rounded-3xl"
    : "bg-white shadow-lg rounded-2xl";

  const itemCardClasses = isPremium
    ? "bg-white/30 border-white/20 rounded-xl"
    : "text-gray-700";

  const textColor = isPremium ? "text-slate-800" : "text-gray-700";

  return (
    <div
      className={`bg-white p-6 rounded-lg shadow-md w-full max-w-md mx-auto max-h-[600px] ${cardClasses}`}
    >
      <div className="flex justify-between items-start">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Upload Your Audio
        </h2>
        {!isPremium && (
          <button
            onClick={handleGetPremium}
            disabled={isRedirecting}
            className="cursor-pointer bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-semibold py-2 px-4 rounded-md hover:from-yellow-500 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm shadow-md transition-transform transform hover:scale-105"
          >
            {isRedirecting ? "Redirecting..." : "Get Premium (1$)"}
          </button>
        )}
      </div>

      {!isPremium &&
        (count > 2 ? (
          <p className={`mb-2 text-center ${textColor}`}>
            You have made all free transcriptions.
          </p>
        ) : (
          <p className={`mb-2 text-center ${textColor}`}>
            You have made {count} / 2 free transcriptions.
          </p>
        ))}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label
            htmlFor="language-select"
            className={`block text-sm font-medium text-gray-700 mb-2 ${textColor}`}
          >
            Language to transcript
          </label>
          <div
            className="relative"
            onClick={() => setIsSelectOpen(!isSelectOpen)}
            onBlur={() => setIsSelectOpen(false)}
          >
            <select
              id="language-select"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className={`peer block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm 
                          focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm 
                          appearance-none cursor-pointer ${itemCardClasses}`}
            >
              <option value="" disabled className="text-gray-400">
                Please select a language...
              </option>
              {supportedLanguages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg
                className={`fill-current h-4 w-4 transition-transform duration-200 ${
                  isSelectOpen ? "rotate-180" : ""
                }`}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
              >
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </div>
          </div>
        </div>

        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`mt-1 flex flex-col items-center justify-center w-full h-36 px-6 
                       border-2 border-dashed rounded-xl transition-colors ${
                         isDragging
                           ? "border-blue-500 bg-blue-500/10"
                           : isPremium
                           ? "border-slate-600 hover:border-slate-500"
                           : "border-gray-300 hover:border-gray-400"
                       }`}
          >
            <div className="text-center">
              <svg
                className={`mx-auto h-10 w-10 ${
                  isPremium ? "text-slate-500" : "text-gray-400"
                }`}
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
                aria-hidden="true"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>

              <p className={`mt-2 text-sm`}>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="font-medium text-blue-500 hover:text-blue-400 focus:outline-none cursor-pointer"
                >
                  Upload a file
                </button>{" "}
                or drag and drop
              </p>
              <p
                className={`text-xs ${
                  isPremium ? "text-slate-500" : "text-gray-500"
                }`}
              >
                MP3, WAV, M4A up to 10MB
              </p>
              {file && (
                <p className="text-sm font-semibold text-green-500 mt-2">
                  Selected: {file.name}
                </p>
              )}
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || !file}
          className={`w-full bg-blue-600 text-white mt-2 py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 cursor-pointer ${textColor}`}
        >
          {isLoading ? "Transcribing..." : "Transcribe Audio"}
        </button>
      </form>

      {error && <p className="mt-4 text-red-500 text-center">{error}</p>}

      {transcription && (
        <div className="mt-6 p-4 bg-gray-50 rounded-md border max-h-[150px] overflow-y-auto">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Transcription Result:
          </h3>
          <p className="text-gray-600 whitespace-pre-wrap">{transcription}</p>
        </div>
      )}
    </div>
  );
}
