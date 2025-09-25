"use client";

import type { PlanType } from "@prisma/client";
import React, { useState } from "react";
import { planFeatures } from "~/lib/const";

const page = () => {
  const [planData, setPlanData] = useState<{
    amount: number;
    userPlan: PlanType;
  }>({
    amount: 0,
    userPlan: "BASE",
  });

  return <div>{planFeatures.map((plan, index) => (
    <div key={index} className="">

      
    </div>
  ))}</div>;
};

export default page;
