# Git Collaboration Rules for Travel-planner-agent

## 1. Branch Strategy (分支策略)
- **`main`**: Protected release branch. NEVER push directly to `main`!
- **`dev`**: Protected integration branch. NEVER push directly to `dev`!
- **Feature Branches**: All feature development MUST be done on personal feature branches:
  - Naming pattern: `feature/sunalan2025/<feature-description>`
  - Active developer username: `sunalan2025`

## 2. Pre-operation Checklist (每次操作前严格遵守)
1. Ensure working on a personal `feature/sunalan2025/...` branch before making code changes or commits.
2. Never push directly to `main` or `dev`.
3. Before pushing to remote or creating a PR, run `git pull --rebase origin dev` to keep history clean.
4. Check that no API keys, secrets, `.env` files, or large files (>10MB / `chroma_db`) are staged or committed.

## 3. Commit Message Specification (Commit 规范)
Commit messages MUST follow the conventional commit format:
- `feat: <description>` - New features
- `fix: <description>` - Bug fixes
- `docs: <description>` - Documentation changes
- `style: <description>` - Formatting/style (no code logic changes)
- `refactor: <description>` - Code refactoring
- `test: <description>` - Adding/modifying tests
- `chore: <description>` - Tooling, CI, dependencies

## 4. Pull Request (PR) Requirements
- Target branch MUST be `dev`.
- Title format: `<type>: <short summary>`
- Provide a clear description of changes and test verification results.
- Must obtain at least 1 Code Review approval from teammates before merging.
