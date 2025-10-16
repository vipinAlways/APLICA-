"use client";
import Image from "next/image";
import React, { useRef } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "~/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
const howWorks = [
  {
    image: "/howwork/a1.png",
    text: "Upload your Resume To find Perfect job for you.",
  },
  {
    image: "/howwork/a2.png",
    text: "",
  },
  {
    image: "/howwork/a3.png",
    text: "Start your one-on-one session and let your Agent handle the rest while you focus on what matters.",
  },
  {
    image: "/howwork/a4.png",
    text: "Once the meeting ends, instantly access the recording, transcript, and AI-generated summary — plus, get insights on how to improve next time.",
  },
  {
    image: "/howwork/a5.png",
    text: "Once the meeting ends, instantly access the recording, transcript, and AI-generated summary — plus, get insights on how to improve next time.",
  },
];
  
const HowWork = () => {
  const autoplay = useRef(
    Autoplay({ delay: 2000, stopOnInteraction: false, stopOnMouseEnter: true }),
  );
  return (
    <div className="h-fit max-w-full p-10">
      <h1 className="text-center md:text-6xl text-3xl font-bold">How It Works ?</h1>
      <Carousel
        plugins={[autoplay.current]}
        className="mx-auto w-full max-w-4xl"
      >
        <CarouselContent className="w-full ">
          {howWorks.map((work, index) => (
            <CarouselItem key={index} className="w-full md:p-10 p-5 flex flex-col gap-6">
              <div className="relative h-72">
                <Image
                  src={work.image}
                  alt="work"  
                  fill
                  loading="lazy"
                  className="object-contain md:shadow-2xl shadow-md"
                />
              </div>
              <p className="md:text-center  text-xl font-semibold break-words">
                {work.text}
              </p>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
};

export default HowWork;
