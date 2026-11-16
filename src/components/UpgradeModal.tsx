"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowRight, X, CheckCircle2 } from "lucide-react";

/**
 * Global quota limit interception modal (UpgradeModal - Palantir Navy & Slate).
 * Listens for the "quota-exceeded" custom event when an API returns HTTP 402.
 */
export function UpgradeModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("You have reached your monthly video generation limit.");
  const router = useRouter();

  useEffect(() => {
    const handleQuotaExceeded = (e: Event) => {
      const customEvent = e as CustomEvent<{ message?: string }>;
      if (customEvent.detail && customEvent.detail.message) {
        setMessage(customEvent.detail.message);
      } else {
        setMessage("You have reached your monthly video generation limit. Upgrade to Pro for 30 videos/mo or Ultra for 100 videos/mo with 1080p priority rendering.");
      }
      setIsOpen(true);
    };

    window.addEventListener("quota-exceeded", handleQuotaExceeded);
    return () => {
      window.removeEventListener("quota-exceeded", handleQuotaExceeded);
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 transition-all">
      <div className="relative w-full max-w-lg rounded-xl bg-white dark:bg-[#101828] border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-2xl text-slate-900 dark:text-white animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header Icon */}
        <div className="flex flex-col items-center text-center mt-1">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20 mb-3">
            <AlertCircle className="h-6 w-6" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[#1e3a8a] dark:text-[#93c5fd] text-xs font-semibold mb-2">
            Monthly Quota Reached
          </div>

          <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Upgrade Your Plan
          </h3>

          <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed px-4">
            {message}
          </p>

          {/* Quick Comparison */}
          <div className="mt-5 w-full bg-slate-50 dark:bg-slate-850 rounded-lg p-4 border border-slate-200 dark:border-slate-800 text-left space-y-2.5">
            <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              Select Your Next Tier
            </div>
            <div className="flex items-center justify-between text-xs py-1.5 border-b border-slate-200 dark:border-slate-800">
              <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#1e3a8a] dark:text-[#60a5fa]" />
                Pro Plan ($19/mo)
              </span>
              <span className="text-xs font-mono text-[#1e3a8a] dark:text-[#60a5fa] font-bold">30 Videos/mo</span>
            </div>
            <div className="flex items-center justify-between text-xs py-1.5 border-b border-slate-200 dark:border-slate-800">
              <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#1e3a8a] dark:text-[#60a5fa]" />
                Ultra Plan ($49/mo)
              </span>
              <span className="text-xs font-mono text-[#1e3a8a] dark:text-[#60a5fa] font-bold">100 Videos/mo</span>
            </div>
            <div className="flex items-center justify-between text-xs py-1.5">
              <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                Studio / Team ($199/mo)
              </span>
              <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold">Unlimited</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 w-full space-y-2.5">
            <button
              onClick={() => {
                setIsOpen(false);
                router.push("/billing");
              }}
              className="w-full flex items-center justify-center gap-2 bg-[#1e3a8a] hover:bg-[#172554] dark:bg-[#1e40af] dark:hover:bg-[#1e3a8a] text-white py-2.5 rounded-lg font-semibold text-xs sm:text-sm shadow-xs transition active:scale-[0.98]"
            >
              <span>View Pricing & Upgrade</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            <button
              onClick={() => setIsOpen(false)}
              className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition border border-slate-200 dark:border-slate-700"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
