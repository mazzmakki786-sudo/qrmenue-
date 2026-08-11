---
description: Anti-duplication guardrail for adding or changing skills
paths:
  - ".claude/skills/**"
---

# Adding or changing a skill

This project already covers most of the development lifecycle, so most new-skill ideas overlap an existing skill. Before creating a new `.claude/skills/<name>/` directory or significantly reworking an existing one:

- Prefer extending an existing skill over adding a near-duplicate. If the idea overlaps an existing skill, edit that skill instead of adding a new directory.
- Never duplicate content between skills — reference the other skill instead.
- These skills originate from [addyosmani/agent-skills](https://github.com/addyosmani/agent-skills); check the upstream catalog before inventing something new.
