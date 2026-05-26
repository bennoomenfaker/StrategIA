"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useI18n } from "@/lib/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Radio, AlertTriangle, TrendingUp, Target, Clock, Activity,
  ChevronRight, Sparkles, Search,
} from "lucide-react";
import { motion } from "framer-motion";
import type { Signal, Project } from "@/types";

function StrengthBadge({ strength }: { strength: string }) {
  const variants: Record<string, { color: string; dot: string }> = {
    FAIBLE: { color: "text-muted-foreground border-muted-foreground/30", dot: "bg-gray-400" },
    MOYEN: { color: "text-amber-500 border-amber-500/30", dot: "bg-amber-500" },
    FORT: { color: "text-orange-500 border-orange-500/30", dot: "bg-orange-500" },
    CONFIRME: { color: "text-red-500 border-red-500/30", dot: "bg-red-500" },
  };
  const v = variants[strength] || variants.FAIBLE;
  return (
    <Badge variant="outline" className={`gap-1.5 ${v.color}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${v.dot}`} />
      {strength}
    </Badge>
  );
}

export default function SignalsPage() {
  const { t } = useI18n();
  const [signals, setSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllSignals();
  }, []);

  const fetchAllSignals = async () => {
    try {
      const projectsRes = await api.get("/projects");
      const projects: Project[] = projectsRes.data.data || projectsRes.data || [];
      const all: Signal[] = [];
      await Promise.all(
        projects.slice(0, 5).map(async (project) => {
          try {
            const res = await api.get(`/signals/project/${project.id}`);
            const data = res.data.data || res.data || [];
            all.push(...(Array.isArray(data) ? data : data.data || []));
          } catch { /* skip */ }
        })
      );
      setSignals(all);
    } catch (err) {
      console.error("Failed to fetch signals:", err);
    } finally {
      setLoading(false);
    }
  };

  const byStrength = (s: Signal) => {
    const order: Record<string, number> = { CONFIRME: 0, FORT: 1, MOYEN: 2, FAIBLE: 3 };
    return order[s.strength] ?? 99;
  };
  const sorted = [...signals].sort((a, b) => byStrength(a) - byStrength(b));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t("signals.title")}</h1>
          <p className="text-sm text-muted-foreground mt-1">{signals.length} signal{signals.length > 1 ? 'x' : ''} détecté{signals.length > 1 ? 's' : ''}</p>
        </div>
        <Badge variant="outline" className="gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          Veille
        </Badge>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-36 rounded-xl border border-border bg-card animate-pulse" />
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Radio className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">{t("signals.noSignals")}</p>
            <p className="text-sm text-muted-foreground mt-2">
              Les signaux faibles sont détectés automatiquement par l'IA après chaque collecte
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {sorted.map((signal, i) => (
            <motion.div
              key={signal.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <Card className="overflow-hidden transition-all hover:shadow-md border-border/50 hover:border-primary/20">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <div className={`mt-1 p-2 rounded-lg ${
                      signal.strength === "CONFIRME" ? "bg-red-500/10" :
                      signal.strength === "FORT" ? "bg-orange-500/10" :
                      signal.strength === "MOYEN" ? "bg-amber-500/10" : "bg-muted"
                    }`}>
                      <Radio className={`h-4 w-4 ${
                        signal.strength === "CONFIRME" ? "text-red-500" :
                        signal.strength === "FORT" ? "text-orange-500" :
                        signal.strength === "MOYEN" ? "text-amber-500" : "text-muted-foreground"
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <StrengthBadge strength={signal.strength} />
                        {signal.category && (
                          <Badge variant="secondary" className="text-xs">{signal.category}</Badge>
                        )}
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Activity className="h-3 w-3" />
                          x{signal.detectionCount}
                        </span>
                      </div>
                      <h3 className="font-semibold">{signal.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{signal.description}</p>
                      <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(signal.firstDetected).toLocaleDateString()}
                        </span>
                        {signal.sourceUrl && (
                          <span className="truncate max-w-[200px]">{signal.sourceUrl}</span>
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
