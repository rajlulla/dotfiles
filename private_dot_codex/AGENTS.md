# The Standard

Do the whole thing. Do it right. Search before building. Test before shipping. Prefer the permanent fix over a workaround when the real fix is within reach. The answer should be the finished product, not a plan to build it.

Completeness means fully solving the requested task, including tests and documentation when they matter. It does not mean expanding scope, inventing features, or polishing unrelated code.

---

# Working Relationship

Ask questions early when the answer materially changes the work. Surface assumptions, tradeoffs, and major implementation choices before they become expensive. Keep the user looped into meaningful direction changes, blockers, and decisions; for small obvious steps, proceed without ceremony.

---

# CLI Output

Do not run `tail` in CLI commands.

---

# No Band-Aids

When something does not work, find why and fix the cause. Never:

- Bypass safety checks (`--no-verify`, disabling lints, skipping tests, suppressing type errors with `as any` / `# type: ignore` / `@ts-expect-error` / `@SuppressWarnings`)
- Wrap a real bug in try/catch to make the symptom disappear
- Hardcode the value that is failing instead of fixing what computed it wrong
- Comment out / `.skip` the test that started failing
- Use `setTimeout` / `sleep` / arbitrary retries to mask a race condition instead of resolving the ordering
- Delete or rewrite state to "make the error go away" when investigation would explain what produced the bad state

If the real fix is genuinely out of scope, say so explicitly. Do not ship a workaround silently.

---

# Strongest Primitive

Use the strongest named boundary or platform primitive the project already provides. Expose app operations, not raw infrastructure details, when there are domain rules, authorization checks, validation, workflows, cache/revalidation behavior, transactions, batching opportunities, or performance-sensitive composition.

- Versioned migrations over ad-hoc schema edits
- Infrastructure-as-code over console clicks
- Typed API/RPC/server-function boundaries over raw client-side storage queries
- Generated SDK clients or typed contracts over hand-built payloads
- Transactions, workflows, or queues over fragile chains of independent calls
- Framework cache/revalidation APIs over manual refresh logic
- Design-system components over one-off UI primitives when the system exists
- Batch or native platform APIs over manual orchestration

The point is to avoid drift, mixed error models, duplicated validation, partial failure, and slow multi-round-trip flows. If a weaker path already exists, flag it as debt; do not add another one.

---

# Andrej Karpathy's 4 Rules

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.

---

# Code Standards

Use idiomatic naming for the language. Prefer strong types and generated types. Avoid `any`, un-narrowed `unknown`, untyped payloads, and implicit returns when the language/tooling can prevent them.

---

# Parallel Research and Worker Chats

For large tasks that naturally split into independent workstreams, use the strongest parallelization available.

If the runtime supports subagents or native workflow orchestration, use that for coordinated research, investigation, test planning, or implementation review. Keep one agent as the orchestrator: define the goal, assign bounded worker scopes, reconcile conflicts, and produce the final answer.

If subagents are unavailable or not the right fit, simulate the pattern with exact copy/paste prompts for separate worker chats. Each worker prompt should include the shared goal, narrow scope, files/docs to inspect, constraints, and required final report format. Tell the user whether to run the worker chats sequentially or in parallel, then use the pasted reports to decide the final plan or implementation.

Use this for complex, broad, or high-uncertainty tasks. Do not use it for simple changes where normal search, parallel tool calls, and direct implementation are faster.

---

# Environment

- **Python:** Use `uv` (`uv add`, `uv run`, `uv sync`, `uv init`) instead of `pip install` or `python -m venv`. Install Python versions with `uv python install`.
- **Node:** Use the official installer first, then Homebrew if the official installer is not a good fit. Do not suggest `nvm`, `mise`, or `fnm`.
- **Docker:** Treat Docker as Linux/VPS-only. Do not configure or assume Docker on macOS.
- **Browser:** Use `playwright-cli` for all browser work (automation, verification, screenshots) — see the playwright-cli skill.
- **Dotfiles:** Dotfiles are managed by chezmoi. Source repo: `~/.local/share/chezmoi/`. When modifying any tracked dotfile (`.zprofile`, `.gitconfig`, `~/.codex/`, etc.), surface `chezmoi re-add <path>` so source stays in sync.

---

# Headless VPS (rajs-vps)

When on rajs-vps: headless, on Tailscale (`100.68.56.124`). Anything meant for human eyes — dev servers, demos, dashboards — binds 0.0.0.0 and gets reported as `http://100.68.56.124:<port>` proactively, without being asked. Localhost URLs are for agent-side verification only.

---

# npm workspaces

Never run bare `npm install <pkg>` from a subdirectory of a workspaces monorepo — npm may target the ROOT manifest. Use `npm install <pkg> -w <workspace>` from the repo root (this includes tools that wrap npm, like `npx expo install`), and check `git status` afterward to confirm only the intended manifests changed.

---

# RTK - Rust Token Killer

Prefix shell commands with `rtk`.

Examples:

```bash
rtk git status
rtk cargo test
rtk npm run build
rtk pytest -q
```

Useful meta commands:

```bash
rtk gain
rtk gain --history
rtk proxy <cmd>
```

Verification:

```bash
rtk --version
rtk gain
which rtk
```
