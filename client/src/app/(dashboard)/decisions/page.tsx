"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useI18n } from "@/lib/i18n";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  GitBranch, CheckCircle, XCircle, Clock, AlertTriangle,
  Sparkles, ChevronRight, Calendar,
} from "lucide-react";
import { motion } from "framer-motion";
import type { StrategicDecision, Project } from "@/types";

const statusConfig: Record<string, { icon: any; color: string; bg: string }> = {
  TAKEN: { icon: CheckCircle, color: "text-green-500", bg: "bg-green-500/10" },
  PENDING: { icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10" },
  DEFERRED: { icon: AlertTriangle, color: "text-blue-500", bg: "bg-blue-500/10" },
  CANCELLED: { icon: XCircle, color: "text-red-500", bg: "bg-red-500/10" },
};

export default function DecisionsPage() {
  const { t } = useI18n();
  const [decisions, setDecisions] = useState<StrategicDecision[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const projectsRes = await api.get("/projects");
      const projects: Project[] = projectsRes.data.data || projectsRes.data || [];
      const all: StrategicDecision[] = [];
      await Promise.all(
        projects.slice(0, 5).map(async (project) => {
          try {
            const res = await api.get(`/strategic-decisions/project/${project.id}`);
            const data = res.data.data || res.data || [];
            all.push(...(Array.isArray(data) ? data : data.data || []));
          } catch { /* skip */ }
        })
      );
      setDecisions(all);
    } catch (err) {
      console.error("Failed to fetch decisions:", err);
    } finally {
      setLoading(false);
    }
  };

  const sorted = [...decisions].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t("decisions.title")}</h1>
          <p className="text-sm text-muted-foreground mt-1">{decisions.length} décision{decisions.length > 1 ? 's' : ''}</p>
        </div>
        <Badge variant="outline" className="gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          Stratégie
        </Badge>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 rounded-xl border border-border bg-card animate-pulse" />
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <GitBranch className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">{t("decisions.noDecisions")}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {sorted.map((decision, i) => {
            const StatusIcon = statusConfig[decision.status]?.icon || Clock;
            return (
              <motion.div
                key={decision.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <Card className="overflow-hidden transition-all hover:shadow-md border-border/50 hover:border-primary/20">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <div className={`mt-1 p-2.5 rounded-lg ${statusConfig[decision.status]?.bg || "bg-muted"}`}>
                        <StatusIcon className={`h-5 w-5 ${statusConfig[decision.status]?.color || "text-muted-foreground"}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="font-semibold">{decision.title}</h3>
                          <Badge variant="outline" className={`text-xs gap-1 ${statusConfig[decision.status]?.color || ""}`}>
                            {decision.status}
                          </Badge>
                        </div>
                        {decision.description && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{decision.description}</p>
                        )}
                        <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground flex-wrap">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(decision.createdAt).toLocaleDateString()}
                          </span>
                          {decision.selectedOption && (
                            <span>Choix : {decision.selectedOption.substring(0, 40)}...</span>
                          )}
                          {decision.decisionDate && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {new Date(decision.decisionDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        {decision.tags?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-3">
                            {decision.tags.map((tag, j) => (
                              <span key={j} className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-2" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
