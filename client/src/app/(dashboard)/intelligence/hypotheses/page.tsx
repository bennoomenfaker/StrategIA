"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Brain, Plus, CheckCircle, XCircle } from "lucide-react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/auth.store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const statusColors: Record<string, string> = {
  VALIDATED: "bg-emerald-500/10 text-emerald-500",
  INVALIDATED: "bg-red-500/10 text-red-500",
  IN_PROGRESS: "bg-amber-500/10 text-amber-500",
  OPEN: "bg-blue-500/10 text-blue-500",
};

interface Hypothesis {
  id: string;
  content: string;
  status: string;
  priority: number;
  validationScore?: number;
  axis?: { name: string; objective?: { project?: { name: string } } };
}

export default function HypothesesPage() {
  const [hypotheses, setHypotheses] = useState<Hypothesis[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    fetchHypotheses();
  }, [isAuthenticated]);

  const fetchHypotheses = async () => {
    try {
      const res = await api.get("/hypotheses?include=axis.objective.project");
      const data = res.data.data || res.data || [];
      setHypotheses(data);
    } catch (err) {
      console.error("Failed to fetch hypotheses:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleValidate = async (id: string) => {
    try {
      await api.patch(`/hypotheses/${id}/validate`, {
        validatedBy: useAuthStore.getState().user?.id,
      });
      fetchHypotheses();
    } catch (err) {
      console.error("Failed to validate hypothesis:", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this hypothesis?")) return;
    try {
      await api.delete(`/hypotheses/${id}`);
      fetchHypotheses();
    } catch (err) {
      console.error("Failed to delete hypothesis:", err);
    }
  };

  return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground">Track and validate your strategic hypotheses</p>
          <Button onClick={() => router.push("/projects")}>
            <Plus className="mr-2 h-4 w-4" />
            Add Hypothesis
          </Button>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 rounded-xl border border-border bg-card animate-pulse" />
            ))}
          </div>
        ) : hypotheses.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-12 text-center">
            <Brain className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">No hypotheses yet</h3>
            <p className="text-muted-foreground mt-2">Create hypotheses from your project axes</p>
          </div>
        ) : (
          <div className="space-y-4">
            {hypotheses.map((h, i) => (
              <motion.div
                key={h.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-4 rounded-xl border border-border bg-card p-5"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Brain className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{h.content}</p>
                  <p className="text-sm text-muted-foreground">
                    {h.axis?.name || "No axis"} → {h.axis?.objective?.project?.name || "No project"}
                  </p>
                </div>
                <Badge className={statusColors[h.status]}>{h.status}</Badge>
                {h.validationScore !== undefined && h.validationScore > 0 && (
                  <div className="w-24">
                    <div className="h-2 rounded-full bg-secondary">
                      <div
                        className="h-2 rounded-full bg-primary"
                        style={{ width: `${h.validationScore * 100}%` }}
                      />
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {(h.validationScore * 100).toFixed(0)}%
                    </p>
                  </div>
                )}
                <div className="flex gap-2">
                  {h.status !== "VALIDATED" && (
                    <Button size="sm" variant="outline" onClick={() => handleValidate(h.id)}>
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                  )}
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(h.id)}>
                    <XCircle className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
  );
}
