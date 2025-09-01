"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

type NavItem = {
  label: string;
  href: string;
  icon?: React.ReactNode;
  action?: () => void;
};

export default function Sidebar() {
  const [open, setOpen] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUserEmail(parsed?.email || null);
      } catch {
        setUserEmail(null);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("token_type");
    localStorage.removeItem("user");
    router.push("/");
  };

  const navItems: NavItem[] = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Job Posting", href: "/job-postings" },
    { label: "Applications", href: "/applications" },
    { label: "Users", href: "/users" },
    { label: "Logout", href: "#", action: handleLogout },
  ];

  if (pathname === "/") {
    return null;
  }

  return (
    <aside
      className={`$${
        open ? "w-64" : "w-16"
      } shrink-0 transition-all duration-300 border-r border-gray-800 bg-gray-900 text-gray-200  h-screen flex flex-col`}
    >
      {/* Header / Toggle */}
      <div className="flex items-center justify-between px-3 py-3 border-b border-gray-800">
        <span
          className={`font-semibold text-purple-100 text-xl tracking-wide ${
            open ? "block" : "hidden"
          }`}
        >
          SmartHire - Admin
        </span>

        <button
          onClick={() => setOpen((p) => !p)}
          className="rounded-lg p-2 hover:bg-gray-800"
          aria-label="Toggle sidebar"
          title="Toggle sidebar"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            {open ? (
              <path strokeWidth="2" d="M15 18l-6-6 6-6" />
            ) : (
              <path strokeWidth="2" d="M9 6l6 6-6 6" />
            )}
          </svg>
        </button>
      </div>

      {/* User Profile Section */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-800">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 text-white font-semibold">
          {userEmail ? userEmail.charAt(0).toUpperCase() : "?"}
        </div>
        {open && (
          <div>
            <div className="text-sm font-medium text-white">Admin User</div>
            <div className="text-xs text-gray-400">{userEmail || "No email"}</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="mt-2 px-2 flex-1">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return item.action ? (
            <button
              key={item.label}
              onClick={item.action}
              className={[
                "w-full text-left group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition",
                active
                  ? "bg-indigo-600 text-white"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white",
              ].join(" ")}
            >
              <span
                className={[
                  "h-2 w-2 rounded-full",
                  active ? "bg-white" : "bg-gray-600 group-hover:bg-gray-400",
                  open ? "" : "mx-auto",
                ].join(" ")}
              />
              <span className={open ? "block" : "hidden"}>{item.label}</span>
            </button>
          ) : (
            <Link
              key={item.href}
              href={item.href}
              className={[
                "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition",
                active
                  ? "bg-indigo-600 text-white"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white",
              ].join(" ")}
            >
              <span
                className={[
                  "h-2 w-2 rounded-full",
                  active ? "bg-white" : "bg-gray-600 group-hover:bg-gray-400",
                  open ? "" : "mx-auto",
                ].join(" ")}
              />
              <span className={open ? "block" : "hidden"}>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
