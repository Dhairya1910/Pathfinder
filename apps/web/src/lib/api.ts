import type { Evaluation, Profile, QuizResponse, SessionResponse } from "./types";

class ApiError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { headers: { "Content-Type": "application/json" }, ...init });
  const body: unknown = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = typeof body === "object" && body !== null && "error" in body && typeof body.error === "string"
      ? body.error
      : "Something went wrong. Please try again.";
    throw new ApiError(response.status, message);
  }
  return body as T;
}

export const api = {
  createSession: (profile: Profile) => request<SessionResponse>("/api/sessions", { method: "POST", body: JSON.stringify(profile) }),
  generateQuiz: (sessionId: string) => request<QuizResponse>(`/api/sessions/${sessionId}/quiz`, { method: "POST" }),
  submitAnswers: (sessionId: string, answers: string[]) => request<Evaluation>(`/api/sessions/${sessionId}/quiz/answers`, { method: "POST", body: JSON.stringify({ answers }) }),
  generateRoadmap: (sessionId: string) => request<{ roadmap: string }>(`/api/sessions/${sessionId}/roadmap`, { method: "POST" }),
  directRoadmap: (sessionId: string) => request<{ roadmap: string }>(`/api/sessions/${sessionId}/roadmap/direct`, { method: "POST" }),
};
