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

const Nav = () => {
  const session = useSession();
  const isMobile = useIsMobile();
  if (!session.data) return <h1>helllllll yeah</h1>;
  const data = session.data.user;
  return (
    <nav>
      <h1>Aplica-</h1>
      <div>
        {isMobile ? (
          <Drawer>
            <DrawerTrigger className="border-border/20 flex w-full items-center justify-between gap-x-2 overflow-hidden rounded-lg border bg-white/5 p-3 hover:bg-white/10">
              <Avatar>
                <AvatarImage
                  src={data.image || ""}
                  alt="avatar"
                  className="rounded-full"
                />
              </Avatar>

              <div className="flex min-w-8 flex-1 flex-col gap-0.5 overflow-hidden text-left">
                <p className="w-full truncate text-sm">
                  {" "}
                  {data.name ?? "User"}
                </p>
                <p className="w-full truncate text-xs">{data.email}</p>
              </div>
              <ChevronDownIcon className="size-4 shrink-0" />
            </DrawerTrigger>

            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>{data.name ?? ""}</DrawerTitle>
                <DrawerDescription>{data.email}</DrawerDescription>
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
                  onClick={() => signOut({ callbackUrl: "/" })}
                >
                  <LogOut className="size-4 text-black" />
                  Logout
                </Button>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger className="border-border/20 flex w-full items-center justify-between gap-x-2 overflow-hidden rounded-lg border bg-white/5 p-3 hover:bg-white/10">
              <Avatar>
                <AvatarImage src={data.image || ""} />
              </Avatar>

              <div className="flex min-w-8 flex-1 flex-col gap-0.5 overflow-hidden text-left">
                <p className="w-full truncate text-sm">
                  {" "}
                  {data.name ?? "User"}
                </p>
                <p className="w-full truncate text-xs">{data.email}</p>
              </div>
              <ChevronDownIcon className="size-4 shrink-0" />
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" side="right" className="w-72">
              <DropdownMenuLabel>
                <div className="flex flex-col gap-1">
                  <span className="truncate font-medium">
                    {data.name ?? "user"}
                  </span>
                  <span className="text-muted-foreground truncate text-sm font-normal">
                    {data.email ?? "Email"}
                  </span>
                </div>
              </DropdownMenuLabel>

              <DropdownMenuSeparator />
              <DropdownMenuItem className="courser-pointer flex items-center justify-between">
                Billing
                <CreditCardIcon className="size-4 shrink-0" />
              </DropdownMenuItem>
              <DropdownMenuItem className="courser-pointer flex items-center justify-between">
                <button
                  className="text-sm text-black"
                  onClick={() => signOut({ callbackUrl: "/" })}
                >
                  Logout
                </button>
                <LogOut className="size-4 shrink-0" />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </nav>
  );
};

export default Nav;
