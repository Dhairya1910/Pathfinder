export interface Profile {
  name: string;
  field: string;
  education: string;
  experience: string;
}

export interface QuizQuestion {
  index: number;
  question: string;
  options: string[];
}

export interface QuizResponse {
  questions: QuizQuestion[];
  total: number;
}

export interface Evaluation {
  score: string | number;
  strengths: string[];
  weaknesses: string[];
  feedback: string;
}

export interface SessionResponse {
  sessionId: string;
  profile: Profile;
}
