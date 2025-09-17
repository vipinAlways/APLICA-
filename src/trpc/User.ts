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
            password: input.password,
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
      const existingUser = await ctx.db.user.findFirst({
        where: { id: ctx.session?.user.id },
      });

      if (existingUser) {
        return existingUser;
      } else {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Not able to find user",
        });
      }
    } catch (error) {
      console.error("Error checking existing user:", error);
      throw new Error("Failed to check existing user");
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
        console.log(error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Not able to receive file please try again",
        });
      }
    }),
});
