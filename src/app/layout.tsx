import type { Metadata } from "next";

import "@/app/globals.css";
import Providers from "@/app/providers";

export const metadata: Metadata = {
  title: "MiraiGo Admin",
  description: "MiraiGo admin console for managing courses and learning content"
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
