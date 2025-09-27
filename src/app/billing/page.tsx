"use client";

import type { PlanType } from "@prisma/client";
import { Elements } from "@stripe/react-stripe-js";
import React, { useCallback, useEffect, useState } from "react";
import CheckOutPage from "~/components/CheckOutPage";
import Loader from "~/components/Loader";
import { Button } from "~/components/ui/button";
import { planFeatures } from "~/lib/const";
import covertToSubcurrency from "~/lib/covertToSubcurrency";
import { cn } from "~/lib/utils";
import { api } from "~/trpc/react";
import { loadStripe } from "@stripe/stripe-js";

if (process.env.NEXT_PUBLIC_STRIPE_KEY === undefined) {
  throw new Error("NEXT_PUBLIC_STRIPE_KEY is not defined");
}

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY);

const Page = () => {
  const [user] = api.user.userPlanDetails.useSuspenseQuery();
  const [planData, setPlanData] = useState<{
    amount: number;
    userPlan: PlanType;
  }>({
    amount: 0,
    userPlan: "BASE",
  });
  const [showPaymentGetWay, setShowPaymentGetWay] = useState(false);
  const [loading, setLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState("");

  const handleSelect = useCallback(
    ({ amount, plan }: { amount: number; plan: PlanType }) => {
      setPlanData({ amount, userPlan: plan });
      setLoading(true);

      setTimeout(() => {
        setShowPaymentGetWay(true);
        setLoading(false);
      }, 1500);
    },
    [],
  );

  const { mutate: createPaymentIntent, isPending } =
    api.payment.pay.useMutation({
      onSuccess: (data) => {
        if (data?.clientSecret) {
          setClientSecret(data.clientSecret);
        }
      },
      onError: (error) => {
        console.error("Failed to create payment intent:", error);
      },
    });

  useEffect(() => {
    createPaymentIntent({
      amount: covertToSubcurrency(planData.amount),
      userPlan: planData.userPlan,
    });
  }, [planData, createPaymentIntent]);

  return (
    <div className="flex h-full flex-wrap items-center justify-center gap-5 px-20 py-20">
      {!showPaymentGetWay ? (
        planFeatures.map((plan, index) => (
          <div
            key={index}
            className={cn(
              "shadow-accent-foreground relative flex h-[30rem] flex-1 flex-col justify-around rounded-lg p-2 shadow-2xl",
              user?.UserPlan?.planType === plan.plan && "shadow-green-500",
            )}
          >
            {user?.UserPlan?.planType === plan.plan && (
              <div className="text-muted absolute -top-4 left-1/2 -translate-x-1/2 rounded-full border-2 border-green-700 bg-green-600 px-3 text-lg">
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
              onClick={() =>
                handleSelect({ amount: plan.price, plan: plan.plan })
              }
            >
              Select Plan
            </Button>
          </div>
        ))
      ) : loading || isPending ? (
        <Loader />
      ) : (
        <Elements
          stripe={stripePromise}
          options={{
            appearance: {
              theme: "stripe",
              variables: {
                colorPrimary: "#7c3aed",
              },
            },
            clientSecret,
          }}
        >
          <CheckOutPage amount={planData.amount} />
        </Elements>
      )}
    </div>
  );
};

export default Page;
