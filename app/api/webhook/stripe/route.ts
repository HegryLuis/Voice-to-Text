import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/db";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET as string;

export async function POST(req: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: "2025-06-30.basil",
  });

  const body = await req.text();
  const signature = (await headers()).get("stripe-signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    let err = "Unknown error";

    if (error instanceof Error) {
      err = error.message;
    }
    console.error("Webhook signature verification failed!", err);
    return new NextResponse(`Webhook responce ${err}`, {
      status: 400,
    });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  if (event.type === "checkout.session.completed") {
    const userId = session?.metadata?.userId;
    if (!userId) {
      console.error("No userId in metadata!");
      return new NextResponse(
        `Webhook error, not user ID in session's metadata`,
        { status: 400 }
      );
    }

    try {
      await prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          isPremium: true,
        },
      });
    } catch (dbError) {
      console.error(`Database update failed for user ${userId}:`, dbError);
      return new NextResponse("Database error during user update", {
        status: 500,
      });
    }
  }

  return new NextResponse("User has given a premium status", { status: 200 });
}
