"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Globe, Plus, Trash2, Building, Map } from "lucide-react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/auth.store";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Perimeter {
  id: string;
  name: string;
  type: string;
  parentId?: string;
  parent?: Perimeter;
  children?: Perimeter[];
  _count?: { hypotheses: number };
}

export default function PerimetersPage() {
  const [perimeters, setPerimeters] = useState<Perimeter[]>([]);
  const [flatPerimeters, setFlatPerimeters] = useState<Perimeter[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    type: "GEOGRAPHIC",
    parentId: "",
    description: "",
  });
  
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    fetchPerimeters();
  }, [isAuthenticated]);

  const fetchPerimeters = async () => {
    try {
      const res = await api.get("/perimeters");
      const data = res.data.data || res.data || [];
      // Keep flat list for dropdown
      setFlatPerimeters(data);
      // Build tree structure for display
      const tree = buildTree(data);
      setPerimeters(tree);
    } catch (err) {
      console.error("Failed to fetch perimeters:", err);
    } finally {
      setLoading(false);
    }
  };

  const buildTree = (items: any[]): any[] => {
    const map = new Map();
    const roots: any[] = [];

    // Initialize map
    items.forEach(item => {
      map.set(item.id, { ...item, children: [] });
    });

    // Build tree
    items.forEach(item => {
      const node = map.get(item.id);
      if (item.parentId && map.has(item.parentId)) {
        const parent = map.get(item.parentId);
        if (parent) {
          parent.children.push(node);
        }
      } else {
        roots.push(node);
      }
    });

    return roots;
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = {
        name: form.name,
        type: form.type,
      };
      if (form.parentId && form.parentId !== "none") {
        payload.parentId = form.parentId;
      }
      if (form.description) {
        payload.description = form.description;
      }
      await api.post("/perimeters", payload);
      setShowForm(false);
      setForm({ name: "", type: "GEOGRAPHIC", parentId: "none", description: "" });
      fetchPerimeters();
    } catch (err) {
      console.error("Failed to create perimeter:", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this perimeter?")) return;
    try {
      await api.delete(`/perimeters/${id}`);
      fetchPerimeters();
    } catch (err) {
      console.error("Failed to delete perimeter:", err);
    }
  };

  const renderPerimeterTree = (items: Perimeter[], level = 0) => {
    return items.map((p, i) => (
      <motion.div
        key={p.id}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: i * 0.05 }}
      >
        <div
          className="flex items-center gap-4 p-4 rounded-lg border border-border hover:bg-secondary/50"
          style={{ marginLeft: `${level * 24}px` }}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            {p.type === "GEOGRAPHIC" ? (
              <Globe className="h-5 w-5 text-primary" />
            ) : (
              <Building className="h-5 w-5 text-primary" />
            )}
          </div>
          <div className="flex-1">
            <p className="font-medium">{p.name}</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline">{p.type}</Badge>
              {p._count && p._count.hypotheses > 0 && (
                <Badge variant="secondary">{p._count.hypotheses} hypotheses</Badge>
              )}
            </div>
          </div>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => handleDelete(p.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        {p.children && p.children.length > 0 && renderPerimeterTree(p.children, level + 1)}
      </motion.div>
    ));
  };

  return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground">Manage geographic and sectorial perimeters for your intelligence operations</p>
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus className="mr-2 h-4 w-4" />
            {showForm ? "Cancel" : "Add Perimeter"}
          </Button>
        </div>

        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Create Perimeter</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreate} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="e.g., Africa, FinTech, HealthTech"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type">Type</Label>
                    <Select
                      value={form.type}
                      onValueChange={(value) => setForm({ ...form, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GEOGRAPHIC">Geographic</SelectItem>
                        <SelectItem value="SECTORIAL">Sectorial</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="parent">Parent (optional)</Label>
                    <Select
                      value={form.parentId || "none"}
                      onValueChange={(value) => setForm({ ...form, parentId: value === "none" ? "" : value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="None (root level)" />
                      </SelectTrigger>
                        <SelectContent>
                        <SelectItem value="none">None (root level)</SelectItem>
                        {flatPerimeters.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name} ({p.type})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description (optional)</Label>
                    <Textarea
                      id="description"
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      placeholder="Brief description..."
                      rows={3}
                    />
                  </div>

                  <Button type="submit">Create Perimeter</Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 rounded-xl border border-border bg-card animate-pulse" />
            ))}
          </div>
        ) : perimeters.length === 0 ? (
          <Card className="p-12 text-center">
            <Globe className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">No perimeters yet</h3>
            <p className="text-muted-foreground mt-2">Create geographic or sectorial perimeters to organize your intelligence collection</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {renderPerimeterTree(perimeters)}
          </div>
        )}

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Quick Setup - Recommended Périmètres</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-medium mb-2">🌍 Geographic</h4>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>├── Africa</p>
                <p>│   ├── North Africa</p>
                <p>│   ├── West Africa</p>
                <p>│   └── East Africa</p>
                <p>└── Europe</p>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">🏭 Sectorial (AI)</h4>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>├── FinTech</p>
                <p>├── HealthTech</p>
                <p>├── AgriTech</p>
                <p>└── EdTech</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
  );
}
