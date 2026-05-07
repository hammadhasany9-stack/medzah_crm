"use client";

import { useEffect } from "react";

/**
 * Root-level error UI. Must define <html> and <body> (replaces root layout when active).
 * Prevents the dev overlay from stalling on “missing required error components, refreshing…”.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="antialiased bg-slate-100 min-h-screen flex items-center justify-center p-6">
        <div className="text-center max-w-md rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-lg font-bold text-slate-900">Application error</h1>
          <p className="text-sm text-slate-600 mt-2">
            {error.message || "Something went wrong. Try refreshing the page."}
          </p>
          <button
            type="button"
            onClick={() => reset()}
            className="mt-6 px-4 py-2 text-sm font-semibold text-white bg-[#002f93] rounded-lg hover:bg-[#001f6b] transition-colors"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
