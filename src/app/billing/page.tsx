"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { 
  CreditCard, 
  CheckCircle2, 
  Crown, 
  ArrowRight, 
  Loader2, 
  Zap, 
  AlertCircle,
  Infinity as InfinityIcon
} from "lucide-react";
import { UserProfile } from "@/lib/types";

function BillingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const mockUpgradeParam = searchParams.get("mock_upgraded");
  const isSuccess = searchParams.get("success");

  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchBillingStatus();
  }, [mockUpgradeParam]);

  const fetchBillingStatus = async () => {
    try {
      setLoading(true);
      const url = mockUpgradeParam 
        ? `/api/billing/status?mock_upgraded=${mockUpgradeParam}` 
        : `/api/billing/status`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      }
    } catch {
      setErrorMsg("Failed to load subscription status.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * 发起 Creem Checkout 支付跳转
   */
  const handleUpgrade = async (planType: "pro" | "ultra" | "studio") => {
    try {
      setCheckoutLoading(planType);
      setErrorMsg(null);

      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planType }),
      });

      const data = await res.json();
      if (data.checkoutUrl) {
        // 跳转到 Creem 国际收银台
        window.location.href = data.checkoutUrl;
      } else if (data.mockCheckoutUrl) {
        // 若无 API Key 则使用本地沙箱测试回显
        router.push(data.mockCheckoutUrl);
      } else {
        throw new Error(data.error || "Failed to initialize payment checkout.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred while creating checkout.");
    } finally {
      setCheckoutLoading(null);
    }
  };

  const isUnlimited = user?.planType === "studio" || (user?.monthlyUsageLimit || 0) >= 999999;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 transition-colors">
      {/* ── Page Header ── */}
      <div className="mb-10 text-center sm:text-left">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center justify-center sm:justify-start gap-3">
          <CreditCard className="h-7 w-7 text-[#1e3a8a] dark:text-blue-400" />
          <span>Billing & Subscription</span>
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Manage your subscription tier, track monthly generation quotas, and unlock priority rendering features.
        </p>
      </div>

      {isSuccess && (
        <div className="mb-8 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-sm flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
          <span>Payment successful! Your plan and generation quota have been updated.</span>
        </div>
      )}

      {errorMsg && (
        <div className="mb-8 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm flex items-center gap-3">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* ── Current Plan Overview Card ── */}
      {loading ? (
        <div className="py-16 text-center text-slate-500 dark:text-slate-400">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-[#1e3a8a] dark:text-blue-400" />
          <p>Loading subscription details...</p>
        </div>
      ) : user && (
        <div className="rounded-xl bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-slate-800 p-7 shadow-xs mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
            <div>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Current Active Tier
              </span>
              <div className="flex items-center gap-3 mt-1">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white capitalize">
                  {user.planType === "free" ? "Free Trial Plan" : `${user.planType} Plan`}
                </h2>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase ${
                  user.planType === "free"
                    ? "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                    : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                }`}>
                  {user.subscriptionStatus || "Active"}
                </span>
              </div>
            </div>

            {user.planType === "free" && (
              <button
                onClick={() => handleUpgrade("pro")}
                className="flex items-center gap-2 bg-[#1e3a8a] hover:bg-[#172554] dark:bg-[#1e40af] dark:hover:bg-[#1e3a8a] text-white px-5 py-2.5 rounded-lg text-sm font-semibold shadow-xs transition active:scale-95"
              >
                <span>Upgrade to Pro ($19)</span>
              </button>
            )}
          </div>

          {/* Quota Progress Bar */}
          <div className="mt-6">
            <div className="flex items-center justify-between text-sm mb-2 font-medium">
              <span className="text-slate-700 dark:text-slate-300">Monthly Video Generation Usage</span>
              <span className="text-slate-900 dark:text-white font-mono text-xs">
                {isUnlimited ? (
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5">
                    <InfinityIcon className="h-4 w-4" />
                    Unlimited Generations Active
                  </span>
                ) : (
                  `${user.monthlyUsageCount} / ${user.monthlyUsageLimit} videos (${Math.min(100, Math.round((user.monthlyUsageCount / user.monthlyUsageLimit) * 100))}%)`
                )}
              </span>
            </div>

            {!isUnlimited && (
              <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${
                    user.monthlyUsageCount >= user.monthlyUsageLimit
                      ? "bg-red-500"
                      : "bg-[#1e3a8a] dark:bg-blue-500"
                  }`}
                  style={{
                    width: `${Math.min(100, Math.max(5, (user.monthlyUsageCount / user.monthlyUsageLimit) * 100))}%`,
                  }}
                />
              </div>
            )}

            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mt-2">
              <span>
                {isUnlimited ? (
                  "No monthly quota ceiling"
                ) : (
                  <>Remaining: <strong>{Math.max(0, user.monthlyUsageLimit - user.monthlyUsageCount)} videos</strong></>
                )}
              </span>
              <span>Next quota reset: {user.currentPeriodEnd ? new Date(user.currentPeriodEnd).toLocaleDateString() : "Next billing cycle"}</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Upgrade Tiers Grid (Pro, Ultra, Studio) ── */}
      <div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Available Subscription Plans</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 1. Pro ($19 / 30 videos) */}
          <div className="rounded-xl bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-slate-800 p-7 flex flex-col justify-between shadow-xs hover:border-slate-350 dark:hover:border-slate-700 transition">
            <div>
              <div className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-[#1e3a8a] dark:text-blue-400" />
                <h4 className="text-xl font-bold text-slate-900 dark:text-white">Pro</h4>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">For independent creators & educators.</p>

              <div className="mt-5 flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-slate-900 dark:text-white">$19</span>
                <span className="text-sm text-slate-500">/month</span>
              </div>

              <div className="mt-6 space-y-3 text-sm text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-[#1e3a8a] dark:text-blue-400 flex-shrink-0" />
                  <span><strong>30 vocabulary videos</strong> / month</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-[#1e3a8a] dark:text-blue-400 flex-shrink-0" />
                  <span>Full HD 1080p 60fps rendering</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-[#1e3a8a] dark:text-blue-400 flex-shrink-0" />
                  <span><strong>No watermarks</strong></span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-[#1e3a8a] dark:text-blue-400 flex-shrink-0" />
                  <span>Priority render speed</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleUpgrade("pro")}
              disabled={checkoutLoading === "pro" || user?.planType === "pro"}
              className="mt-8 w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 disabled:opacity-50 py-3 rounded-lg font-semibold text-sm transition active:scale-95 shadow-xs"
            >
              {checkoutLoading === "pro" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : user?.planType === "pro" ? (
                <span>Current Plan</span>
              ) : (
                <>
                  <span>Upgrade to Pro ($19)</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>

          {/* 2. Ultra ($49 / 100 videos) - Popular */}
          <div className="rounded-xl bg-white dark:bg-[#151f36] border-2 border-[#1e3a8a] dark:border-blue-500 p-7 flex flex-col justify-between relative shadow-md">
            <div className="absolute -top-3 right-6 px-3 py-0.5 rounded-full bg-[#1e3a8a] text-white text-xs font-bold uppercase tracking-wider">
              Recommended
            </div>

            <div>
              <div className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-[#1e3a8a] dark:text-blue-400" />
                <h4 className="text-xl font-bold text-slate-900 dark:text-white">Ultra</h4>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">For active social media publishing channels.</p>

              <div className="mt-5 flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-slate-900 dark:text-white">$49</span>
                <span className="text-sm text-slate-500">/month</span>
              </div>

              <div className="mt-6 space-y-3 text-sm text-slate-800 dark:text-slate-200">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-[#1e3a8a] dark:text-blue-400 flex-shrink-0" />
                  <span><strong>100 vocabulary videos</strong> / month</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-[#1e3a8a] dark:text-blue-400 flex-shrink-0" />
                  <span>Ultra-fast parallel render queue</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-[#1e3a8a] dark:text-blue-400 flex-shrink-0" />
                  <span>Zero watermarks & Commercial License</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-[#1e3a8a] dark:text-blue-400 flex-shrink-0" />
                  <span>SRT Subtitles export</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleUpgrade("ultra")}
              disabled={checkoutLoading === "ultra" || user?.planType === "ultra"}
              className="mt-8 w-full flex items-center justify-center gap-2 bg-[#1e3a8a] hover:bg-[#172554] dark:bg-[#1e40af] dark:hover:bg-[#1e3a8a] text-white disabled:opacity-50 py-3 rounded-lg font-bold text-sm shadow-xs transition active:scale-95"
            >
              {checkoutLoading === "ultra" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : user?.planType === "ultra" ? (
                <span>Current Plan</span>
              ) : (
                <>
                  <span>Upgrade to Ultra ($49)</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>

          {/* 3. Studio / Team ($199 / Unlimited) */}
          <div className="rounded-xl bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-slate-800 p-7 flex flex-col justify-between shadow-xs hover:border-slate-350 dark:hover:border-slate-700 transition">
            <div>
              <div className="flex items-center gap-2">
                <InfinityIcon className="h-5 w-5 text-[#1e3a8a] dark:text-blue-400" />
                <h4 className="text-xl font-bold text-slate-900 dark:text-white">Studio / Team</h4>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Institutions & high-volume media studios.</p>

              <div className="mt-5 flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-slate-900 dark:text-white">$199</span>
                <span className="text-sm text-slate-500">/month</span>
              </div>

              <div className="mt-6 space-y-3 text-sm text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-[#1e3a8a] dark:text-blue-400 flex-shrink-0" />
                  <span><strong>Unlimited videos</strong> / month</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-[#1e3a8a] dark:text-blue-400 flex-shrink-0" />
                  <span>Batch CSV word import tool</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-[#1e3a8a] dark:text-blue-400 flex-shrink-0" />
                  <span>Dedicated parallel render workers</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-[#1e3a8a] dark:text-blue-400 flex-shrink-0" />
                  <span>24/7 VIP priority support</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleUpgrade("studio")}
              disabled={checkoutLoading === "studio" || user?.planType === "studio"}
              className="mt-8 w-full flex items-center justify-center gap-2 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 text-slate-800 dark:text-slate-200 py-3 rounded-lg font-semibold text-sm transition"
            >
              {checkoutLoading === "studio" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : user?.planType === "studio" ? (
                <span>Current Plan</span>
              ) : (
                <>
                  <span>Upgrade to Studio ($199)</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BillingPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-slate-500">Loading billing details...</div>}>
      <BillingContent />
    </Suspense>
  );
}
