import type { types } from "@prisma/client";
import { planFeatures } from "~/lib/const";
import { db } from "~/server/db";

export async function checkAndIncrementOptimistic(
  userId: string,
  feature: "coverLetter" | "email" | "score",
) {
  const featureMap = {
    coverLetter: "numberOfCoverLetter",
    email: "numberOfEmail",
    score: "numberOfScore",
    resumeSubmitted: "numberOfresumeSubmittedByuser",
  } as const;

  const dbField = featureMap[feature];

  try {
    const user = await db.user.findFirst({
      where: {
        id: userId,
      },
      select: {
        plan: true,
      },
    });

    if (!user || !user.plan) {
      throw new Error("User not found");
    }
    const featureKey =
      `max${feature.charAt(0).toUpperCase()}${feature.slice(1)}` as keyof (typeof planFeatures)[typeof user.plan];
    const maxLimit = planFeatures[user.plan][featureKey];

    const updated = await db.user.updateMany({
      where: {
        id: userId,
        [dbField]: {
          lt: maxLimit,
        },
      },
      data: {
        [dbField]: {
          increment: 1,
        },
      },
    });

    if (updated.count === 0) {
      // Check if user still exists or limit was reached
      const userCheck = await db.user.findUnique({
        where: { id: userId },
        select: { [dbField]: true },
      });

      if (!userCheck) {
        throw new Error("User not found");
      }

      throw new Error(
        `${feature} limit reached (${userCheck[dbField]}/${maxLimit})`,
      );
    }

    return { success: true, feature, userId };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Failed to increment ${feature} usage`);
  }
}
