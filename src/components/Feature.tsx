import Image from "next/image";
import React from "react";
import { Features } from "~/lib/const";

const Feature = () => {
  return (
    <div className="h-fit w-full space-y-10 " >
      <div className="flex items-center justify-around gap-4 px-3">
        {Features.map((feature, index) => (
          <div
            key={index}
            className="flex h-60  w-4/5 flex-col items-center justify-center gap-1.5"
          >
            <div>
              <Image
                src={feature.icons}
                alt={feature.featureName}
                height={80}
                width={160}
              />
            </div>
            <h1 className="text-center font-semibold">{feature.featureName}</h1>

            <p className="w-4/5 text-center">{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Feature;
