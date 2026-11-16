"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Menu, X } from "lucide-react";

/**
 * 工作区总壳组件 (Workspace Layout Shell)
 * 智能感知当前路径：在后台系统（/dashboard, /library, /tools/*, /billing）中自动嵌入常驻侧边栏，
 * 在官网首页与登录注册页保持全宽清爽展示。
 */
export function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // 判断是否属于后台工作区路径
  const isWorkspaceRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/library") ||
    pathname.startsWith("/tools") ||
    pathname.startsWith("/billing");

  if (!isWorkspaceRoute) {
    return <main className="flex-1">{children}</main>;
  }

  return (
    <div className="flex-1 flex w-full relative min-h-[calc(100vh-4rem)]">
      {/* 桌面端常驻 Sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* 移动端汉堡切换悬浮按钮 */}
      <div className="md:hidden fixed bottom-5 right-5 z-40">
        <button
          type="button"
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="h-12 w-12 rounded-xl bg-[#1e3a8a] hover:bg-[#172554] text-white shadow-md flex items-center justify-center transition active:scale-95"
          aria-label="Toggle Navigation Menu"
        >
          {mobileSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* 移动端侧边栏抽屉遮罩与面板 */}
      {mobileSidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative z-10 w-72 max-w-[80vw] h-full shadow-2xl bg-white dark:bg-[#0d121f]">
            <Sidebar onCloseMobile={() => setMobileSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* 右侧核心内容主工作区 */}
      <main className="flex-1 overflow-x-hidden min-w-0 bg-slate-50/60 dark:bg-[#0b0f19]/40">
        {children}
      </main>
    </div>
  );
}

