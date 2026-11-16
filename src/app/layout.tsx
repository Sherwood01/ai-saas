import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { UpgradeModal } from "@/components/UpgradeModal";
import { ThemeProvider } from "@/components/ThemeProvider";
import { WorkspaceLayout } from "@/components/WorkspaceLayout";

export const metadata: Metadata = {
  title: "SaaS AI - Automated Video Generator for Creators & Educators",
  description: "Turn any English word into high-retention TikTok, Reels & YouTube Shorts videos in seconds with AI scripting, natural voiceover, and Remotion animations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('vocabvids_theme');
                if (theme === 'light') {
                  document.documentElement.classList.remove('dark');
                } else {
                  document.documentElement.classList.add('dark');
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-[#f1f5f9] text-slate-900 dark:bg-[#0a0f1d] dark:text-slate-100 flex flex-col antialiased selection:bg-[#1e3a8a] selection:text-white transition-colors duration-150">
        <ThemeProvider>
          <Navbar />
          <WorkspaceLayout>{children}</WorkspaceLayout>
          <UpgradeModal />
          
          {/* 政企严谨稳重 Footer */}
          <footer className="border-t border-slate-200 dark:border-slate-800 py-6 text-center text-xs text-slate-500 dark:text-slate-400 bg-white/70 dark:bg-[#0a0f1d]/70">
            <p>© {new Date().getFullYear()} SaaS AI Omni Studio Enterprise. All rights reserved.</p>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
