import { NextResponse } from "next/server";

// NOTE:
// We intentionally do not use `@clerk/nextjs/server` here so the app can run
// without `CLERK_SECRET_KEY` configured. Auth is enforced by Convex functions.
export default function middleware() {
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
