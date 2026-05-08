"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, ArrowLeft, Target, Edit, Trash2, X, Eye } from "lucide-react";
import { useAuthStore } from "@/stores/auth.store";
import { api } from "@/lib/api";
import { motion } from "framer-motion";

interface Axe {
  id: string;
  name: string;
  description?: string;
  objectiveId: string;
  objective?: { content: string };
  _count?: { hypotheses: number };
}

interface Objective {
  id: string;
  content: string;
}

export default function ProjectAxesPage() {
  const { id } = useParams();
  const [axes, setAxes] = useState<Axe[]>([]);
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAxe, setEditingAxe] = useState<Axe | null>(null);
  const [filterObjectiveId, setFilterObjectiveId] = useState<string>("");
  const [form, setForm] = useState({
    name: "",
    description: "",
    objectiveId: "",
  });
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    fetchAxes();
    fetchObjectives();
  }, [isAuthenticated, id]);

  const fetchAxes = async () => {
    try {
      const url = filterObjectiveId
        ? `/axes?objectiveId=${filterObjectiveId}`
        : `/axes?projectId=${id}`;
      const res = await api.get(url);
      const data = res.data.data || res.data;
      setAxes(data || []);
    } catch (err) {
      console.error("Failed to fetch axes:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchObjectives = async () => {
    try {
      const res = await api.get(`/objectives?projectId=${id}`);
      const data = res.data.data || res.data;
      setObjectives(data || []);
    } catch (err) {
      console.error("Failed to fetch objectives:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAxe) {
        await api.patch(`/axes/${editingAxe.id}`, form);
      } else {
        await api.post("/axes", form);
      }
      setShowForm(false);
      setEditingAxe(null);
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
      objectiveId: axe.objectiveId,
    });
    setEditingAxe(axe);
    setShowForm(true);
  };

  const handleDelete = async (axeId: string) => {
    if (!confirm("Are you sure you want to delete this axe? All related hypotheses will also be deleted.")) return;
    try {
      await api.delete(`/axes/${axeId}`);
      fetchAxes();
    } catch (err) {
      console.error("Failed to delete axe:", err);
    }
  };

  return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={`/projects/${id}`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Project
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">Axes de Veille</h1>
          </div>
          <Button onClick={() => {
            setShowForm(!showForm);
            setEditingAxe(null);
            setForm({ name: "", description: "", objectiveId: "" });
          }}>
            {showForm ? <X className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
            {showForm ? "Cancel" : "New Axe"}
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <Label htmlFor="filterObjective">Filter by Objective:</Label>
          <select
            id="filterObjective"
            value={filterObjectiveId}
            onChange={(e) => {
              setFilterObjectiveId(e.target.value);
            }}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">All Objectives</option>
            {objectives.map((obj) => (
              <option key={obj.id} value={obj.id}>
                {obj.content.substring(0, 50)}...
              </option>
            ))}
          </select>
          <Button variant="outline" size="sm" onClick={fetchAxes}>
            Apply Filter
          </Button>
        </div>

        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>{editingAxe ? "Edit Axe" : "Create New Axe"}</CardTitle>
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
                    {editingAxe ? "Update Axe" : "Create Axe"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-card animate-pulse rounded-xl" />
            ))}
          </div>
        ) : axes.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Target className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No axes yet</p>
              <p className="text-sm text-muted-foreground mt-2">
                Create your first strategic axis linked to an objective
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {axes.map((axe, index) => (
              <motion.div
                key={axe.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium">{axe.name}</p>
                        {axe.description && (
                          <p className="text-sm text-muted-foreground mt-1">{axe.description}</p>
                        )}
                        <div className="flex items-center gap-4 mt-2">
                          {axe.objective && (
                            <Badge variant="outline">
                              Objective: {axe.objective.content.substring(0, 30)}...
                            </Badge>
                          )}
                          {axe._count && (
                            <Badge variant="outline">
                              {axe._count.hypotheses || 0} hypotheses
                            </Badge>
                          )}
                        </div>
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
                        <Link href={`/projects/${id}/hypotheses?axeId=${axe.id}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="mr-2 h-3 w-3" />
                            View Hypotheses
                          </Button>
                        </Link>
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
