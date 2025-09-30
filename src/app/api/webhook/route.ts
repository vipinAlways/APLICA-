"use server";
import type { PlanType } from "@prisma/client";
import type Stripe from "stripe";
import { stripe } from "~/lib/stripe";
import { db } from "~/server/db";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return new Response("Invalid signature", { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SIGNING_SECRET!,
    );
  } catch (err) {
    return new Response(`Webhook Error ${String(err)}`, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    const { userId, userPlan, orderId } = session.metadata ?? {};

    if (!userId || !userPlan || !orderId) {
      console.error("Invalid metadata in session:", session.metadata);
      return new Response("Invalid metadata", { status: 400 });
    }
    await db.userPlan.upsert({
      where: { userId },
      update: { planType: userPlan as PlanType },
      create: { userId, planType: userPlan as PlanType },
    });
    const updateduserFeatues = await db.user.update({
      where: { id: userId },
      data: {
        resumeUpload: 0,
        numberOfEmail: 0,
        numberOfCoverLetter: 0,
        numberOfScore: 0,
      },
    });

    if (!updateduserFeatues) {
      throw new Error("Cann't find the user");
    }

    if (!session.payment_intent) {
      throw new Error("enable to find the payment id");
    }
    await db.paymentIntent.update({
      where: {
        id: orderId,
      },
      data: {
        stripePaymentIntentId: session.payment_intent
          ? (session.payment_intent as string)
          : "",
        status: "SUCCESS",
      },
    });
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 });
}
