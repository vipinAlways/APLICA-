"use client";

import React from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "~/components/ui/dropdown-menu";
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from "~/components/ui/drawer";

import {
  Bookmark,
  BookmarkCheck,
  ChevronDownIcon,
  CreditCardIcon,
  Loader2Icon,
  LogOut,
} from "lucide-react";

import { useIsMobile } from "~/hooks/use-mobile";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { api } from "~/trpc/react";
import { planFeatures } from "~/lib/const";

import { Progress } from "./ui/progress";
import { cn } from "~/lib/utils";

const Nav = () => {
  const isMobile = useIsMobile();
  const session = useSession();
  const pathName = usePathname();

  const { data: userPlanDetails, isLoading: isPlanLoading } =
    api.user?.userPlanDetails.useQuery(undefined, {
      enabled: session.status === "authenticated",
      retry: 1,
    });

  const { data: user, isLoading: isUserLoading } =
    api.user?.existingUser?.useQuery(undefined, {
      enabled: session.status === "authenticated",
      retry: 1,
    });

  const fallbackAvatar =
    "https://cdn-icons-png.flaticon.com/512/149/149071.png";

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const isLoading =
    session.status === "loading" ||
    (session.status === "authenticated" && (isPlanLoading || isUserLoading));

  const getCurrentPlanFeatures = () => {
    if (!userPlanDetails?.UserPlan?.planType || !user) {
      return null;
    }

    return planFeatures.find(
      (plan) => userPlanDetails.UserPlan?.planType === plan.plan,
    )?.features;
  };

  const currentPlanFeatures = getCurrentPlanFeatures();

  return (
    <nav className="group w-full text-zinc-900">
      <div className="flex w-full items-center justify-between rounded-lg p-0.5 text-lg backdrop-blur-xl transition-all duration-150 ease-linear group-hover:scale-[0.98] group-focus:bg-white/40 md:p-2 md:text-2xl">
        <Link href={"/"}>
          <i>Aplica-</i>
        </Link>

        <div className="flex w-fit items-center justify-center gap-1 md:w-80">
          {isLoading ? (
            <Loader2Icon className="size-5 animate-spin border-black" />
          ) : session.status === "authenticated" ? (
            isMobile ? (
              <Drawer>
                <DrawerTrigger className="border-border/20 flex w-full items-center justify-between gap-x-2 overflow-hidden rounded-lg border bg-white/5 p-3 hover:bg-white/10">
                  <Avatar>
                    <AvatarImage
                      src={user?.image ?? fallbackAvatar}
                      alt={user?.name ?? "User avatar"}
                    />
                    <AvatarFallback className="text-lg">
                      {getInitials(user?.name)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex min-w-8 flex-1 flex-col gap-0.5 overflow-hidden text-left">
                    <p className="w-full truncate text-sm">
                      {user?.name ?? "User"}
                    </p>
                  </div>
                  <ChevronDownIcon className="size-4 shrink-0" />
                </DrawerTrigger>

                <DrawerContent>
                  <DrawerHeader>
                    <DrawerTitle>{user?.name ?? ""}</DrawerTitle>
                    <DrawerDescription>{user?.email}</DrawerDescription>
                  </DrawerHeader>

                  <DrawerFooter className="flex gap-2">
                    <Button variant={"outline"} asChild>
                      <Link href="/billing">
                        <CreditCardIcon className="size-4 text-black" />
                        Billing
                      </Link>
                    </Button>
                    <Button
                      variant={"outline"}
                      onClick={async (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        try {
                          await signOut({ callbackUrl: "/", redirect: true });
                        } catch (error) {
                          console.error("Logout failed:", error);
                          toast.error("Failed to logout. Please try again.");
                        }
                      }}
                    >
                      <LogOut className="size-4 text-black" />
                      Logout
                    </Button>
                  </DrawerFooter>
                </DrawerContent>
              </Drawer>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger className="border-border/20 flex w-72 items-center justify-between gap-x-2 overflow-hidden rounded-lg border bg-white/5 p-3 hover:bg-white/10">
                  <Avatar>
                    <AvatarImage
                      src={user?.image ?? fallbackAvatar}
                      alt={user?.name ?? "User avatar"}
                    />
                    <AvatarFallback className="text-lg">
                      {getInitials(user?.name)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex min-w-8 flex-1 flex-col gap-0.5 overflow-hidden text-left">
                    <p className="w-full truncate text-sm">
                      {user?.name ?? "User"}
                    </p>
                    <p className="w-full truncate text-xs">{user?.email}</p>
                  </div>
                  <ChevronDownIcon className="size-4 shrink-0" />
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  className="w-72"
                  onCloseAutoFocus={(e) => e.preventDefault()}
                >
                  <DropdownMenuLabel>
                    <div className="flex flex-col gap-1">
                      <span className="truncate font-medium">
                        {user?.name ?? "User"}
                      </span>
                      <span className="text-muted-foreground truncate text-sm font-normal">
                        {user?.email ?? "Email"}
                      </span>
                    </div>
                  </DropdownMenuLabel>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    className="flex cursor-pointer items-center justify-between"
                    onClick={async (e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      try {
                        await signOut({ callbackUrl: "/", redirect: true });
                      } catch (error) {
                        console.error("Logout failed:", error);
                        toast.error("Failed to logout. Please try again.");
                      }
                    }}
                  >
                    Logout
                    <LogOut className="size-4 shrink-0" />
                  </DropdownMenuItem>

                  <DropdownMenuItem>
                    <Link
                      href={"/billing"}
                      className="flex w-full cursor-pointer items-center justify-between"
                    >
                      Billing
                      <CreditCardIcon className="size-4 text-black" />
                    </Link>
                  </DropdownMenuItem>

                  {/* Only show limits if user has a plan and features exist */}
                  {currentPlanFeatures && (
                    <DropdownMenuItem className="flex flex-col items-start px-4">
                      <h5 className="mb-2 font-medium">Limits</h5>
                      {Object.entries(currentPlanFeatures).map(
                        ([key, value]) => {
                          type UserKey = keyof typeof user;
                          const usage = user?.[key as UserKey] ?? 0;
                          const percentage =
                            value === Infinity
                              ? 100
                              : Math.min(
                                  (Number(usage) / Number(value)) * 100,
                                  100,
                                );

                          return (
                            <div key={key} className="mb-2 w-full space-y-1.5">
                              <div className="flex justify-between text-sm">
                                <span className="capitalize">
                                  {key.replace(/([A-Z])/g, " $1").trim()}
                                </span>
                                <span>
                                  {String(usage)} /{" "}
                                  {value === Infinity ? "∞" : String(value)}
                                </span>
                              </div>
                              <Progress
                                value={percentage}
                                className={cn(percentage > 90 && "bg-red-600")}
                              />
                            </div>
                          );
                        },
                      )}
                    </DropdownMenuItem>
                  )}

                  {!userPlanDetails?.UserPlan && (
                    <DropdownMenuItem className="flex flex-col items-start px-4">
                      <h5 className="mb-2 font-medium">No Active Plan</h5>
                      <p className="text-muted-foreground text-sm">
                        <Link
                          href="/billing"
                          className="text-blue-600 hover:underline"
                        >
                          Choose a plan
                        </Link>{" "}
                        to start using features
                      </p>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )
          ) : (
            <div>
              <Link
                href={"/api/auth/authentication"}
                className="rounded-md bg-black/10 px-3 py-2 text-lg backdrop-blur-3xl transition-all ease-linear hover:bg-black/20"
              >
                Sign In
              </Link>
            </div>
          )}

          <Link href={"/bookmark"}>
            {pathName === "/bookmark" ? (
              <BookmarkCheck className="size-6" />
            ) : (
              <Bookmark className="size-6" />
            )}
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Nav;
