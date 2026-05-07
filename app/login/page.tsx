"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Input } from "@/components/ui/Input";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"email" | "otp">("email");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onRequestOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setError(typeof j.error === "string" ? j.error : "Could not send code");
        return;
      }
      setStep("otp");
    } finally {
      setLoading(false);
    }
  }

  async function onVerify(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setError(typeof j.error === "string" ? j.error : "Invalid code");
        return;
      }
      const j = (await res.json()) as { tenant?: string };
      const t = j.tenant === "amanda" ? "amanda" : "kevin";
      if (t === "amanda") {
        router.replace("/amanda/dashboard");
      } else {
        router.replace("/kevin/dashboard");
      }
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white border border-slate-200 shadow-sm p-8">
        <div className="mb-8 text-center">
          <h1 className="text-xl font-bold text-slate-900">Medzah CRM</h1>
          <p className="text-sm text-slate-500 mt-1">Sign in with your work email</p>
        </div>

        {step === "email" ? (
          <form onSubmit={onRequestOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Email
              </label>
              <Input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@medzah.com"
                required
              />
            </div>
            {error && (
              <p className="text-sm text-red-600" role="alert">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-[#002f93] text-white text-sm font-semibold hover:opacity-95 disabled:opacity-60"
            >
              {loading ? "Sending…" : "Continue"}
            </button>
          </form>
        ) : (
          <form onSubmit={onVerify} className="space-y-4">
            <p className="text-sm text-slate-600">
              Enter the verification code for{" "}
              <span className="font-medium text-slate-900">{email}</span>.
            </p>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                One-time code
              </label>
              <Input
                inputMode="numeric"
                autoComplete="one-time-code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="000000"
                required
              />
            </div>
            {error && (
              <p className="text-sm text-red-600" role="alert">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-[#002f93] text-white text-sm font-semibold hover:opacity-95 disabled:opacity-60"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
            <button
              type="button"
              className="w-full text-sm text-slate-500 hover:text-slate-800"
              onClick={() => {
                setStep("email");
                setCode("");
                setError(null);
              }}
            >
              Use a different email
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
