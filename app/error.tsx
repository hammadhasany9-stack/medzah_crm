"use client";

import { useEffect } from "react";

export default function Error({
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
    <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-lg font-bold text-slate-900">Something went wrong</h1>
      <p className="text-sm text-slate-600 max-w-md">
        {error.message || "An unexpected error occurred."}
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className="px-4 py-2 text-sm font-semibold text-white bg-[#002f93] rounded-lg hover:bg-[#001f6b] transition-colors"
      >
        Try again
      </button>
    </div>
  );
}
