# 🧭 Pathfinder

Pathfinder is an AI-powered career guidance system that helps users discover personalized learning paths based on their background, skills, and goals. It combines LLM-driven assessment, evaluation, and roadmap generation into a seamless interactive experience.

---

## Overview

Pathfinder guides users through a structured 3-step workflow:

1. **User Profiling**
   Collects user information such as:

   * Desired field
   * Education level
   * Work experience

2. **Skill Assessment (Optional)**
   Dynamically generates a quiz to evaluate the user's current knowledge.

3. **Personalized Roadmap Generation**
   Produces a tailored learning roadmap using AI based on:

   * User profile
   * Quiz performance (if taken)

---

## Features

* AI-generated quizzes based on user goals
* Structured evaluation with strengths and weaknesses
* Personalized roadmap generation
* Option to skip assessment and directly generate roadmap
* Minimal and interactive Streamlit UI
* Modular architecture for scalability

---

## Project Structure

```
Pathfinder/
│
├── apps/                  # Frontend & Backend (in development)
│
├── packages/
│   └── ai/
│       ├── agents/
│       │   └── Agent.py   # Core AI workflow
│       └── prompts/       # Prompt templates
│
├── .env                   # Environment variables
├── main.py                # Entry point
├── pyproject.toml         # Project configuration
├── uv.lock                # Dependency lock file
└── README.md
```

---

## Core Architecture

The system is centered around the `AgentWorkFlow` class, which orchestrates multiple AI tasks.

### State Management

A shared `State` object is used across all steps:

```python
class State(TypedDict):
    user_field: str
    user_education: str
    user_workexp: str

    Question: list[str]
    AnswerKeys: list[list[str]]
    CorrectAnswer: list[str]
    UserAnswer: list[str]

    Feedback: str
    Score: int
    strength: str
    weakness: str
    roadmap: str
```

---

## AI Workflow

### 1. Quiz Generation

* Uses `mistral-medium-latest`
* Structured output via Pydantic

```python
self.quiz_model = ChatMistralAI(...).with_structured_output(QuizGeneratorOutput)
```

Generates:

* Questions
* Multiple-choice options
* Correct answers

---

### 2. Quiz Evaluation

* Uses deterministic configuration (low temperature)
* Returns structured feedback

```python
class EvaluationOutput(BaseModel):
    score: str
    strengths: List[str]
    weaknesses: List[str]
    feedback: str
```

Outputs:

* Score
* Strengths
* Weaknesses
* Detailed feedback

---

### 3. Roadmap Generation

Two modes:

#### a. Assessment-Based Roadmap

Generated after quiz evaluation.

#### b. Direct Roadmap (No Quiz)

Generated directly from user profile.

---

## Frontend (Streamlit)

The UI is built using Streamlit and follows a multi-step flow:

### Step 1: User Input

* Name
* Field
* Education
* Experience

### Step 2: Quiz

* Dynamic question generation
* Progress tracking
* Answer submission

### Step 3: Result

* Displays AI-generated roadmap

Implementation reference: 

---

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/pathfinder.git
cd pathfinder
```

### 2. Create Virtual Environment (Python 3.12)

```bash
uv venv --python 3.12
source .venv/bin/activate  # Linux / Mac
.venv\Scripts\activate     # Windows
```

### 3. Install Dependencies

```bash
uv pip install -r pyproject.toml
```

---

## Environment Variables

Create a `.env` file:

```
MISTRAL_API_KEY=your_api_key_here
```

---

## Running the Application

```bash
streamlit run main.py
```

---

## Tech Stack

* **LLM**: Mistral (via LangChain)
* **Framework**: Streamlit
* **Backend Logic**: Python
* **Validation**: Pydantic
* **Environment Management**: uv

---

## Current Status

* Core AI workflow implemented
* UI functional with multi-step navigation
* Backend/frontend separation in progress
* Active development ongoing

---

## Future Improvements

* API-based backend (FastAPI)
* Persistent user sessions
* Advanced evaluation metrics
* Visualization of learning paths
* Integration with real course providers

---

## Contributing

Contributions are welcome. Please open an issue or submit a pull request for improvements.

---

## License

This project is currently under development and does not yet have a defined license.

---

## Notes

* This project is experimental and evolving.
* Outputs depend on LLM behavior and prompt design.
* Ensure API keys are properly configured before running.

---
