#!/bin/bash

echo "🔧 CORREÇÃO AUTOMÁTICA - FinanceAI"
echo "=================================="
echo ""

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    echo "❌ ERRO: Execute este script dentro da pasta financeapp"
    echo "   cd /workspaces/MAXFinance/financeapp"
    exit 1
fi

echo "✅ Diretório correto detectado"
echo ""

# PASSO 1: Backup de segurança
echo "📦 PASSO 1: Criando backup de segurança..."
mkdir -p backup
cp package.json backup/package.json.backup 2>/dev/null
cp package-lock.json backup/package-lock.json.backup 2>/dev/null
echo "✅ Backup criado em ./backup/"
echo ""

# PASSO 2: Limpeza completa
echo "🧹 PASSO 2: Limpeza completa..."
echo "   Removendo .next..."
rm -rf .next
echo "   Removendo node_modules..."
rm -rf node_modules
echo "   Limpando cache npm..."
npm cache clean --force 2>/dev/null
echo "✅ Limpeza concluída"
echo ""

# PASSO 3: Verificar e corrigir package.json
echo "📝 PASSO 3: Verificando package.json..."

# Verificar se as dependências críticas estão presentes
REQUIRED_DEPS=("next" "react" "react-dom" "zustand" "crypto-js" "dompurify")
MISSING_DEPS=()

for dep in "${REQUIRED_DEPS[@]}"; do
    if ! grep -q "\"$dep"\": package.json; then
        MISSING_DEPS+=("$dep")
    fi
done

if [ ${#MISSING_DEPS[@]} -eq 0 ]; then
    echo "✅ Todas as dependências críticas estão no package.json"
else
    echo "⚠️  Dependências faltando: ${MISSING_DEPS[*]}"
    echo "   Instalando dependências faltantes..."
    npm install "${MISSING_DEPS[@]}" 2>/dev/null
fi
echo ""

# PASSO 4: Instalação limpa
echo "📦 PASSO 4: Instalação limpa das dependências..."
echo "   Executando npm install..."
npm install
INSTALL_STATUS=$?

if [ $INSTALL_STATUS -eq 0 ]; then
    echo "✅ npm install concluído com sucesso"
else
    echo "❌ ERRO no npm install (código: $INSTALL_STATUS)"
    echo "   Verifique conexão com internet e tente novamente"
    exit 1
fi
echo ""

# PASSO 5: Verificar instalação
echo "🔍 PASSO 5: Verificando instalação..."
echo "   Verificando dependências críticas..."

# Verificar se as dependências foram instaladas
for dep in "${REQUIRED_DEPS[@]}"; do
    if npm ls "$dep" --depth=0 &>/dev/null; then
        echo "✅ $dep instalado"
    else
        echo "❌ $dep NÃO instalado"
    fi
done
echo ""

# PASSO 6: Teste de build
echo "🏗️  PASSO 6: Testando build..."
npm run build
BUILD_STATUS=$?

if [ $BUILD_STATUS -eq 0 ]; then
    echo "✅ BUILD SUCESSO!"
else
    echo "❌ BUILD FALHOU (código: $BUILD_STATUS)"
    echo "   Verificando logs de erro..."
    echo ""
    echo "LOGS DE ERRO MAIS RECENTES:"
    find .next -name "*.log" -type f -exec tail -20 {} \; 2>/dev/null || echo "Nenhum log encontrado"
    echo ""
    echo "TENTATIVA DE CORREÇÃO:"
    echo "1. Verifique se há erros de sintaxe no código"
    echo "2. Execute: npm run lint"
    echo "3. Verifique imports e exports"
    exit 1
fi
echo ""

# PASSO 7: Teste do servidor dev
echo "🚀 PASSO 7: Testando servidor de desenvolvimento..."
echo "   Iniciando npm run dev em background..."
timeout 10s npm run dev &
DEV_PID=$!

# Aguardar um pouco para o servidor iniciar
sleep 5

# Verificar se o processo ainda está rodando
if kill -0 $DEV_PID 2>/dev/null; then
    echo "✅ Servidor dev iniciou com sucesso!"
    echo "   PID do processo: $DEV_PID"
    echo "   Para parar: kill $DEV_PID"
    echo ""
    echo "🎉 CORREÇÃO CONCLUÍDA COM SUCESSO!"
    echo "   A aplicação está pronta para uso."
    echo "   Execute 'npm run dev' para iniciar o servidor."
else
    echo "❌ Servidor dev falhou ao iniciar"
    echo "   Verifique logs acima para detalhes"
    exit 1
fi

echo ""
echo "📊 RESUMO DA CORREÇÃO:"
echo "✅ Cache limpo"
echo "✅ Dependências reinstaladas"
echo "✅ Build testado"
echo "✅ Servidor dev testado"
echo ""

echo "🎯 PRÓXIMOS PASSOS:"
echo "1. Execute: npm run dev"
echo "2. Acesse: http://localhost:3000"
echo "3. Teste as funcionalidades"
echo "4. Execute ./full-audit.sh para análise completa"