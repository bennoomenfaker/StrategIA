import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../styles/globals.css";
import { Providers } from "./providers";
import Link from "next/link";
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
} from "lucide-react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "StrategIA - Strategic Intelligence Platform",
  description: "AI-Augmented Strategic Intelligence & Competitive Intelligence SaaS Platform",
};

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Projects", href: "/projects", icon: FolderKanban },
  { name: "Hypotheses", href: "/intelligence/hypotheses", icon: Brain },
  { name: "Collection Plans", href: "/intelligence/collection-plans", icon: Rss },
  { name: "Périmètres", href: "/perimeters", icon: Globe },
  { name: "Intelligence Feed", href: "/feed", icon: LineChart },
  { name: "Graph View", href: "/graph", icon: Network },
  { name: "Analytics", href: "/analytics", icon: LineChart },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
