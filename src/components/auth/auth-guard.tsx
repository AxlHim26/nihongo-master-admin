"use client";

import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { getToken } from "@/lib/storage";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace("/login");
      return;
    }
    setReady(true);
  }, [router]);

  if (!ready) {
    return (
      <Stack alignItems="center" justifyContent="center" className="min-h-screen">
        <CircularProgress />
      </Stack>
    );
  }

  return <>{children}</>;
}
