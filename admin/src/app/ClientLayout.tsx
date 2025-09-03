"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "./components/Sidebar";

const LOGIN_ROUTE = "/";                   // your login page
const TOKEN_KEY = "access_token";         // where you save the token

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  // Whether the current path is considered public (no auth required)
  const isPublic = useMemo(() => pathname === LOGIN_ROUTE, [pathname]);

  const [checked, setChecked] = useState(false); // finished checking token
  const [authed, setAuthed] = useState(false);   // has token?

  useEffect(() => {
    // LocalStorage exists only on client
    const token = typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;
    const hasToken = Boolean(token);

    setAuthed(hasToken);
    setChecked(true);

    // If trying to access a protected route without a token -> go to login
    if (!isPublic && !hasToken) {
      router.replace(LOGIN_ROUTE);
    }

    // If already logged in and visiting the login page, send to dashboard (optional)
    if (isPublic && hasToken) {
      router.replace("/dashboard");
    }
  }, [isPublic, router, pathname]);

  // Avoid flashing content while we check
  if (!checked) {
    return (
      <div className="min-h-screen grid place-items-center bg-gray-950">
        <div className="text-gray-300">Checking authentication…</div>
      </div>
    );
  }

  // On the login page, don't render the Sidebar
  if (isPublic) {
    return <>{children}</>;
  }

  // On protected routes, only render content if authed
  if (!authed) {
    // We already issued a redirect; render nothing to prevent a flash.
    return null;
  }

  // Authenticated + protected: show your normal shell
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 pt-20 p-4 sm:p-6">{children}</main>
    </div>
  );
}
