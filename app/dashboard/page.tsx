import UploadComponent from "./components/upload-component";
import { Suspense } from "react";
import TranscriptionList from "./components/transcription-list";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { UserButton } from "@clerk/nextjs";
import Footer from "./components/Footer";

async function getUserData() {
  const { userId } = await auth();

  if (!userId) return { transcriptions: [], count: 0, isPremium: false };

  const [transcriptions, user] = await Promise.all([
    prisma.transcription.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.findUnique({
      where: { id: userId },
    }),
  ]);

  if (!user) return { transcriptions: [], count: 0, isPremium: false };

  return {
    transcriptions,
    count: user?.transcriptionCount ?? 0,
    isPremium: user?.isPremium as boolean,
  };
}

export default async function DashboardPage() {
  const { transcriptions, count, isPremium } = await getUserData();

  const background = isPremium
    ? "bg-gradient-to-br from-amber-200 via-yellow-500 to-amber-700"
    : "bg-gradient-to-r from-blue-400 to-purple-500";

  return (
    <div className={`min-h-screen bg-gray-100 ${background}`}>
      <header className={`shadow`}>
        <div className="mx-auto py-4 px-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className=" group relative
          p-2 rounded-full text-gray-600 
          bg-gray-100 hover:text-gray-900 
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
          transition-all duration-200
        "
              aria-label="Back to main page"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-4 w-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
                />
              </svg>

              <span
                className="
            absolute left-1/2 -translate-x-1/2 top-full mt-2 w-max 
            px-2 py-1 bg-gray-800 text-white text-xs rounded-md 
            opacity-0 invisible group-hover:opacity-100 group-hover:visible 
            transition-all duration-300
          "
              >
                Back to main page
              </span>
            </Link>
            <div className="relative flex items-center justify-center">
              {isPremium && (
                <div
                  className="absolute -top-4.5 -left-1 transform -rotate-12"
                  title="Premium Account"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-8 h-8 drop-shadow-md text-black"
                  >
                    <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7z" />
                  </svg>
                </div>
              )}
              <UserButton />
            </div>
          </div>
        </div>
      </header>
      <main>
        <div>
          <div className="flex space-between flex-row-reverse items-center">
            <UploadComponent isPremium={isPremium} count={count} />
            <Suspense
              fallback={<p className="text-center mt-4">Loading history...</p>}
            >
              <TranscriptionList transcriptions={transcriptions} />
            </Suspense>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
