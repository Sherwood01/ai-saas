"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { 
  Video, 
  CreditCard, 
  LayoutDashboard, 
  Film,
  Crown, 
  Sun, 
  Moon, 
  LogOut, 
  ChevronDown,
  Languages
} from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { useLanguage } from "./LanguageProvider";
import { useAuth } from "./AuthProvider";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const { locale, toggleLanguage, t } = useLanguage();
  const { user, loading: loadingUser, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSignOut = async () => {
    setMenuOpen(false);
    await signOut();
  };

  const isUnlimited = user?.planType === "studio" || (user?.monthlyUsageLimit || 0) >= 999999;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#0a0f1d]/95 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-15 flex items-center justify-between">
        {/* Brand Logo (政企深海藏青) */}
        <Link href="/" className="flex items-center gap-2.5 font-bold text-lg group">
          <div className="h-8 w-8 rounded-lg bg-[#1e3a8a] dark:bg-[#1e40af] text-white flex items-center justify-center font-bold text-sm shadow-xs transition group-hover:opacity-90">
            <Video className="h-4 w-4" />
          </div>
          <span className="tracking-tight text-lg font-bold text-slate-900 dark:text-slate-100">
            SaaS<span className="text-[#1e3a8a] dark:text-[#60a5fa] font-semibold ml-0.5">.ai</span>
          </span>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 sm:gap-2">
          <Link
            href="/dashboard"
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-semibold transition ${
              pathname === "/dashboard"
                ? "bg-slate-100 dark:bg-slate-800 text-[#1e3a8a] dark:text-[#93c5fd]"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/60"
            }`}
          >
            <LayoutDashboard className="h-4 w-4" />
            <span>{t.navDashboard}</span>
          </Link>

          <Link
            href="/library"
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-semibold transition ${
              pathname === "/library"
                ? "bg-slate-100 dark:bg-slate-800 text-[#1e3a8a] dark:text-[#93c5fd]"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/60"
            }`}
          >
            <Film className="h-4 w-4" />
            <span>{t.navLibrary}</span>
          </Link>

          <Link
            href="/#pricing"
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/60 transition"
          >
            <span>{locale === "zh" ? "价格方案" : "Pricing"}</span>
          </Link>

          <Link
            href="/billing"
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-semibold transition ${
              pathname === "/billing"
                ? "bg-slate-100 dark:bg-slate-800 text-[#1e3a8a] dark:text-[#93c5fd]"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/60"
            }`}
          >
            <CreditCard className="h-4 w-4" />
            <span>{t.navBilling}</span>
          </Link>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Language Switch Button (中 / EN) */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition shadow-xs"
            title={locale === "zh" ? "Switch to English" : "切换为简体中文"}
          >
            <Languages className="h-3.5 w-3.5 text-[#1e3a8a] dark:text-[#60a5fa]" />
            <span>{locale === "zh" ? "EN" : "中"}</span>
          </button>

          {/* Light / Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition"
            title={`Switch to ${theme === "dark" ? "Light" : "Dark"} mode`}
            aria-label="Toggle Theme"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4 text-slate-300" />
            ) : (
              <Moon className="h-4 w-4 text-slate-700" />
            )}
          </button>

          {/* User Status Bar */}
          {!loadingUser && user ? (
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Quota Badge */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
                {user.planType !== "free" ? (
                  <span className="flex items-center gap-1.5 text-[#1e3a8a] dark:text-[#60a5fa] font-bold uppercase">
                    <Crown className="h-4 w-4" />
                    {user.planType}
                  </span>
                ) : (
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Free Tier</span>
                )}
                <span className="text-slate-300 dark:text-slate-600">|</span>
                <span className="text-slate-700 dark:text-slate-300 font-mono text-xs">
                  {isUnlimited ? "Unlimited" : `${user.monthlyUsageCount}/${user.monthlyUsageLimit} videos`}
                </span>
              </div>

              {/* User Dropdown Profile */}
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 transition text-sm font-semibold shadow-xs"
                >
                  <div className="h-6 w-6 rounded-md bg-[#1e3a8a] dark:bg-[#1e40af] text-white flex items-center justify-center font-bold text-xs">
                    {user.displayName.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:inline text-slate-800 dark:text-slate-200 max-w-[120px] truncate">
                    {user.displayName}
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                </button>

                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-60 rounded-lg bg-white dark:bg-[#101828] border border-slate-200 dark:border-slate-800 shadow-lg py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                      <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        {user.displayName}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {user.email}
                      </p>
                    </div>

                    <Link
                      href="/dashboard"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition"
                    >
                      <LayoutDashboard className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                      <span>{t.navDashboard}</span>
                    </Link>

                    <Link
                      href="/library"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition"
                    >
                      <Film className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                      <span>{t.navLibrary}</span>
                    </Link>

                    <Link
                      href="/billing"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition"
                    >
                      <CreditCard className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                      <span>{t.navBilling}</span>
                    </Link>

                    <div className="border-t border-slate-100 dark:border-slate-800 my-1" />

                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition text-left font-medium"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>{t.signOut}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                href="/auth/sign-in"
                className="px-3.5 py-1.5 rounded-lg text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
              >
                {t.signIn}
              </Link>
              <Link
                href="/auth/sign-up"
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-semibold bg-[#1e3a8a] hover:bg-[#172554] dark:bg-[#1e40af] dark:hover:bg-[#1e3a8a] text-white transition shadow-xs active:scale-95"
              >
                <span>{t.signUp}</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
