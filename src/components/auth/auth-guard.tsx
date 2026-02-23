"use client";

import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { getToken } from "@/lib/storage";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const token = getToken();

  useEffect(() => {
    if (token) {
      return;
    }
    router.replace("/login");
  }, [router, token]);

  if (!token) {
    return (
      <Stack alignItems="center" justifyContent="center" className="min-h-screen">
        <CircularProgress />
      </Stack>
    );
  }

  return <>{children}</>;
}
