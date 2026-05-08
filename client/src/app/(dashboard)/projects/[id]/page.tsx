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
import { FolderKanban, ArrowLeft, Plus, Edit, Trash2, X, Target, Lightbulb, Eye } from "lucide-react";
import { useAuthStore } from "@/stores/auth.store";
import { api } from "@/lib/api";
import { motion } from "framer-motion";

interface Project {
  id: string;
  name: string;
  description?: string;
  veilleType: string;
  organization?: { name: string };
  objectives?: Objective[];
  axes?: Axe[];
  hypotheses?: Hypothesis[];
  collectionPlans?: CollectionPlan[];
  createdAt: string;
}

interface Objective {
  id: string;
  content: string;
  priority: number;
  axes?: Axe[];
  _count?: { axes: number };
}

interface Axe {
  id: string;
  name: string;
  description?: string;
  objectiveId: string;
  hypotheses?: Hypothesis[];
  _count?: { hypotheses: number };
}

interface Hypothesis {
  id: string;
  statement: string;
  status: string;
  axeId: string;
}

interface CollectionPlan {
  id: string;
  name: string;
  hypothesisId: string;
}

export default function ProjectDetailPage() {
  const { id } = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [showObjectiveForm, setShowObjectiveForm] = useState(false);
  const [editingObjective, setEditingObjective] = useState<Objective | null>(null);
  const [showAxeForm, setShowAxeForm] = useState(false);
  const [editingAxe, setEditingAxe] = useState<Axe | null>(null);
  const [activeTab, setActiveTab] = useState<"objectives" | "axes">("objectives");
  const [form, setForm] = useState({
    name: "",
    description: "",
    veilleType: "CUSTOM",
  });
  const [objForm, setObjForm] = useState({
    content: "",
    priority: 1,
  });
  const [axeForm, setAxeForm] = useState({
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
    fetchProject();
  }, [isAuthenticated, id]);

  const fetchProject = async () => {
    try {
      const res = await api.get(`/projects/${id}?include=objectives,axes,hypotheses,collectionPlans`);
      const projectData = res.data.data || res.data;
      setProject(projectData);
      setForm({
        name: projectData.name,
        description: projectData.description || "",
        veilleType: projectData.veilleType,
      });
    } catch (err) {
      console.error("Failed to fetch project:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this project? This will also delete all related data (objectives, axes, hypotheses, etc.)")) return;
    try {
      await api.delete(`/projects/${id}`);
      router.push("/projects");
    } catch (err) {
      console.error("Failed to delete project:", err);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.patch(`/projects/${id}`, form);
      setProject(res.data.data || res.data);
      setEditing(false);
    } catch (err) {
      console.error("Failed to update project:", err);
    }
  };

  const handleAddObjective = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingObjective) {
        await api.patch(`/objectives/${editingObjective.id}`, objForm);
      } else {
        await api.post("/objectives", { ...objForm, projectId: id });
      }
      setShowObjectiveForm(false);
      setEditingObjective(null);
      setObjForm({ content: "", priority: 1 });
      fetchProject();
    } catch (err) {
      console.error("Failed to save objective:", err);
    }
  };

  const handleEditObjective = (obj: Objective) => {
    setObjForm({
      content: obj.content,
      priority: obj.priority,
    });
    setEditingObjective(obj);
    setShowObjectiveForm(true);
  };

  const handleDeleteObjective = async (objId: string) => {
    if (!confirm("Are you sure you want to delete this objective? All related axes will also be deleted.")) return;
    try {
      await api.delete(`/objectives/${objId}`);
      fetchProject();
    } catch (err) {
      console.error("Failed to delete objective:", err);
    }
  };

  const handleAddAxe = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAxe) {
        await api.patch(`/axes/${editingAxe.id}`, axeForm);
      } else {
        await api.post("/axes", axeForm);
      }
      setShowAxeForm(false);
      setEditingAxe(null);
      setAxeForm({ name: "", description: "", objectiveId: "" });
      fetchProject();
    } catch (err) {
      console.error("Failed to save axe:", err);
    }
  };

  const handleEditAxe = (axe: Axe) => {
    setAxeForm({
      name: axe.name,
      description: axe.description || "",
      objectiveId: axe.objectiveId,
    });
    setEditingAxe(axe);
    setShowAxeForm(true);
  };

  const handleDeleteAxe = async (axeId: string) => {
    if (!confirm("Are you sure you want to delete this axe? All related hypotheses will also be deleted.")) return;
    try {
      await api.delete(`/axes/${axeId}`);
      fetchProject();
    } catch (err) {
      console.error("Failed to delete axe:", err);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-64 bg-card rounded" />
        <div className="h-32 bg-card rounded-xl" />
      </div>
    );
  }

  if (!project) {
    return (
      <div>
        <p>Project not found</p>
      </div>
    );
  }

  return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Link href="/projects">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Projects
            </Button>
          </Link>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setEditing(!editing)}>
              {editing ? <X className="mr-2 h-4 w-4" /> : <Edit className="mr-2 h-4 w-4" />}
              {editing ? "Cancel" : "Edit Project"}
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDelete}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>

        {editing ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Edit Project</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleEdit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Project Name</Label>
                    <Input
                      id="name"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="veilleType">Type</Label>
                    <select
                      id="veilleType"
                      value={form.veilleType}
                      onChange={(e) => setForm({ ...form, veilleType: e.target.value })}
                      className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                    >
                      <option value="TECHNOLOGIQUE">Technological</option>
                      <option value="CONCURRENTIELLE">Competitive</option>
                      <option value="REGLEMENTAIRE">Regulatory</option>
                      <option value="MARCHES">Markets</option>
                      <option value="SCIENTIFIQUE">Scientific</option>
                      <option value="MEDIAS">Media</option>
                      <option value="CUSTOM">Custom</option>
                    </select>
                  </div>
                  <Button type="submit">Save Changes</Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <FolderKanban className="h-5 w-5 text-primary" />
                <CardTitle>{project.name}</CardTitle>
                <Badge>{project.veilleType}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              {project.description && (
                <p className="text-muted-foreground">{project.description}</p>
              )}
              {project.organization && (
                <p className="text-sm text-muted-foreground mt-2">
                  Organization: {project.organization.name}
                </p>
              )}
            </CardContent>
          </Card>
        )}

        <div className="flex gap-2 border-b">
          <Button
            variant={activeTab === "objectives" ? "default" : "ghost"}
            onClick={() => setActiveTab("objectives")}
          >
            <Lightbulb className="mr-2 h-4 w-4" />
            Objectives ({project.objectives?.length || 0})
          </Button>
          <Button
            variant={activeTab === "axes" ? "default" : "ghost"}
            onClick={() => setActiveTab("axes")}
          >
            <Target className="mr-2 h-4 w-4" />
            Axes ({project.axes?.length || 0})
          </Button>
        </div>

        {activeTab === "objectives" && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Objectives</CardTitle>
                <Button size="sm" onClick={() => {
                  setShowObjectiveForm(!showObjectiveForm);
                  setEditingObjective(null);
                  setObjForm({ content: "", priority: 1 });
                }}>
                  <Plus className="mr-2 h-4 w-4" />
                  {showObjectiveForm ? "Cancel" : "Add Objective"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {showObjectiveForm && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-4 border border-border rounded-lg"
                >
                  <form onSubmit={handleAddObjective} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="content">Objective Content</Label>
                      <Textarea
                        id="content"
                        value={objForm.content}
                        onChange={(e) => setObjForm({ ...objForm, content: e.target.value })}
                        placeholder="Describe the strategic objective..."
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="priority">Priority</Label>
                      <Input
                        id="priority"
                        type="number"
                        min="1"
                        value={objForm.priority}
                        onChange={(e) => setObjForm({ ...objForm, priority: +e.target.value })}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit" size="sm">
                        {editingObjective ? "Update Objective" : "Add Objective"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setShowObjectiveForm(false);
                          setEditingObjective(null);
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </motion.div>
              )}
              {!project.objectives || project.objectives.length === 0 ? (
                <p className="text-muted-foreground text-sm">No objectives yet</p>
              ) : (
                <div className="space-y-3">
                  {project.objectives.map((obj) => (
                    <motion.div
                      key={obj.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="p-4 rounded-lg border border-border hover:bg-secondary/50"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium">{obj.content}</p>
                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <span>Priority: {obj.priority}</span>
                            <Badge variant="outline">
                              <Target className="mr-1 h-3 w-3" />
                              {obj._count?.axes || 0} axes
                            </Badge>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditObjective(obj)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteObjective(obj.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                          <Link href={`/projects/${id}/axes?objectiveId=${obj.id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="mr-2 h-3 w-3" />
                              View Axes
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === "axes" && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Axes de Veille</CardTitle>
                <Button size="sm" onClick={() => {
                  setShowAxeForm(!showAxeForm);
                  setEditingAxe(null);
                  setAxeForm({ name: "", description: "", objectiveId: "" });
                }}>
                  <Plus className="mr-2 h-4 w-4" />
                  {showAxeForm ? "Cancel" : "Add Axe"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {showAxeForm && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-4 border border-border rounded-lg"
                >
                  <form onSubmit={handleAddAxe} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="axeName">Axe Name</Label>
                      <Input
                        id="axeName"
                        value={axeForm.name}
                        onChange={(e) => setAxeForm({ ...axeForm, name: e.target.value })}
                        placeholder="e.g., AI Technologies"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="axeDescription">Description</Label>
                      <Textarea
                        id="axeDescription"
                        value={axeForm.description}
                        onChange={(e) => setAxeForm({ ...axeForm, description: e.target.value })}
                        placeholder="Describe the strategic axis..."
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="objectiveId">Linked Objective</Label>
                      <select
                        id="objectiveId"
                        value={axeForm.objectiveId}
                        onChange={(e) => setAxeForm({ ...axeForm, objectiveId: e.target.value })}
                        className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                        required
                      >
                        <option value="">Select an objective</option>
                        {project.objectives?.map((obj) => (
                          <option key={obj.id} value={obj.id}>
                            {obj.content.substring(0, 50)}...
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit" size="sm">
                        {editingAxe ? "Update Axe" : "Add Axe"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setShowAxeForm(false);
                          setEditingAxe(null);
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </motion.div>
              )}
              {!project.axes || project.axes.length === 0 ? (
                <p className="text-muted-foreground text-sm">No axes yet</p>
              ) : (
                <div className="space-y-3">
                  {project.axes.map((axe) => (
                    <motion.div
                      key={axe.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="p-4 rounded-lg border border-border hover:bg-secondary/50"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium">{axe.name}</p>
                          {axe.description && (
                            <p className="text-sm text-muted-foreground mt-1">{axe.description}</p>
                          )}
                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <Badge variant="outline">
                              {project.objectives?.find(o => o.id === axe.objectiveId)?.content.substring(0, 30)}...
                            </Badge>
                            <Badge variant="outline">
                              {axe._count?.hypotheses || 0} hypotheses
                            </Badge>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditAxe(axe)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteAxe(axe.id)}
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
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2">
            {/* Additional content can go here */}
          </div>
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Project Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type</span>
                  <span>{project.veilleType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created</span>
                  <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Objectives</span>
                  <span>{project.objectives?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Axes</span>
                  <span>{project.axes?.length || 0}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
  );
}
