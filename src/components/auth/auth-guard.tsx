"use client";

import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { BYPASS_ADMIN_AUTH } from "@/lib/env";
import { getToken } from "@/lib/storage";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const token = getToken();

  useEffect(() => {
    if (BYPASS_ADMIN_AUTH || token) {
      return;
    }
    router.replace("/login");
  }, [router, token]);

  if (!BYPASS_ADMIN_AUTH && !token) {
    return (
      <Stack alignItems="center" justifyContent="center" className="min-h-screen">
        <CircularProgress />
      </Stack>
    );
  }

  return <>{children}</>;
}
