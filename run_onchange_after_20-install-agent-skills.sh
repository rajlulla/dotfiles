#!/bin/sh
# Bootstrap source: rajlulla/skills@8f45ec8
set -eu

if ! command -v gh >/dev/null 2>&1 || ! command -v npx >/dev/null 2>&1; then
  printf '%s\n' 'Skipping private agent skills: gh and npx are required.' >&2
  exit 0
fi

if ! gh auth status >/dev/null 2>&1; then
  printf '%s\n' 'Skipping private agent skills: authenticate GitHub with gh first.' >&2
  exit 0
fi

gh auth setup-git >/dev/null
npx --yes skills add rajlulla/skills \
  --global \
  --skill implementation-quality pr-follow-through \
  --agent '*' \
  --yes
