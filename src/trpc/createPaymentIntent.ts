import { TRPCError } from "@trpc/server";
import { NextResponse } from "next/server";
import z from "zod";
import { stripe } from "~/lib/stripe";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const paymentRoute = createTRPCRouter({
  pay: protectedProcedure
    .input(
      z.object({
        amount: z.number(),
        userPlan: z.enum(["BASE", "PRO", "ELITE"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const paymentIntent = await stripe.paymentIntents.create({
          amount: input.amount,
          currency: "usd",
          automatic_payment_methods: { enabled: true },
        });

        const updateUserPlan = await ctx.db.userPlan.update({
          where: {
            id: ctx.session.user.id,
          },
          data: {
            planType: input.userPlan,
          },
        });

        return { clientSecret: paymentIntent.client_secret };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Internal server Error",
          cause: error,
        });
      }
    }),
});
