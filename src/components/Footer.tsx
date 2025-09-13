import { Folder, Github, Instagram, Linkedin, MailIcon } from "lucide-react";
import Image from "next/image";
import React from "react";

const Footer = () => {
  return (
    <footer className="fixed top-0 left-0 z-10 flex h-screen w-full items-center justify-center bg-[#F8F2EA] text-[#450C18] dark:bg-[#450C18] dark:text-[#F8F2EA]">
      <div className="flex w-full flex-col items-center justify-center gap-2 z-40">
        <div className="flex w-full items-center justify-between px-20">
          <Image
            src={"/logo.png"}
            alt="logo of vipinAlways"
            height={140}
            width={140}
            className="rounded-lg"
          />

          <div>
            <a
              href="https://itsvipin.me"
              className="group flex items-center gap-4 text-3xl"
            >
              <Folder className="size-10 transition-all duration-150 ease-out group-hover:text-yellow-300" />{" "}
              <i className="font-semibold">Vipin</i>
            </a>
            <a
              href="https://github.com/vipinAlways"
              className="group flex items-center gap-4 text-3xl"
            >
              <Github className="size-10 transition-all duration-150 ease-out group-hover:text-gray-600" />{" "}
              <i className="font-semibold">vipinAlways</i>
            </a>
          </div>
        </div>
        <h1 className="text-[11rem] font-bold">
          <i>VipinAlways</i>
        </h1>

        <div className="flex w-full items-start">
          <div className="flex w-3/5 items-center justify-evenly">
            <span className="text-3xl font-medium">
              <i>Connect</i>
            </span>

            <div className="flex items-center gap-4">
              <a href="">
                <Instagram className="size-10 transition-all duration-150 ease-out hover:text-[#C13584]" />
              </a>
              <a href="">
                <Linkedin className="size-10 transition-all duration-150 ease-out hover:text-blue-600" />
              </a>
              <a href="">
                <MailIcon className="size-10 transition-all duration-150 ease-out hover:text-blue-500" />
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
