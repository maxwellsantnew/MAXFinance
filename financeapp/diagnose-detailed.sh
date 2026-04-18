#!/bin/bash

echo "🔍 DIAGNÓSTICO DETALHADO - FinanceAI"
echo "==================================="
echo ""

echo "📍 Verificando ambiente..."
echo "Data/Hora: $(date)"
echo "Diretório: $(pwd)"
echo ""

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    echo "❌ ERRO: package.json não encontrado!"
    echo "   Execute: cd /workspaces/MAXFinance/financeapp"
    exit 1
fi

echo "✅ package.json encontrado"
echo ""

# Verificar Node e NPM
echo "🔧 Verificando Node.js e NPM..."
if ! command -v node &> /dev/null; then
    echo "❌ ERRO: Node.js não instalado!"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ ERRO: NPM não instalado!"
    exit 1
fi

echo "✅ Node.js: $(node --version)"
echo "✅ NPM: $(npm --version)"
echo ""

# Verificar dependências críticas
echo "📦 Verificando dependências críticas..."
MISSING_DEPS=()

# Verificar se as dependências estão no package.json
deps=("next" "react" "react-dom" "zustand" "crypto-js" "dompurify")
for dep in "${deps[@]}"; do
    if ! grep -q "\"$dep\"" package.json; then
        MISSING_DEPS+=("$dep")
    fi
done

if [ ${#MISSING_DEPS[@]} -eq 0 ]; then
    echo "✅ Todas as dependências críticas estão no package.json"
else
    echo "❌ Dependências faltando no package.json: ${MISSING_DEPS[*]}"
fi
echo ""

# Verificar se node_modules existe
if [ ! -d "node_modules" ]; then
    echo "❌ node_modules não encontrado - execute 'npm install'"
else
    echo "✅ node_modules encontrado"
fi
echo ""

# Verificar se .next existe (pode ser problema)
if [ -d ".next" ]; then
    echo "⚠️  .next existe - pode causar problemas de cache"
    echo "   Recomendação: rm -rf .next"
else
    echo "✅ .next não existe (bom para primeiro build)"
fi
echo ""

# Verificar arquivos críticos
echo "📁 Verificando arquivos críticos..."
files=("src/pages/_app.tsx" "src/pages/index.tsx" "src/lib/store.ts" "src/components/AIChat.tsx")
for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file encontrado"
    else
        echo "❌ $file NÃO encontrado"
    fi
done
echo ""

# Verificar sintaxe básica dos arquivos TypeScript
echo "🔍 Verificando sintaxe básica..."
SYNTAX_ERRORS=()

# Verificar se há erros óbvios de sintaxe
if grep -q "import.*from.*;" src/lib/store.ts; then
    echo "✅ store.ts: imports OK"
else
    SYNTAX_ERRORS+=("store.ts: problema com imports")
fi

if grep -q "export default" src/components/AIChat.tsx; then
    echo "✅ AIChat.tsx: export OK"
else
    SYNTAX_ERRORS+=("AIChat.tsx: problema com export")
fi

if [ ${#SYNTAX_ERRORS[@]} -eq 0 ]; then
    echo "✅ Nenhum erro de sintaxe óbvio detectado"
else
    echo "❌ Erros de sintaxe encontrados:"
    for error in "${SYNTAX_ERRORS[@]}"; do
        echo "   - $error"
    done
fi
echo ""

# Recomendações
echo "💡 RECOMENDAÇÕES PARA CORREÇÃO:"
echo ""
echo "1️⃣  Limpar cache e reinstalar:"
echo "   rm -rf .next node_modules"
echo "   npm install"
echo ""

echo "2️⃣  Verificar instalação das dependências:"
echo "   npm ls crypto-js dompurify"
echo ""

echo "3️⃣  Testar build:"
echo "   npm run build"
echo ""

echo "4️⃣  Se build falhar, verificar logs detalhados"
echo ""

echo "5️⃣  Se tudo OK, iniciar dev server:"
echo "   npm run dev"
echo ""

echo "📞 SUPORTE:"
echo "Se o problema persistir, verifique:"
echo "- Conexão com internet para npm install"
echo "- Versão do Node.js (recomendado: 18+)"
echo "- Espaço em disco disponível"
echo "- Permissões de escrita no diretório"
echo ""

echo "✅ Diagnóstico concluído!"