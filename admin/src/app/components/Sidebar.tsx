"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

type NavItem = {
  label: string;
  href: string;
  icon?: React.ReactNode;
};

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Job Posting", href: "/job-postings" },
  { label: "Applications", href: "/applications" },
  { label: "Users", href: "/users" },
];

export default function Sidebar() {
  
  const [open, setOpen] = useState(true);
  const pathname = usePathname();
   if (pathname === "/") {
    return null;
  }

  return (
    <aside
      className={`${
        open ? "w-64" : "w-16"
      } shrink-0 transition-all duration-300 border-r border-gray-800 bg-gray-900 text-gray-200  h-screen flex flex-col `}
    >
      {/* Header / Toggle */}
      <div className="flex items-center justify-between px-3 py-3 border-b border-gray-800">
        <span className={`font-semibold text-purple-100 text-xl tracking-wide ${open ? "block" : "hidden"}`}>
          SmartHire - Admin
        </span>
        <button
          onClick={() => setOpen((p) => !p)}
          className="rounded-lg p-2 hover:bg-gray-800"
          aria-label="Toggle sidebar"
          title="Toggle sidebar"
        >
          {/* simple hamburger/chevron */}
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

      {/* Nav */}
      <nav className="mt-2 px-2 flex-1">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
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
              {/* minimalist icon dot */}
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

      {/* Footer mini status (optional) */}
      {/* <div className="mt-auto p-3 text-xs text-gray-400 hidden md:block">
        <div className={`${open ? "block" : "hidden"}`}>
          Model: <span className="text-gray-300">v1.2</span>
        </div>
      </div> */}
    </aside>
  );
}
