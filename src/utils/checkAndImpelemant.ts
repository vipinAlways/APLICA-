import { TRPCError } from "@trpc/server";
import { planFeatures } from "~/lib/const";
import { db } from "~/server/db";

export const checkAndImpelement = async ({
  userId,
  feature = "numberOfEmail",
}: {
  userId: string;
  feature:
    | "numberOfCoverLetter"
    | "numberOfEmail"
    | "numberOfScore"
    | "resumeUpload";
}) => {
  if (!userId || !feature) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Missing userId or feature in request.",
    });
  }
  try {
    const userPlan = await db.userPlan.findFirst({
      where: { userId },
    });

    if (!userPlan) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Cannot find any active plan",
      });
    }

    const maxLimit = planFeatures.find(
      (plan) => plan.plan === userPlan.planType,
    )?.features[feature];

    if (maxLimit === undefined) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Server Issue",
      });
    }

    const checkLimit = await db.user.findUnique({
      where: { id: userId },
    });

    if (!checkLimit) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }

  
    if (feature === "resumeUpload") {
      if (!checkLimit.resumeUpload && maxLimit > 0) {
        return true; // User can upload resume
      }
      throw new TRPCError({
        code: "TOO_MANY_REQUESTS",
        message: "You have already uploaded a resume. Upgrade plan for more.",
      });
    }

    
    if (checkLimit[feature] < maxLimit) {
      return true;
    }

    throw new TRPCError({
      code: "TOO_MANY_REQUESTS",
      message: `You have reached your limit for ${feature}. Please upgrade your plan.`,
    });
  } catch (error) {
    if (error instanceof TRPCError) throw error;

    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Please try again later",
      cause: error,
    });
  }
};
