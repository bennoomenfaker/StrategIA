"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line,
} from "recharts";
import {
  FolderKanban, Target, GitBranch, Lightbulb, ListTodo, Database, TrendingUp, Activity,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const COLORS = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444", "#ec4899"];

interface AnalyticsStats {
  totalProjects: number;
  totalObjectives: number;
  totalAxes: number;
  totalHypotheses: number;
  activeCollectionPlans: number;
  totalRawItems: number;
  rawItemsByMonth: { month: string; count: number }[];
  topSources: { name: string; value: number; count: number }[];
  jobsStats: { total: number; succeeded: number; failed: number; successRate: number };
}

export default function AnalyticsPage() {
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get("/analytics/stats");
      setStats(res.data);
    } catch (err) {
      console.error("Failed to fetch analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid gap-6 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-32 rounded-xl border border-border bg-card animate-pulse" />
        ))}
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="rounded-xl border border-border bg-card p-12 text-center">
        <TrendingUp className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold">Unable to load analytics</h3>
        <p className="text-muted-foreground mt-2">Check your connection and try again</p>
      </div>
    );
  }

  const kpis = [
    { label: "Projects", value: stats.totalProjects, icon: FolderKanban, color: "text-blue-500" },
    { label: "Objectives", value: stats.totalObjectives, icon: Target, color: "text-violet-500" },
    { label: "Axes", value: stats.totalAxes, icon: GitBranch, color: "text-emerald-500" },
    { label: "Hypotheses", value: stats.totalHypotheses, icon: Lightbulb, color: "text-amber-500" },
    { label: "Active Plans", value: stats.activeCollectionPlans, icon: ListTodo, color: "text-rose-500" },
    { label: "Items Collected", value: stats.totalRawItems, icon: Database, color: "text-cyan-500" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground">
          Real-time analytics from your intelligence operations
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {kpis.map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {kpi.label}
                </CardTitle>
                <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{kpi.value.toLocaleString()}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl border border-border bg-card p-6"
        >
          <h3 className="mb-4 text-lg font-semibold flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-blue-500" />
            Collection Trend
          </h3>
          {stats.rawItemsByMonth.length === 0 ? (
            <p className="text-muted-foreground text-sm py-8 text-center">No collection data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={stats.rawItemsByMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="month" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: "8px" }}
                />
                <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} dot={{ fill: "#3b82f6" }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border border-border bg-card p-6"
        >
          <h3 className="mb-4 text-lg font-semibold flex items-center gap-2">
            <Activity className="h-4 w-4 text-violet-500" />
            Source Distribution
          </h3>
          {stats.topSources.length === 0 ? (
            <p className="text-muted-foreground text-sm py-8 text-center">No sources data yet</p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={stats.topSources}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {stats.topSources.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {stats.topSources.map((s, i) => (
                  <div key={s.name} className="flex items-center gap-2 text-sm">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-muted-foreground">{s.name}</span>
                    <span className="font-medium">{s.count.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-xl border border-border bg-card p-6 lg:col-span-2"
        >
          <h3 className="mb-4 text-lg font-semibold flex items-center gap-2">
            <Activity className="h-4 w-4 text-emerald-500" />
            Collection Jobs Performance
          </h3>
          <div className="grid gap-4 lg:grid-cols-3 mb-4">
            <div className="rounded-lg bg-secondary/50 p-4 text-center">
              <div className="text-2xl font-bold text-blue-500">{stats.jobsStats.total}</div>
              <div className="text-sm text-muted-foreground">Total Jobs</div>
            </div>
            <div className="rounded-lg bg-secondary/50 p-4 text-center">
              <div className="text-2xl font-bold text-emerald-500">{stats.jobsStats.succeeded}</div>
              <div className="text-sm text-muted-foreground">Succeeded</div>
            </div>
            <div className="rounded-lg bg-secondary/50 p-4 text-center">
              <div className="text-2xl font-bold text-rose-500">{stats.jobsStats.failed}</div>
              <div className="text-sm text-muted-foreground">Failed</div>
            </div>
          </div>
          {stats.jobsStats.total > 0 && (
            <div className="w-full bg-secondary rounded-full h-3">
              <div
                className="bg-emerald-500 h-3 rounded-full transition-all"
                style={{ width: `${stats.jobsStats.successRate}%` }}
              />
            </div>
          )}
          <p className="text-xs text-muted-foreground mt-2">
            Success rate: {stats.jobsStats.successRate}%
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-xl border border-border bg-card p-6 lg:col-span-2"
        >
          <h3 className="mb-4 text-lg font-semibold flex items-center gap-2">
            <Database className="h-4 w-4 text-amber-500" />
            Top Sources by Volume
          </h3>
          {stats.topSources.length === 0 ? (
            <p className="text-muted-foreground text-sm py-8 text-center">No source data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={stats.topSources}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: "8px" }}
                />
                <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>
      </div>
    </div>
  );
}
