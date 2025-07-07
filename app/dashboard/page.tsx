import UploadComponent from "./components/upload-component";
import { Suspense } from "react";
import TranscriptionList from "./components/transcription-list";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import Footer from "./components/Footer";
import DashboardHeader from "./components/dashboard-header";

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
    ? "bg-gradient-to-br from-yellow-200 via-amber-200 to-orange-200"
    : "bg-gradient-to-br from-indigo-200 via-purple-200 to-pink-200";

  return (
    <div
      className={`w-full min-h-screen flex-col-reverse p-4 lg:flex-row flex lg:h-[100vh] ${background}`}
    >
      <div className=" flex items-center justify-center w-full md:p-6">
        <TranscriptionList
          transcriptions={transcriptions}
          isPremium={isPremium}
        />
      </div>

      <main className=" flex-grow w-full flex flex-col  justify-between w-[65%]">
        <div className="w-[100%]  flex flex-col">
          <DashboardHeader isPremium={isPremium} />

          <div className="flex space-between flex-row-reverse items-center">
            <UploadComponent isPremium={isPremium} count={count} />
            <Suspense
              fallback={<p className="text-center mt-4">Loading history...</p>}
            ></Suspense>
          </div>
        </div>
        <Footer />
      </main>
    </div>
  );
}
