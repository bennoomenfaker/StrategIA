"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import {
  Rss, Globe, Tag, Clock, ExternalLink, User, FileText, Activity,
  Filter, RefreshCw, ChevronLeft, ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type ActivityItem = {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata: Record<string, unknown>;
  createdAt: string;
  user: { id: string; email: string; nom: string };
};

type RawItem = {
  id: string;
  title?: string;
  summary?: string;
  sourceType: string;
  sourceUrl: string;
  sourceName?: string;
  publishedAt?: string;
  sentimentScore?: number;
  entities?: Record<string, unknown>;
  project: { id: string; name: string };
  collectionPlan?: { id: string; question: string };
  fetchedAt: string;
};

const ACTION_LABELS: Record<string, { label: string; icon: string; color: string }> = {
  CREATE: { label: "Created", icon: "plus", color: "text-emerald-500" },
  UPDATE: { label: "Updated", icon: "edit", color: "text-blue-500" },
  DELETE: { label: "Deleted", icon: "trash", color: "text-rose-500" },
  VALIDATE: { label: "Validated", icon: "check", color: "text-emerald-500" },
  INVALIDATE: { label: "Invalidated", icon: "x", color: "text-rose-500" },
  COLLECT: { label: "Collected", icon: "download", color: "text-violet-500" },
};

const getEntityIcon = (type: string) => {
  switch (type) {
    case "project": return FileText;
    case "hypothesis": return Activity;
    case "collectionPlan": return Rss;
    default: return FileText;
  }
};

export default function FeedPage() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [rawItems, setRawItems] = useState<RawItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [entityFilter, setEntityFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeTab, setActiveTab] = useState<"activity" | "items">("activity");

  useEffect(() => {
    fetchActivities();
    fetchRawItems();
  }, [page, entityFilter]);

  const fetchActivities = async () => {
    try {
      const params: any = { page, limit: 20 };
      if (entityFilter !== "all") params.entityType = entityFilter;
      const res = await api.get("/feed/activities", { params });
      setActivities(res.data.items || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error("Failed to fetch activities:", err);
    }
  };

  const fetchRawItems = async () => {
    try {
      const res = await api.get("/feed/raw-items?limit=30");
      setRawItems(res.data.items || []);
    } catch (err) {
      console.error("Failed to fetch raw items:", err);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.85) return "bg-emerald-500/10 text-emerald-500";
    if (score >= 0.7) return "bg-amber-500/10 text-amber-500";
    return "bg-muted text-muted-foreground";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <p className="text-muted-foreground">
          Real-time activity feed from your intelligence operations
        </p>
        <div className="flex items-center gap-3">
          <div className="flex rounded-lg border border-border overflow-hidden">
            <button
              onClick={() => setActiveTab("activity")}
              className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                activeTab === "activity" ? "bg-primary text-primary-foreground" : "hover:bg-secondary"
              }`}
            >
              Activity
            </button>
            <button
              onClick={() => setActiveTab("items")}
              className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                activeTab === "items" ? "bg-primary text-primary-foreground" : "hover:bg-secondary"
              }`}
            >
              Recent Items
            </button>
          </div>
          <Select value={entityFilter} onValueChange={(v) => { setEntityFilter(v); setPage(1); }}>
            <SelectTrigger className="w-[140px]">
              <Filter className="h-3 w-3 mr-1" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="project">Projects</SelectItem>
              <SelectItem value="hypothesis">Hypotheses</SelectItem>
              <SelectItem value="collectionPlan">Plans</SelectItem>
              <SelectItem value="axis">Axes</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={() => { fetchActivities(); fetchRawItems(); }}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-xl border border-border bg-card animate-pulse" />
          ))}
        </div>
      ) : activeTab === "activity" ? (
        <>
          {activities.length === 0 ? (
            <div className="rounded-xl border border-border bg-card p-12 text-center">
              <Activity className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">No activity yet</h3>
              <p className="text-muted-foreground mt-2">
                Activities will appear as you create and modify entities
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {activities.map((item) => {
                const actionInfo = ACTION_LABELS[item.action] || { label: item.action, icon: "circle", color: "text-muted-foreground" };
                const Icon = getEntityIcon(item.entityType);
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl border border-border bg-card p-4 transition-shadow hover:shadow-md"
                  >
                    <div className="flex items-start gap-3">
                      <div className="rounded-full bg-secondary p-2">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium">{item.user?.nom || "System"}</span>
                          <span className={`text-xs font-medium ${actionInfo.color}`}>
                            {actionInfo.label}
                          </span>
                          <span className="text-sm text-muted-foreground">{item.entityType}</span>
                          {item.metadata && (item.metadata as any).name && (
                            <span className="text-sm text-muted-foreground truncate max-w-[200px]">
                              &quot;{(item.metadata as any).name}&quot;
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {new Date(item.createdAt).toLocaleDateString("fr-FR", {
                              day: "numeric", month: "long", hour: "2-digit", minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 pt-4">
                  <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                    <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {page} of {totalPages}
                  </span>
                  <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
                    Next <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        <>
          {rawItems.length === 0 ? (
            <div className="rounded-xl border border-border bg-card p-12 text-center">
              <Rss className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">No data collected yet</h3>
              <p className="text-muted-foreground mt-2">Run collection plans to populate the feed</p>
            </div>
          ) : (
            <div className="space-y-4">
              {rawItems.map((item, i) => (
                <motion.article
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="rounded-xl border border-border bg-card p-6 transition-shadow hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="mb-2 flex items-center gap-3 flex-wrap">
                        <span className="text-xs text-muted-foreground bg-secondary rounded-full px-2 py-0.5">
                          {item.project?.name || "General"}
                        </span>
                        {item.sentimentScore !== undefined && (
                          <span className={`rounded-full px-2 py-[2px] text-xs font-medium ${getScoreColor(item.sentimentScore)}`}>
                            {(item.sentimentScore * 100).toFixed(0)}%
                          </span>
                        )}
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          {item.sourceType === "RSS" ? (
                            <Rss className="h-3 w-3 text-amber-500" />
                          ) : item.sourceType === "WEB" ? (
                            <Globe className="h-3 w-3 text-blue-500" />
                          ) : (
                            <Globe className="h-3 w-3 text-green-500" />
                          )}
                          {item.sourceName || item.sourceType}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {item.publishedAt
                            ? new Date(item.publishedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })
                            : "Recently"}
                        </div>
                      </div>

                      <h3 className="text-base font-semibold truncate">{item.title || "Untitled"}</h3>
                      {item.summary && (
                        <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{item.summary}</p>
                      )}

                      {item.entities && Object.keys(item.entities).length > 0 && (
                        <div className="mt-3 flex items-center gap-2 flex-wrap">
                          {Object.entries(item.entities).slice(0, 5).map(([key]) => (
                            <span key={key} className="flex items-center gap-1 rounded-md bg-secondary px-2 py-[2px] text-xs">
                              <Tag className="h-3 w-3" />
                              {key}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {item.sourceUrl && (
                      <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer" className="rounded-lg p-2 hover:bg-secondary shrink-0">
                        <ExternalLink className="h-4 w-4 text-muted-foreground" />
                      </a>
                    )}
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
