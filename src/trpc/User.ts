import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { auth } from "~/server/auth";

export const User = createTRPCRouter({
  newUser: publicProcedure
    .input(
      z.object({
        userName: z.string(),
        email: z.string().email("Invalid email address"),
        password: z.string().min(8, "password should be 8 character"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.db.user.update({
          where: {
            email: input.email,
          },
          data: {
            name: input.userName,
            // password: input.password,
          },
        });

        return { success: true, message: "User created and sign-in link sent" };
      } catch (error) {
        console.error("Error creating user:", error);
        throw new Error("Failed to create user");
      }
    }),
  existingUser: publicProcedure.query(async ({ ctx }) => {
    try {

      if(!ctx.session?.user.id){
        return null
      }
      const existingUser = await ctx.db.user.findUnique({
        where: { id: ctx.session?.user.id },
      });

      if (existingUser) {
        return existingUser;
      } else {
        return null;
      }
    } catch (error) {
      throw new Error("Failed to check existing user", { cause: error });
    }
  }),
  uplaodResume: protectedProcedure
    .input(
      z.object({
        resume: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const session = await auth();
        await ctx.db.user.update({
          where: {
            id: session?.user.id,
          },
          data: {
            Resume: input.resume,
          },
        });
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Not able to receive file please try again",
          cause: error,
        });
      }
    }),

  bookmarkJobs: protectedProcedure.query(async ({ ctx }) => {
    const session = await auth();

    if (!session) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User is to logged in",
      });
    }

    try {
      const markedJobs = await ctx.db.user.findFirst({
        where: {
          id: session.user.id,
        },
        select: {
          JobCard: true,
        },
      });

      return {
        JobCard: markedJobs?.JobCard ?? [],
      };
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Something went wrong",
        cause: error,
      });
    }
  }),

  addtoBookMark: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        employer_name: z.string(),
        employer_logo: z.string().optional(),
        job_title: z.string(),
        job_description: z.string(),
        job_location: z.string(),
        job_country: z.string(),
        job_salary_min: z.number().optional(),
        job_salary_max: z.number().optional(),
        job_publisher: z.string(),
        job_apply_link: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const {
        id,
        employer_name,
        job_apply_link,
        job_country,
        job_description,
        job_location,
        job_publisher,
        job_title,
        employer_logo,
        job_salary_max,
        job_salary_min,
      } = input;
      const session = await auth();

      if (!session) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User is to logged in",
        });
      }

      try {
        const bookMark = await ctx.db.jobCard.create({
          data: {
            id: id,
            employer_name,
            job_apply_link,
            job_country,
            job_description,
            job_location,
            job_publisher,
            job_title,
            ...(employer_logo && { employer_logo }),
            ...(job_salary_min !== undefined && { job_salary_min }),
            ...(job_salary_max !== undefined && { job_salary_max }),
            userId: session.user.id,
          },
        });

        return {
          message: "Data saved",
          bookMark,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong",
          cause: error,
        });
      }
    }),
  removeFromBookMark: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const session = await auth();

      if (!session) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User is to logged in",
        });
      }

      try {
        return await ctx.db.jobCard.delete({
          where: {
            id: input.id,
          },
        });
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong",
          cause: error,
        });
      }
    }),

  getBookmarks: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.user.findFirst({
      where: { id: ctx.session.user.id },
      select: {
        JobCard: {
          select: {
            id: true,
          },
        },
      },
    });
  }),

  userPlanDetails: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.session) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Please login",
      });
    } else {
      return await ctx.db.user.findFirst({
        where: {
          id: ctx.session.user.id,
        },
        select: {
          UserPlan: true,
        },
      });
    }
  }),
});
