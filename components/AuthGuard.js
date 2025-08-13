"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function AuthGuard({ children }) {
  const { status } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  const isPublicRoute = pathname === "/login";

  useEffect(() => {
    if (!isPublicRoute && status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, isPublicRoute, router]);

  if (!isPublicRoute && status === "unauthenticated") {
    return null;
  }

  return children;
}


