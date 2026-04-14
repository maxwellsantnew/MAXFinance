#!/bin/bash

# ============================================
# Diagnóstico Rápido - MAXFinance
# ============================================

echo "🔍 DIAGNÓSTICO DO PROJETO"
echo ""

# Check 1: Node e NPM
echo "1️⃣  Versões:"
echo "   Node: $(node --version 2>/dev/null || echo 'NÃO INSTALADO')"
echo "   NPM: $(npm --version 2>/dev/null || echo 'NÃO INSTALADO')"
echo ""

# Check 2: Dependências principais
echo "2️⃣  Dependências Críticas:"
npm ls next react react-dom --depth=0 2>/dev/null | head -10
echo ""

# Check 3: Estrutura de arquivos
echo "3️⃣  Estrutura:"
echo "   .next: $([ -d .next ] && echo '✅' || echo '❌')"
echo "   node_modules: $([ -d node_modules ] && echo '✅' || echo '❌')"
echo "   src/: $([ -d src ] && echo '✅' || echo '❌')"
echo "   public/: $([ -d public ] && echo '✅' || echo '❌')"
echo "   .env.local: $([ -f .env.local ] && echo '✅' || echo '❌')"
echo ""

# Check 4: Tamanho de node_modules
echo "4️⃣  Tamanho node_modules:"
du -sh node_modules 2>/dev/null || echo "   Não foi possível calcular"
echo ""

# Check 5: Scripts disponíveis
echo "5️⃣  Scripts disponíveis:"
grep '"scripts"' -A 5 package.json | grep -E '^\s+"' | sed 's/,//'
echo ""

# Check 6: Verificar porta 3000
echo "6️⃣  Porta 3000:"
if lsof -i :3000 2>/dev/null | grep -q LISTEN; then
  echo "   ⚠️  PORTA 3000 JÁ EM USO!"
  lsof -i :3000 | tail -1
else
  echo "   ✅ Porta 3000 livre"
fi
echo ""

echo "✅ Diagnóstico concluído!"
