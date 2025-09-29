"use client";

import { useCallback, useState } from "react";
import { signIn } from "next-auth/react";
import { motion } from "motion/react";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

interface SignInProps {
  email: string;
  name: string;
  password: string;
  disable: boolean;
}

const SignIn = () => {
  const [authProp, setAuthProp] = useState<SignInProps>({
    email: "",
    name: "",
    password: "",
    disable: false,
  });
  const userQuery = api.user.existingUser.useQuery(undefined, {
    enabled: !!authProp.email && authProp.email.includes("@"),
  });
  const [isSignIn, setIsSignIn] = useState<boolean>(true);
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!authProp.email.includes("@")) {
        alert("Please enter a valid email");
        return;
      }

      const isExistingUser = userQuery.data;

      await signIn("nodemailer", {
        email: authProp.email,
        callbackUrl: isExistingUser ? "/" : "/profile",
      });

      setAuthProp((prev) => ({ ...prev, disable: true }));
    },
    [authProp.email, userQuery.data],
  );

  // const handleSignup = useCallback(async () => {
  //   //TODO:signup functionality with credentical
  //   console.log("hogyasignup");
  // }, []);

  return (
    <section className="mt-20 flex w-full items-center justify-center ">
      <div className="relative flex items-stretch ">
        <div className="flex w-96 flex-1 flex-col h-96 items-center justify-between rounded-tl-lg rounded-bl-lg bg-black/10 backdrop-blur-3xl p-8">
          <h1 className="text-center text-xl font-semibold sm:text-2xl">
            Welcome Back
          </h1>

          <form
            onSubmit={handleSubmit}
            className="flex h-fit flex-col items-center gap-4 p-8 text-lg sm:text-xl"
          >
            <div className="flex w-full flex-col gap-2">
              <label htmlFor="email">Email</label>
              <input
                className="borr rounded-md p-2 text-lg   focus:outline-white"
                id="email"
                type="email"
                placeholder="Email"
                value={authProp.email}
                onChange={(e) =>
                  setAuthProp((prev) => ({ ...prev, email: e.target.value }))
                }
                disabled={authProp.disable}
              />
            </div>

            <Button
              type="submit"
              className="w-full text-zinc-100"
              disabled={authProp.disable}
            >
              Sign In
            </Button>
          </form>

          <div className="text-center">Or With</div>

          <Button
            onClick={() =>
              signIn("google", {
                callbackUrl: "/",
              })
            }
            className="mt-4 flex items-center justify-center gap-2 p-5 sm:text-xl"
          >
            Sign in with Google
          </Button>
        </div>

        <div
          className={cn(
            "from-sidebar-accent to-sidebar  h-96 w-96 flex-1 flex-col items-center justify-center gap-4 rounded-tr-lg rounded-br-lg border bg-black/10 backdrop-blur-3xl  md:flex",
          )}
        >
          <h2 className="text-3xl font-semibold">Welcome To</h2>
          <i className="text-3xl">Aplica-</i>
        </div>
      </div>
    </section>
  );
};

export default SignIn;
