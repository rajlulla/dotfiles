// RTK ↔ OMP bash rewrite with a conservative guard.
//
// Derived from upstream rtk-ai/rtk hooks/pi/rtk.ts (Apache-2.0). `rtk rewrite` remains the
// single source of truth for *what* a command rewrites to; `guard.ts` decides whether that
// rewrite is safe to apply. Refused rewrites run the original command unchanged, preserving
// its semantics and exit code (including 127 for a missing executable).
//
// Exit code contract for `rtk rewrite`: 0/3 + stdout → candidate rewrite; 1 → none.

import type {
  BashToolCallEvent,
  ExtensionAPI,
  ToolCallEvent,
} from "@oh-my-pi/pi-coding-agent"
import { decide } from "./guard"

const REWRITE_TIMEOUT_MS = 2_000
const MIN_SUPPORTED_RTK_MINOR = 23

function isBashToolCallEvent(event: ToolCallEvent): event is BashToolCallEvent {
  return event.toolName === "bash"
}

export default async function (pi: ExtensionAPI) {
  const ver = await pi.exec("rtk", ["--version"], { timeout: REWRITE_TIMEOUT_MS })
  if (ver.code !== 0) {
    console.warn("[rtk-omp] rtk binary not found in PATH — extension disabled")
    return
  }
  const m = ver.stdout.match(/(\d+)\.(\d+)\.(\d+)/)
  if (m && Number(m[1]) === 0 && Number(m[2]) < MIN_SUPPORTED_RTK_MINOR) {
    console.warn(`[rtk-omp] rtk ${ver.stdout.trim()} is too old (need >= 0.23.0) — extension disabled`)
    return
  }

  pi.on("tool_call", async (event) => {
    try {
      if (!isBashToolCallEvent(event)) return
      const original = event.input.command
      if (typeof original !== "string" || original.trim() === "") return
      if (original.startsWith("rtk ")) return
      if (process.env.RTK_DISABLED === "1") return

      const result = await pi.exec("rtk", ["rewrite", original], { timeout: REWRITE_TIMEOUT_MS })
      const rewritten =
        !result.killed && (result.code === 0 || result.code === 3) ? result.stdout.trim() || null : null

      const env =
        "env" in event.input && event.input.env && typeof event.input.env === "object"
          ? (event.input.env as Record<string, unknown>) // bash tool env: string map, validated by the tool
          : null
      const decision = decide({
        original,
        rewritten,
        env,
        which: (name) => Bun.which(name),
      })
      if (decision.apply) {
        event.input.command = decision.command
        return { input: event.input }
      }
    } catch (err) {
      // Fail open: never block execution on an unexpected error.
      console.warn("[rtk-omp] unexpected error in tool_call handler; passing through command", err)
    }
  })
}
