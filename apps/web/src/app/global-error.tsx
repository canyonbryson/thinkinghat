"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error(error);
  }, [error]);

  const message = String(error?.message ?? error);
  const isMissingClerkPk = message.includes("NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY");
  const isMissingConvexUrl = message.includes("NEXT_PUBLIC_CONVEX_URL");

  return (
    <html lang="en">
      <body style={{ padding: 24, fontFamily: "system-ui, -apple-system, Segoe UI, sans-serif" }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>Something went wrong</h1>

        {(isMissingClerkPk || isMissingConvexUrl) && (
          <div style={{ marginBottom: 12 }}>
            <p style={{ marginBottom: 8 }}>
              Missing required environment variables for local dev:
            </p>
            <ul>
              {isMissingClerkPk ? <li>NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY</li> : null}
              {isMissingConvexUrl ? <li>NEXT_PUBLIC_CONVEX_URL</li> : null}
            </ul>
          </div>
        )}

        <pre
          style={{
            whiteSpace: "pre-wrap",
            background: "rgba(0,0,0,0.06)",
            padding: 12,
            borderRadius: 8,
          }}
        >
          {message}
        </pre>

        <div style={{ marginTop: 16, display: "flex", gap: 12 }}>
          <button
            onClick={() => reset()}
            style={{
              padding: "8px 12px",
              borderRadius: 8,
              border: "1px solid rgba(0,0,0,0.2)",
              background: "white",
              cursor: "pointer",
            }}
          >
            Retry
          </button>
        </div>
      </body>
    </html>
  );
}


