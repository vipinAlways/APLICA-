"use client"
import { useEffect, useState } from "react";
import { Check } from "lucide-react";

export default function Loader() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const texts = [
    "Finding jobs made simple",
    "Struggling with replies?",
    "AI-powered career assistant",
    "Apply smarter, not harder",
    "Get noticed by recruiters",
    "Boost your interview chances",
    "Turn applications into offers",
    "Your job hunt, simplified",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % texts.length);
      // delay active highlight until scroll animation completes
      setTimeout(() => {
        setActiveIndex((prev) => (prev + 1) % texts.length);
      }, 700); // must match transition duration
    }, 1000); // total cycle
    return () => clearInterval(interval);
  }, [texts.length]);

  return (
    <div className="flex h-[calc(100vh-10rem)] w-full items-center justify-center">
      <div className="relative h-36 w-full overflow-hidden p-4">
        {/* Gradient fade */}
        <div className="pointer-events-none absolute top-0 h-1/3 w-full " />
        <div className="pointer-events-none absolute bottom-0 h-1/3 w-full " />

        <div
          className="flex flex-col items-center gap-4 text-2xl transition-transform duration-[0.45s] ease-in-out"
          style={{ transform: `translateY(-${currentIndex * 2}rem)` }}
        >
          {texts.map((text, index) => {
            const isCenter = index === activeIndex; // ✅ only highlight when fully centered
            return (
              <p
                key={index}
                className={`flex h-8 items-center space-x-4 font-semibold transition-all duration-300 ${
                  isCenter
                    ? "scale-110 text-black opacity-100"
                    : "text-gray-400 opacity-50"
                }`}
              >
                <span>
                  <Check
                    className={`size-8 rounded-full border p-0.5 transition-colors duration-300 ${
                      isCenter
                        ? "border-green-500 text-green-500"
                        : "border-white text-white"
                    }`}
                  />
                </span>
                <span>{text}</span>
              </p>
            );
          })}
        </div>
      </div>
    </div>
  );
}
