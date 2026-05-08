"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import {
  Rss,
  Globe,
  Tag,
  Clock,
  ExternalLink,
} from "lucide-react";

export default function FeedPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchFeed();
  }, []);

  const fetchFeed = async () => {
    try {
      const res = await api.get("/raw-data?limit=50");
      const data = res.data.data || res.data || {};
      const itemsArray = data.items || data || [];
      setItems(itemsArray);
    } catch (err) {
      console.error("Failed to fetch feed:", err);
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
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground">
          Real-time strategic intelligence from your collection plans
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 rounded-xl border border-border bg-card animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <Rss className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">No data yet</h3>
          <p className="text-muted-foreground mt-2">Run collection plans to populate the feed</p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item, i) => (
            <motion.article
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="rounded-xl border border-border bg-card p-6 transition-shadow hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-3">
                    {item.sentimentScore !== undefined && (
                      <span className={`rounded-full px-2 py-[2px] text-xs font-medium ${getScoreColor(item.sentimentScore)}`}>
                        {(item.sentimentScore * 100).toFixed(0)}%
                      </span>
                    )}
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      {item.sourceType === "RSS" ? (
                        <Rss className="h-3 w-3 text-amber-500" />
                      ) : (
                        <Globe className="h-3 w-3 text-blue-500" />
                      )}
                      {item.sourceName}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {item.publishedAt ? new Date(item.publishedAt).toLocaleDateString() : "Recently"}
                    </div>
                  </div>

                  <h3 className="text-base font-semibold">{item.title}</h3>
                  {item.summary && (
                    <p className="mt-2 text-sm text-muted-foreground">{item.summary}</p>
                  )}

                  {item.entities && Object.keys(item.entities).length > 0 && (
                    <div className="mt-3 flex items-center gap-2 flex-wrap">
                      {Object.keys(item.entities).map((key) => (
                        <span
                          key={key}
                          className="flex items-center gap-1 rounded-md bg-secondary px-2 py-[2px] text-xs"
                        >
                          <Tag className="h-3 w-3" />
                          {key}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {item.sourceUrl && (
                  <a
                    href={item.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg p-2 hover:bg-secondary"
                  >
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  </a>
                )}
              </div>
            </motion.article>
          ))}
        </div>
      )}
    </div>
  );
}
