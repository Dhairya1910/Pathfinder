from langchain_mistralai import ChatMistralAI
from dotenv import load_dotenv
from typing import TypedDict, List
from pydantic import BaseModel, Field

from packages.ai.prompts.evaluate_quiz import evaluate_quiz_prompt
from packages.ai.prompts.generate_quiz import generate_quiz_prompt
from packages.ai.prompts.generate_roadmap import generate_roadmap_prompt
from packages.ai.prompts.direct_roadmap import generate_direct_roadmap


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


class EvaluationOutput(BaseModel):
    score: str
    strengths: List[str]
    weaknesses: List[str]
    feedback: str


class QuizGeneratorOutput(BaseModel):
    Question: List[str] = Field(description="List questions")
    AnswerKeys: List[List[str]] = Field(description="Each question has 4 options")
    CorrectAnswer: List[str] = Field(
        description="Correct option per question (A/B/C/D)"
    )


class AgentWorkFlow:
    def __init__(self):
        load_dotenv()

        self.quiz_model = ChatMistralAI(
            model="mistral-medium-latest", temperature=0.8
        ).with_structured_output(QuizGeneratorOutput)

        self.eval_model = ChatMistralAI(
            model="mistral-medium-latest", temperature=0.2
        ).with_structured_output(EvaluationOutput)

        self.roadmap_model = ChatMistralAI(model="mistral-small-2603", temperature=0.4)

    def Generate_quiz(self, state: State) -> State:
        prompt = generate_quiz_prompt(state)

        output = self.quiz_model.invoke(prompt)
        state["Question"] = output.Question
        state["AnswerKeys"] = output.AnswerKeys
        state["CorrectAnswer"] = output.CorrectAnswer

        return state

    def Quiz_Evalutation(self, state: State) -> State:
        prompt = evaluate_quiz_prompt(state)
        response = self.eval_model.invoke(prompt)

        state["Score"] = response.score
        state["Feedback"] = response.feedback
        state["strength"] = response.strengths
        state["weakness"] = response.weaknesses

        return state

    def _generate_direct_roadmap(self, state: State) -> State:

        prompt = generate_direct_roadmap(state)
        response = self.roadmap_model.invoke(prompt)
        state["roadmap"] = response.content

        return state

    def generate_roadmap(self, state: State) -> State:
        prompt = generate_roadmap_prompt(state)

        response = self.roadmap_model.invoke(prompt)
        state["roadmap"] = response.content

        return state
