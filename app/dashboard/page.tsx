import UploadComponent from "./components/upload-component";
import { Suspense } from "react";
import TranscriptionList from "./components/transcription-list";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { UserButton } from "@clerk/nextjs";

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

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
          <div className="flex items-center">
            <Link className="text-sm text-gray-900 mr-5 font-bold" href="/">
              Back to main page
            </Link>
            <UserButton />
          </div>
        </div>
      </header>
      <main>
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0 flex space-between flex-row-reverse items-center">
            <UploadComponent isPremium={isPremium} />
            <Suspense
              fallback={<p className="text-center mt-4">Loading history...</p>}
            >
              <TranscriptionList
                transcriptions={transcriptions}
                count={count}
                isPremium={isPremium}
              />
            </Suspense>
          </div>
        </div>
      </main>
    </div>
  );
}
