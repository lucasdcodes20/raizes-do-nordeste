#!/bin/bash

# ============================================================
# Deploy - Rede Raízes do Nordeste
# GitHub Pages — lucasdcodes20.github.io/raizes-do-nordeste
# ============================================================

PROJECT_DIR="/var/www/html/raiz"
cd "$PROJECT_DIR"

echo "=============================================="
echo "  DEPLOY: Raízes do Nordeste → GitHub Pages"
echo "=============================================="

echo ""
echo "[1/2] Versionando no GitHub..."
git add .

if ! git diff --cached --quiet 2>/dev/null; then
  git commit -m "deploy: $(date '+%d/%m/%Y %H:%M')"
  git push && echo "✓ GitHub atualizado." \
    || echo "Git push falhou."
else
  echo "Sem alterações para versionar."
fi

echo ""
echo "[2/2] GitHub Pages atualizando automaticamente..."
echo "Aguarde 1-2 minutos e acesse:"
echo "https://lucasdcodes20.github.io/raizes-do-nordeste/"
echo ""
echo "=============================================="
echo "  Deploy concluído!"
echo "=============================================="
