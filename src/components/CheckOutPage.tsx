"use client";
import {
  useStripe,
  useElements,
  PaymentElement,
} from "@stripe/react-stripe-js";
import React, { useState } from "react";

const CheckOutPage = ({ amount }: { amount: number }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success`,
        },
      });

      if (error) {
        setErrorMessage(error.message ?? "Payment failed");
      }
    } catch (err) {
      setErrorMessage("An unexpected error occurred");
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-md bg-white p-4 w-full">
      <PaymentElement />

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
  );
};

export default CheckOutPage;
