"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth.store";
import { api } from "@/lib/api";
import {
  FolderKanban,
  Brain,
  Rss,
  Lightbulb,
  TrendingUp,
  ArrowUpRight,
} from "lucide-react";
import { motion } from "framer-motion";

interface KPI {
  label: string;
  value: string;
  change: string;
  icon: any;
  color: string;
  bgColor: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function DashboardPage() {
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    fetchData();
  }, [isAuthenticated]);

  const fetchData = async () => {
    try {
      const [projectsRes, hypothesesRes, plansRes] = await Promise.all([
        api.get("/projects"),
        api.get("/hypotheses"),
        api.get("/collection-plans"),
      ]);

      const projects = projectsRes.data.data || projectsRes.data || [];
      const hypotheses = hypothesesRes.data.data || hypothesesRes.data || [];
      const plans = plansRes.data.data || plansRes.data || [];

      setKpis([
        {
          label: "Active Projects",
          value: projects.length.toString(),
          change: `${projects.filter((p: any) => !p.isArchived).length} active`,
          icon: FolderKanban,
          color: "text-blue-500",
          bgColor: "bg-blue-500/10",
        },
        {
          label: "Hypotheses",
          value: hypotheses.length.toString(),
          change: `${hypotheses.filter((h: any) => h.status === "VALIDATED").length} validated`,
          icon: Brain,
          color: "text-purple-500",
          bgColor: "bg-purple-500/10",
        },
        {
          label: "Collection Plans",
          value: plans.length.toString(),
          change: `${plans.filter((p: any) => p.isActive).length} running`,
          icon: Rss,
          color: "text-emerald-500",
          bgColor: "bg-emerald-500/10",
        },
        {
          label: "Insights Generated",
          value: "0",
          change: "AI integration pending",
          icon: Lightbulb,
          color: "text-amber-500",
          bgColor: "bg-amber-500/10",
        },
      ]);

      setRecentActivity([
        { action: "System Ready", detail: "Dashboard connected to API", time: "now", type: "system" },
        { action: `Projects loaded`, detail: `${projects.length} projects found`, time: "just now", type: "collection" },
      ]);
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1,2,3,4].map(i => (
          <div key={i} className="h-32 rounded-xl border border-border bg-card animate-pulse" />
        ))}
      </div>
    );
  }

  return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        <div>
          <h2 className="text-2xl font-bold">Strategic Overview</h2>
          <p className="mt-1 text-muted-foreground">
            Monitor your intelligence operations in real-time
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {kpis.map((kpi) => (
            <motion.div
              key={kpi.label}
              variants={itemVariants}
              className="rounded-xl border border-border bg-card p-6 transition-shadow hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div className={`rounded-lg ${kpi.bgColor} p-2`}>
                  <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
                </div>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="mt-4">
                <p className="text-3xl font-bold">{kpi.value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{kpi.label}</p>
                <p className="mt-2 text-xs text-emerald-500">{kpi.change}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <motion.div
            variants={itemVariants}
            className="rounded-xl border border-border bg-card p-6 lg:col-span-2"
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Recent Activity</h3>
              <button className="flex items-center gap-1 text-sm text-primary hover:underline">
                View all <ArrowUpRight className="h-3 w-3" />
              </button>
            </div>
            <div className="space-y-4">
              {recentActivity.map((activity, i) => (
                <div key={i} className="flex items-start gap-3 rounded-lg p-3 hover:bg-secondary/50">
                  <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">{activity.detail}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{activity.time}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="rounded-xl border border-border bg-card p-6">
            <h3 className="mb-4 text-lg font-semibold">Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={() => router.push("/projects/new")}
                className="flex w-full items-center gap-3 rounded-lg border border-border p-3 text-left text-sm font-medium transition-colors hover:bg-secondary"
              >
                <FolderKanban className="h-4 w-4 text-primary" />
                Create New Project
              </button>
              <button className="flex w-full items-center gap-3 rounded-lg border border-border p-3 text-left text-sm font-medium transition-colors hover:bg-secondary">
                <Brain className="h-4 w-4 text-primary" />
                Add Hypothesis
              </button>
              <button className="flex w-full items-center gap-3 rounded-lg border border-border p-3 text-left text-sm font-medium transition-colors hover:bg-secondary">
                <Rss className="h-4 w-4 text-primary" />
                New Collection Plan
              </button>
            </div>
          </motion.div>
        </div>
      </motion.div>
  );
}
