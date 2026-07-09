---
name: superpowers
description: Install and use the Superpowers development methodology — a complete TDD-first software engineering workflow for AI coding agents. Use this skill when the user wants structured agent workflows, test-driven development, systematic debugging, subagent-driven development, code review processes, brainstorming with Socratic refinement, or mentions "Superpowers," "obra/superpowers," "plugin install superpowers," "agent methodology," "TDD for AI," "agent workflow," or "disciplined AI development." Also trigger when the user asks about installing agent plugins, improving agent code quality, or adding structured development processes.
---

# Superpowers — Development Methodology for AI Coding Agents

An open-source (MIT) complete software development methodology that gives AI coding agents disciplined engineering workflows. Created by Jesse Vincent at Prime Radiant. Forces structured TDD-first development instead of ad-hoc code generation.

## Installation

### For Claude Code (Official Marketplace — Recommended)

```bash
/plugin install superpowers@claude-plugins-official
```

### For Claude Code (Alternative Marketplace)

```bash
/plugin marketplace add obra/superpowers-marketplace
/plugin install superpowers@superpowers-marketplace
```

### For Other Harnesses

| Tool | Command |
|---|---|
| Cursor | `/add-plugin superpowers` |
| Codex CLI | `codex plugins add superpowers` |
| Pi | `pi install git:github.com/obra/superpowers` |
| OpenCode | Copy `.opencode` directory into project |

## Core Skills Library

Once installed, Superpowers provides these skills that fire automatically:

### Testing & Development
- **test-driven-development** — Enforces RED-GREEN-REFACTOR: write a failing test, see it fail, write minimal code, watch it pass, commit. Deletes code written before tests.

### Debugging
- **systematic-debugging** — 4-phase root-cause process: reproduce → isolate → fix → verify. Uses defense-in-depth and condition-based-waiting.
- **verification-before-completion** — Confirms bugs are actually fixed before closing.

### Collaboration & Workflow
| Skill | Purpose |
|---|---|
| **brainstorming** | Socratic design refinement — presents design in sections for validation |
| **writing-plans** | Breaks work into 2–5 minute tasks with exact file paths, complete code, verification steps |
| **executing-plans** / **subagent-driven-development** | Dispatches fresh subagents per task with two-stage review (spec first, then code quality) |
| **requesting-code-review** | Reviews against plan and reports issues by severity; critical issues block progress |
| **using-git-worktrees** | Creates isolated workspaces on new branches for parallel work |
| **finishing-a-development-branch** | Verifies tests and provides merge/PR/keep/discard options |
| **dispatching-parallel-agents** | Concurrent subagent workflows |

### Meta Skills
- **writing-skills** — Create new skills following best practices
- **using-superpowers** — Introduction to the system

## Typical Workflow

When Superpowers is active, the agent follows this structured process automatically:

```
1. Brainstorming — Refines rough ideas → design document
2. Git worktree setup — Isolated branch with clean test baseline
3. Writing plans — Decomposes into tiny verifiable tasks
4. Execution — Sub-agents work through tasks autonomously
5. TDD — Every implementation follows RED-GREEN-REFACTOR
6. Code review between tasks — Critical issues block progress
7. Branch finishing — Tests verified, merge/PR/keep/discard
```

## Key Philosophy

- **Test-Driven Development** — Always red-green-refactor. Never write implementation code before tests.
- **Systematic over ad-hoc** — Follow the process, don't skip steps.
- **Complexity reduction** — YAGNI, DRY, keep things simple.
- **Evidence over claims** — Verify with tests, don't assume it works.

## Telemetry

By default, a logo is loaded from Prime Radiant's website that includes the Superpowers version number for usage tracking. **No project details, code, prompts, or agent info is collected.** Disable with:
- `SUPERPOWERS_DISABLE_TELEMETRY` environment variable
- Or Claude Code's analogous env variables

## Uninstallation

```bash
/plugin uninstall superpowers
```

This removes all Superpowers skills and workflows from the current session.