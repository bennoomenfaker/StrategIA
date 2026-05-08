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
import { Plus, ArrowLeft, Lightbulb, Edit, Trash2, X, CheckCircle, XCircle, Clock } from "lucide-react";
import { useAuthStore } from "@/stores/auth.store";
import { api } from "@/lib/api";
import { motion } from "framer-motion";

interface Hypothesis {
  id: string;
  content: string;
  status: string;
  priority: number;
  axisId: string;
  axe?: { name: string; objective?: { content: string } };
  collectionPlans?: CollectionPlan[];
  _count?: { collectionPlans: number };
}

interface Axe {
  id: string;
  name: string;
  objectiveId: string;
  objective?: { content: string };
}

interface CollectionPlan {
  id: string;
  name: string;
  status: string;
}

interface Project {
  id: string;
  name: string;
}

export default function ProjectHypothesesPage() {
  const { id } = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [hypotheses, setHypotheses] = useState<Hypothesis[]>([]);
  const [axes, setAxes] = useState<Axe[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingHypothesis, setEditingHypothesis] = useState<Hypothesis | null>(null);
  const [filterAxeId, setFilterAxeId] = useState<string>("");
  
  // ✅ 简化：只保留后端需要的字段
  const [content, setContent] = useState("");
  const [priority, setPriority] = useState(1);
  const [selectedAxeId, setSelectedAxeId] = useState("");
  
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    fetchProject();
    fetchAxes();
    fetchHypotheses();
  }, [isAuthenticated, id]);

  const fetchProject = async () => {
    try {
      const res = await api.get(`/projects/${id}`);
      const data = res.data.data || res.data;
      setProject(data);
    } catch (err) {
      console.error("Failed to fetch project:", err);
    }
  };

  const fetchAxes = async () => {
    try {
      const res = await api.get(`/axes?projectId=${id}`);
      const data = res.data.data || res.data;
      setAxes(data || []);
    } catch (err) {
      console.error("Failed to fetch axes:", err);
    }
  };

  const fetchHypotheses = async () => {
    try {
      const res = await api.get(`/hypotheses?projectId=${id}`);
      const data = res.data.data || res.data;
      setHypotheses(data || []);
    } catch (err) {
      console.error("Failed to fetch hypotheses:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // ✅ 明确构建 payload
    const payload = {
      content: content,           // ← 确保有值
      priority: priority,
      axisId: selectedAxeId,     // ← 确保有值（注意是 axisId）
    };
    
    console.log("Submitting hypothesis:", payload);  // ← 调试
    
    if (!payload.content || !payload.axisId) {
      alert("Please fill in all fields (content and axe)");
      return;
    }
    
    try {
      if (editingHypothesis) {
        await api.patch(`/hypotheses/${editingHypothesis.id}`, payload);
      } else {
        await api.post("/hypotheses", payload);
      }
      resetForm();
      fetchHypotheses();
    } catch (err: any) {
      console.error("Failed to save hypothesis:", err);
      alert(`Error: ${err.response?.data?.message || err.message}`);
    }
  };

  const resetForm = () => {
    setContent("");
    setPriority(1);
    setSelectedAxeId("");
    setShowForm(false);
    setEditingHypothesis(null);
  };

  const handleEdit = (hypothesis: Hypothesis) => {
    setContent(hypothesis.content);
    setPriority(hypothesis.priority);
    setSelectedAxeId(hypothesis.axisId);
    setEditingHypothesis(hypothesis);
    setShowForm(true);
  };

  const handleDelete = async (hypId: string) => {
    if (!confirm("Are you sure you want to delete this hypothesis?")) return;
    try {
      await api.delete(`/hypotheses/${hypId}`);
      fetchHypotheses();
    } catch (err) {
      console.error("Failed to delete hypothesis:", err);
    }
  };

  const handleStatusChange = async (hypId: string, newStatus: string) => {
    try {
      await api.patch(`/hypotheses/${hypId}`, { status: newStatus });
      fetchHypotheses();
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const filteredHypotheses = filterAxeId
    ? hypotheses.filter((h) => h.axisId === filterAxeId)
    : hypotheses;

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
            <h1 className="text-2xl font-bold">Hypotheses</h1>
          </div>
          <Button onClick={() => {
            resetForm();
            setShowForm(!showForm);
          }}>
            {showForm ? <X className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
            {showForm ? "Cancel" : "New Hypothesis"}
          </Button>
        </div>

        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>{editingHypothesis ? "Edit Hypothesis" : "Create New Hypothesis"}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* ✅ 简化：选择 Axe（自动关联到 Objective 和 Project） */}
                  <div className="space-y-2">
                    <Label htmlFor="axeId">Select Axe *</Label>
                    <select
                      id="axeId"
                      value={selectedAxeId}
                      onChange={(e) => setSelectedAxeId(e.target.value)}
                      className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                      required
                    >
                      <option value="">-- Select an axe --</option>
                      {axes.map((axe) => (
                        <option key={axe.id} value={axe.id}>
                          {axe.name} (Objective: {axe.objective?.content?.substring(0, 30)}...)
                        </option>
                      ))}
                    </select>
                    {axes.length === 0 && (
                      <p className="text-sm text-muted-foreground mt-1">
                        No axes yet. Please <Link href={`/projects/${id}#axes`} className="underline">create an axe</Link> first.
                      </p>
                    )}
                  </div>

                  {/* ✅ Hypothesis Content */}
                  <div className="space-y-2">
                    <Label htmlFor="content">Hypothesis Statement *</Label>
                    <Textarea
                      id="content"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Enter your hypothesis..."
                      required
                      rows={3}
                    />
                  </div>

                  {/* Priority */}
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Input
                      id="priority"
                      type="number"
                      min="1"
                      value={priority}
                      onChange={(e) => setPriority(+e.target.value)}
                    />
                  </div>

                  <Button type="submit">
                    {editingHypothesis ? "Update Hypothesis" : "Create Hypothesis"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Filter by Axe */}
        <div className="flex items-center gap-4">
          <Label>Filter by Axe:</Label>
          <select
            value={filterAxeId}
            onChange={(e) => setFilterAxeId(e.target.value)}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">All Axes</option>
            {axes.map((axe) => (
              <option key={axe.id} value={axe.id}>{axe.name}</option>
            ))}
          </select>
        </div>

        {/* Hypotheses List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-card animate-pulse rounded-xl" />
            ))}
          </div>
        ) : filteredHypotheses.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Lightbulb className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No hypotheses yet</p>
              <p className="text-sm text-muted-foreground mt-2">
                Create your first hypothesis linked to an axe
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredHypotheses.map((hypothesis, index) => (
              <motion.div
                key={hypothesis.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium">{hypothesis.content}</p>
                        <div className="flex items-center gap-4 mt-2 flex-wrap">
                          <Badge variant={
                            hypothesis.status === "VALIDATED" ? "default" :
                            hypothesis.status === "INVALIDATED" ? "destructive" :
                            hypothesis.status === "IN_PROGRESS" ? "secondary" : "outline"
                          }>
                            {hypothesis.status}
                          </Badge>
                          <Badge variant="outline">
                            Priority: {hypothesis.priority}
                          </Badge>
                          {hypothesis.axe && (
                            <Badge variant="outline">
                              Axe: {hypothesis.axe.name}
                            </Badge>
                          )}
                          {hypothesis._count && (
                            <Badge variant="outline">
                              {hypothesis._count.collectionPlans} plans
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(hypothesis)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(hypothesis.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                        <select
                          value={hypothesis.status}
                          onChange={(e) => handleStatusChange(hypothesis.id, e.target.value)}
                          className="text-xs h-8 rounded border border-input bg-background px-2"
                        >
                          <option value="OPEN">OPEN</option>
                          <option value="IN_PROGRESS">IN_PROGRESS</option>
                          <option value="VALIDATED">VALIDATED</option>
                          <option value="INVALIDATED">INVALIDATED</option>
                        </select>
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
