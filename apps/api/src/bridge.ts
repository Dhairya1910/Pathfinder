import { spawn } from "node:child_process";
import type { WorkflowState } from "./types.js";

interface BridgeResult {
  state?: WorkflowState;
  error?: string;
  stderr: string;
  exitCode: number | null;
}

export function callBridge(action: string, state: WorkflowState): Promise<BridgeResult> {
  const commandParts = (process.env.PYTHON_CMD || "uv run python").trim().split(/\s+/);
  const [command, ...commandArgs] = commandParts;
  return new Promise((resolve) => {
    const child = spawn(command, [...commandArgs, "-m", "packages.ai.bridge", action], {
      cwd: process.cwd(),
      env: { ...process.env, MISTRAL_API_KEY: process.env.MISTRAL_API_KEY || "" },
    });
    child.stdin.write(JSON.stringify(state));
    child.stdin.end();
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk: Buffer) => {
      stdout += chunk.toString();
    });
    child.stderr.on("data", (chunk: Buffer) => {
      stderr += chunk.toString();
    });
    child.on("error", (error: Error) => resolve({ error: error.message, stderr, exitCode: null }));
    child.on("close", (exitCode) => {
      try {
        const parsed: unknown = JSON.parse(stdout);
        if (typeof parsed === "object" && parsed !== null && "error" in parsed) {
          const error = (parsed as { error?: unknown }).error;
          resolve({
            error: typeof error === "string" ? error : "Python bridge failed",
            stderr,
            exitCode,
          });
        } else {
          resolve({ state: parsed as WorkflowState, stderr, exitCode });
        }
      } catch {
        resolve({ error: "Python bridge returned invalid JSON", stderr, exitCode });
      }
    });
  });
}
