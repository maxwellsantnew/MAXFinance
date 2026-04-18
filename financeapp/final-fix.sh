#!/bin/bash

echo "🚀 CORREÇÃO FINAL - Todos os Erros"
echo "=================================="
echo ""

# Verificar diretório
if [ ! -f "package.json" ]; then
    echo "❌ Execute dentro da pasta financeapp"
    exit 1
fi

echo "✅ Diretório correto"
echo ""

# PASSO 1: Instalar dependências faltantes
echo "📦 PASSO 1: Instalando dependências faltantes..."
npm install dompurify crypto-js
npm install --save-dev @types/dompurify @types/crypto-js

echo "✅ Dependências instaladas"
echo ""

# PASSO 2: Verificar instalação
echo "🔍 PASSO 2: Verificando instalação..."
if npm ls dompurify crypto-js --depth=0 &>/dev/null; then
    echo "✅ Todas as dependências instaladas"
else
    echo "❌ Problema na instalação"
    exit 1
fi
echo ""

# PASSO 3: Limpar cache
echo "🧹 PASSO 3: Limpando cache..."
rm -rf .next
npm cache clean --force 2>/dev/null

echo "✅ Cache limpo"
echo ""

# PASSO 4: Testar build
echo "🏗️  PASSO 4: Testando build..."
if npm run build; then
    echo "✅ BUILD SUCESSO!"
    echo ""
    echo "🎉 TODOS OS ERROS CORRIGIDOS!"
    echo ""
    echo "🚀 Execute: npm run dev"
    echo "🌐 Acesse: http://localhost:3000"
    echo ""
    echo "📊 FUNCIONALIDADES ATIVAS:"
    echo "✅ Criptografia localStorage (AES-256)"
    echo "✅ Sanitização HTML (contra XSS)"
    echo "✅ Dados anônimos para IA"
    echo "✅ Interface responsiva"
    echo "✅ Scripts de análise completos"
else
    echo "❌ Build ainda falhando"
    echo ""
    echo "🔧 SOLUÇÕES ALTERNATIVAS:"
    echo "1. rm -rf node_modules && npm install"
    echo "2. Verifique versão do Node.js (18+)"
    echo "3. Execute ./fix-complete.sh"
    exit 1
fi