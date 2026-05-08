"use client";

import { useState, useEffect } from "react";
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  MarkerType,
  Position,
} from "reactflow";
import "reactflow/dist/style.css";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/auth.store";
import { useRouter } from "next/navigation";

const statusColors: Record<string, string> = {
  VALIDATED: "#10b981",
  INVALIDATED: "#ef4444",
  IN_PROGRESS: "#f59e0b",
  OPEN: "#3b82f6",
};

export default function GraphPage() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [loading, setLoading] = useState(true);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    fetchGraphData();
  }, [isAuthenticated]);

  const fetchGraphData = async () => {
    try {
      const [projectsRes, perimetersRes] = await Promise.all([
        api.get("/projects/with-details"),
        api.get("/perimeters"),
      ]);

      const projects = projectsRes.data.data || projectsRes.data || [];
      const perimeters = perimetersRes.data.data || perimetersRes.data || [];
      
      console.log("Projects:", JSON.stringify(projects, null, 2));
      console.log("Perimeters:", JSON.stringify(perimeters, null, 2));

      const allNodes: Node[] = [];
      const allEdges: Edge[] = [];
      const nodePositions = new Map<string, { x: number; y: number }>();

      let xOffset = 0;

      // Create project nodes
      projects.forEach((project: any, projectIndex: number) => {
        const projectX = xOffset;
        const projectY = 0;

        allNodes.push({
          id: `project-${project.id}`,
          type: "input",
          position: { x: projectX, y: projectY },
          data: { label: project.name },
          style: {
            background: "#1e293b",
            color: "white",
            border: "2px solid #3b82f6",
            borderRadius: "8px",
            padding: "12px 16px",
            fontWeight: 600,
            fontSize: "14px",
          },
          sourcePosition: Position.Right,
        });

        nodePositions.set(`project-${project.id}`, { x: projectX, y: projectY });

        let objY = projectY + 150;

        // Create objective nodes
        (project.objectives || []).forEach((obj: any, objIdx: number) => {
          const objX = projectX + 300;

          allNodes.push({
            id: `obj-${obj.id}`,
            position: { x: objX, y: objY + objIdx * 150 },
            data: { label: obj.content.substring(0, 40) + "..." },
            style: {
              background: "#3b82f6",
              color: "white",
              border: "none",
              borderRadius: "8px",
              padding: "10px 14px",
              fontSize: "12px",
            },
            sourcePosition: Position.Right,
            targetPosition: Position.Left,
          });

          allEdges.push({
            id: `e-proj-obj-${obj.id}`,
            source: `project-${project.id}`,
            target: `obj-${obj.id}`,
            markerEnd: { type: MarkerType.ArrowClosed, color: "#64748b" },
          });

          nodePositions.set(`obj-${obj.id}`, { x: objX, y: objY + objIdx * 150 });

          let axeY = objY + objIdx * 150 + 60;

          // Create axe nodes
          (obj.axes || []).forEach((axe: any, axeIdx: number) => {
            const axeX = objX + 300;

            allNodes.push({
              id: `axe-${axe.id}`,
              position: { x: axeX, y: axeY + axeIdx * 120 },
              data: { label: axe.name },
              style: {
                background: "#8b5cf6",
                color: "white",
                border: "none",
                borderRadius: "8px",
                padding: "10px 14px",
                fontSize: "12px",
              },
              sourcePosition: Position.Right,
              targetPosition: Position.Left,
            });

            allEdges.push({
              id: `e-obj-axe-${axe.id}`,
              source: `obj-${obj.id}`,
              target: `axe-${axe.id}`,
              markerEnd: { type: MarkerType.ArrowClosed, color: "#64748b" },
            });

            nodePositions.set(`axe-${axe.id}`, { x: axeX, y: axeY + axeIdx * 120 });

            let hypY = axeY + axeIdx * 120 + 50;

            // Create hypothesis nodes
            (axe.hypotheses || []).forEach((hyp: any, hypIdx: number) => {
              const hypX = axeX + 300;
              const color = statusColors[hyp.status] || "#6b7280";

              allNodes.push({
                id: `hyp-${hyp.id}`,
                position: { x: hypX, y: hypY + hypIdx * 100 },
                data: { label: hyp.content.substring(0, 35) + "..." },
                style: {
                  background: color,
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  padding: "8px 12px",
                  fontSize: "11px",
                },
                sourcePosition: Position.Right,
                targetPosition: Position.Left,
              });

              allEdges.push({
                id: `e-axe-hyp-${hyp.id}`,
                source: `axe-${axe.id}`,
                target: `hyp-${hyp.id}`,
                markerEnd: { type: MarkerType.ArrowClosed, color: "#64748b" },
              });

              nodePositions.set(`hyp-${hyp.id}`, { x: hypX, y: hypY + hypIdx * 100 });

              hypY += 100;
            });

            axeY += 120;
          });

          objY += 150;
        });

        xOffset += 500;
      });

      // Add perimeter nodes
      let perimX = xOffset + 100;
      let perimY = 0;

      perimeters.forEach((perim: any, idx: number) => {
        allNodes.push({
          id: `perim-${perim.id}`,
          position: { x: perimX, y: perimY + idx * 100 },
          data: { label: `${perim.name} (${perim.type})` },
          style: {
            background: perim.type === "GEOGRAPHIC" ? "#f59e0b" : "#ec4899",
            color: "white",
            border: "none",
            borderRadius: "8px",
            padding: "10px 14px",
            fontSize: "12px",
          },
          sourcePosition: Position.Left,
          targetPosition: Position.Right,
        });

        // Link perimeter to hypotheses
        (perim.hypothesisLinks || []).forEach((link: any) => {
          if (nodePositions.has(`hyp-${link.hypothesisId}`)) {
            allEdges.push({
              id: `e-perim-hyp-${perim.id}-${link.hypothesisId}`,
              source: `perim-${perim.id}`,
              target: `hyp-${link.hypothesisId}`,
              markerEnd: { type: MarkerType.ArrowClosed, color: "#f59e0b" },
              style: { stroke: "#f59e0b", strokeDasharray: "5 5" },
            });
          }
        });

        perimY += 100;
      });

      setNodes(allNodes);
      setEdges(allEdges);
    } catch (err) {
      console.error("Failed to fetch graph data:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[calc(100vh-200px)] rounded-xl border border-border bg-card animate-pulse" />
    );
  }

  return (
      <div className="space-y-4">
        <p className="text-muted-foreground">
          Visualize: Project → Objective → Axis → Hypothesis (linked to Périmètres)
        </p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="h-[calc(100vh-200px)] rounded-xl border border-border bg-card"
        >
          <ReactFlow
            nodes={nodes}
            edges={edges}
            fitView
            attributionPosition="bottom-right"
            onNodeClick={(_, node) => {
              const [type, id] = node.id.split("-");
              if (type === "project") router.push(`/projects/${id}`);
              if (type === "obj") router.push(`/projects/${id}`);
              if (type === "hyp") router.push(`/intelligence/hypotheses`);
              if (type === "perim") router.push(`/perimeters`);
            }}
          >
            <Background color="#334155" gap={20} />
            <Controls />
          </ReactFlow>
        </motion.div>

        <div className="flex items-center gap-6 text-sm flex-wrap">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-slate-800 border-2 border-blue-500" />
            <span>Project</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-blue-500" />
            <span>Objective</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-purple-500" />
            <span>Axis</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-emerald-500" />
            <span>Validated</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-amber-500" />
            <span>In Progress</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-blue-500" />
            <span>Open</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-amber-500" />
            <span>Geographic Perimeter</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-pink-500" />
            <span>Sectorial Perimeter</span>
          </div>
        </div>
      </div>
  );
}
