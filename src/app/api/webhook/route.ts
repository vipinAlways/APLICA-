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
    console.log(err);
    return new Response("Webhook Error", { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const { userId, userPlan } = session.metadata ?? {};

    if (!userId || !userPlan) {
      console.error("Invalid metadata in session:", session.metadata);
      return new Response("Invalid metadata", { status: 400 });
    }
    const updatesUserPlan = await db.userPlan.update({
      where: { userId },
      data: { planType: userPlan as PlanType },
    });

    if (!updatesUserPlan) {
      throw new Error("Cann't find the user");
    }
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
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 });
}
