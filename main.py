import streamlit as st
from packages.ai.agents.Agent import AgentWorkFlow

st.set_page_config(page_title="Path Finder", page_icon="🧭", layout="centered")

st.markdown(
    """
    <style>
        .main { background-color: #f8f9fa; }
        .stButton>button { width: 100%; border-radius: 8px; height: 3em; background-color: #4CAF50; color: white; border: none; }
        .stButton>button:hover { background-color: #45a049; border: none; }
        .card {
            background-color: white;
            padding: 2rem;
            border-radius: 15px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.05);
            margin-bottom: 2rem;
        }
        .step-text { font-size: 0.9rem; color: #6c757d; text-transform: uppercase; letter-spacing: 1px; }
    </style>
""",
    unsafe_allow_html=True,
)

# ---------------- GLOBAL STATE ----------------
if "state" not in st.session_state:
    st.session_state.state = {}

if "page" not in st.session_state:
    st.session_state.page = 1

if "agent" not in st.session_state:
    st.session_state.agent = AgentWorkFlow()

if st.session_state.page == 1:
    st.markdown('<div class="card">', unsafe_allow_html=True)
    st.markdown('<p class="step-text">Step 1 of 3</p>', unsafe_allow_html=True)
    st.title("🧭 Path Finder")
    st.subheader("Let's map out your career journey.")

    col1, col2 = st.columns(2)
    with col1:
        name = st.text_input(
            "Full Name",
            placeholder="John Doe",
            value=st.session_state.state.get("user_name", ""),
        )
        education = st.selectbox(
            "Current Education",
            [
                "No prior education",
                "High School",
                "Diploma",
                "Undergraduate",
                "Postgraduate",
                "PhD",
            ],
        )
    with col2:
        field = st.text_input(
            "Desired Field",
            placeholder="e.g. Data Science",
            value=st.session_state.state.get("user_field", ""),
        )
        exp = st.selectbox(
            "Years of Experience",
            [
                "No Experience",
                "Fresher",
                "0-2 years",
                "2-5 years",
                "5-7 years",
                "7+ years",
            ],
        )

    st.markdown("---")

    if st.button("Start with Assessment →"):
        if not name or not field:
            st.error("Please fill in your name and field.")
        else:
            st.session_state.state.update(
                {
                    "user_name": name,
                    "user_field": field,
                    "user_education": education,
                    "user_workexp": exp,
                }
            )
            st.session_state.page = 2
            st.rerun()

    if st.button("Direct Roadmap (No Quiz)", type="secondary"):
        if not name or not field:
            st.warning("Please enter your name and field above before skipping.")
        else:
            st.session_state.state.update(
                {
                    "user_name": name,
                    "user_field": field,
                    "user_education": education,
                    "user_workexp": exp,
                }
            )
            with st.spinner("Our AI is generating your roadmap..."):
                st.session_state.agent._generate_direct_roadmap(st.session_state.state)
                st.session_state.page = 3
                st.rerun()

    st.markdown("</div>", unsafe_allow_html=True)

# ---------------- PAGE 2: ASSESSMENT ----------------

elif st.session_state.page == 2:
    state = st.session_state.state

    st.markdown('<div class="card">', unsafe_allow_html=True)
    st.markdown('<p class="step-text">Step 2 of 3</p>', unsafe_allow_html=True)
    st.title("Skill Assessment")

    with st.expander("👤 Review My Profile"):
        c1, c2, c3 = st.columns(3)
        c1.metric("Field", state["user_field"])
        c2.metric("Education", state["user_education"])
        c3.metric("Experience", state["user_workexp"])

    if "Question" not in state:
        st.info(
            "To generate a personalized roadmap, we need to test your current knowledge in this field."
        )
        if st.button("🚀 Start Skill Quiz"):
            with st.spinner("Generating questions..."):
                st.session_state.agent.Generate_quiz(state)
                state["UserAnswer"] = []
                state["q_idx"] = 0
                st.rerun()

    elif "Question" in state and not state.get("complete"):
        q_idx = state.get("q_idx", 0)
        total_q = len(state["Question"])

        progress = (q_idx) / total_q
        st.progress(progress)
        st.caption(f"Question {q_idx + 1} of {total_q}")

        st.markdown(f"### {state['Question'][q_idx]}")

        selected = st.radio(
            "Choose the best option:", state["AnswerKeys"][q_idx], key=f"q_{q_idx}"
        )

        if st.button("Submit Answer"):
            state["UserAnswer"].append(selected)
            if q_idx + 1 < total_q:
                state["q_idx"] += 1
            else:
                state["complete"] = True
            st.rerun()

    if state.get("complete"):
        st.balloons()
        st.success("Success! Assessment Finished.")
        if st.button("✨ Generate My Roadmap"):
            with st.spinner("Our AI is analyzing your answers...."):
                st.session_state.agent.Quiz_Evalutation(state)
                st.toast("Evaluation Completed")
                with st.spinner("Our AI is generating your roadmap....."):
                    st.session_state.agent.generate_roadmap(state)
                    st.session_state.page = 3
                    st.rerun()

    st.markdown("</div>", unsafe_allow_html=True)

# ---------------- PAGE 3: ROADMAP ----------------

elif st.session_state.page == 3:
    state = st.session_state.state
    st.markdown('<p class="step-text">Final Result</p>', unsafe_allow_html=True)
    st.title("🗺️ Your Personalized Career Path")

    st.markdown('<div class="card">', unsafe_allow_html=True)

    roadmap_content = state.get("roadmap", "No roadmap generated")
    st.markdown(roadmap_content)

    st.markdown("</div>", unsafe_allow_html=True)

    if st.button("🔄 Restart Path Finder"):
        st.session_state.state = {}
        st.session_state.page = 1
        st.rerun()
