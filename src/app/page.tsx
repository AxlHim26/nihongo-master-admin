import { redirect } from "next/navigation";

import { BYPASS_ADMIN_AUTH } from "@/lib/env";

export default function HomePage() {
  redirect(BYPASS_ADMIN_AUTH ? "/courses" : "/login");
}
