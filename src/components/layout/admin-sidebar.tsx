"use client";

import AutoStoriesIcon from "@mui/icons-material/AutoStories";
import EditNoteIcon from "@mui/icons-material/EditNote";
import LanguageIcon from "@mui/icons-material/Language";
import LogoutIcon from "@mui/icons-material/Logout";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import SchoolIcon from "@mui/icons-material/School";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import BrandLogo from "@/components/common/brand-logo";
import { clearToken } from "@/lib/storage";

const navItems = [
  { href: "/courses", label: "Courses", icon: <SchoolIcon fontSize="small" /> },
  { href: "/grammar", label: "Grammar", icon: <EditNoteIcon fontSize="small" /> },
  { href: "/vocabulary", label: "Vocabulary", icon: <AutoStoriesIcon fontSize="small" /> },
  { href: "/kanji", label: "Kanji", icon: <LanguageIcon fontSize="small" /> },
  { href: "/users", label: "Users", icon: <PeopleAltIcon fontSize="small" /> },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const onLogout = () => {
    clearToken();
    router.replace("/login");
  };

  return (
    <aside className="admin-sidebar w-[272px] p-4">
      <Stack spacing={3} className="h-full">
        <div className="admin-panel px-3 py-3">
          <BrandLogo />
        </div>

        <Stack spacing={1} className="admin-panel p-2">
          {navItems.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                data-active={active}
                className="admin-nav-item"
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </Stack>

        <div className="admin-panel mt-auto p-2.5">
          <Button
            fullWidth
            variant="outlined"
            color="inherit"
            startIcon={<LogoutIcon />}
            onClick={onLogout}
            className="justify-start rounded-xl border-slate-300 text-slate-600"
          >
            Logout
          </Button>
        </div>
      </Stack>
    </aside>
  );
}
