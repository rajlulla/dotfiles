// Pure decision logic for the RTK ↔ OMP bash rewrite guard. No I/O; `which` is injected.
//
// `rtk rewrite` stays the rewrite oracle. This guard only decides whether a proposed
// rewrite is safe to apply. Anything ambiguous passes through unchanged, so the
// original command runs with its original semantics and exit code.

export type Decision =
  | { apply: true; command: string }
  | { apply: false; reason: string }

export interface GuardInput {
  original: string
  rewritten: string | null
  /** Structured env overrides from the bash tool call (`event.input.env`). */
  env?: Record<string, unknown> | null
  /** Resolves a bare executable name on the session PATH; null when absent. */
  which: (name: string) => string | null
}

// substitutions, grouping, backgrounding, newlines. `&&`/`||` are fine; a lone `&`/`|` is not.
const AMBIGUOUS = /[<>$`(){}\n]|(?<!&)&(?!&)|(?<!\|)\|(?!\|)/

// Leading `NAME=value` assignment on the whole command or any segment (PATH=… git …).
const ENV_PREFIX = /^\s*[A-Za-z_][A-Za-z0-9_]*=/

// Bare executable name: no path separators, no assignment, nothing shell-special.
const BARE_NAME = /^[A-Za-z0-9_.+-]+$/

const SEGMENT_SPLIT = /&&|\|\||;/

// Builtins that change shell state for later segments (PATH, aliases, functions, fds).
// Any segment starting with one of these — rewritten or not — refuses the whole command.
const STATE_CHANGING: Record<string, true> = {
  export: true, source: true, ".": true, eval: true, exec: true, set: true, unset: true,
  declare: true, typeset: true, local: true, readonly: true, alias: true, unalias: true,
  hash: true, enable: true, shopt: true, trap: true, ulimit: true, umask: true,
}

export function decide(input: GuardInput): Decision {
  const { original, rewritten, which } = input
  if (rewritten === null || rewritten.trim() === "" || rewritten === original) {
    return { apply: false, reason: "no rewrite" }
  }
  if (input.env && Object.prototype.hasOwnProperty.call(input.env, "PATH")) {
    return { apply: false, reason: "tool env overrides PATH" }
  }
  if (AMBIGUOUS.test(original)) {
    return { apply: false, reason: "ambiguous shell form" }
  }
  if (ENV_PREFIX.test(original)) {
    return { apply: false, reason: "leading env assignment" }
  }

  const origSegs = original.split(SEGMENT_SPLIT)
  const newSegs = rewritten.split(SEGMENT_SPLIT)
  if (origSegs.length !== newSegs.length) {
    return { apply: false, reason: "rewrite changed command structure" }
  }
  // The joiners themselves must be untouched.
  const origJoiners = original.match(/&&|\|\||;/g) ?? []
  const newJoiners = rewritten.match(/&&|\|\||;/g) ?? []
  if (origJoiners.join("\u0000") !== newJoiners.join("\u0000")) {
    return { apply: false, reason: "rewrite changed command structure" }
  }

  for (let i = 0; i < origSegs.length; i++) {
    const o = origSegs[i]
    const n = newSegs[i]
    const word = o.trim().split(/\s+/, 1)[0] ?? ""
    if (ENV_PREFIX.test(o)) {
      return { apply: false, reason: "leading env assignment" }
    }
    if (STATE_CHANGING[word]) {
      return { apply: false, reason: `shell-state-changing builtin: ${word}` }
    }
    if (o === n) continue
    // Only accept `rtk ` inserted immediately before the segment's first word.
    const lead = o.match(/^\s*/)?.[0] ?? ""
    const body = o.slice(lead.length)
    if (n !== `${lead}rtk ${body}`) {
      return { apply: false, reason: "rewrite is not a plain prefix insertion" }
    }
    if (!BARE_NAME.test(word)) {
      return { apply: false, reason: `not a bare executable name: ${word}` }
    }
    if (which(word) === null) {
      return { apply: false, reason: `underlying executable not on PATH: ${word}` }
    }
  }
  return { apply: true, command: rewritten }
}
