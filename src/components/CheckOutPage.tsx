"use client";
import type { PlanType } from "@prisma/client";
import { useStripe, useElements, Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import React, { useEffect, useState } from "react";
import covertToSubcurrency from "~/lib/covertToSubcurrency";
import { api } from "~/trpc/react";

if (process.env.NEXT_PUBLIC_STRIPE_KEY === undefined) {
  throw new Error("NEXT_PUBLIC_STRIPE_PUBLIC_KEY is not defined");
}
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY);

const CheckOutPage = ({
  amount,
  userPlan,
}: {
  amount: number;
  userPlan: PlanType;
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [clientSecret, setClientSecret] = useState<string>("");
  const [err, setError] = useState<string>("");

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
    createPaymentIntent({ amount: covertToSubcurrency(amount), userPlan });
  }, [amount, createPaymentIntent]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    const { error: submitError } = await elements.submit();

    if (submitError && submitError.message) {
      setError(submitError.message);
      return;
    }

    const { error } = await stripe.confirmPayment({
      elements,
      clientSecret,
      confirmParams: {
        return_url: `https://www.localhost:3000/payment-success?amount=${amount}`,
      },
    });

    if (error && error.message) {
      setError(error?.message);
    } else {
    }
  };

  if (!clientSecret || stripe || !elements) {
    return (
      <div className="flex items-center justify-center">
        <div
          className="text-surface inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-e-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite] dark:text-white"
          role="status"
        >
          <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !border-0 !p-0 !whitespace-nowrap ![clip:rect(0,0,0,0)]">
            Loading...
          </span>
        </div>
      </div>
    );
  }

  // const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  //   e.preventDefault();

  //   if (!stripe || !elements) {
  //     return;
  //   }

  //   setLoading(true);
  //   setErrorMessage("");

  //   try {
  //     const { error } = await stripe.confirmPayment({
  //       elements,
  //       confirmParams: {
  //         return_url: `${window.location.origin}/payment-success`,
  //       },
  //     });

  //     if (error) {
  //       setErrorMessage(error.message || "Payment failed");
  //     }
  //   } catch (err) {
  //     setErrorMessage("An unexpected error occurred");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

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
          <form onSubmit={handleSubmit} className="rounded-md bg-white p-4">
            {}

            {errorMessage && (
              <div className="mt-2 rounded-md bg-red-50 p-3 text-sm text-red-600">
                {errorMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={!stripe || !elements || loading}
              className="mt-4 w-full rounded-md bg-black p-4 font-bold text-white transition-all hover:bg-gray-800 disabled:animate-pulse disabled:opacity-50"
            >
              {!loading ? `Pay $${amount}` : "Processing..."}
            </button>
          </form>
        </Elements>
      )}
    </main>
  );
};

export default CheckOutPage;
