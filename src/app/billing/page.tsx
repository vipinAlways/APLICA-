"use client";

import type { PlanType } from "@prisma/client";
import React, { useCallback } from "react";
import { Button } from "~/components/ui/button";
import { planFeatures } from "~/lib/const";
import { cn } from "~/lib/utils";
import { api } from "~/trpc/react";

import { useRouter } from "next/navigation";

if (process.env.NEXT_PUBLIC_STRIPE_KEY === undefined) {
  throw new Error("NEXT_PUBLIC_STRIPE_KEY is not defined");
}

const Page = () => {
  const [user] = api.user.userPlanDetails.useSuspenseQuery();
    const route = useRouter();
  const { mutate: createPaymentIntent, isPending } =
    api.payment.pay.useMutation({
      onSuccess: ({ url }) => {
        route.replace(url!);
      },
      onError: (error) => {
        console.error("Failed to create payment intent:", error);
      },
    });

  const handleSelect = useCallback(
    ({ amount, plan }: { amount: "40" | "100"; plan: PlanType }) => {
      createPaymentIntent({
        amount: amount,
        userPlan: plan,
      });
    },
    [createPaymentIntent],
  );

  return (
    <div className="flex h-full flex-wrap items-center justify-center gap-5 px-20 py-20">
      {
        planFeatures.map((plan, index) => (
          <div
            key={index}
            className={cn(
              "shadow-accent-foreground relative flex h-[30rem] flex-1 flex-col justify-around rounded-lg p-2 shadow-2xl",
              user?.UserPlan?.planType === plan.plan && "shadow-green-500",
            )}
          >
            {user?.UserPlan?.planType === plan.plan && (
              <div className="text-muted absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-green-600 px-3 text-lg">
                <span>Current</span>
              </div>
            )}
            <h1 className="bg-muted-foreground text-muted w-full rounded-xl py-2 text-center text-xl font-semibold">
              {plan.plan}
            </h1>

            <h2 className="w-full text-center text-5xl">$ {plan.price}</h2>
            <div className="flex flex-col gap-2 p-2">
              <ul className="list-inside list-disc space-y-2">
                {Object.entries(plan.features).map(([key, value]) => (
                  <li key={key}>
                    <span className="text-base font-medium capitalize">
                      {key}
                    </span>
                    : {value}
                  </li>
                ))}
              </ul>
            </div>

            <Button
              className="w-full"
              onClick={() => {
                if (plan.price !== "0") {
                  handleSelect({
                    amount: plan.price,
                    plan: plan.plan,
                  });
                }
              }}
              disabled={isPending}
            >
              Select Plan
            </Button>
          </div>
        ))}
    </div>
  );
};

export default Page;
