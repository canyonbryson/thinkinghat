"use client";

import { ReactNode, useMemo } from "react";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { useAuth } from "@clerk/nextjs";
import { ThemeProvider } from "@thinkinghat/ui";
import { usePathname } from "next/navigation";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
const convex = new ConvexReactClient(convexUrl ?? "");

function useConvexAuth() {
  const auth = useAuth();
  const pathname = usePathname();

  // If the user just changed Clerk metadata (e.g. toggled isAdmin),
  // the cached JWT may not include it yet. On /admin routes, force a fresh token.
  const getToken = useMemo(() => {
    return (opts?: any) =>
      auth.getToken({
        ...(opts ?? {}),
        skipCache: pathname?.startsWith("/admin") ? true : (opts as any)?.skipCache,
      });
  }, [auth, pathname]);

  return { ...auth, getToken };
}

export default function Providers({ children }: { children: ReactNode }) {
  const useAuthHook = useMemo(() => useConvexAuth, []);

  if (!convexUrl) {
    throw new Error(
      "Missing NEXT_PUBLIC_CONVEX_URL. Run `pnpm dev` with apps/web/.env.local configured."
    );
  }

  return (
    <ThemeProvider defaultMode="dark" defaultStyle="modern">
      <ConvexProviderWithClerk client={convex} useAuth={useAuthHook}>
        {children}
      </ConvexProviderWithClerk>
    </ThemeProvider>
  );
}


