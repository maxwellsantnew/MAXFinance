#!/bin/bash

echo "🔧 INSTALAÇÃO DE DEPENDÊNCIAS FALTANTES - FinanceAI"
echo "=================================================="
echo ""

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    echo "❌ ERRO: Execute este script dentro da pasta financeapp"
    echo "   cd /workspaces/MAXFinance/financeapp"
    exit 1
fi

echo "✅ Diretório correto detectado"
echo ""

# Verificar se node_modules existe
if [ ! -d "node_modules" ]; then
    echo "❌ node_modules não encontrado"
    echo "   Execute primeiro: npm install"
    echo "   Ou execute: ./fix-complete.sh"
    exit 1
fi

echo "✅ node_modules encontrado"
echo ""

# Verificar quais dependências estão faltando
echo "🔍 Verificando dependências faltantes..."

MISSING_DEPS=()

# Verificar dompurify
if ! npm ls dompurify --depth=0 &>/dev/null; then
    MISSING_DEPS+=("dompurify")
fi

# Verificar crypto-js
if ! npm ls crypto-js --depth=0 &>/dev/null; then
    MISSING_DEPS+=("crypto-js")
fi

# Verificar @types/dompurify
if ! npm ls @types/dompurify --depth=0 &>/dev/null; then
    MISSING_DEPS+=("@types/dompurify")
fi

# Verificar @types/crypto-js
if ! npm ls @types/crypto-js --depth=0 &>/dev/null; then
    MISSING_DEPS+=("@types/crypto-js")
fi

if [ ${#MISSING_DEPS[@]} -eq 0 ]; then
    echo "✅ Todas as dependências já estão instaladas"
    echo ""
    echo "🧪 Testando build..."
    npm run build
    BUILD_STATUS=$?
    if [ $BUILD_STATUS -eq 0 ]; then
        echo "✅ Build bem-sucedido!"
        echo ""
        echo "🚀 Iniciando servidor..."
        npm run dev
    else
        echo "❌ Build ainda falhando. Execute ./fix-complete.sh"
    fi
    exit 0
fi

echo "📦 Dependências faltando: ${MISSING_DEPS[*]}"
echo ""

# Instalar dependências faltantes
echo "📥 Instalando dependências faltantes..."
for dep in "${MISSING_DEPS[@]}"; do
    echo "   Instalando $dep..."
    npm install "$dep"
    if [ $? -ne 0 ]; then
        echo "❌ Falha ao instalar $dep"
        exit 1
    fi
done

echo ""
echo "✅ Todas as dependências instaladas!"
echo ""

# Verificar instalação
echo "🔍 Verificando instalação..."
npm ls dompurify crypto-js --depth=0
echo ""

# Testar build
echo "🧪 Testando build..."
npm run build
BUILD_STATUS=$?

if [ $BUILD_STATUS -eq 0 ]; then
    echo "✅ BUILD SUCESSO!"
    echo ""
    echo "🎉 Problema resolvido!"
    echo "   Execute: npm run dev"
    echo "   Acesse: http://localhost:3000"
else
    echo "❌ Build ainda falhando"
    echo "   Execute: ./fix-complete.sh para correção completa"
    exit 1
fi