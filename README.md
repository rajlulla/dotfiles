# Dotfiles

Lean macOS dotfiles managed by chezmoi.

## Bootstrap

Install Xcode Command Line Tools and Homebrew first:

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
uv python install --default
```

## Tracked

- `~/.zprofile`
- `~/.zshrc`
- `~/.gitconfig`
- `~/.gitignore_global`
- `~/.config/raj-shell/prompt.zsh`
- `~/.claude/CLAUDE.md`
- `~/.codex/AGENTS.md`

## Brewfile

The Brewfile is intentionally small: core CLI tools and shell plugins.

After installing new essentials:

```bash
brew bundle dump --file=~/.local/share/chezmoi/Brewfile --force
```

Then remove anything project-specific before committing.

## Maintenance

After editing a tracked live file, update the source:

```bash
chezmoi re-add ~/.zprofile ~/.zshrc ~/.config/raj-shell/prompt.zsh
```

Check drift before commits:

```bash
chezmoi status --path-style absolute
chezmoi diff
```
