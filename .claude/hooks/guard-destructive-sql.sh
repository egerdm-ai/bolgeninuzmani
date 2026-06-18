#!/usr/bin/env bash
# Block destructive SQL / migration runs until the audit is approved.
# Approval marker: .claude/AUDIT_APPROVED. exit 2 blocks the tool call.
set -euo pipefail
input="$(cat || true)"
cmd="$(printf '%s' "$input" | grep -oiE '"command"[^,]*' || true)"
approved=0; [ -f ".claude/AUDIT_APPROVED" ] && approved=1
if printf '%s' "$cmd" | grep -qiE 'drop +table|truncate|delete +from|supabase +db +push|supabase +migration +up|psql'; then
  if [ "$approved" -ne 1 ]; then
    echo "BLOCKED: destructive/migration SQL before audit approval. Create .claude/AUDIT_APPROVED to unlock." >&2
    exit 2
  fi
fi
exit 0
