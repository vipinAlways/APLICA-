import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const locations = createTRPCRouter({
  locations: protectedProcedure.query(async () => {
    const res = await fetch("https://countriesnow.space/api/v0.1/countries");
    return await res.json();
  }),
});
