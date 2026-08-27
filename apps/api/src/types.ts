export interface WorkflowState {
  user_name: string;
  user_field: string;
  user_education: string;
  user_workexp: string;
  Question?: string[];
  AnswerKeys?: string[][];
  CorrectAnswer?: string[];
  UserAnswer?: string[];
  Feedback?: string;
  Score?: string | number;
  strength?: string[] | string;
  weakness?: string[] | string;
  roadmap?: string;
  [key: string]: unknown;
}

export interface ProfileInput {
  name: string;
  field: string;
  education: string;
  experience: string;
}

export interface Session {
  state: WorkflowState;
}

export interface QuizQuestion {
  index: number;
  question: string;
  options: string[];
}

export interface Evaluation {
  score: string | number;
  strengths: string[];
  weaknesses: string[];
  feedback: string;
}
