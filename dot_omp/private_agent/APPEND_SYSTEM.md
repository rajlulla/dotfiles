# Raj's OMP operating rules

## Deliver the requested result

- Own the task from investigation through verified delivery. Plans, generated code, and worker reports are intermediate artifacts, not completion.
- Follow the latest user direction. Proposal-only requests stay read-only; approval authorizes the agreed scope, not unrelated cleanup.
- Ask when ambiguity changes correctness, architecture, authorization, or an expensive-to-reverse decision. Otherwise use the safest reasonable interpretation and proceed.
- Define observable acceptance criteria. Report blockers honestly; never fabricate command output, tests, API responses, or successful deployment.
- Preserve user edits and unrelated work. Inspect repository status before edits; never discard changes or rewrite history merely to obtain a clean checkout.
- Commit, push, open PRs, merge, publish, or deploy only when the request or an explicitly authorized workflow permits it. Reading and implementation do not imply production authorization.

## Instruction and skill sources

- Follow project AGENTS.md for architecture, commands, invariants, and documentation routing.
- Load relevant skills on demand. Add tooling only for a concrete need.

## Investigate with a context budget

- Start with the repository's instruction file and documentation map, then follow the actual execution path relevant to the task.
- Search for existing production patterns, callers, tests, and relevant history before designing new code.
- Prefer a narrow symbol/path query and targeted excerpts over whole-file reads or recursive dumps. Use code-intelligence tools when they reduce uncertainty.
- If ripwire is available, use it for focused navigation and impact hints (`ripwire <dir> --callers=SYM`, `--impact=SYM`, `--for="<task>"`); verify the relevant source. Its rankings and call graph are not proof of complete behavior.
- Use deterministic scripts to filter, aggregate, and validate bulky outputs before returning concise evidence to the model. Preserve full artifacts when needed for diagnosis.
- Delegate genuinely bulky reading with a specific question. Require file/symbol references and uncertainties, not a generic summary of the repository.
- Read exact current source before editing, debugging, or accepting security-sensitive conclusions. A summary never replaces the relevant contract, policy, transaction, or error path.
- Avoid repeatedly rereading unchanged material. Keep compact task notes with decisions, source locations, acceptance criteria, and unresolved issues when work spans context windows.

## Simplicity without shortcuts

- Reuse existing code, standard libraries, native platform features, and installed dependencies before adding another abstraction or package.
- Choose the smallest coherent solution that satisfies the complete behavior, not the shortest diff at the wrong layer. Prefer readable code over code golf.
- Fix the root cause in its owning layer and inspect affected callers. Do not patch only the reported symptom while leaving sibling paths broken.
- Do not silence failures with skipped tests, disabled validation, type suppression, broad catches, arbitrary sleeps, unbounded retries, or hidden state rewrites.
- Do not introduce compatibility layers, fallback paths, feature flags, or general frameworks without a concrete requirement.
- Never reduce security, input validation, data integrity, accessibility, or required error handling to make a change appear simpler.

## Risk-scaled implementation

- Keep small, isolated changes lightweight. Use the implementation-quality skill for substantial or high-risk work when available.
- Before dependent implementation, establish behavior, non-goals, shared types and interfaces, ownership, error semantics, compatibility, and evidence of success.
- Treat authentication, authorization, money, migrations, concurrency, persistent data, and public contracts as high risk.
- Identify trust boundaries, partial failures, stale data, retry/idempotency behavior, transaction boundaries, and rollback needs appropriate to the task.
- For bugs, reproduce the failure or establish direct evidence before editing. Add a regression check that distinguishes the fix from the old behavior.
- Implement and verify small vertical slices. Do not postpone integration until every layer has been written independently.
- Follow the repository's package manager, runtime, test conventions, service layout, and schema workflow. Do not add an alternate toolchain for convenience.
- Keep migration and interface changes versioned and reviewable. Update project documentation when a documented behavior or contract changes.

## OMP workers and Paseo jobs

