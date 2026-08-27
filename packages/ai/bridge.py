"""JSON stdin/stdout bridge for the existing Pathfinder AI workflow."""

from __future__ import annotations

import json
import sys
from contextlib import redirect_stdout
from typing import Any

def _run(action: str, state: dict[str, Any]) -> dict[str, Any]:
    from packages.ai.agents.Agent import AgentWorkFlow

    workflow = AgentWorkFlow()
    actions: dict[str, Callable[[dict[str, Any]], dict[str, Any]]] = {
        "generate_quiz": workflow.Generate_quiz,
        "evaluate_quiz": workflow.Quiz_Evalutation,
        "generate_roadmap": workflow.generate_roadmap,
        "direct_roadmap": workflow._generate_direct_roadmap,
    }
    if action not in actions:
        raise ValueError(f"Unknown action: {action}")
    return actions[action](state)


def main() -> int:
    try:
        action = sys.argv[1] if len(sys.argv) == 2 else ""
        if not action:
            raise ValueError("Usage: python -m packages.ai.bridge <action>")
        payload = json.load(sys.stdin)
        if not isinstance(payload, dict):
            raise ValueError("stdin must contain a JSON object")
        # Keep stdout machine-readable even if a dependency emits diagnostics.
        with redirect_stdout(sys.stderr):
            result = _run(action, payload)
        print(json.dumps(result, default=str))
        return 0
    except Exception as exc:
        print(json.dumps({"error": str(exc)}))
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
