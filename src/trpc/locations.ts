import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

interface data {
  data: [
    {
      country: string;
      cities: string[];
    },
  ];
}

export const locations = createTRPCRouter({
  locations: protectedProcedure.query(async () => {
    const res = await fetch("https://countriesnow.space/api/v0.1/countries");
    const data: data = await res.json();

    if (!data) return null;
    return data?.data;
  }),
});
