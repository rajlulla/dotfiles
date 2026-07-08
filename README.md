# Dotfiles

Lean cross-machine dotfiles managed by chezmoi.

## Bootstrap

On macOS, install Xcode Command Line Tools and Homebrew first:

```bash
xcode-select --install
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

Initialize and apply dotfiles:

```bash
brew install chezmoi
chezmoi init rajlulla
chezmoi apply
brew bundle install --file=~/.local/share/chezmoi/Brewfile
mkdir -p ~/.npm-global
npm config set prefix "$HOME/.npm-global"
uv python install --default
```

## Tracked

- `~/.zshenv`
- `~/.zprofile`
- `~/.zshrc`
- `~/.gitconfig`
- `~/.gitignore_global`
- `~/.config/zed/themes/xCodium.json`
- `~/.claude/CLAUDE.md`
- `~/.codex/AGENTS.md`
- `~/.paseo/config.json`
- `~/.paseo/orchestration-preferences.json`

## Shell layout

- `~/.zshenv`: minimal PATH setup for every zsh invocation, plus optional untracked `~/.zshenv.local` for machine-local env vars and secrets.
- `~/.zprofile`: login-shell Homebrew/Linuxbrew setup only.
- `~/.zshrc`: interactive shell behavior only: prompt and zsh plugins.

`~/.zshenv` includes `~/.npm-global/bin`, `~/.local/bin`, and `~/bin`. Configure npm globals with `npm config set prefix "$HOME/.npm-global"` so global npm CLIs stay user-owned and land on PATH.

Use `~/.zshenv.local` for environment variables that should not be committed, such as local OAuth tokens.

## MCPs and Connectors

Claude and Codex should both have these services available where possible:

- GitHub
- Sentry
- Vercel
- Supabase

Use each tool's strongest available connector or MCP integration. Supabase is configured locally per machine with bearer-token auth for cross-org access. Do not commit Supabase tokens or other MCP credentials.

## Paseo

The tracked `~/.paseo/config.json` is localhost-safe and cross-machine. Machine-specific daemon binding belongs in local environment, not in chezmoi. For example, a VPS can set these in `~/.zshenv.local` or a systemd `EnvironmentFile=`:

```zsh
export PASEO_LISTEN="100.x.y.z:6767"
export PASEO_HOSTNAMES="rajs-vps,100.x.y.z,localhost,.localhost"
```

Keep provider routing and handoff/review preferences in `~/.paseo/orchestration-preferences.json`.

## Brewfile

The Brewfile is intentionally small: core CLI tools and shell plugins. Do not add Claude, Codex, Paseo, Supabase, Docker, or project-specific tools unless they are intentionally Homebrew-managed.

After installing new essentials:

```bash
brew bundle dump --file=~/.local/share/chezmoi/Brewfile --force
```

Then remove anything project-specific before committing.

## Maintenance

After editing a tracked live file, update the source:

```bash
chezmoi re-add ~/.zshenv ~/.zprofile ~/.zshrc
```

Add other changed tracked files to the same command as needed, for example `~/.claude/CLAUDE.md`, `~/.codex/AGENTS.md`, or `~/.paseo/config.json`.

Check drift before commits:

```bash
chezmoi status --path-style absolute
chezmoi diff
```
