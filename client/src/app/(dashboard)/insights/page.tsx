"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useI18n } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Lightbulb, TrendingUp, ArrowUpRight, AlertTriangle, Target,
  Sparkles, Filter, ChevronRight, BarChart3,
} from "lucide-react";
import { motion } from "framer-motion";
import type { Insight, Project } from "@/types";

function InsightIcon({ type }: { type: string }) {
  const icons: Record<string, { icon: any; color: string }> = {
    OPPORTUNITY: { icon: TrendingUp, color: "text-emerald-500" },
    THREAT: { icon: AlertTriangle, color: "text-red-500" },
    TREND: { icon: TrendingUp, color: "text-blue-500" },
    SIGNAL_FAIBLE: { icon: Sparkles, color: "text-purple-500" },
    CONFIRMATION: { icon: Target, color: "text-green-500" },
    ALERT: { icon: AlertTriangle, color: "text-amber-500" },
    INFORMATION: { icon: Lightbulb, color: "text-muted-foreground" },
  };
  const { icon: Icon, color } = icons[type] || icons.INFORMATION;
  return <Icon className={`h-5 w-5 ${color}`} />;
}

const typeColors: Record<string, string> = {
  OPPORTUNITY: "border-emerald-500/30 bg-emerald-500/5",
  THREAT: "border-red-500/30 bg-red-500/5",
  TREND: "border-blue-500/30 bg-blue-500/5",
  SIGNAL_FAIBLE: "border-purple-500/30 bg-purple-500/5",
  CONFIRMATION: "border-green-500/30 bg-green-500/5",
  ALERT: "border-amber-500/30 bg-amber-500/5",
  INFORMATION: "border-border bg-card",
};

export default function InsightsPage() {
  const { t } = useI18n();
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedProject, setSelectedProject] = useState<string>("all");

  useEffect(() => {
    fetchAllInsights();
  }, []);

  const fetchAllInsights = async () => {
    try {
      const projectsRes = await api.get("/projects");
      const projects: Project[] = projectsRes.data.data || projectsRes.data || [];

      const allInsights: Insight[] = [];
      await Promise.all(
        projects.slice(0, 5).map(async (project) => {
          try {
            const res = await api.get(`/insights/project/${project.id}?limit=10`);
            const data = res.data.data || res.data || [];
            const items = Array.isArray(data) ? data : data.data || [];
            allInsights.push(...items);
          } catch { /* skip projects without insights */ }
        })
      );

      setInsights(allInsights);
    } catch (err) {
      console.error("Failed to fetch insights:", err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = selectedType === "all"
    ? insights
    : insights.filter((i) => i.type === selectedType);

  const types = [...new Set(insights.map((i) => i.type))];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t("insights.title")}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {insights.length} insight{insights.length > 1 ? "s" : ""} sur {selectedProject === "all" ? "tous les projets" : "1 projet"}
          </p>
        </div>
        <Badge variant="outline" className="gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          IA
        </Badge>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <Button
          variant={selectedType === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedType("all")}
          className="gap-1.5"
        >
          <Filter className="h-3.5 w-3.5" />
          Tous
        </Button>
        {types.map((type) => (
          <Button
            key={type}
            variant={selectedType === type ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedType(type)}
            className="gap-1.5"
          >
            <InsightIcon type={type} />
            {type.replace(/_/g, " ")}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-44 rounded-xl border border-border bg-card animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Lightbulb className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">{t("insights.noInsights")}</p>
            <p className="text-sm text-muted-foreground mt-2">
              Les insights sont générés automatiquement après chaque collecte IA
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((insight, i) => (
            <motion.div
              key={insight.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className={`overflow-hidden transition-all hover:shadow-md border ${typeColors[insight.type] || typeColors.INFORMATION}`}>
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      <InsightIcon type={insight.type} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <Badge variant="outline" className="text-xs">{insight.type.replace(/_/g, " ")}</Badge>
                        {insight.confidence !== undefined && (
                          <Badge variant="secondary" className="text-xs">
                            {(insight.confidence * 100).toFixed(0)}%
                          </Badge>
                        )}
                      </div>
                      <h3 className="font-semibold">{insight.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{insight.content}</p>
                      <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                        {insight.impactScore !== undefined && (
                          <span className="flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" />
                            Impact: {(insight.impactScore * 10).toFixed(0)}/10
                          </span>
                        )}
                        {insight.urgencyScore !== undefined && (
                          <span className="flex items-center gap-1">
                            <ArrowUpRight className="h-3 w-3" />
                            Urgence: {(insight.urgencyScore * 10).toFixed(0)}/10
                          </span>
                        )}
                      </div>
                      {insight.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3">
                          {insight.tags.map((tag, j) => (
                            <span key={j} className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
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
