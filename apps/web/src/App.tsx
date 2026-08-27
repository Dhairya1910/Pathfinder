import { useRef, useState } from "react";
import { api } from "./lib/api";
import type { Evaluation, Profile, QuizQuestion } from "./lib/types";
import { ErrorBanner } from "./components/ErrorBanner";
import { LoadingState } from "./components/LoadingState";
import { Stepper } from "./components/Stepper";
import { ProfileView } from "./views/ProfileView";
import { QuizView } from "./views/QuizView";
import { RoadmapView } from "./views/RoadmapView";

type Step = "profile" | "assessment" | "roadmap";

export default function App() {
  const [step, setStep] = useState<Step>("profile");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [sessionId, setSessionId] = useState("");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [current, setCurrent] = useState(0);
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [roadmap, setRoadmap] = useState("");
  const [busy, setBusy] = useState(false);
  const [loadingLabel, setLoadingLabel] = useState("Finding your starting point");
  const [error, setError] = useState("");
  const retryRef = useRef<(() => void) | null>(null);

  const execute = async (label: string, operation: () => Promise<void>, retry: () => void) => {
    setBusy(true);
    setLoadingLabel(label);
    setError("");
    retryRef.current = retry;
    try {
      await operation();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };
  const startAssessment = (nextProfile: Profile) => {
    setProfile(nextProfile);
    const action = () =>
      execute(
        "Preparing your assessment",
        async () => {
          const session = await api.createSession(nextProfile);
          setSessionId(session.sessionId);
          const quiz = await api.generateQuiz(session.sessionId);
          setQuestions(quiz.questions);
          setAnswers(new Array(quiz.total).fill(""));
          setStep("assessment");
          setCurrent(0);
        },
        () => startAssessment(nextProfile),
      );
    void action();
  };
  const startDirect = (nextProfile: Profile) => {
    setProfile(nextProfile);
    const action = () =>
      execute(
        "Designing your roadmap",
        async () => {
          const session = await api.createSession(nextProfile);
          setSessionId(session.sessionId);
          const result = await api.directRoadmap(session.sessionId);
          setRoadmap(result.roadmap);
          setStep("roadmap");
        },
        () => startDirect(nextProfile),
      );
    void action();
  };
  const nextQuestion = () => {
    if (current < questions.length - 1) {
      setCurrent((value) => value + 1);
      return;
    }
    if (!sessionId) return;
    const action = () =>
      execute(
        "Analyzing your answers",
        async () => {
          const result = await api.submitAnswers(sessionId, answers);
          setEvaluation(result);
          const roadmapResult = await api.generateRoadmap(sessionId);
          setRoadmap(roadmapResult.roadmap);
          setStep("roadmap");
        },
        nextQuestion,
      );
    void action();
  };
  const startOver = () => {
    setStep("profile");
    setProfile(null);
    setSessionId("");
    setQuestions([]);
    setAnswers([]);
    setEvaluation(null);
    setRoadmap("");
    setError("");
  };
  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="brand">
          <span className="brand-mark">✦</span>
          <span>
            pathfinder<span className="brand-dot">.</span>
          </span>
        </div>
        <span className="header-note">AI-guided career clarity</span>
      </header>
      <main>
        <Stepper current={step} />
        {error && (
          <ErrorBanner message={error} onRetry={retryRef.current} onDismiss={() => setError("")} />
        )}
        {busy ? (
          <LoadingState label={loadingLabel} />
        ) : step === "profile" ? (
          <ProfileView onAssessment={startAssessment} onDirect={startDirect} busy={busy} />
        ) : step === "assessment" && profile ? (
          <QuizView
            profile={profile}
            questions={questions}
            answers={answers}
            current={current}
            onAnswer={(value) =>
              setAnswers((currentAnswers) =>
                currentAnswers.map((answer, index) => (index === current ? value : answer)),
              )
            }
            onBack={() => setCurrent((value) => Math.max(0, value - 1))}
            onNext={nextQuestion}
            busy={busy}
          />
        ) : (
          <RoadmapView roadmap={roadmap} evaluation={evaluation} onStartOver={startOver} />
        )}
      </main>
      <footer>
        <span>Pathfinder / made for meaningful momentum</span>
        <span>✦</span>
      </footer>
    </div>
  );
}
