"use client";
import React from "react";
import { useSession } from "next-auth/react";

import { signOut } from "next-auth/react";

import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "~/components/ui/drawer";

import { ChevronDownIcon, CreditCardIcon, LogOut } from "lucide-react";
import { useIsMobile } from "~/hooks/use-mobile";
import { Avatar, AvatarImage } from "./ui/avatar";
import { toast } from "sonner";
import Link from "next/link";

const Nav = () => {
  const session = useSession();
  const isMobile = useIsMobile();

  return (
    <nav className="group w-full">
      <div className="flex w-full items-center justify-between rounded-lg p-2 text-2xl backdrop-blur-xl transition-all duration-150 ease-linear group-hover:scale-[0.98] group-focus:bg-white/40">
        <Link href={"/"}>
          <i>Aplica-</i>
        </Link>
        <div className="flex w-80 items-center justify-center">
          {session.data ? (
            isMobile ? (
              <Drawer>
                <DrawerTrigger className="border-border/20 flex w-full items-center justify-between gap-x-2 overflow-hidden rounded-lg border bg-white/5 p-3 hover:bg-white/10">
                  <Avatar>
                    <AvatarImage
                      src={session.data.user.image!}
                      alt="avatar"
                      className="rounded-full"
                    />
                  </Avatar>

                  <div className="flex min-w-8 flex-1 flex-col gap-0.5 overflow-hidden text-left">
                    <p className="w-full truncate text-sm">
                      {" "}
                      {session.data.user.name ?? "User"}
                    </p>
                    <p className="w-full truncate text-xs">
                      {session.data.user.email}
                    </p>
                  </div>
                  <ChevronDownIcon className="size-4 shrink-0" />
                </DrawerTrigger>

                <DrawerContent>
                  <DrawerHeader>
                    <DrawerTitle>{session.data.user.name ?? ""}</DrawerTitle>
                    <DrawerDescription>
                      {session.data.user.email}
                    </DrawerDescription>
                  </DrawerHeader>

                  <DrawerFooter>
                    <Button
                      variant={"outline"}
                      onClick={() => {
                        toast("Coming Soon");
                      }}
                    >
                      <CreditCardIcon className="size-4 text-black" />
                      Billing
                    </Button>
                    <Button
                      variant={"outline"}
                      onClick={async (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        try {
                          await signOut({
                            callbackUrl: "/",
                            redirect: true,
                          });
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
                    <AvatarImage src={session.data.user.image || ""} />
                  </Avatar>

                  <div className="flex min-w-8 flex-1 flex-col gap-0.5 overflow-hidden text-left">
                    <p className="w-full truncate text-sm">
                      {" "}
                      {session.data.user.name ?? "User"}
                    </p>
                    <p className="w-full truncate text-xs">
                      {session.data.user.email}
                    </p>
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
                        {session.data.user.name ?? "user"}
                      </span>
                      <span className="text-muted-foreground truncate text-sm font-normal">
                        {session.data.user.email ?? "Email"}
                      </span>
                    </div>
                  </DropdownMenuLabel>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    className="courser-pointer flex items-center justify-between"
                    onClick={async (e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      try {
                        await signOut({
                          callbackUrl: "/",
                          redirect: true,
                        });
                      } catch (error) {
                        console.error("Logout failed:", error);
                        toast.error("Failed to logout. Please try again.");
                      }
                    }}
                  >
                    Logout
                    <LogOut className="size-4 shrink-0" />
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )
          ) : (
            <div>
              <Link href={"/api/auth/authentication"} className="text-xl">
                SignIn
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Nav;
