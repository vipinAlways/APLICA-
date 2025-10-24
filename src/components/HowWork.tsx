"use client";
import Image from "next/image";
import React, { useRef } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "~/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
const howWorks = [
  {
    image: "/howwork/a1.png",
    text: "Upload your resume and discover the perfect job opportunities for you.",
  },
  {
    image: "/howwork/a2.png",
    text: "Get in-depth insights and suggestions to optimize your resume.",
  },
  {
    image: "/howwork/a4.png",
    text: "Explore jobs that match your skills and experience effortlessly.",
  },
  {
    image: "/howwork/a3.png",
    text: "Review your score, email, and cover letter details before applying.",
  },
  {
    image: "/howwork/a5.png",
    text: "Track the features available based on your active subscription plan.",
  },
];

const HowWork = () => {
  const autoplay = useRef(
    Autoplay({ delay: 2000, stopOnInteraction: false, stopOnMouseEnter: true }),
  );
  return (
    <div className="h-fit max-w-full p-1">
      <h1 className="text-center text-3xl font-bold md:text-6xl">
        How It Works ?
      </h1>
      <Carousel
        plugins={[autoplay.current]}
        className="mx-auto w-full max-w-4xl"
      >
        <CarouselContent className="w-full">
          {howWorks.map((work, index) => (
            <CarouselItem
              key={index}
              className="flex w-full flex-col gap-6 p-5 md:p-10"
            >
              <div className="relative h-72 w-full bg-zinc-600/10 p-5">
                <Image
                  src={work.image}
                  alt="work"
                  fill
                  loading="lazy"
                  className="aspect-auto w-96 object-contain shadow-md md:shadow-xl"
                />
              </div>
              <p className="text-xl font-semibold break-words md:text-center">
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
