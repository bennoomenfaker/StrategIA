"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useI18n } from "@/lib/i18n";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp, TrendingDown, Minus, Sparkles, ArrowUp, ArrowDown,
  Activity, ChevronRight,
} from "lucide-react";
import { motion } from "framer-motion";
import type { Trend, Project } from "@/types";

function DirectionIcon({ direction }: { direction?: string }) {
  const icons: Record<string, { icon: any; color: string }> = {
    ascending: { icon: ArrowUp, color: "text-green-500" },
    descending: { icon: ArrowDown, color: "text-red-500" },
    stable: { icon: Minus, color: "text-muted-foreground" },
    emerging: { icon: TrendingUp, color: "text-blue-500" },
  };
  const { icon: Icon, color } = icons[direction || ""] || { icon: TrendingUp, color: "text-muted-foreground" };
  return <Icon className={`h-4 w-4 ${color}`} />;
}

function MomentumBar({ value }: { value?: number }) {
  if (value === undefined) return null;
  const pct = Math.min(Math.max(value * 100, 0), 100);
  const color = value > 0.6 ? "bg-green-500" : value > 0.3 ? "bg-amber-500" : "bg-blue-500";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-medium">{pct.toFixed(0)}%</span>
    </div>
  );
}

export default function TrendsPage() {
  const { t } = useI18n();
  const [trends, setTrends] = useState<Trend[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const projectsRes = await api.get("/projects");
      const projects: Project[] = projectsRes.data.data || projectsRes.data || [];
      const all: Trend[] = [];
      await Promise.all(
        projects.slice(0, 5).map(async (project) => {
          try {
            const res = await api.get(`/trends/project/${project.id}`);
            const data = res.data.data || res.data || [];
            all.push(...(Array.isArray(data) ? data : data.data || []));
          } catch { /* skip */ }
        })
      );
      setTrends(all);
    } catch (err) {
      console.error("Failed to fetch trends:", err);
    } finally {
      setLoading(false);
    }
  };

  const sorted = [...trends].sort((a, b) => (b.momentum || 0) - (a.momentum || 0));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t("trends.title")}</h1>
          <p className="text-sm text-muted-foreground mt-1">{trends.length} tendance{trends.length > 1 ? 's' : ''} identifiée{trends.length > 1 ? 's' : ''}</p>
        </div>
        <Badge variant="outline" className="gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          IA
        </Badge>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 rounded-xl border border-border bg-card animate-pulse" />
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <TrendingUp className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">{t("trends.noTrends")}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {sorted.map((trend, i) => (
            <motion.div
              key={trend.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="overflow-hidden transition-all hover:shadow-md border-border/50 hover:border-primary/20">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <div className={`mt-1 p-2 rounded-lg ${
                      trend.direction === "ascending" ? "bg-green-500/10" :
                      trend.direction === "descending" ? "bg-red-500/10" :
                      trend.direction === "emerging" ? "bg-blue-500/10" : "bg-muted"
                    }`}>
                      <DirectionIcon direction={trend.direction} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-semibold">{trend.name}</h3>
                        {trend.direction && (
                          <Badge variant="outline" className="text-xs gap-1">
                            <DirectionIcon direction={trend.direction} />
                            {trend.direction}
                          </Badge>
                        )}
                        {trend.category && (
                          <Badge variant="secondary" className="text-xs">{trend.category}</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{trend.description}</p>
                      <div className="mt-3 space-y-2">
                        {(trend.momentum !== undefined) && (
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Activity className="h-3 w-3" />
                              Momentum
                            </span>
                            <MomentumBar value={trend.momentum} />
                          </div>
                        )}
                        {trend.keywords?.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {trend.keywords.slice(0, 5).map((kw, j) => (
                              <span key={j} className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                                {kw}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
