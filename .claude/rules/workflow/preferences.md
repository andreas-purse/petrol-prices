---
description: User preferences and working style — ALWAYS follow these
globs: *
---

# Workflow Preferences

## About the user

Non-technical builder. Does not know TypeScript. Building this project with Claude Code as the primary development tool. Always give simple, clear guidance. Avoid jargon.

## Rules (always follow)

1. **Keep it simple** — always choose the simplest approach. No over-engineering.
2. **No screenshot workflow** — don't run `pnpm snapshot`. User checks visually themselves.
3. **No keys in chat** — never ask for API keys in conversation. Give commands with `PASTE_KEY_HERE` placeholders.
4. **Always commit and push** — after making changes, commit and push without asking.
5. **No heatmap** — never use a heatmap on the map. Only individual price-colored points (green=cheap, red=expensive).
6. **Don't re-add removed features** — main is clean Phase 2. No auth, payments, or theming unless explicitly asked.
