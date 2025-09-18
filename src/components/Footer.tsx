import { Folder, Github, Instagram, Linkedin, MailIcon } from "lucide-react";
import Image from "next/image";
import React from "react";

const Footer = () => {
  return (
    <footer className="fixed bottom-0 left-0 z-10 flex h-52 items-center justify-center w-full bg-[#F8F2EA] text-[#450C18] dark:bg-[#450C18] dark:text-[#F8F2EA]">
      <div className="z-40 flex w-full items-center justify-around gap-2">
        <div className="flex items-center flex-col gap-1 justify-between px-20">
          <Image
            src={"/logo.png"}
            alt="logo of vipinAlways"
            height={70}
            width={70}
            className="rounded-lg"
          />

          <div className="flex items-center gap-4">
            <a
              href="https://itsvipin.me"
              className="group flex items-center gap-0.5 text-lg"
            >
              <Folder className="size-5 transition-all duration-150 ease-out group-hover:text-yellow-300" />{" "}
              <i className="font-semibold">Vipin</i>
            </a>
            <a
              href="https://github.com/vipinAlways"
              className="group flex items-center gap-0.5 text-lg"
            >
              <Github className="size-5 transition-all duration-150 ease-out group-hover:text-gray-600" />{" "}
              <i className="font-semibold">vipinAlways</i>
            </a>
          </div>
        </div>
        <div className=" ">
          <h1 className="text-3xl font-bold">
            <h3 className="text-xl">Made by</h3>
            <i>VipinAlways</i>
          </h1>
        </div>

        <div className="flex">
          <div className="flex w-3/5 flex-col justify-around gap-1">
            <span className="text-3xl font-medium">
              <i>Connect</i>
            </span>

            <div className="flex items-center gap-4">
              <a href="">
                <Instagram className="size-6 transition-all duration-150 ease-out hover:text-[#C13584]" />
              </a>
              <a href="">
                <Linkedin className="size-6 transition-all duration-150 ease-out hover:text-blue-600" />
              </a>
              <a href="">
                <MailIcon className="size-6 transition-all duration-150 ease-out hover:text-blue-500" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
// absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
