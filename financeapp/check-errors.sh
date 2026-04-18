#!/bin/bash

echo "🔍 VERIFICAÇÃO DE ERROS DE COMPILAÇÃO - FinanceAI"
echo "================================================"
echo ""

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    echo "❌ ERRO: Execute este script dentro da pasta financeapp"
    exit 1
fi

echo "✅ Diretório correto"
echo ""

# Verificar se as dependências estão instaladas
echo "📦 Verificando dependências críticas..."

deps=("dompurify" "crypto-js" "zustand" "react" "next")
for dep in "${deps[@]}"; do
    if npm ls "$dep" --depth=0 &>/dev/null; then
        echo "✅ $dep instalado"
    else
        echo "❌ $dep NÃO instalado - instalando..."
        npm install "$dep"
    fi
done

echo ""

# Verificar tipos
echo "🔧 Verificando tipos TypeScript..."
devdeps=("@types/dompurify" "@types/crypto-js")
for dep in "${devdeps[@]}"; do
    if npm ls "$dep" --depth=0 &>/dev/null; then
        echo "✅ $dep instalado"
    else
        echo "❌ $dep NÃO instalado - instalando..."
        npm install --save-dev "$dep"
    fi
done

echo ""

# Tentar build para identificar erros específicos
echo "🏗️  Testando build para identificar erros..."
BUILD_OUTPUT=$(npm run build 2>&1)
BUILD_STATUS=$?

if [ $BUILD_STATUS -eq 0 ]; then
    echo "✅ BUILD SUCESSO! Nenhum erro encontrado."
    echo ""
    echo "🚀 Iniciando servidor de desenvolvimento..."
    npm run dev
    exit 0
fi

echo "❌ BUILD FALHOU. Analisando erros..."
echo ""

# Analisar erros específicos
if echo "$BUILD_OUTPUT" | grep -q "dompurify"; then
    echo "🔍 ERRO IDENTIFICADO: dompurify não encontrado"
    echo "   Solução: npm install dompurify"
    npm install dompurify
elif echo "$BUILD_OUTPUT" | grep -q "crypto-js"; then
    echo "🔍 ERRO IDENTIFICADO: crypto-js não encontrado"
    echo "   Solução: npm install crypto-js"
    npm install crypto-js
elif echo "$BUILD_OUTPUT" | grep -q "zustand"; then
    echo "🔍 ERRO IDENTIFICADO: zustand não encontrado"
    echo "   Solução: npm install zustand"
    npm install zustand
elif echo "$BUILD_OUTPUT" | grep -q "Cannot resolve module"; then
    echo "🔍 ERRO IDENTIFICADO: Módulo não encontrado"
    echo "   Verificando dependências faltantes..."
    npm install
elif echo "$BUILD_OUTPUT" | grep -q "TypeScript"; then
    echo "🔍 ERRO IDENTIFICADO: Erro de TypeScript"
    echo "   Verificando tipos..."
    npm install --save-dev @types/dompurify @types/crypto-js
else
    echo "🔍 ERRO NÃO IDENTIFICADO:"
    echo "$BUILD_OUTPUT" | tail -10
fi

echo ""
echo "🔄 Tentando build novamente..."
npm run build
if [ $? -eq 0 ]; then
    echo "✅ BUILD CORRIGIDO!"
    echo ""
    echo "🚀 Execute: npm run dev"
else
    echo "❌ Build ainda falhando. Verifique os logs acima."
    echo ""
    echo "💡 SOLUÇÕES ALTERNATIVAS:"
    echo "1. Execute: rm -rf node_modules && npm install"
    echo "2. Execute: ./fix-complete.sh"
    echo "3. Verifique se Node.js 18+ está instalado"
fi