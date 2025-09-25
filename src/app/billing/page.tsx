"use client";
import React, { useState, useEffect } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import covertToSubcurrency from "~/lib/covertToSubcurrency";
import CheckOutPage from "~/components/CheckOutPage";
import { api } from "~/trpc/react";

if (process.env.NEXT_PUBLIC_STRIPE_KEY === undefined) {
  throw new Error("NEXT_PUBLIC_STRIPE_PUBLIC_KEY is not defined");
}
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY);

const PaymentPage = () => {
  const amount = 44;
  const [clientSecret, setClientSecret] = useState<string>("");

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
    createPaymentIntent({ amount: covertToSubcurrency(amount) });
  }, [amount, createPaymentIntent]);

  const handleSubmite = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
  };

  return (
    <main className="m-10 mx-auto max-w-6xl rounded-md border bg-gradient-to-tr from-blue-500 to-purple-500 p-10 text-center text-white">
      <div className="mb-10">
        <h1 className="mb-2 text-4xl font-extrabold">Sonny</h1>
        <h2 className="text-2xl">
          has requested
          <span className="font-bold"> ${amount}</span>
        </h2>
      </div>

      {isPending && (
        <div className="rounded-md bg-white/20 p-8">
          <p className="text-lg">Initializing payment...</p>
        </div>
      )}

      {clientSecret && (
        <Elements
          stripe={stripePromise}
          options={{
            appearance: {
              theme: "stripe",
              variables: {
                colorPrimary: "#7c3aed",
              },
            },
          }}
        >
          <CheckOutPage amount={amount} handleSubmite={handleSubmite} />
        </Elements>
      )}
    </main>
  );
};

export default PaymentPage;
