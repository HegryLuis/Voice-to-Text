import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import HomeComponent from "./components/HomeComponent";

async function getUserData() {
  const { userId } = await auth();
  if (!userId) {
    return { isPremium: false };
  }
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isPremium: true },
  });
  return { isPremium: user?.isPremium ?? false };
}

export default async function Home() {
  const { isPremium } = await getUserData();

  return <HomeComponent isPremium={isPremium} />;
}
