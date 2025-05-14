#!/bin/bash
set -euo pipefail

# Añade // @ts-nocheck al inicio de cada .ts/.tsx except .d.ts
find src -type f \( -name '*.ts' -o -name '*.tsx' \) ! -name '*.d.ts' -print0 \
  | xargs -0 sed -i '' '1s;^;// @ts-nocheck\n;'
echo "✅ Directiva @ts-nocheck añadida a todos los TS/TSX en src/"
