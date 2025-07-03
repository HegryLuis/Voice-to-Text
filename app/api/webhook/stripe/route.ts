import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/db";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-06-30.basil",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET as string;

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = (await headers()).get("stripe-signature") as string;

  console.log("--- Webhook Received ---");
  console.log("Signature:", signature);
  console.log(
    "Webhook Secret (from env):",
    webhookSecret ? "Loaded" : "NOT LOADED"
  );

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error: any) {
    console.error("Webhook signature verification failed!", error.message);
    return new NextResponse(`Webhook responce ${error.message}`, {
      status: 400,
    });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  console.log("✅ Webhook verified successfully!");
  console.log("Event Type:", event.type);

  if (event.type === "checkout.session.completed") {
    console.log("Processing checkout.session.completed event.");
    console.log("Metadata:", session?.metadata);

    const userId = session?.metadata?.userId;
    if (!userId) {
      console.error("No userId in metadata!");
      return new NextResponse(
        `Webhook error, not user ID in session's metadata`,
        { status: 400 }
      );
    }

    console.log(`Found userId: ${userId}. Attempting to update user...`);

    // await prisma.user.update({
    //   where: {
    //     id: session.metadata.userId,
    //   },
    //   data: {
    //     isPremium: true,
    //   },
    // });

    try {
      await prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          isPremium: true,
        },
      });
      console.log(`Successfully updated user ${userId} to premium.`);
    } catch (dbError) {
      console.error(`Database update failed for user ${userId}:`, dbError);
      return new NextResponse("Database error during user update", {
        status: 500,
      });
    }
  }

  return new NextResponse("User has given a premium status", { status: 200 });
}
