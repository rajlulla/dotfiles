# Mac Mini Fresh Setup

Reference for reproducing this setup on a new Mac. The chezmoi repo
(`rajlulla/dotfiles`) is the source of truth — most of this is captured
automatically once chezmoi is bootstrapped.

---

## GUI apps (manual install)

- Firefox
- Loopback
- Logi Options+
- GitHub Desktop
- Claude desktop app

---

## Command line setup

### 1. Xcode Command Line Tools

```bash
xcode-select --install
```

Required for compilers, headers, and Homebrew itself.

### 2. Homebrew

Install via the official script at https://brew.sh, then run the three
lines it prompts at the end:

```bash
echo >> ~/.zprofile
echo 'eval "$(/opt/homebrew/bin/brew shellenv zsh)"' >> ~/.zprofile
eval "$(/opt/homebrew/bin/brew shellenv zsh)"
```

These add `/opt/homebrew/bin` to PATH for future shells (`.zprofile`)
and the current shell (the `eval`).

### 3. Set git identity

Required before any chezmoi/git commits work on a fresh machine:

```bash
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
git config --global init.defaultBranch main
```

### 4. Global gitignore

Save the headache of `.DS_Store` clutter in every repo:

```bash
git config --global core.excludesfile ~/.gitignore_global
echo '.DS_Store' >> ~/.gitignore_global
```

### 5. Core brew packages

```bash
brew install git uv node chezmoi gh
```

- `git` — newer than Apple's bundled version
- `uv` — Python version + project manager
- `node` — JavaScript runtime
- `chezmoi` — dotfiles manager
- `gh` — GitHub CLI

### 6. Python via uv

```bash
uv python install --default
```

The `--default` flag creates `python` and `python3` symlinks in
`~/.local/bin`. Without it, only version-specific binaries are created
(e.g. `python3.14`).

### 7. PATH fix for `python3`

After `uv python install --default`, `python` resolves correctly but
`python3` still points to the system Python 3.9.6 because `/usr/bin`
comes before `~/.local/bin` in PATH. Fix by prepending explicitly:

```bash
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zprofile
```

Restart terminal, then verify:

```bash
which python3      # /Users/rajlulla/.local/bin/python3
python3 -V         # matches uv-installed version
```

### 8. Chezmoi initialization

If pulling from existing dotfiles repo:

```bash
chezmoi init rajlulla
chezmoi diff      # preview what would change
chezmoi apply
```

If setting up the source repo from scratch:

```bash
chezmoi init
chezmoi add ~/.zprofile
chezmoi add ~/.gitconfig
chezmoi add ~/.gitignore_global
chezmoi add ~/.claude/CLAUDE.md
```

### 9. Block `.DS_Store` files in chezmoi

`chezmoi add` on a directory grabs `.DS_Store` files. Block them:

```bash
echo '.DS_Store' >> ~/.local/share/chezmoi/.chezmoiignore
echo '.DS_Store' >> ~/.local/share/chezmoi/.gitignore
find ~/.local/share/chezmoi -name "dot_DS_Store" -delete
```

### 10. Brewfile in chezmoi repo

Capture brew packages in a Brewfile that lives in the chezmoi repo
but isn't applied to home directory:

```bash
brew bundle dump --file=~/.local/share/chezmoi/Brewfile --force
echo 'Brewfile' >> ~/.local/share/chezmoi/.chezmoiignore
```

Re-run the dump command after installing new brew packages.

### 11. Push chezmoi repo to GitHub

```bash
gh auth login
chezmoi cd
git add .
git commit -m "initial dotfiles setup"
gh repo create dotfiles --public --source=. --push
```

Repo name `dotfiles` is the chezmoi convention — `chezmoi init rajlulla`
auto-resolves to `https://github.com/rajlulla/dotfiles`.

### 12. Playwright (NOT chezmoi-tracked)

Globally installed npm packages aren't captured anywhere automatic.
Re-run manually on each new machine:

```bash
npm install -g @playwright/cli@latest
playwright-cli install --skills
```

---

## Bootstrap on future fresh machine

Minimal sequence to reproduce everything:

```bash
# 1. Xcode CLT
xcode-select --install

# 2. Homebrew (run the install script from brew.sh)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
echo >> ~/.zprofile
echo 'eval "$(/opt/homebrew/bin/brew shellenv zsh)"' >> ~/.zprofile
eval "$(/opt/homebrew/bin/brew shellenv zsh)"

# 3. Git identity (needed for chezmoi to commit)
git config --global user.name "Your Name"
git config --global user.email "you@example.com"

# 4. Pull dotfiles
brew install chezmoi
chezmoi init rajlulla
chezmoi apply

# 5. Install all brew packages from the Brewfile
brew bundle install --file=~/.local/share/chezmoi/Brewfile

# 6. Python
uv python install --default

# 7. Restart terminal

# 8. Global npm tools
npm install -g @playwright/cli@latest
playwright-cli install --skills

# 9. Manual app installs: Firefox, Loopback, Logi Options+,
#    GitHub Desktop, Claude desktop
```

---

## What's tracked where

**Chezmoi (auto-deployed by `chezmoi apply`):**

- `~/.zprofile`
- `~/.gitconfig`
- `~/.gitignore_global`
- `~/.claude/CLAUDE.md`

**Chezmoi repo, but NOT applied to home dir** (excluded via `.chezmoiignore`):

- `Brewfile`
- `README.md` (this file)

**Not tracked anywhere — manual on each machine:**

- Globally installed npm packages (Playwright CLI + skills)
- GUI apps installed via DMG/App Store
- App-specific configs not yet `chezmoi add`ed

---

## Maintenance reminders

- After installing new brew packages: re-run `brew bundle dump --file=~/.local/share/chezmoi/Brewfile --force`, commit
- After modifying any tracked dotfile in home dir: `chezmoi re-add` to update source
- Periodically: `chezmoi diff` to spot drift between home and source
- Consider: `run_once_after_apply.sh.tmpl` script to automate global npm installs on future bootstraps
