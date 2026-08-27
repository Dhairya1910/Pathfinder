import { useState } from "react";
import type { Profile } from "../lib/types";

interface ProfileViewProps {
  onAssessment: (profile: Profile) => void;
  onDirect: (profile: Profile) => void;
  busy: boolean;
}

const educationOptions = [
  "No prior education",
  "High School",
  "Diploma",
  "Undergraduate",
  "Postgraduate",
  "PhD",
];
const experienceOptions = [
  "No Experience",
  "Fresher",
  "0-2 years",
  "2-5 years",
  "5-7 years",
  "7+ years",
];

export function ProfileView({ onAssessment, onDirect, busy }: ProfileViewProps) {
  const [profile, setProfile] = useState<Profile>({
    name: "",
    field: "",
    education: educationOptions[0],
    experience: experienceOptions[0],
  });
  const [touched, setTouched] = useState({ name: false, field: false });
  const nameError = touched.name && !profile.name.trim() ? "Tell us what to call you." : "";
  const fieldError =
    touched.field && !profile.field.trim() ? "Choose the direction you want to explore." : "";
  const valid = Boolean(profile.name.trim() && profile.field.trim());
  const update = (key: keyof Profile, value: string) =>
    setProfile((current) => ({ ...current, [key]: value }));
  return (
    <div className="profile-layout">
      <div className="intro-copy">
        <span className="eyebrow">A clearer way forward</span>
        <h1>
          Your next chapter starts with <em>direction.</em>
        </h1>
        <p>
          Tell us where you want to go. Pathfinder will turn your starting point into a practical,
          personal learning path.
        </p>
        <div className="signal-row">
          <span>✦</span>
          <p>
            <strong>Built for your momentum.</strong>
            <br />
            No generic checklists. Just the next best steps.
          </p>
        </div>
      </div>
      <form
        className="profile-card glass-card"
        onSubmit={(event) => {
          event.preventDefault();
          if (valid) onAssessment(profile);
        }}
      >
        <div className="card-heading">
          <div>
            <span className="eyebrow">Step one</span>
            <h2>Set your coordinates</h2>
          </div>
          <span className="card-count">01 / 03</span>
        </div>
        <label>
          What should we call you?
          <input
            autoComplete="name"
            value={profile.name}
            onChange={(event) => update("name", event.target.value)}
            onBlur={() => setTouched((current) => ({ ...current, name: true }))}
            placeholder="e.g. Maya Chen"
            aria-invalid={Boolean(nameError)}
          />
          {nameError && <small className="field-error">{nameError}</small>}
        </label>
        <label>
          What field are you moving toward?
          <input
            value={profile.field}
            onChange={(event) => update("field", event.target.value)}
            onBlur={() => setTouched((current) => ({ ...current, field: true }))}
            placeholder="e.g. Product design, data science…"
            aria-invalid={Boolean(fieldError)}
          />
          {fieldError && <small className="field-error">{fieldError}</small>}
        </label>
        <div className="field-grid">
          <label>
            Current education
            <select
              value={profile.education}
              onChange={(event) => update("education", event.target.value)}
            >
              {educationOptions.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </label>
          <label>
            Experience
            <select
              value={profile.experience}
              onChange={(event) => update("experience", event.target.value)}
            >
              {experienceOptions.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </label>
        </div>
        <div className="form-actions">
          <button className="primary-button" type="submit" disabled={!valid || busy}>
            Start with assessment <span>→</span>
          </button>
          <button
            className="secondary-button"
            type="button"
            disabled={!valid || busy}
            onClick={() => onDirect(profile)}
          >
            Skip to roadmap <span>↗</span>
          </button>
        </div>
        <p className="form-note">Your answers stay private to this session.</p>
      </form>
    </div>
  );
}
