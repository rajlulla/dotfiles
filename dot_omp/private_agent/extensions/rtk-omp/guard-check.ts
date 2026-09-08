// Runnable check for guard.ts. Run: node ~/.omp/agent/extensions/rtk-omp/guard-check.ts
// (Node ≥ 22.6 strips types; also runs under bun.) Not an extension entry: the loader only
// picks index.ts from this directory.
import assert from "node:assert/strict"
import { decide } from "./guard.ts"

const onPath: Record<string, true> = { git: true, cat: true, wc: true, ls: true, uv: true, bun: true }
const which = (name: string) => (onPath[name] ? `/fake/bin/${name}` : null)

const cases: Array<[string, string | null, boolean, string?]> = [
  // apply: plain prefix insertion on resolvable bare names
  ["git status", "rtk git status", true],
  ["git status && git log -3", "rtk git status && rtk git log -3", true],
  ["cd /tmp && git status", "cd /tmp && rtk git status", true],
  ["git status || true", "rtk git status || true", true],
  ['git commit -m "a && b"', 'rtk git commit -m "a && b"', true],
  ["cat foo.txt", "rtk read foo.txt", false, "not a plain prefix insertion"], // rtk renames the verb
  // refuse: env / PATH overrides
  ["PATH=/usr/bin git status", "PATH=/usr/bin rtk git status", false, "leading env assignment"],
  // refuse: an unchanged earlier segment mutates shell state for later ones (review finding)
  ["export PATH=/usr/bin; git status --short", "export PATH=/usr/bin; rtk git status --short", false, "shell-state-changing builtin: export"],
  ["source ./env.sh && git status", "source ./env.sh && rtk git status", false, "shell-state-changing builtin: source"],
  [". ./env.sh && git status", ". ./env.sh && rtk git status", false, "shell-state-changing builtin"],
  ["FOO=1; git status", "FOO=1; rtk git status", false, "leading env assignment"],
  ["eval \"$X\" && git status", "eval \"$X\" && rtk git status", false, "ambiguous shell form"],
  ["cd /x && FOO=1 git status", "cd /x && FOO=1 rtk git status", false, "leading env assignment"],
  // refuse: underlying executable missing → raw shell yields 127
  ["pytest -q", "rtk pytest -q", false, "underlying executable not on PATH"],
  // refuse: path-spelled or wrapped executables
  ["./gradlew build", "rtk gradlew build", false, "not a plain prefix insertion"],
  ["sudo git status", "sudo rtk git status", false, "not a plain prefix insertion"],
  ["uv run pytest -q", "uv run rtk pytest -q", false, "not a plain prefix insertion"],
  // refuse: ambiguous shell forms
  ["git status 2>&1", "rtk git status 2>&1", false, "ambiguous shell form"],
  ["git status > out.txt", "rtk git status > out.txt", false, "ambiguous shell form"],
  ["git log | head", "rtk git log | head", false, "ambiguous shell form"],
  ["git status &", "rtk git status &", false, "ambiguous shell form"],
  ["git show $(git rev-parse HEAD)", "rtk git show $(git rev-parse HEAD)", false, "ambiguous shell form"],
  ["git status\ngit log", "rtk git status\nrtk git log", false, "ambiguous shell form"],
  // refuse: structural drift in the rewrite
  ["git status; git log", "rtk git status && rtk git log", false, "changed command structure"],
  // no-op
  ["echo hi", null, false, "no rewrite"],
  ["git status", "git status", false, "no rewrite"],
]

let failures = 0
for (const [original, rewritten, expectApply, reasonPart] of cases) {
  const d = decide({ original, rewritten, which })
  try {
    assert.equal(d.apply, expectApply, `apply mismatch for ${JSON.stringify(original)}: ${JSON.stringify(d)}`)
    if (!d.apply && reasonPart) assert.match(d.reason, new RegExp(reasonPart))
    if (d.apply) assert.equal(d.command, rewritten)
  } catch (e) {
    failures++
    console.error("FAIL", e instanceof Error ? e.message : e)
  }
}

// tool-level env override of PATH refuses even a perfect rewrite
const envCase = decide({ original: "git status", rewritten: "rtk git status", env: { PATH: "/usr/bin" }, which })
assert.equal(envCase.apply, false)
const envOk = decide({ original: "git status", rewritten: "rtk git status", env: { FOO: "1" }, which })
assert.equal(envOk.apply, true)

console.log(failures === 0 ? `ok — ${cases.length + 2} cases` : `${failures} failure(s)`)
process.exit(failures === 0 ? 0 : 1)
