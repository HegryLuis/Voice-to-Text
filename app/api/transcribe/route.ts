import { getAuth } from "@clerk/nextjs/server";
import { AssemblyAI, TranscriptOptionalParams } from "assemblyai";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const FREE_TIER_LIMIT = 2;

export async function POST(req: NextRequest) {
  const client = new AssemblyAI({
    apiKey: process.env.ASSEMBLYAI_API_KEY as string,
  });

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
    const language = (formData.get("language") as string) || null;

    if (!file) return new NextResponse("No file", { status: 400 });

    const audioBuffer = await file.arrayBuffer();

    const params: TranscriptOptionalParams = {
      speaker_labels: true, // Divided by speakers
    };

    if (language && language !== "auto") {
      params.language_code = language;
    }

    const transcript = await client.transcripts.transcribe({
      audio: Buffer.from(audioBuffer),
      ...params,
    });

    if (transcript.status === "error") {
      console.error("AssemblyAI Error:", transcript.error);
      return new NextResponse(transcript.error, { status: 500 });
    }

    if (transcript.utterances && transcript.utterances.length > 1) {
      const formattedDialog = transcript.utterances
        .map((utterance) => `${utterance.speaker}: ${utterance.text}`)
        .join("\n\n");

      await prisma.$transaction([
        prisma.user.update({
          where: { id: userId },
          data: { transcriptionCount: { increment: 1 } },
        }),
        prisma.transcription.create({
          data: { userId: userId, text: formattedDialog },
        }),
      ]);

      return NextResponse.json({ text: formattedDialog });
    } else {
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
    }
  } catch (err) {
    console.error("Error = ", err);
    return new NextResponse("Server error", { status: 500 });
  }
}
