---
name: loop-engineering
description: Design automated control systems (loops) that orchestrate AI coding agents on a cadence. Use this skill when the user wants to set up recurring agent tasks, automated triage/dependency/PR monitoring loops, scheduled sweeps, background automation patterns, or when they mention "loop engineering," "agent loops," "automated coding agents," "CI sweeper," "daily triage," "PR babysitter," or "changelog drafting." Also use when discussing prompting strategies for unattended agent operation, control systems for coding agents, or production automation patterns from cobusgreyling/loop-engineering.
---

# Loop Engineering

Reference implementation and design patterns for building automated control systems that orchestrate AI coding agents on a cadence. Based on the [loop-engineering](https://github.com/cobusgreyling/loop-engineering) methodology.

The core philosophy: **Stop prompting. Design the loop. Get a score.** Instead of manually prompting agents each time, you build a system that prompts agents for you on a schedule.

## The Five Building Blocks

| Primitive | Role in the Loop |
|---|---|
| **Automations / Scheduling** | Discovery and triage on a cadence |
| **Worktrees** | Safe, isolated parallel execution |
| **Skills** | Persistent project knowledge that agents consult |
| **Plugins & Connectors** | Tool access via MCP |
| **Sub-agents** | Split maker/checker responsibilities |

Plus **Memory/State** — a durable record outside any single conversation.

## Maturity Levels

Loops progress through three stages:
- **L1** — Report only, no automatic fixes (safe to start)
- **L2** — Assisted fixes with human gates (moderate trust)
- **L3** — Unattended operation (high trust, full automation)

## Available CLI Tools

These `@cobusgreyling/*` packages scaffold, audit, and manage loops:

| Tool | Purpose | Usage |
|---|---|---|
| `loop-init` | Scaffold starter files (skills, state, budget) | `npx @cobusgreyling/loop-init . --pattern daily-triage --tool grok` |
| `loop-audit` | Compute Loop Readiness Score | `npx @cobusgreyling/loop-audit . --suggest` |
| `loop-cost` | Estimate token spend for pattern+cadence | `npx @cobusgreyling/loop-cost --pattern ci-sweeper --cadence 15m` |
| `loop-sync` | Detect drift between STATE.md and LOOP.md | `npx @cobusgreyling/loop-sync .` |
| `loop-context` | Stateful memory manager with circuit breaker | `npx @cobusgreyling/loop-context --check --ledger run.json` |
| `loop-mcp-server` | MCP server for runtime lookup of patterns/skills/state | `npx @cobusgreyling/loop-mcp-server` |
| `loop-worktree` | Manage isolated git worktrees per fix attempt | `npx @cobusgreyling/loop-worktree create --run-id <id>` |

## Seven Production Patterns

Each pattern has a specific cadence, cost profile, and maturity path:

| Pattern | Cadence | Cost | Notes |
|---|---|---|---|
| **Daily Triage** | 1d–2h | Low | Report-only at L1, the safest starting pattern |
| **PR Babysitter** | 5–15m | High | Watches pull requests for issues |
| **CI Sweeper** | 5–15m | Very high | L2 cautious fixes only |
| **Dependency Sweeper** | 6h–1d | Medium | Patch-only at L2 |
| **Changelog Drafter** | 1d or tag-driven | Low | L1 draft, human review |
| **Post-Merge Cleanup** | 1d–6h | Low | Off-peak execution |
| **Issue Triage** | 2h–1d | Low | Propose-only at L1 |

## Getting Started (5-minute setup)

```bash
# 1. Scaffold a daily-triage loop
npx @cobusgreyling/loop-init . --pattern daily-triage --tool claude

# 2. Estimate costs
npx @cobusgreyling/loop-cost --pattern daily-triage --level L1

# 3. Audit readiness
npx @cobusgreyling/loop-audit . --suggest

# 4. Run the loop (inside Claude Code)
/loop 1d Run loop-triage. Update STATE.md. No auto-fix in week one.
```

## Important Safety Notes

- **Token costs can explode** with sub-agents and long-running loops — always estimate first
- **Verification is still on you** — loops don't eliminate the need for human oversight
- **Start at L1** (report only) and progress to L2/L3 as confidence grows
- Use denylists and auto-merge restrictions for unattended operation
- Coordinate multiple loops to avoid collisions

## Related Patterns

- **Goal Engineering** — companion methodology: "loops discover, goals finish" — provides a `/goal` command and stack cookbook
- Use CronCreate for scheduling loops once scaffolding is done