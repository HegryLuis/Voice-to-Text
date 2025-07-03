import { getAuth } from "@clerk/nextjs/server";
import { AssemblyAI } from "assemblyai";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const FREE_TIER_LIMIT = 2;

const client = new AssemblyAI({
  apiKey: process.env.ASSEMBLYAI_API_KEY as string,
});

export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 400 });
    }

    let user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      user = await prisma.user.create({ data: { id: userId } });
    }

    const isPremium = user.isPremium;

    if (!isPremium && user.transcriptionCount >= FREE_TIER_LIMIT) {
      return new NextResponse("Free tier limit is reached", { status: 402 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return new NextResponse("No file", { status: 400 });
    }

    const audioBuffer = await file.arrayBuffer();

    const transcript = await client.transcripts.transcribe({
      audio: Buffer.from(audioBuffer),
    });

    if (transcript.status === "error") {
      console.error("AssemblyAI Error:", transcript.error);
      return new NextResponse(transcript.error, { status: 500 });
    }

    const transcribedText = transcript.text;

    if (!transcribedText) {
      console.error("No text in response:", transcript);
      return new NextResponse("Transcription failed, empty response.", {
        status: 500,
      });
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { transcriptionCount: { increment: 1 } },
      }),

      prisma.transcription.create({
        data: { userId: userId, text: transcribedText },
      }),
    ]);

    return NextResponse.json({ text: transcribedText });
  } catch (err) {
    console.error("Error = ", err);
    return new NextResponse("Server error", { status: 500 });
  }
}
