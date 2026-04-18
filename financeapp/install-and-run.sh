#!/bin/bash

echo "🚀 INSTALAÇÃO COMPLETA E EXECUÇÃO - FinanceAI"
echo "============================================"
echo ""

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    echo "❌ ERRO: Execute este script dentro da pasta financeapp"
    echo "   cd /workspaces/MAXFinance/financeapp"
    exit 1
fi

echo "✅ Diretório correto detectado"
echo ""

# PASSO 1: Limpeza completa
echo "🧹 PASSO 1: Limpeza completa..."
rm -rf .next node_modules package-lock.json
npm cache clean --force 2>/dev/null
echo "✅ Limpeza concluída"
echo ""

# PASSO 2: Instalação completa
echo "📦 PASSO 2: Instalação completa das dependências..."
npm install
INSTALL_STATUS=$?

if [ $INSTALL_STATUS -ne 0 ]; then
    echo "❌ ERRO na instalação. Verifique conexão com internet."
    exit 1
fi

echo "✅ Dependências instaladas com sucesso"
echo ""

# PASSO 3: Verificação das dependências críticas
echo "🔍 PASSO 3: Verificando dependências críticas..."

deps=("dompurify" "crypto-js" "zustand" "react" "next")
missing_deps=()

for dep in "${deps[@]}"; do
    if ! npm ls "$dep" --depth=0 &>/dev/null; then
        missing_deps+=("$dep")
    fi
done

if [ ${#missing_deps[@]} -eq 0 ]; then
    echo "✅ Todas as dependências críticas estão instaladas"
else
    echo "❌ Dependências faltando: ${missing_deps[*]}"
    echo "   Tentando instalar novamente..."
    npm install "${missing_deps[@]}"
fi
echo ""

# PASSO 4: Teste de build
echo "🏗️  PASSO 4: Testando build..."
npm run build
BUILD_STATUS=$?

if [ $BUILD_STATUS -ne 0 ]; then
    echo "❌ BUILD FALHOU!"
    echo "   Logs de erro:"
    npm run build 2>&1 | tail -10
    echo ""
    echo "💡 POSSÍVEIS SOLUÇÕES:"
    echo "1. Verifique se há erros de sintaxe no código"
    echo "2. Execute: npm run lint"
    echo "3. Verifique imports e exports"
    echo "4. Execute: rm -rf node_modules && npm install"
    exit 1
fi

echo "✅ BUILD SUCESSO!"
echo ""

# PASSO 5: Iniciar servidor
echo "🚀 PASSO 5: Iniciando servidor de desenvolvimento..."
echo "   Se aparecer 'ready - started server on 0.0.0.0:3000', tudo funcionou!"
echo ""

npm run dev