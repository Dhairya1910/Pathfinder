import express, { type Request, type Response } from "express";
import { existsSync } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { callBridge } from "./bridge.js";
import { mockEvaluation, mockQuiz, mockRoadmap } from "./fixtures.js";
import type { Evaluation, ProfileInput, QuizQuestion, Session, WorkflowState } from "./types.js";

const app = express();
const sessions = new Map<string, Session>();
const port = Number(process.env.PORT || 4000);
const mock = process.env.MOCK_AI === "1";

app.use(express.json());

function aiUnavailable(response: Response): boolean {
  if (mock || process.env.MISTRAL_API_KEY) return false;
  response.status(503).json({ error: "MISTRAL_API_KEY is missing. Add it to .env or enable MOCK_AI=1 for local development." });
  return true;
}

function getSession(id: string, response: Response): Session | undefined {
  const session = sessions.get(id);
  if (!session) response.status(404).json({ error: "Session not found" });
  return session;
}

function sanitize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sanitize);
  if (typeof value === "object" && value !== null) {
    return Object.fromEntries(Object.entries(value).filter(([key]) => key !== "CorrectAnswer").map(([key, entry]) => [key, sanitize(entry)]));
  }
  return value;
}

function list(value: string[] | string | undefined): string[] {
  if (Array.isArray(value)) return value;
  return value ? [value] : [];
}

async function runAction(action: string, session: Session, response: Response): Promise<WorkflowState | undefined> {
  if (aiUnavailable(response)) return undefined;
  if (mock) {
    if (action === "generate_quiz") session.state = mockQuiz(session.state);
    else if (action === "evaluate_quiz") session.state = mockEvaluation(session.state).state;
    else session.state = mockRoadmap(session.state);
    return session.state;
  }
  const result = await callBridge(action, session.state);
  if (result.error || !result.state) {
    console.error(`Bridge ${action} failed: ${result.error || "empty state"}${result.stderr ? `\n${result.stderr}` : ""}`);
    response.status(502).json({ error: result.error || "AI bridge failed" });
    return undefined;
  }
  session.state = result.state;
  return session.state;
}

app.get("/api/health", (_request, response) => {
  response.json({ status: "ok", aiConfigured: Boolean(process.env.MISTRAL_API_KEY), mock });
});

app.post("/api/sessions", (request: Request<unknown, unknown, Partial<ProfileInput>>, response) => {
  const { name = "", field = "", education = "", experience = "" } = request.body || {};
  if (typeof name !== "string" || typeof field !== "string" || !name.trim() || !field.trim()) {
    response.status(400).json({ error: "Name and desired field are required." });
    return;
  }
  const sessionId = randomUUID();
  const state: WorkflowState = { user_name: name.trim(), user_field: field.trim(), user_education: education, user_workexp: experience };
  sessions.set(sessionId, { state });
  response.status(201).json({ sessionId, profile: { name: state.user_name, field: state.user_field, education, experience } });
});

app.get("/api/sessions/:id", (request, response) => {
  const session = getSession(request.params.id, response);
  if (session) response.json(sanitize(session.state));
});

app.post("/api/sessions/:id/quiz", async (request, response) => {
  const session = getSession(request.params.id, response);
  if (!session) return;
  const state = await runAction("generate_quiz", session, response);
  if (!state) return;
  const questions: QuizQuestion[] = (state.Question || []).map((question, index) => ({ index, question, options: state.AnswerKeys?.[index] || [] }));
  response.json({ questions, total: questions.length });
});

app.post("/api/sessions/:id/quiz/answers", async (request: Request<{ id: string }, unknown, { answers?: string[] }>, response) => {
  const session = getSession(request.params.id, response);
  if (!session) return;
  const answers = request.body?.answers;
  const total = session.state.Question?.length || 0;
  if (!Array.isArray(answers) || answers.length !== total) {
    response.status(400).json({ error: `Expected ${total} answers.` });
    return;
  }
  session.state.UserAnswer = answers;
  const state = await runAction("evaluate_quiz", session, response);
  if (!state) return;
  const evaluation: Evaluation = { score: state.Score || "0", strengths: list(state.strength), weaknesses: list(state.weakness), feedback: state.Feedback || "" };
  response.json(evaluation);
});

app.post("/api/sessions/:id/roadmap", async (request, response) => {
  const session = getSession(request.params.id, response);
  if (!session) return;
  if (!session.state.Score) {
    response.status(409).json({ error: "Complete the quiz evaluation before generating this roadmap." });
    return;
  }
  const state = await runAction("generate_roadmap", session, response);
  if (state) response.json({ roadmap: state.roadmap || "" });
});

app.post("/api/sessions/:id/roadmap/direct", async (request, response) => {
  const session = getSession(request.params.id, response);
  if (!session) return;
  const state = await runAction("direct_roadmap", session, response);
  if (state) response.json({ roadmap: state.roadmap || "" });
});

const webDist = path.resolve(process.cwd(), "apps/web/dist");
if (existsSync(webDist)) {
  app.use(express.static(webDist));
  app.get("*", (_request, response) => response.sendFile(path.join(webDist, "index.html")));
}

app.listen(port, () => console.log(`Pathfinder API listening on http://localhost:${port}`));
