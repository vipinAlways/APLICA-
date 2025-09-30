"use client";

import { useCallback, useState } from "react";
import { signIn } from "next-auth/react";

import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { useRouter } from "next/navigation";

interface SignInProps {
  email: string;
  disable: boolean;
}

const SignIn = () => {
  const [authProp, setAuthProp] = useState<SignInProps>({
    email: "",
    disable: false,
  });
  const router = useRouter();

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (!authProp.email.includes("@")) {
        alert("Please enter a valid email");
        return;
      }

      setAuthProp((prev) => ({ ...prev, disable: true }));

      await signIn("nodemailer", {
        email: authProp.email,
        callbackUrl: "/",
      });

      setAuthProp((prev) => ({ ...prev, disable: false }));
      router.push("/api/auth/verify-request");
    },
    [authProp.email, router],
  );

  return (
    <section className="mt-20 flex w-full items-center justify-center">
      <div className="relative flex items-stretch">
        <div className="flex h-96 w-96 flex-1 flex-col items-center justify-between rounded-tl-lg rounded-bl-lg bg-black/10 p-8 backdrop-blur-3xl">
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
                className="borr rounded-md p-2 text-lg focus:outline-white"
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
            onClick={async () => {
              setAuthProp((prev) => ({ ...prev, disable: true }));
              await signIn("google", {
                callbackUrl: "/",
              });

              setAuthProp((prev) => ({ ...prev, disable: false }));
            }}
            className="mt-4 flex items-center justify-center gap-2 p-5 sm:text-xl"
            disabled={authProp.disable}
          >
            Sign in with Google
          </Button>
        </div>

        <div
          className={cn(
            "from-sidebar-accent to-sidebar h-96 w-96 flex-1 flex-col items-center justify-center gap-4 rounded-tr-lg rounded-br-lg border bg-black/10 backdrop-blur-3xl max-md:hidden md:flex",
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
