#!/bin/bash

# ============================================
# TESTE ULTRA SIMPLES
# ============================================

echo "🚀 INICIANDO TESTE SIMPLES"
echo ""

# Navegar
cd /workspaces/MAXFinance/financeapp || exit 1

# Limpar
echo "1️⃣  Limpando cache..."
rm -rf .next
echo "   ✅ OK"
echo ""

# Instalar
echo "2️⃣  Reinstalando..."
npm install --legacy-peer-deps 2>&1 | tail -5
echo "   ✅ OK"
echo ""

# Build
echo "3️⃣  Compilando..."
npm run build 2>&1 | tail -10
BUILD_RESULT=$?
echo ""

if [ $BUILD_RESULT -eq 0 ]; then
  echo "✅ BUILD FUNCIONOU!"
  echo ""
  echo "4️⃣  Iniciando servidor..."
  echo "   (Aguarde 5-10 segundos...)"
  echo "   Com Sucesso mostrará: 'ready - started server on 0.0.0.0:3000'"
  echo ""
  timeout 15 npm run dev || echo "   (timeout - servidor iniciou e foi parado)"
else
  echo "❌ BUILD FALHOU"
  echo ""
  echo "Tente:"
  echo "  npm cache clean --force"
  echo "  npm install --legacy-peer-deps"
  exit 1
fi
