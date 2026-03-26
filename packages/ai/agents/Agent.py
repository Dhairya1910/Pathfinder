from langchain_mistralai import ChatMistralAI
from dotenv import load_dotenv
from langgraph.graph import StateGraph, START, END
from typing import TypedDict, Annotated
from pydantic import BaseModel, Field
from langgraph.types import interrupt


class State(TypedDict):
    # =======================
    #      USER INPUT      #
    # =======================
    user_field: str
    user_education: str
    user_workexp: str

    Question: list[str]
    AnswerKeys: list[list[str]]
    CorrectAnswer: list[str]
    UserAnswer: list[str]

    Feedback: str
    Score: float
    iteration: int


class Evalution_model_output(BaseModel):
    Feedback: str = Field("for provided results generate a feedback for the user")
    score: int = Field("Provided the score for the user.")


class Option(BaseModel):
    label: str
    text: str


class Quiz_Generator_model_output(BaseModel):
    Question: list[str] = Field(description="List of Questions number wise")
    AnswerKeys: list[list[Option]] = Field(
        description="List of answer keys for Questions"
    )
    CorrectAnswer: list[str] = Field(
        description="List of correct answers for Questions"
    )


class AgentWorkFlow:
    def __init__(self):

        if load_dotenv():
            print("API Verified Successfully")
        else:
            print("API Not verfied")

        Quiz_Generator_model = ChatMistralAI(
            model="mistral-medium-latest",
            temperature=0.8,
        )

        self.Quiz_Generator_model = Quiz_Generator_model.with_structured_output(
            Quiz_Generator_model_output
        )

        Evaluation_model = ChatMistralAI(
            model="magistral-medium-latest", temperature=0.2
        )
        self.Evaluation_model = Evaluation_model.with_structured_output(
            Evalution_model_output
        )

        self.Roadmap_Generator_model = ChatMistralAI(
            model="mistral-small-2603", temperature=0.8
        )

    def Generate_quiz(self, state: State) -> State:
        prompt = f"""
                <ROLE_AND_OBJECTIVE>
        You are an intelligent QUIZ GENERATION AGENT.

        Your goal:
        - Generate a high-quality, personalized quiz based on user profile inputs.
        - The quiz must be tailored to the user's:
        - Education level
        - Field/domain
        - Work experience
        - The quiz should contain EXACTLY 10 questions.

        </ROLE_AND_OBJECTIVE>
        <INPUT_SPECIFICATION>
        You will receive structured user input in the following format:
        education: {state['user_education']},
        field: {state['user_field']},
        experience: {state['user_workexp']}
        </INPUT_SPECIFICATION>

        <QUIZ_GENERATION_RULES>
        1. TOTAL QUESTIONS:
        - Always generate EXACTLY 10 questions (no more, no less).

        2. DIFFICULTY DISTRIBUTION:
        - Beginner: 20%
        - Intermediate: 50%
        - Advanced: 30%

        3. QUESTION TYPES:
        - Mix of:
            - Multiple Choice Questions (MCQs)
            - Scenario-based questions
            - Conceptual understanding questions

        4. PERSONALIZATION LOGIC:
        - Education level determines baseline complexity.
        - Field determines topic relevance.
        - Experience determines depth and real-world application.

        5. MCQ STRUCTURE:
        Each MCQ must include:
        - Question
        - 4 options (A, B, C, D)
        - Correct answer
        - Brief explanation (1–2 lines)

        6. QUALITY REQUIREMENTS:
        - Questions must be clear, non-ambiguous, and realistic.
        - Avoid trivial or overly generic questions.
        - Ensure no repeated or redundant questions.
        </QUIZ_GENERATION_RULES>
        """

        output = self.Quiz_Generator_model.invoke(prompt)

        return {
            "Question": output.Question,
            "AnswerKeys": output.AnswerKeys,
            "CorrectAnswer": output.CorrectAnswer,
        }

    def Quiz_Evalutation(self, state: State) -> State:
        prompt = f"""
                    <ROLE>
            You are a precise and analytical MCQ Evaluation Agent.

            Your job is to evaluate a user's quiz performance strictly based on selected options.
            You act like an automated grading system with intelligent feedback capabilities.
            </ROLE>

            <OBJECTIVE>
            - Compare user-selected answers with correct options.
            - Calculate score accurately.
            - Identify patterns in mistakes.
            - Provide concise, meaningful feedback.
            </OBJECTIVE>

            <INPUT_FORMAT>
            "domain": "<domain_name>",
            "questions":
                "question": {state['Question']},
                "correct_option": {state['CorrectAnswer']},
                "user_selected": {state['UserAnswer']}
            </INPUT_FORMAT>

            <EVALUATION_LOGIC>
            For each question:

            - If user_selected == correct_option:
                → Mark as "Correct"
                → Score = 1

            - Else:
                → Mark as "Incorrect"
                → Score = 0

            No partial marking unless explicitly stated.
            </EVALUATION_LOGIC>

            <SCORING_RULES>
            - Total Score = Sum of all correct answers
            - Accuracy (%) = (Total Score / Total Questions) * 100

            </SCORING_RULES>

            <PERFORMANCE_LEVEL>
            - Beginner: < 40%
            - Intermediate: 40% – 75%
            - Advanced: > 75%
            </PERFORMANCE_LEVEL>
        """

        response = self.Evaluation_model.invoke(prompt)

        return {"Feedback": response.Feedback, "Score": response.score}
