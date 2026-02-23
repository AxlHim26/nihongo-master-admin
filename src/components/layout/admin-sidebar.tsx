"use client";

import AutoStoriesIcon from "@mui/icons-material/AutoStories";
import DashboardIcon from "@mui/icons-material/Dashboard";
import EditNoteIcon from "@mui/icons-material/EditNote";
import LanguageIcon from "@mui/icons-material/Language";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import SchoolIcon from "@mui/icons-material/School";
import LogoutIcon from "@mui/icons-material/Logout";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { clearToken } from "@/lib/storage";

const navItems = [
  { href: "/courses", label: "Courses", icon: <SchoolIcon fontSize="small" /> },
  { href: "/grammar", label: "Grammar", icon: <EditNoteIcon fontSize="small" /> },
  { href: "/vocabulary", label: "Vocabulary", icon: <AutoStoriesIcon fontSize="small" /> },
  { href: "/kanji", label: "Kanji", icon: <LanguageIcon fontSize="small" /> },
  { href: "/users", label: "Users", icon: <PeopleAltIcon fontSize="small" /> }
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const onLogout = () => {
    clearToken();
    router.replace("/login");
  };

  return (
    <aside className="w-[260px] border-r border-slate-200 bg-white p-4">
      <Stack spacing={3} className="h-full">
        <div>
          <Typography variant="overline" color="text.secondary">
            Admin Panel
          </Typography>
          <Typography variant="h6" fontWeight={700} className="flex items-center gap-2">
            <DashboardIcon fontSize="small" /> Nihongo LMS
          </Typography>
        </div>

        <Stack spacing={1}>
          {navItems.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition ${
                  active
                    ? "bg-primary-50 text-primary-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </Stack>

        <div className="mt-auto">
          <Button
            fullWidth
            variant="outlined"
            color="inherit"
            startIcon={<LogoutIcon />}
            onClick={onLogout}
          >
            Logout
          </Button>
        </div>
      </Stack>
    </aside>
  );
}
