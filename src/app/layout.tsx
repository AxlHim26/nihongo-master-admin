import type { Metadata } from "next";

import "@/app/globals.css";
import Providers from "@/app/providers";

export const metadata: Metadata = {
  title: "Nihongo Admin Dashboard",
  description: "Admin CMS for course/chapter/section/lesson management"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
