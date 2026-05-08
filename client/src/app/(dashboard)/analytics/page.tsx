"use client";

import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";

const trendData = [
  { month: "Jan", items: 120, insights: 18 },
  { month: "Feb", items: 180, insights: 24 },
  { month: "Mar", items: 250, insights: 35 },
  { month: "Apr", items: 310, insights: 42 },
  { month: "May", items: 420, insights: 56 },
  { month: "Jun", items: 580, insights: 78 },
];

const sourceData = [
  { name: "RSS Feeds", value: 45, color: "#3b82f6" },
  { name: "Web Scraping", value: 35, color: "#8b5cf6" },
  { name: "PDF Extraction", value: 12, color: "#10b981" },
  { name: "API Sources", value: 8, color: "#f59e0b" },
];

const keywordData = [
  { keyword: "AI", count: 234 },
  { keyword: "Healthcare", count: 189 },
  { keyword: "Machine Learning", count: 156 },
  { keyword: "Drug Discovery", count: 123 },
  { keyword: "Regulation", count: 98 },
  { keyword: "Startup", count: 87 },
];

export default function AnalyticsPage() {
  return (
      <div className="space-y-6">
        <p className="text-muted-foreground">
          Insights and trends from your intelligence operations
        </p>

        <div className="grid gap-6 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-border bg-card p-6"
          >
            <h3 className="mb-4 text-lg font-semibold">Collection Trend</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="month" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    background: "#1e293b",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                  }}
                />
                <Line type="monotone" dataKey="items" stroke="#3b82f6" strokeWidth={2} />
                <Line type="monotone" dataKey="insights" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-xl border border-border bg-card p-6"
          >
            <h3 className="mb-4 text-lg font-semibold">Source Distribution</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={sourceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {sourceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {sourceData.map((s) => (
                <div key={s.name} className="flex items-center gap-2 text-sm">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: s.color }} />
                  <span className="text-muted-foreground">{s.name}</span>
                  <span className="font-medium">{s.value}%</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-xl border border-border bg-card p-6 lg:col-span-2"
          >
            <h3 className="mb-4 text-lg font-semibold">Top Keywords</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={keywordData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="keyword" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    background: "#1e293b",
                    border: "1px solid #334155",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>
      </div>
  );
}
