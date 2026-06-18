#!/usr/bin/env bash
# Warn (non-blocking) if locked-field identifiers appear in client-side code.
set -euo pipefail
input="$(cat || true)"
path="$(printf '%s' "$input" | grep -oiE '"file_path"[^,]*' | head -1 || true)"
if printf '%s' "$path" | grep -qiE 'src/.*(components|routes|pages|features)'; then
  if printf '%s' "$input" | grep -qiE 'exact_lat|exact_lng|exact_address|private_description|private_notes|malik_info|tapu'; then
    echo "WARNING: a locked-field identifier appears in client-side code. Locked fields must stay server/RLS-side and never reach teaser/public/customer views. Verify this is not a leak." >&2
  fi
fi
exit 0
