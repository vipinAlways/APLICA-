import { TRPCError } from "@trpc/server";
import z from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const jobsRoute = createTRPCRouter({
  getJobs: protectedProcedure
    .input(
      z.object({
        query: z.string().min(3, "Query Must be Valid"),
        location: z.string().optional(),
        page: z.number().optional(),
      }),
    )
    .query(async ({ input }) => {
      const url = `https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(
        input.query,
      )}&page=1&num_pages=${input.page ?? 1}&country=${encodeURIComponent(
        input.location ?? "india",
      )}&date_posted=all`;

      const options = {
        method: "GET",
        headers: {
          "x-rapidapi-key": process.env.RAPIDAPI_KEY!,
          "x-rapidapi-host": "jsearch.p.rapidapi.com",
        },
      };

      try {
        const response = await fetch(url, options);
        if (!response.ok) {
          console.log(response);
          throw new Error(`API error: ${response.status}`);
        }
        const result = await response.json();
        return result;
      } catch (error) {
        console.error(error);
        throw new TRPCError({
          code: "BAD_GATEWAY",
          message: "Unable to fetch jobs. Please try again later.",
        });
      }
    }),
});
