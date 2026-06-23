"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function AuthGuard({ children }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  // Define public routes that don't require authentication
  const publicRoutes = ["/login", "/"]; 
  const isPublicRoute = publicRoutes.includes(pathname);

  useEffect(() => {
    if (status === "loading") return;

    // 1. Redirect unauthenticated users from protected routes to login
    if (!isPublicRoute && status === "unauthenticated") {
      router.replace("/login");
    }

    // 2. If authenticated but no type is set, force them to the select-type page
    if (status === "authenticated" && !session?.user?.type && pathname !== "/select-type") {
      router.replace("/select-type");
    }
  }, [status, session, isPublicRoute, pathname, router]);

  // Show nothing while loading session
  if (status === "loading") {
    return null; 
  }

  // Prevent rendering if unauthenticated on a protected route
  if (!isPublicRoute && status === "unauthenticated") {
    return null;
  }

  // Prevent rendering protected content if they haven't selected a type yet
  if (status === "authenticated" && !session?.user?.type && pathname !== "/select-type") {
    return null;
  }

  return children;
}