import { TRPCError } from "@trpc/server";
import z from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const jobsRoute = createTRPCRouter({
  getJobs: protectedProcedure
    .input(
      z.object({
        query: z.string().min(3, "Query Must be Valid"),
        country: z.string().optional(),
        city: z.string().optional(),
        page: z.number().optional(),
        isRomte: z.boolean().default(true),
      }),
    )
    .query(async ({ input }) => {
      const url = `https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(
        input.query,
      )}&page=${encodeURIComponent(input.page ?? 1)}&num_pages=${encodeURIComponent(
        input.page ?? 1,
      )}&country=${encodeURIComponent(input.country ?? "IN")}&city=${encodeURIComponent(
        input.city ?? "",
      )}&date_posted=all&remote_jobs_only=${encodeURIComponent(input.isRomte)}`;

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