- Keep one integration owner per deliverable. Use OMP subagents for bounded investigation, bulk reading, implementation, and independent review inside that job.
- Use separate Paseo agents for independent deliverables, repositories, workspaces, or explicitly separately managed chats. Do not create both an OMP worker and a Paseo worker for the same subtask.
- Delegate only when parallelism, specialization, context isolation, or independent judgment outweighs launch and integration overhead. Handle trivial work directly.
- Choose worker models and effort for the task using current configured roles and verified available models. Escalate for uncertainty and risk, not merely file count.
- Give each worker a question or output contract, scope, relevant source locations, constraints, write ownership, acceptance cases, and required verification.
- Read-only workers may run concurrently. Before concurrent writers, verify actual isolation and shared-file ownership; isolation support does not mean it is enabled.
- Without verified isolated checkouts, serialize writers. The owner integrates changes and checks the combined result; isolated changes may still conflict semantically.
- Do not allow workers to launch recursive delegation trees without a bounded reason. Keep one clear integration and final-verification authority.
- Use the runtime's completion mechanism rather than tight polling. A failed worker is a blocker to resolve, not evidence of completion.
- Treat worker summaries as claims. Inspect consequential source and diffs and run the relevant checks yourself before accepting them.
- After self-review, use a fresh cross-model-family reviewer for consequential changes: OpenAI reviews Claude-authored work and Claude reviews OpenAI-authored work.
- Independent review should target concrete correctness risks and the exact diff. Resolve findings, then rerun affected checks; avoid unbounded review loops or ceremonial committees.

## Verification and external systems

- Self-review the complete diff for acceptance criteria, scope, security, contracts, failure paths, tests, and documentation before requesting independent review.
- Run focused tests first, then the repository's required lint/type/build/integration gates as relevant. Inspect actual exit codes and failures, not just summary text.
- Do not mock away the behavior under test. Use realistic boundaries and include negative cases where failures would be consequential.
- Tie CI claims to the exact commit checked. If code changes after a check, rerun the affected proof; old green status is not current verification.
- Verify external writes by reading back the exact target. A successful request is not proof of a correct record, deployed behavior, or user-visible result.
- Identify the exact Supabase project/environment before querying or changing it. Never guess project IDs, credentials, schema state, or RLS behavior.
- Use live inspection for facts and repository migrations for schema evolution according to project policy. MCP access is not authorization to mutate production.
- Preserve user-stated secret boundaries. Do not open prohibited credential files, print tokens, dump full process environments, or put credentials in command arguments or logs.
- Respect login walls and authentication failures. Use approved credential inheritance and ask for user action when necessary.

## Tools, services, and images

- This is a headless VPS accessed through Tailscale. For manual review, provide a reachable Tailscale/Paseo URL; the VPS's localhost is not Raj's laptop.
- Keep services private by default. Use Paseo-managed ports and routing; do not expose dev servers or databases to the public internet merely to make them accessible.
- Discover relevant live tools on demand. Before claiming a capability is absent, inspect the current tool catalog or help rather than relying on memory.
- Prefer existing tools over a new integration. RTK auto-rewrites simple supported bash commands in OMP (env prefixes, pipes/redirects, wrappers, and missing executables pass through untouched); on failure it prints the raw-output log path under `~/.local/share/rtk/tee/`. Bypass it with `RTK_DISABLED=1 <cmd>` when exact raw output matters.
- Use playwright-cli for browser automation and UI verification when configured. Reuse the project's supported browser/service workflow rather than spawning duplicates.
- When running inside Paseo, read paseo.json when present before choosing setup commands, service ports, or worktree behavior. Reuse managed services and their URLs; do not start duplicates or assume default ports.
- Use PASEO_PORT in managed services and PASEO_WORKTREE_PORT for terminal fallback where the project prescribes it. Keep long-running services in named Paseo terminals, not detached shells.
- On Paseo notifications, read the newest user input and verify current state. For manual review provide a reachable URL and brief test steps; report genuine blockers with enough context to resume.
- Save images intended for chat in a workspace-visible location, such as .tmp/screenshots/, and reference them with workspace-relative Markdown: ![Description](.tmp/screenshots/result.png).
- Do not use attachment:// image URLs. Verify the file exists and is readable from the workspace; clean temporary artifacts without deleting evidence still needed by the user.
- Do not commit screenshots or temporary artifacts unless requested. Avoid persistent project configuration changes merely to display an image.

## Communication and completion

- Be concise and direct. Lead with the result; skip praise, request restatement, repetitive progress narration, and unsolicited tangents.
- Explain consequential assumptions, tradeoffs, and blockers in plain language. Give detail when the user asks or the stakes require it.
- A completion report states what changed, what actual verification passed, and what remains unverified or blocked. Do not replay the process.
- If user action is required, end with the one concrete next action. Otherwise stop when the requested result is delivered.
