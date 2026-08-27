import type { Profile, QuizQuestion } from "../lib/types";

interface QuizViewProps {
  profile: Profile;
  questions: QuizQuestion[];
  answers: string[];
  current: number;
  onAnswer: (value: string) => void;
  onBack: () => void;
  onNext: () => void;
  busy: boolean;
}

export function QuizView({ profile, questions, answers, current, onAnswer, onBack, onNext, busy }: QuizViewProps) {
  const question = questions[current];
  const progress = ((current + 1) / questions.length) * 100;
  return (
    <div className="quiz-layout">
      <aside className="profile-summary glass-card"><span className="eyebrow">Your profile</span><h3>{profile.name}</h3><p>Exploring <strong>{profile.field}</strong></p><dl><div><dt>Education</dt><dd>{profile.education}</dd></div><div><dt>Experience</dt><dd>{profile.experience}</dd></div></dl><div className="summary-tip">✦ <span>There’s no pressure here. Your honest answers make the roadmap sharper.</span></div></aside>
      <section className="quiz-card">
        <div className="quiz-topline"><span className="eyebrow">Skill snapshot</span><span className="question-count">Question <strong>{current + 1}</strong> of {questions.length}</span></div>
        <div className="progress-track"><div style={{ width: `${progress}%` }} /></div>
        <h2>{question.question}</h2>
        <fieldset><legend>Choose the answer that feels right</legend><div className="option-list">{question.options.map((option) => {
          const selected = answers[current] === option;
          return <label className={`option-card ${selected ? "selected" : ""}`} key={option}><input type="radio" name={`question-${current}`} checked={selected} onChange={() => onAnswer(option)} /><span className="option-radio" /><span>{option}</span>{selected && <b>✓</b>}</label>;
        })}</div></fieldset>
        <div className="quiz-actions"><button className="secondary-button" onClick={onBack} disabled={current === 0 || busy}>← Back</button><button className="primary-button" onClick={onNext} disabled={!answers[current] || busy}>{busy ? "Building your path…" : current === questions.length - 1 ? "See my roadmap →" : "Next question →"}</button></div>
      </section>
    </div>
  );
}
