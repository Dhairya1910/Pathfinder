/* DEV-ONLY deterministic fixtures used when MOCK_AI=1. */
import type { Evaluation, WorkflowState } from "./types.js";

const questions = [
  "Which data structure provides average O(1) key lookup?",
  "What does HTTP status 201 indicate?",
  "Which principle keeps a module focused on one responsibility?",
  "What is the primary purpose of a database index?",
  "Which practice makes a UI adapt to different screen sizes?",
  "What does a unit test isolate?",
  "Which Git command creates a new branch and switches to it?",
  "What does JSON.stringify return?",
  "Which SQL clause filters grouped results?",
  "What is the safest way to store a password?",
];

const options = [
  ["A. Hash map", "B. Linked list", "C. Stack", "D. Binary heap"],
  ["A. Accepted", "B. Created", "C. No content", "D. Unauthorized"],
  ["A. DRY", "B. KISS", "C. Single Responsibility", "D. YAGNI"],
  ["A. Encrypt rows", "B. Speed up lookups", "C. Validate forms", "D. Compress tables"],
  ["A. Responsive layout", "B. Static pixels", "C. Server rendering", "D. Minification"],
  ["A. The whole system", "B. One small behavior", "C. Production traffic", "D. The database backup"],
  ["A. git merge", "B. git branch", "C. git switch -c", "D. git clone"],
  ["A. A JSON string", "B. A parsed object", "C. A stream", "D. A buffer"],
  ["A. WHERE", "B. ORDER BY", "C. HAVING", "D. LIMIT"],
  ["A. Plain text", "B. Base64", "C. A salted password hash", "D. A URL parameter"],
];

const correctAnswers = ["A. Hash map", "B. Created", "C. Single Responsibility", "B. Speed up lookups", "A. Responsive layout", "B. One small behavior", "C. git switch -c", "A. A JSON string", "C. HAVING", "C. A salted password hash"];

export function mockQuiz(state: WorkflowState): WorkflowState {
  return { ...state, Question: questions, AnswerKeys: options, CorrectAnswer: correctAnswers };
}

export function mockEvaluation(state: WorkflowState): { state: WorkflowState; evaluation: Evaluation } {
  const answers = state.UserAnswer ?? [];
  const score = answers.reduce((total, answer, index) => total + (answer === correctAnswers[index] ? 1 : 0), 0);
  const evaluation: Evaluation = {
    score: `${score} / ${questions.length}`,
    strengths: ["You recognize core web and software engineering vocabulary.", "Your answers show a solid foundation in data structures and HTTP.", "You can connect practical development tools to their intended use."],
    weaknesses: ["Keep strengthening database querying and aggregation concepts.", "Practice translating principles into architecture and testing decisions.", "Revisit secure credential handling and its operational trade-offs."],
    feedback: `You scored ${score} out of ${questions.length}. Build depth through small projects that combine an API, database, tests, and a responsive interface, then revisit the missed concepts with deliberate practice.`,
  };
  return { state: { ...state, Score: evaluation.score, strength: evaluation.strengths, weakness: evaluation.weaknesses, Feedback: evaluation.feedback }, evaluation };
}

const roadmap = `# Your Pathfinder Roadmap

## North star
Build production-ready web applications that solve a real problem for your target field.

## 12-week sequence

| Phase | Focus | Deliverable |
| --- | --- | --- |
| Weeks 1–3 | Foundations | A typed API with tests |
| Weeks 4–6 | Data and security | A database-backed feature |
| Weeks 7–9 | Product UI | A responsive dashboard |
| Weeks 10–12 | Delivery | A deployed capstone |

## Weekly rhythm

1. Learn one focused concept.
2. Ship a small, observable feature.
3. Write tests and review the trade-offs.
4. Document what you would improve next.

\`\`\`ts
export const nextStep = "build, measure, reflect";
\`\`\`

## Milestone
At the end of week 12, demo your capstone, explain its architecture, and use feedback to choose the next specialization.`;

export function mockRoadmap(state: WorkflowState): WorkflowState {
  return { ...state, roadmap };
}
