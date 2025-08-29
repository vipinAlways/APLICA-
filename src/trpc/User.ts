import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const User = createTRPCRouter({
  newUser: publicProcedure
    .input(
      z.object({
        userName: z.string(),
        email: z.string().email("Invalid email address"),
        password:z.string().min(8,"password should be 8 character")
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
            password:input.password
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
});
