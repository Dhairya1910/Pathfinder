import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Evaluation } from "../lib/types";
import { ResultsPanel } from "../components/ResultsPanel";

interface RoadmapViewProps { roadmap: string; evaluation: Evaluation | null; onStartOver: () => void; }

export function RoadmapView({ roadmap, evaluation, onStartOver }: RoadmapViewProps) {
  const [copied, setCopied] = useState(false);
  const copy = async () => { await navigator.clipboard.writeText(roadmap); setCopied(true); window.setTimeout(() => setCopied(false), 1800); };
  const download = () => { const url = URL.createObjectURL(new Blob([roadmap], { type: "text/markdown" })); const anchor = document.createElement("a"); anchor.href = url; anchor.download = "pathfinder-roadmap.md"; anchor.click(); URL.revokeObjectURL(url); };
  return (
    <div className="roadmap-layout">
      <div className="roadmap-heading"><div><span className="eyebrow">Your route is ready</span><h1>A path with <em>purpose.</em></h1></div><div className="roadmap-actions"><button className="secondary-button" onClick={copy}>{copied ? "Copied ✓" : "Copy roadmap"}</button><button className="secondary-button" onClick={download}>Download .md</button></div></div>
      {evaluation && <ResultsPanel evaluation={evaluation} />}
      <article className="markdown-card glass-card"><ReactMarkdown remarkPlugins={[remarkGfm]}>{roadmap}</ReactMarkdown></article>
      <div className="restart-row"><span>Ready to explore a different direction?</span><button className="text-button" onClick={onStartOver}>Start over ↗</button></div>
    </div>
  );
}
