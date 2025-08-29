"use client";

import { useCallback, useState } from "react";
import { signIn } from "next-auth/react";

import { api } from "~/trpc/react";
import Image from "next/image";
import { Button } from "~/components/ui/button";

interface SignInProps {
  email: string;
  disable: boolean;
}

const SignIn = () => {
  const [authProp, setAuthProp] = useState<SignInProps>({
    email: "",
    disable: false,
  });
 const userQuery = api.user.existingUser.useQuery(
    undefined,
    {
      enabled: !!authProp.email && authProp.email.includes("@"),
    }
  );
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

  return (
    <section className="flex min-h-screen w-full items-center justify-center bg-zinc-300">
      <div className="flex h-96 items-stretch">
        <div className="flex w-96 flex-1 flex-col items-center justify-center rounded-tl-lg rounded-bl-lg bg-white">
          <h1 className="text-center text-xl font-semibold sm:text-2xl">
            Welcome to Meet.AI
          </h1>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col items-center gap-4 p-8 text-lg sm:text-xl"
          >
            <div className="flex w-full flex-col gap-2">
              <label htmlFor="email">Email</label>
              <input
                className="rounded-md border p-2 focus:border-blue-500 focus:outline-none"
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

        <div className="from-sidebar-accent to-sidebar hidden w-96 flex-1 flex-col items-center justify-center gap-4 rounded-tr-lg rounded-br-lg border bg-radial md:flex">
          <Image
            src={"/svgs/logo.svg"}
            alt="logo"
            width={120}
            height={60}
            className="object-cover"
          />
          <span className="text-3xl text-zinc-100">Meet.AI</span>
        </div>
      </div>
    </section>
  );
};

export default SignIn;
