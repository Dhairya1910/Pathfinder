import streamlit as st
from packages.ai.agents.Agent import AgentWorkFlow

# Page config
st.set_page_config(page_title="Path Finder", page_icon="🧭", layout="centered")

# Initialize session state (Only if they don't exist)
if "page" not in st.session_state:
    st.session_state.page = 1
if "quiz" not in st.session_state:
    st.session_state.quiz = None
if "current_question" not in st.session_state:
    st.session_state.current_question = 0
if "user_ans" not in st.session_state:
    st.session_state.user_ans = []
if "is_complete" not in st.session_state:
    st.session_state.is_complete = False
if "agent" not in st.session_state:  # FIXED: Don't overwrite to None on every rerun
    st.session_state.agent = None

# Custom CSS
st.markdown(
    """
    <style>
        .card { background: white; padding: 30px; border-radius: 16px; box-shadow: 0 8px 24px rgba(0,0,0,0.08); margin-top: 50px; }
        .title { text-align: center; font-size: 28px; font-weight: 600; margin-bottom: 25px; }
        .sub-card { border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px; margin-top: 10px; }
    </style>
""",
    unsafe_allow_html=True,
)

# ---------------- PAGE 1 ----------------
if st.session_state.page == 1:
    st.markdown('<div class="card">', unsafe_allow_html=True)
    st.markdown('<div class="title">Path Finder</div>', unsafe_allow_html=True)
    st.markdown('<div class="sub-card">', unsafe_allow_html=True)

    col1, col2 = st.columns(2)
    with col1:
        user_name = st.text_input("User", value=st.session_state.get("user_name", ""))
    with col2:
        field = st.text_input("Field", value=st.session_state.get("field", ""))

    education = st.selectbox(
        "User Education",
        ["High School", "Diploma", "Undergraduate", "Postgraduate", "PhD"],
    )

    work_exp = st.selectbox(
        "Work Experience",
        ["Fresher", "0-2 years", "2-5 years", "5-7 years", "7+ years"],
    )

    if st.button("Next →"):
        st.session_state.user_name = user_name
        st.session_state.field = field
        st.session_state.education = education
        st.session_state.WorkExperience = "Fresher" if education == "High School" else work_exp
        st.session_state.page = 2
        st.rerun()

    st.markdown("</div></div>", unsafe_allow_html=True)

# ---------------- PAGE 2 ----------------
elif st.session_state.page == 2:
    st.markdown('<div class="card">', unsafe_allow_html=True)
    st.markdown('<div class="title">Your Path Overview</div>', unsafe_allow_html=True)
    st.markdown('<div class="sub-card">', unsafe_allow_html=True)

    st.write("### 👤 User Info")
    st.write(f"**Name:** {st.session_state.user_name}")
    st.write(f"**Field:** {st.session_state.field}")
    st.write(f"**Education:** {st.session_state.education}")
    st.write(f"**Work Experience:** {st.session_state.WorkExperience}")

    st.markdown("---")

    if st.button("Start Quiz"):
        # Store the agent instance in session state so it survives reruns
        st.session_state.agent = AgentWorkFlow()
        st.session_state.quiz = st.session_state.agent.Generate_quiz(
            {
                "user_education": st.session_state.education,
                "user_field": st.session_state.field,
                "user_workexp": st.session_state.WorkExperience,
            }
        )
        st.session_state.current_question = 0
        st.session_state.user_ans = []
        st.session_state.is_complete = False
        st.rerun()

    # Quiz Question Display
    if st.session_state.quiz and not st.session_state.is_complete:
        q_idx = st.session_state.current_question
        quiz = st.session_state.quiz

        st.write(f"#### Question {q_idx + 1}")
        st.write(quiz["Question"][q_idx])

        selected = st.radio(
            "Choose your answer:",
            quiz["AnswerKeys"][q_idx],
            key=f"q_radio_{q_idx}",
        )

        if st.button("Submit Answer"):
            st.session_state.user_ans.append(selected)
            if st.session_state.current_question + 1 < len(quiz["Question"]):
                st.session_state.current_question += 1
            else:
                st.session_state.is_complete = True
                st.toast("You have completed the quiz!")
            st.rerun()

    # Results Display
    if st.session_state.is_complete:
        st.success("Quiz Completed!")
        
        if st.button("Show answers"):
            # FIXED: Changed .Question to ["Question"] to match dictionary format
            questions = st.session_state.quiz["Question"]
            correct_ans = st.session_state.quiz["CorrectAnswer"]
            user_answers = st.session_state.user_ans

            for i in range(len(user_answers)):
                with st.expander(f"Question {i+1}"):
                    st.write(f"**Q:** {questions[i]}")
                    st.write(f"**Your Answer:** {user_answers[i]}")
                    st.write(f"**Correct Answer:** {correct_ans[i]}")

        if st.button("Show Evaluation"):
            if st.session_state.agent:
                output = st.session_state.agent.Quiz_Evalutation(
                    {
                        "Question": st.session_state.quiz["Question"],
                        "CorrectAnswer": st.session_state.quiz["CorrectAnswer"],
                        "UserAnswer": st.session_state.user_ans,
                    }
                )
                st.info(f"**Feedback:** {output.Feedback}")
                st.metric("Score", f"{output.Score}")
            else:
                st.error("Agent session lost. Please restart the quiz.")

    if st.button("← Back"):
        st.session_state.page = 1
        st.rerun()

    st.markdown("</div></div>", unsafe_allow_html=True)