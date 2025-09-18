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
    <section className="mt-20 flex w-full items-center justify-center">
      <div className="relative flex min-h-96 items-stretch">
        <div className="flex w-96 flex-1 flex-col items-center justify-between rounded-tl-lg rounded-bl-lg bg-white/25 p-8">
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
                className="borr rounded-md p-2 text-lg outline-green-950 focus:outline-red-500"
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
        <div className="flex w-96 flex-1 flex-col items-center justify-center rounded-tl-lg rounded-bl-lg bg-white/25 p-8">
          <h1 className="text-center text-xl font-semibold sm:text-2xl">
            Welcome to Aplica-
          </h1>

          <form
            onSubmit={handleSubmit}
            className="flex h-fit flex-col items-center gap-1.5 p-8 text-lg sm:text-xl"
          >
            <div className="flex w-full flex-col gap-2">
              <div className="flex flex-col gap-0.5">
                <label htmlFor="email">Email </label>
                <input
                  className="rounded-md border p-2 text-lg text-[#4A4A6A] focus:border-blue-500 focus:outline-none"
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

              <div>
                {" "}
                <label htmlFor="email" className="">
                  Name{" "}
                </label>
                <input
                  className="rounded-md border p-2 text-lg text-[#4A4A6A] focus:border-blue-500 focus:outline-none"
                  id="email"
                  type="text"
                  placeholder="Enter you Name"
                  value={authProp.email}
                  onChange={(e) =>
                    setAuthProp((prev) => ({ ...prev, email: e.target.value }))
                  }
                  disabled={authProp.disable}
                />
              </div>

              <div>
                <label htmlFor="email">Email </label>
                <input
                  className="rounded-md border p-2 text-lg text-[#4A4A6A] focus:border-blue-500 focus:outline-none"
                  id="email"
                  type="password"
                  placeholder="Must contain 8 chracter"
                  value={authProp.email}
                  onChange={(e) =>
                    setAuthProp((prev) => ({ ...prev, email: e.target.value }))
                  }
                  disabled={authProp.disable}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full text-zinc-100"
              disabled={authProp.disable}
            >
              Sign Up
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
            Sign up with Google
          </Button>
        </div>

        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: isSignIn ? 0 : "100%" }}
          transition={{
            type: "spring",
            duration: 0.6,
            bounce: 0.2,
          }}
          className={cn(
            "from-sidebar-accent to-sidebar absolute top-0 hidden h-full w-96 flex-1 flex-col items-center justify-center gap-4 rounded-tr-lg rounded-br-lg border bg-radial md:flex",
          )}
        >
          <i className="text-3xl">Aplica-</i>
          <Button type="button" onClick={() => setIsSignIn(!isSignIn)}>
            {isSignIn ? "Sign In" : "Sign Up"}
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default SignIn;
