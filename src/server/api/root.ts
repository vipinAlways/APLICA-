import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { jobsRoute } from "~/trpc/FetchJobs";
import { locations } from "~/trpc/locations";
import { pdfRoute } from "~/trpc/pdf";
import { User } from "~/trpc/User";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  user: User,
  pdfRoute: pdfRoute,
  getjobs: jobsRoute,
  locatiosns:locations
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
