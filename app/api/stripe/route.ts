import { getAuth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const apiUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const returnUrl = `${apiUrl}/dashboard`;

  console.log(`ReturnUrl: ${returnUrl}`);

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: "2025-06-30.basil",
  });

  try {
    const { userId } = getAuth(req);

    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) return new NextResponse("User not found", { status: 404 });

    if (user.isPremium) return NextResponse.redirect(returnUrl);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      billing_address_collection: "auto",
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID as string,
          quantity: 1,
        },
      ],
      metadata: {
        userId: userId,
      },
      success_url: returnUrl,
      cancel_url: returnUrl,
    });

    if (!session.url)
      return new NextResponse("Payment session URL not found", { status: 500 });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Payment error: ", error);
    return new NextResponse("Server error : ", { status: 500 });
  }
}
