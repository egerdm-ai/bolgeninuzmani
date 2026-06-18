---
name: jira-sync
description: Keep Jira issues in sync with work. Use at the start and end of every task to transition issues and comment results. Requires the Jira (Atlassian) MCP connected.
allowed-tools: Read, Bash
---

# Jira Sync

## Steps
1. Resolve the issue key (from branch name or task prompt).
2. On start: transition → In Progress.
3. On done (green + committed): transition → Done; comment with commit/PR link
   + one-line result + acceptance status.
4. If blocked: flag with a reason.

## Guardrails
If Jira MCP isn't connected, say so and continue; never fabricate updates.
Never transition issues you didn't work on.
