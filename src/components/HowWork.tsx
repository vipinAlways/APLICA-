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
    image: "/howWroks/agents.png",
    text: "Create your personalized AI Agent — give it a name, define its role, and set it up to attend meetings for you.",
  },
  {
    image: "/howWroks/createMeeting.png",
    text: "Schedule a meeting and assign it to your Agent in just a few clicks.",
  },
  {
    image: "/howWroks/startm.png",
    text: "Start your one-on-one session and let your Agent handle the rest while you focus on what matters.",
  },
  {
    image: "/howWroks/minutesOfmeeting.png",
    text: "Once the meeting ends, instantly access the recording, transcript, and AI-generated summary — plus, get insights on how to improve next time.",
  },
];

const HowWork = () => {
  const autoplay = useRef(
    Autoplay({ delay: 2000, stopOnInteraction: false, stopOnMouseEnter: true }),
  );
  return (
    <div className="h-fit max-w-full p-10">
      <h1 className="text-6xl font-bold text-center">How It Works ?</h1>
      <Carousel
        plugins={[autoplay.current]}
        className="mx-auto w-full max-w-4xl"
      >
        <CarouselContent className="w-full">
          {howWorks.map((work, index) => (
            <CarouselItem key={index} className="w-full p-10">
              <div className="relative h-72">
                <Image
                  src={work.image}
                  alt="work"
                  fill
                  loading="lazy"
                  className="object-contain shadow-2xl"
                />
              </div>
              <p className="text-center text-xl font-semibold break-words">
                {work.text}
              </p>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
};

export default HowWork;
