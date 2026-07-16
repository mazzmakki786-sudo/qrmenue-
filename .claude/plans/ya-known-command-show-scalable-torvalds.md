# Plan: Fix `/makii` Slash Command

## Context

The user wants to use `/makii <description>` as a slash command to invoke the Makii agent (context-aware prompt builder). Currently, typing `/makii` gives "command not found" even though:

- The agent definition exists at `.claude/agents/makii.md`
- The `makii` agent type is available (can be used via `subagent_type: "makii"` in the Agent tool)
- The makii agent is NOT registered as a slash command/skill

## Root Cause

Claude Code has two separate systems:
1. **Agent types** — defined in `.claude/agents/*.md` — available via the Agent tool
2. **Slash commands / Skills** — must be registered in `.claude/settings.json` under `slashCommands`

The `makii` agent exists as an agent type but is **not registered as a slash command**, so `/makii` produces "command not found".

## Fix

Create `.claude/settings.json` (the project-level settings file — currently only `settings.local.json` exists) with a `slashCommands` entry that registers `/makii` as a slash command that invokes the makii agent.

**File to create:** `.claude/settings.json`

Structure:
```json
{
  "slashCommands": [
    {
      "name": "makii",
      "description": "Context-aware prompt builder — writes detailed, project-optimized prompts for reasoning models",
      "agentType": "makii"
    }
  ]
}
```

Note: The exact property name for linking to an agent type (`agentType`, `agent`, or similar) will be verified during implementation. If the exact schema differs, we'll adjust.

The existing `.claude/settings.local.json` (with permissions and MCP servers) should remain untouched — it's user-local settings that override project settings.

## Status: ✅ Done

**File created:** `.claude/settings.json` with a `slashCommands` entry for `/makii`.

```json
{
  "slashCommands": [
    {
      "name": "makii",
      "description": "Context-aware prompt builder — takes simple task descriptions and produces detailed, project-optimized prompts for DeepSeek, Claude, and other reasoning models.",
      "agentType": "makii"
    }
  ]
}
```

## Verification

1. Restart the Claude Code session
2. Type `/makii write a login form` — should invoke the makii agent instead of showing "command not found"
3. The makii agent should run its three phases (project context analysis → task context mapping → prompt construction)
