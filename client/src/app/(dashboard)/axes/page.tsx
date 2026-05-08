"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, ArrowLeft, Target, Edit, Trash2, X } from "lucide-react";
import { useAuthStore } from "@/stores/auth.store";
import { api } from "@/lib/api";
import { motion } from "framer-motion";

interface Axe {
  id: string;
  name: string;
  description?: string;
  objective?: { id: string; content: string };
  project?: { id: string; name: string };
  createdAt: string;
}

export default function AxesPage() {
  const [axes, setAxes] = useState<Axe[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    objectiveId: "",
  });
  const [objectives, setObjectives] = useState<any[]>([]);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchAxes();
    fetchObjectives();
  }, [isAuthenticated]);

  const fetchAxes = async () => {
    try {
      const res = await api.get("/axes");
      setAxes(res.data || []);
    } catch (err) {
      console.error("Failed to fetch axes:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchObjectives = async () => {
    try {
      const res = await api.get("/objectives");
      setObjectives(res.data || []);
    } catch (err) {
      console.error("Failed to fetch objectives:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.patch(`/axes/${editingId}`, form);
      } else {
        await api.post("/axes", form);
      }
      setShowForm(false);
      setEditingId(null);
      setForm({ name: "", description: "", objectiveId: "" });
      fetchAxes();
    } catch (err) {
      console.error("Failed to save axe:", err);
    }
  };

  const handleEdit = (axe: Axe) => {
    setForm({
      name: axe.name,
      description: axe.description || "",
      objectiveId: axe.objective?.id || "",
    });
    setEditingId(axe.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this axe?")) return;
    try {
      await api.delete(`/axes/${id}`);
      fetchAxes();
    } catch (err) {
      console.error("Failed to delete axe:", err);
    }
  };

  return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Dashboard
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">Axes de Veille</h1>
          </div>
          <Button onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setForm({ name: "", description: "", objectiveId: "" });
          }}>
            {showForm ? <X className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
            {showForm ? "Cancel" : "New Axe"}
          </Button>
        </div>

        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>{editingId ? "Edit Axe" : "Create New Axe"}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Axe Name</Label>
                    <Input
                      id="name"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="e.g., AI Technologies"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      placeholder="Describe the strategic axis..."
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="objectiveId">Linked Objective</Label>
                    <select
                      id="objectiveId"
                      value={form.objectiveId}
                      onChange={(e) => setForm({ ...form, objectiveId: e.target.value })}
                      className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                      required
                    >
                      <option value="">Select an objective</option>
                      {objectives.map((obj) => (
                        <option key={obj.id} value={obj.id}>
                          {obj.content.substring(0, 50)}...
                        </option>
                      ))}
                    </select>
                  </div>
                  <Button type="submit">
                    {editingId ? "Update Axe" : "Create Axe"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-card animate-pulse rounded-xl" />
            ))}
          </div>
        ) : axes.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Target className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No axes yet</p>
              <p className="text-sm text-muted-foreground mt-2">
                Create your first strategic axis
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {axes.map((axe, index) => (
              <motion.div
                key={axe.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Target className="h-5 w-5 text-primary" />
                        <CardTitle className="text-lg">{axe.name}</CardTitle>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(axe)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(axe.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {axe.description && (
                      <p className="text-sm text-muted-foreground mb-2">
                        {axe.description}
                      </p>
                    )}
                    {axe.objective && (
                      <Badge variant="outline" className="mt-2">
                        Objective: {axe.objective.content.substring(0, 30)}...
                      </Badge>
                    )}
                    {axe.project && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Project: {axe.project.name}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
  );
}
