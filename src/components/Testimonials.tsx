import Image from "next/image";
import React, { useState, useCallback, useMemo } from "react";
import { testimonials } from "~/lib/const";

const TestimonialCard = React.memo(
  ({
    testimonial,
  }: {
    testimonial: (typeof testimonials)[0];
    offsetX: number;
  }) => {
    return (
      <div className="flex items-center gap-4 group-hover:text-zinc-200">
        <div className="relative z-50 size-20 rounded-full">
          <Image
            src="/user.webp"
            alt={`${testimonial.name} profile picture`}
            fill
            sizes="80px"
            className="rounded-full object-cover"
            loading="lazy"
            quality={75}
          />
        </div>

        <h2 className="text-2xl">{testimonial.name}</h2>
      </div>
    );
  },
);

TestimonialCard.displayName = "TestimonialCard";

export default function Testimonials() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [offsetX, setOffsetX] = useState(0);

  const rafRef = React.useRef<number | null>(null);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }

      
      const target = e.currentTarget;

      rafRef.current = requestAnimationFrame(() => {
        if (!target) return;
        const rect = target.getBoundingClientRect();

        const x = e.clientX - rect.left;
        const centerX = rect.width / 2;
        const moveX = (x - centerX) / 10;
        setOffsetX(moveX);
      });
    },
    [rafRef],
  );

  const handleMouseLeave = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
    setOffsetX(0);
    setHoveredIndex(null);
  }, []);

  React.useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  const testimonialItems = useMemo(() => {
    return testimonials.map((testimonial, index) => (
      <div
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onMouseEnter={() => setHoveredIndex(index)}
        className="group before:bg-muted-foreground relative h-28 w-full rounded-md border px-4 py-3 before:absolute before:top-0 before:left-0 before:-z-10 before:block before:h-0 before:w-full before:rounded-md before:transition-all before:duration-100 before:ease-linear hover:before:h-full"
        key={testimonial.name}
      >
        {hoveredIndex === index && (
          <div
            style={{
              transform: `translate(calc(-50% + ${offsetX}px), -50%)`,
              willChange: "transform",
            }}
            className="bg-accent text-muted-foreground absolute top-1/2 left-2/3 z-10 flex h-72 w-56 flex-col justify-around rounded-lg border border-[#4F7BFF]/20 p-1.5 px-2 opacity-0 transition-opacity duration-150 ease-out group-hover:opacity-100"
          >
            <h1 className="font-semibold">{testimonial.role}</h1>

            <p className="text-base leading-relaxed">
              <i>{testimonial.testimonial}</i>
            </p>

            <p className="text-sm text-[#93B3FF]">--- {testimonial.name}</p>
          </div>
        )}

        <TestimonialCard testimonial={testimonial} offsetX={offsetX} />
      </div>
    ));
  }, [testimonials, offsetX, hoveredIndex, handleMouseMove, handleMouseLeave]);

  return <div className="flex flex-col gap-2 pb-10">{testimonialItems}</div>;
}
