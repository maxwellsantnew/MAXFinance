#!/bin/bash

# ============================================
# MAXFinance - Teste e Correção de npm run dev
# ============================================

echo "🔍 INICIANDO TESTES DE FIX..."
echo ""

# TEST 1: Limpar cache
echo "📋 TEST 1: Limpando cache .next..."
cd /workspaces/MAXFinance/financeapp
rm -rf .next
echo "✅ Cache .next limpo"
echo ""

# TEST 2: npm cache clean
echo "📋 TEST 2: Limpando npm cache..."
npm cache clean --force
echo "✅ npm cache limpo"
echo ""

# TEST 3: Reinstalar dependências
echo "📋 TEST 3: Reinstalando dependências..."
npm install
echo "✅ Dependências reinstaladas"
echo ""

# TEST 4: Verificar versões
echo "📋 TEST 4: Verificando versões..."
echo "Node version: $(node --version)"
echo "NPM version: $(npm --version)"
echo ""

# TEST 5: Tentar build
echo "📋 TEST 5: Compilando projeto..."
npm run build
BUILD_STATUS=$?
if [ $BUILD_STATUS -eq 0 ]; then
  echo "✅ BUILD SUCESSO"
else
  echo "❌ BUILD FALHOU com status $BUILD_STATUS"
  exit 1
fi
echo ""

# TEST 6: Tentar dev
echo "📋 TEST 6: Iniciando servidor dev..."
echo "Se aparecer 'ready - started server on 0.0.0.0:3000', o FIX FUNCIONOU! ✅"
npm run dev
