"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FolderKanban,
  Brain,
  Rss,
  Globe,
  Network,
  LineChart,
  Settings,
  LogOut,
  Lightbulb,
  Radio,
  TrendingUp,
  ClipboardList,
  GitBranch,
  Languages,
  ChevronLeft,
  Search,
} from "lucide-react";
import { useAuthStore } from "@/stores/auth.store";
import { useI18n } from "@/lib/i18n";

const navigationItems = [
  { key: "dashboard", href: "/dashboard", icon: LayoutDashboard },
  { key: "projects", href: "/projects", icon: FolderKanban },
  { key: "hypotheses", href: "/intelligence/hypotheses", icon: Brain },
  { key: "insights", href: "/insights", icon: Lightbulb },
  { key: "signals", href: "/signals", icon: Radio },
  { key: "trends", href: "/trends", icon: TrendingUp },
  { key: "collectionPlans", href: "/intelligence/collection-plans", icon: Rss },
  { key: "perimeters", href: "/perimeters", icon: Globe },
  { key: "recommendations", href: "/recommendations", icon: ClipboardList },
  { key: "decisions", href: "/decisions", icon: GitBranch },
  { key: "intelligenceFeed", href: "/feed", icon: LineChart },
  { key: "graphView", href: "/graph", icon: Network },
  { key: "analytics", href: "/analytics", icon: LineChart },
  { key: "settings", href: "/settings", icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { t, locale, setLocale } = useI18n();
  const [navOpen, setNavOpen] = useState(true);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 z-40 h-screen border-r border-border bg-card transition-all ${
        navOpen ? "w-64" : "w-16"
      }`}>
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-14 items-center border-b border-border px-4">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-purple-600">
                <Brain className="h-5 w-5 text-primary-foreground" />
              </div>
              {navOpen && <span className="text-lg font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">StrategIA</span>}
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-4 scrollbar-thin">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  title={navOpen ? undefined : t(`nav.${item.key}`)}
                  className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                    isActive
                      ? "bg-primary/10 text-primary shadow-sm"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  <Icon className={`h-5 w-5 shrink-0 ${isActive ? "text-primary" : ""}`} />
                  {navOpen && (
                    <span className="truncate">{t(`nav.${item.key}`)}</span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Bottom section */}
          <div className="border-t border-border p-3 space-y-2">
            {/* Language toggle */}
            <button
              onClick={() => setLocale(locale === "fr" ? "en" : "fr")}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
              title={t("common.language")}
            >
              <Languages className="h-5 w-5 shrink-0" />
              {navOpen && (
                <span className="uppercase font-medium">{locale === "fr" ? "EN" : "FR"}</span>
              )}
            </button>

            {/* Sidebar toggle */}
            <button
              onClick={() => setNavOpen(!navOpen)}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
            >
              <ChevronLeft className={`h-5 w-5 shrink-0 transition-transform ${!navOpen ? "rotate-180" : ""}`} />
              {navOpen && <span>Collapse</span>}
            </button>

            {/* User */}
            <div className="flex items-center gap-3 rounded-lg px-3 py-2">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-purple-600">
                <span className="text-sm font-bold text-white">
                  {user?.nom?.charAt(0).toUpperCase() || "U"}
                </span>
              </div>
              {navOpen && (
                <div className="flex-1 overflow-hidden">
                  <p className="truncate text-sm font-medium">{user?.nom || "User"}</p>
                  <p className="truncate text-xs text-muted-foreground">{user?.email || ""}</p>
                </div>
              )}
              <button
                onClick={handleLogout}
                className="rounded-lg p-2 text-muted-foreground hover:text-foreground hover:bg-destructive/10 transition-colors"
                title={t("auth.logout")}
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className={`transition-all ${navOpen ? "ml-64" : "ml-16"}`}>
        <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-lg">
          <div className="flex h-14 items-center gap-4 px-6">
            <div className="ml-auto flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="search"
                  placeholder={t("common.search")}
                  className="h-9 w-64 rounded-full border border-border bg-secondary/50 pl-9 pr-4 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                />
              </div>
            </div>
          </div>
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
