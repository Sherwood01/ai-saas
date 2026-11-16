"use client";

import Link from "next/link";
import { useState } from "react";
import { 
  ArrowRight, 
  CheckCircle2, 
  Zap, 
  Volume2, 
  Video, 
  ShieldCheck, 
  Infinity as InfinityIcon, 
  Crown,
  Layers
} from "lucide-react";

export default function LandingPage() {
  const [demoWord, setDemoWord] = useState("serendipity");

  return (
    <div className="relative overflow-hidden transition-colors duration-200">
      {/* ── 1. Hero Section ── */}
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[#1e3a8a] dark:text-[#93c5fd] text-xs sm:text-sm font-semibold mb-6">
          <Layers className="h-3.5 w-3.5" />
          <span>Next-Gen Vocabulary Video Automation for TikTok & Reels</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto leading-tight sm:leading-none">
          Turn Any Word into <br className="hidden sm:inline" />
          <span className="text-[#1e3a8a] dark:text-[#60a5fa]">
            Engaging Short Videos
          </span> in Seconds
        </h1>

        <p className="mt-6 text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          AI-crafted pedagogical scripts, ultra-realistic neural TTS voiceovers, and synchronized Remotion motion graphics — completely automated for educators, creators, and publishers.
        </p>

        {/* Quick Word Demo Input */}
        <div className="mt-10 max-w-md mx-auto flex items-center p-1.5 rounded-lg bg-white dark:bg-[#101828] border border-slate-200 dark:border-slate-800 shadow-xs">
          <input
            type="text"
            value={demoWord}
            onChange={(e) => setDemoWord(e.target.value)}
            placeholder="Type any word, e.g. ephemeral..."
            className="flex-1 bg-transparent px-3.5 py-2 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none text-sm font-medium"
          />
          <Link
            href={`/tools/vocab-shorts?word=${encodeURIComponent(demoWord.trim())}`}
            className="flex items-center gap-2 bg-[#1e3a8a] hover:bg-[#172554] dark:bg-[#1e40af] text-white px-4 py-2 rounded font-semibold text-xs sm:text-sm transition shadow-xs active:scale-95"
          >
            <span>Generate</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center gap-2">
          <span>5 Free videos included</span>
          <span>•</span>
          <span>No credit card required to start</span>
        </p>
      </section>

      {/* ── 2. How It Works (3 Steps) ── */}
      <section className="py-16 border-y border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-[#070b14]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              From 1 Word to Viral Video in 3 Steps
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Everything rendered in pure 1080x1920 60FPS vertical format.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-lg bg-white dark:bg-[#101828] border border-slate-200 dark:border-slate-800 shadow-xs relative group hover:border-slate-400 dark:hover:border-slate-700 transition">
              <div className="h-10 w-10 rounded bg-slate-100 dark:bg-slate-800 text-[#1e3a8a] dark:text-[#93c5fd] flex items-center justify-center mb-4 font-bold border border-slate-200 dark:border-slate-700">
                <Zap className="h-4 w-4" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">Smart Pedagogical Scripting</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Our LLM analyzes the word, generating phonetic symbols, concise definitions, and vivid real-life contextual stories.
              </p>
            </div>

            <div className="p-6 rounded-lg bg-white dark:bg-[#101828] border border-slate-200 dark:border-slate-800 shadow-xs relative group hover:border-slate-400 dark:hover:border-slate-700 transition">
              <div className="h-10 w-10 rounded bg-slate-100 dark:bg-slate-800 text-[#1e3a8a] dark:text-[#93c5fd] flex items-center justify-center mb-4 font-bold border border-slate-200 dark:border-slate-700">
                <Volume2 className="h-4 w-4" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">Neural Voice & Rhythm Beats</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Synthesizes studio-grade TTS voiceovers and aligns micro-second audio timestamps to trigger dynamic visual transitions.
              </p>
            </div>

            <div className="p-6 rounded-lg bg-white dark:bg-[#101828] border border-slate-200 dark:border-slate-800 shadow-xs relative group hover:border-slate-400 dark:hover:border-slate-700 transition">
              <div className="h-10 w-10 rounded bg-slate-100 dark:bg-slate-800 text-[#1e3a8a] dark:text-[#93c5fd] flex items-center justify-center mb-4 font-bold border border-slate-200 dark:border-slate-700">
                <Video className="h-4 w-4" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">Remotion Engine Rendering</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Renders programmatic kinetic typography, chapter cards, timeline progress bars, and ready-to-publish MP4 files.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. Pricing Section (4 Tiers: Free, Pro, Ultra, Studio) ── */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[#1e3a8a] dark:text-[#93c5fd] text-xs font-semibold uppercase tracking-wider mb-3">
            Transparent Pricing
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Flexible Plans for Every Creator
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
            From free trial to unlimited studio scale. Upgrade or cancel anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {/* 1. Free Tier */}
          <div className="rounded-lg bg-white dark:bg-[#101828] border border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-750 shadow-xs transition">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Free Trial</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Try out video generation.</p>
              <div className="mt-5 flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-slate-900 dark:text-white">$0</span>
                <span className="text-xs text-slate-500">/mo</span>
              </div>

              <div className="mt-6 space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#1e3a8a] dark:text-[#60a5fa] flex-shrink-0" />
                  <span><strong>5 videos</strong> / month</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#1e3a8a] dark:text-[#60a5fa] flex-shrink-0" />
                  <span>720p HD resolution</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#1e3a8a] dark:text-[#60a5fa] flex-shrink-0" />
                  <span>Standard queue</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <span>Watermark included</span>
                </div>
              </div>
            </div>

            <Link
              href="/dashboard"
              className="mt-6 w-full block text-center py-2 rounded border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-semibold transition"
            >
              Start Free
            </Link>
          </div>

          {/* 2. Pro ($19 / 30 videos) */}
          <div className="rounded-lg bg-white dark:bg-[#101828] border border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-750 shadow-xs transition">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Pro</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">For regular creators.</p>
              <div className="mt-5 flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-slate-900 dark:text-white">$19</span>
                <span className="text-xs text-slate-500">/mo</span>
              </div>

              <div className="mt-6 space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#1e3a8a] dark:text-[#60a5fa] flex-shrink-0" />
                  <span><strong>30 videos</strong> / month</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#1e3a8a] dark:text-[#60a5fa] flex-shrink-0" />
                  <span>1080p 60fps Full HD</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#1e3a8a] dark:text-[#60a5fa] flex-shrink-0" />
                  <span><strong>No watermarks</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#1e3a8a] dark:text-[#60a5fa] flex-shrink-0" />
                  <span>Priority render speed</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-[#1e3a8a] dark:text-[#60a5fa] flex-shrink-0" />
                  <span>Commercial rights</span>
                </div>
              </div>
            </div>

            <Link
              href="/billing?select=pro"
              className="mt-6 w-full block text-center py-2 rounded bg-[#1e3a8a] hover:bg-[#172554] dark:bg-[#1e40af] text-white text-xs font-semibold transition shadow-xs"
            >
              Get Pro ($19)
            </Link>
          </div>

          {/* 3. Ultra ($49 / 100 videos) - Highlighted */}
          <div className="rounded-lg bg-white dark:bg-[#131d33] border-2 border-[#1e3a8a] dark:border-[#3b82f6] p-6 flex flex-col justify-between relative shadow-md lg:-translate-y-2">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded bg-[#1e3a8a] dark:bg-[#3b82f6] text-white text-[10px] font-bold tracking-wide uppercase">
              Most Popular
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <Crown className="h-4 w-4 text-[#1e3a8a] dark:text-[#60a5fa]" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Ultra</h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">High-frequency creators & tutors.</p>
              <div className="mt-5 flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-slate-900 dark:text-white">$49</span>
                <span className="text-xs text-slate-500">/mo</span>
              </div>

              <div className="mt-6 space-y-2.5 text-xs text-slate-800 dark:text-slate-200">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#1e3a8a] dark:text-[#60a5fa] flex-shrink-0" />
                  <span><strong>100 videos</strong> / month</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#1e3a8a] dark:text-[#60a5fa] flex-shrink-0" />
                  <span>1080p 60fps Ultra HD</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#1e3a8a] dark:text-[#60a5fa] flex-shrink-0" />
                  <span><strong>Zero watermarks</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#1e3a8a] dark:text-[#60a5fa] flex-shrink-0" />
                  <span>Ultra-fast parallel queue</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#1e3a8a] dark:text-[#60a5fa] flex-shrink-0" />
                  <span>SRT subtitles export</span>
                </div>
              </div>
            </div>

            <Link
              href="/billing?select=ultra"
              className="mt-6 w-full block text-center py-2 rounded bg-[#1e3a8a] hover:bg-[#172554] dark:bg-[#1e40af] text-white text-xs font-bold transition active:scale-95 shadow-xs"
            >
              Get Ultra ($49)
            </Link>
          </div>

          {/* 4. Studio / Team ($199 / Unlimited) */}
          <div className="rounded-lg bg-white dark:bg-[#101828] border border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-750 shadow-xs transition">
            <div>
              <div className="flex items-center gap-1.5">
                <InfinityIcon className="h-4 w-4 text-[#1e3a8a] dark:text-[#60a5fa]" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Studio / Team</h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Institutions & agency teams.</p>
              <div className="mt-5 flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-slate-900 dark:text-white">$199</span>
                <span className="text-xs text-slate-500">/mo</span>
              </div>

              <div className="mt-6 space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#1e3a8a] dark:text-[#60a5fa] flex-shrink-0" />
                  <span><strong>Unlimited videos</strong> / month</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#1e3a8a] dark:text-[#60a5fa] flex-shrink-0" />
                  <span>Batch CSV word import</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#1e3a8a] dark:text-[#60a5fa] flex-shrink-0" />
                  <span>Dedicated render workers</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#1e3a8a] dark:text-[#60a5fa] flex-shrink-0" />
                  <span>Custom brand outro watermark</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#1e3a8a] dark:text-[#60a5fa] flex-shrink-0" />
                  <span>24/7 VIP Priority support</span>
                </div>
              </div>
            </div>

            <Link
              href="/billing?select=studio"
              className="mt-6 w-full block text-center py-2 rounded border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs font-semibold transition"
            >
              Get Studio ($199)
            </Link>
          </div>
        </div>
      </section>

      {/* ── 4. FAQ Section ── */}
      <section className="py-16 border-t border-slate-200 dark:border-slate-800 max-w-4xl mx-auto px-4 sm:px-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white text-center mb-8">Frequently Asked Questions</h2>
        <div className="space-y-4">
          <div className="p-5 rounded-lg bg-white dark:bg-[#101828] border border-slate-200 dark:border-slate-800 shadow-xs">
            <h4 className="font-semibold text-slate-900 dark:text-white">Can I monetize these videos on TikTok, YouTube & Reels?</h4>
            <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400">Yes! Videos created with Pro, Ultra, and Studio plans include full commercial publishing rights.</p>
          </div>
          <div className="p-5 rounded-lg bg-white dark:bg-[#101828] border border-slate-200 dark:border-slate-800 shadow-xs">
            <h4 className="font-semibold text-slate-900 dark:text-white">What does &ldquo;Unlimited videos&rdquo; mean for Studio?</h4>
            <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400">Studio plan users can generate as many vocabulary videos as their production requires without any monthly caps or interruptions.</p>
          </div>
          <div className="p-5 rounded-lg bg-white dark:bg-[#101828] border border-slate-200 dark:border-slate-800 shadow-xs">
            <h4 className="font-semibold text-slate-900 dark:text-white">Can I cancel my subscription anytime?</h4>
            <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400">Absolutely. You can manage and cancel your subscription anytime with 1 click from your Billing dashboard.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
