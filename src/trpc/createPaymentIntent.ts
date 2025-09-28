import { TRPCError } from "@trpc/server";
import z from "zod";
import { stripe } from "~/lib/stripe";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const paymentRoute = createTRPCRouter({
  pay: protectedProcedure
    .input(
      z.object({
        amount: z.enum(["40", "100"]).transform(Number),
        userPlan: z.enum(["BASE", "PRO", "ELITE"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!input.amount || !input.userPlan) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Details are not provided correctly",
        });
      }
      try {
        if (!ctx.session) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "User is not authenticated",
          });
        }
        const id = ctx.session.user.id;
        const user = await ctx.db.user.findUnique({
          where: {
            id,
          },
        });

        if (!user) {
          throw new TRPCError({
            code: "NOT_FOUND",
          });
        }

        const paymentIntent = await stripe.products.create({
          name: `${input.userPlan} bought by ${user.email}`,
          default_price_data: {
            currency: "USD",
            unit_amount: input.amount,
          },
        });

        if (!paymentIntent) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Server issue while heading to the payment Gateway",
          });
        }

        const stripeSession = await stripe.checkout.sessions.create({
          success_url: `${process.env.NEXT_PUBLIC_REDIRECTURL}/thankyou`,
          cancel_url: `${process.env.NEXT_PUBLIC_REDIRECTURL}/billings`,
          payment_method_types: ["card", "amazon_pay"],
          mode: "payment",
          line_items: [
            {
              price_data: {
                currency: "usd",
                product_data: {
                  name: `${input.userPlan} plan bought by ${user.email}`,
                },
                unit_amount: input.amount * 100,
              },
              quantity: 1,
            },
          ],
          metadata: {
            userID: id,
            orderId: user.email,
            userPlan:input.userPlan
          },
        });

     
        return { url: stripeSession.url };
      } catch (error) {
        console.log(error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Internal server Error",
          cause: error,
        });
      }
    }),
});
