import type { Evaluation } from "../lib/types";

export function ResultsPanel({ evaluation }: { evaluation: Evaluation }) {
  return (
    <section className="results-panel">
      <div className="score-card"><span>Your signal</span><strong>{evaluation.score}</strong><small>assessment result</small></div>
      <div className="insight-card"><span className="eyebrow mint">What’s working</span><ul>{evaluation.strengths.map((item) => <li key={item}>{item}</li>)}</ul></div>
      <div className="insight-card"><span className="eyebrow coral">Worth sharpening</span><ul>{evaluation.weaknesses.map((item) => <li key={item}>{item}</li>)}</ul></div>
      <div className="feedback-card"><span className="eyebrow">Mentor note</span><p>{evaluation.feedback}</p></div>
    </section>
  );
}
