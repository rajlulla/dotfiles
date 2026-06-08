#!/bin/bash
# Non-blocking on purpose: a download hiccup must not stop the session from starting.

# The live source lives in the dotfiles repo. Use HEAD so this follows the
# repository default branch if it ever changes.
CLAUDE_MD_URL="https://raw.githubusercontent.com/rajlulla/dotfiles/HEAD/dot_claude/CLAUDE.md"

# The setup phase injects a malformed proxy var that breaks curl; clear it so
# GitHub downloads route transparently the way they do in a normal session.
unset HTTP_PROXY HTTPS_PROXY ALL_PROXY http_proxy https_proxy all_proxy

# 1. Install the universal CLAUDE.md from the live git source.
mkdir -p /root/.claude
if curl -fsSL --noproxy '*' --retry 3 --retry-delay 2 \
     -o /tmp/CLAUDE.md \
     "$CLAUDE_MD_URL"; then
  install -m 644 /tmp/CLAUDE.md /root/.claude/CLAUDE.md
  echo "CLAUDE.md installed from ${CLAUDE_MD_URL}"
else
  echo "WARN: CLAUDE.md download failed; writing minimal fallback"
  cat > /root/.claude/CLAUDE.md <<'CLAUDE_MD_EOF'
# The Standard

Do the whole thing. Do it right. Search before building. Test before shipping.
CLAUDE_MD_EOF
fi

# 2. Docker daemon. Some cloud containers include Docker but do not start
# dockerd, which leaves /var/run/docker.sock missing until we start it.
if command -v docker >/dev/null 2>&1; then
  if docker info >/dev/null 2>&1; then
    echo "docker daemon ready"
  elif command -v dockerd >/dev/null 2>&1; then
    mkdir -p /var/run
    if ! pgrep -x dockerd >/dev/null 2>&1; then
      nohup dockerd >/tmp/dockerd.log 2>&1 &
      echo "dockerd starting; logs: /tmp/dockerd.log"
    fi

    DOCKER_READY=0
    for _ in 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30; do
      if docker info >/dev/null 2>&1; then
        DOCKER_READY=1
        break
      fi
      sleep 1
    done

    if [ "$DOCKER_READY" = "1" ]; then
      echo "docker daemon ready"
    else
      echo "WARN: dockerd did not become ready; see /tmp/dockerd.log"
    fi
  else
    echo "WARN: docker client is installed but dockerd is unavailable"
  fi
else
  echo "WARN: docker is not installed; Docker-backed tests will be unavailable"
fi

# 3. Supabase CLI (GitHub release binary).
SUPA_VERSION=2.105.0
if ! command -v supabase >/dev/null 2>&1; then
  if curl -fsSL --noproxy '*' --retry 3 --retry-delay 2 \
       -o /tmp/supabase.tar.gz \
       "https://github.com/supabase/cli/releases/download/v${SUPA_VERSION}/supabase_linux_amd64.tar.gz"; then
    tar -xzf /tmp/supabase.tar.gz -C /tmp
    install -m 755 /tmp/supabase /usr/local/bin/supabase
    echo "supabase installed: $(supabase --version)"
  else
    echo "WARN: supabase download failed; session starting without it"
  fi
fi
