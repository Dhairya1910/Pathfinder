type Step = "profile" | "assessment" | "roadmap";

interface StepperProps {
  current: Step;
}

const steps: { id: Step; label: string; note: string }[] = [
  { id: "profile", label: "Profile", note: "Set your direction" },
  { id: "assessment", label: "Assessment", note: "Find your baseline" },
  { id: "roadmap", label: "Roadmap", note: "Plan your next move" },
];

export function Stepper({ current }: StepperProps) {
  const currentIndex = steps.findIndex((step) => step.id === current);
  return (
    <nav className="stepper" aria-label="Progress">
      {steps.map((step, index) => (
        <div className={`step ${index < currentIndex ? "complete" : ""} ${step.id === current ? "active" : ""}`} key={step.id}>
          <div className="step-marker">{index < currentIndex ? "✓" : index + 1}</div>
          <div><strong>{step.label}</strong><span>{step.note}</span></div>
          {index < steps.length - 1 && <div className={`step-line ${index < currentIndex ? "filled" : ""}`} />}
        </div>
      ))}
    </nav>
  );
}
