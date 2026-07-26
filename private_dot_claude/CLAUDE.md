# The Standard

Do the whole thing. Do it right. Search before building. Test before shipping. Prefer the permanent fix over a workaround when the real fix is within reach. Deliver the finished product, not a plan to build it.

Completeness means fully solving the requested task, including tests and documentation when they matter. It does not mean expanding scope, inventing features, or polishing unrelated code.

# Response Style

Be concise and direct. Lead with the result, skip restating the request and routine play-by-play, use short bullets when useful, and explain reasoning only for consequential tradeoffs, blockers, or when asked.

---

# Working Relationship

Surface consequential assumptions, tradeoffs, and major implementation choices before they become expensive. Ask only when ambiguity materially changes the implementation; otherwise choose the safest reasonable interpretation and proceed. Keep the user informed about meaningful direction changes, blockers, and decisions, not small obvious steps.

---

# Environment

- **Host and Docker:** Most development runs on Linux/VPS, but these instructions are shared with macOS. Detect the current host before acting. Docker may be used only on Linux/VPS; never install, configure, or run Docker on macOS.
- **Python:** Use `uv` (`uv add`, `uv run`, `uv sync`, `uv init`) instead of bare `pip install` or manually creating virtual environments. Install Python versions with `uv python install`.
- **Node:** Use the project's declared package manager and the existing Node installation. If Node must be installed, use an official distribution or the host's appropriate package source. Do not introduce `nvm`, `mise`, or `fnm` unless requested.
- **Services:** On Linux/VPS, account for headless operation and systemd/user services when applicable. On macOS, use the project's existing native launch mechanism; do not assume systemd.
- **Browser:** Use `playwright-cli` for browser automation, verification, and screenshots when available. Do not assume a visible desktop browser on Linux/VPS.
- **Dotfiles:** Dotfiles are managed by chezmoi at `~/.local/share/chezmoi/`. When editing an applied destination file, use `chezmoi re-add`; when editing the source directly, use `chezmoi apply`. Verify the resulting diff.

---

# Engineering Principles

## Root Causes, Not Band-Aids

Find and fix the cause. Do not use disabled checks, suppressed errors, skipped tests, arbitrary retries or sleeps, hardcoded failing values, broad exception handling, or state rewrites merely to hide a defect. When an exception is genuinely required at a system boundary, narrowly scope it and document why.

## Strongest Primitive

Use the strongest named boundary or platform primitive the project already provides. Prefer versioned migrations over ad-hoc schema edits, typed contracts over hand-built payloads, transactions or workflows over fragile chains, framework cache APIs over manual refresh logic, design-system components over one-offs, and native batch APIs over manual orchestration. Avoid duplicated validation, mixed error models, partial failure, and unnecessary round trips.

## Simplicity and Scope

Implement the minimum complete solution. Do not add speculative features or abstractions, refactor unrelated code, or silently clean up pre-existing issues. Match the existing style. Remove only the orphaned code created by your own changes, and mention unrelated debt rather than expanding scope.

## Verification

Define verifiable success criteria and loop until they pass. Reproduce bugs with tests when practical, add focused regression coverage, and run the relevant checks before and after consequential refactors. For non-trivial multi-step work, maintain a brief plan, but surface it only when it helps coordination or exposes a decision.

---

# Code Standards

Use idiomatic naming for the language. Prefer strong and generated types. Avoid `any`, un-narrowed `unknown`, untyped payloads, and implicit returns when the language and tooling can prevent them.
