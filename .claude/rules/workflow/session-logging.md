---
description: Auto-logging rule — Claude MUST spawn a logging sub-agent after completing work
globs: *
---

# Session Logging

## Rule

After completing any non-trivial work (code changes, bug fixes, new features, investigations), you MUST spawn a background sub-agent to update the session logs before finishing.

## How it works

1. You do the work the user asked for
2. Before your final response, spawn a **background** sub-agent with this prompt:

```
You are the session logger for the Find My Fuel project.

Working directory: C:\Users\Student\dev\petrol-prices

Review what was just done in this session by checking `git diff HEAD~1` and `git log -1`.

Then update or create the appropriate log file in `.claude/rules/logs/`. 

Rules for log files:
- Name files by topic (e.g., `map-changes.md`, `search-fixes.md`, `ingestion-updates.md`, `ui-changes.md`, `cleanup.md`)
- Each file should have frontmatter: description, globs: *, type: log
- Log entries should include: date, what changed, why, any failures or gotchas
- Append to existing files if the topic matches, create new ones if not
- Keep entries concise — 2-3 lines per change
- Also update `.claude/rules/patterns/code-patterns.md` if new patterns were established
- Also update `.claude/rules/project/overview.md` if architecture changed

Do NOT commit or push — just write the log files.
```

3. The sub-agent runs in the background and updates the logs while you respond to the user.

## What gets logged

- Changes made and why
- Bugs found and how they were fixed
- New patterns or conventions established
- Failures, dead ends, things that didn't work
- Decisions and trade-offs
