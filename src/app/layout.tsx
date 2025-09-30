import "~/styles/globals.css";
import { type Metadata } from "next";
import { Geist } from "next/font/google";
import { Toaster } from "~/components/ui/sonner";

import Provider from "~/components/Provider";
import Footer from "~/components/Footer";
import { lazy, Suspense } from "react";
import Loader from "~/components/Loader";

export const metadata: Metadata = {
  title: "Aplica",
  description: "Job huntion application",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});
const LazyNav = lazy(() => import("~/components/Nav"));

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`min-h-screen max-w-screen ${geist.variable}`}>
      <body className="relative pt-4 bg-zinc-200">
        <Suspense fallback={<Loader />}>
          <Provider>
            <Toaster />
            <main className="relative z-20 min-h-screen w-full  px-3 backdrop-blur-2xl md:px-10">
              <LazyNav />
              <div className="">{children}</div>
            </main>

            <div className="relative z-0 h-52 w-full"></div>

            <Footer />
          </Provider>
        </Suspense>
      </body>
    </html>
  );
}
