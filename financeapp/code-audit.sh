#!/bin/bash

echo "📝 Análise de Código - FinanceAI"
echo "==============================="

echo ""
echo "🔍 Analisando estrutura do projeto..."

# Contar arquivos por tipo
echo "📊 Contagem de arquivos:"
echo "TypeScript/TSX: $(find src -name "*.ts" -o -name "*.tsx" | wc -l)"
echo "JavaScript/JSX: $(find src -name "*.js" -o -name "*.jsx" | wc -l)"
echo "Outros: $(find src -type f | grep -v -E "\.(ts|tsx|js|jsx)$" | wc -l)"

echo ""
echo "📏 Analisando tamanho dos arquivos..."

# Maiores arquivos
echo "Maiores arquivos fonte:"
find src -name "*.ts" -o -name "*.tsx" | xargs ls -lh | sort -k5 -hr | head -5

echo ""
echo "🔧 Verificando qualidade do código..."

# Verificar imports não utilizados (simples)
echo "Verificando imports potencialmente não utilizados..."
grep -r "import.*from" src/ | wc -l
echo "Total de imports encontrados"

echo ""
echo "📋 Estatísticas do código:"
echo "- Linhas de código: $(find src -name "*.ts" -o -name "*.tsx" | xargs wc -l | tail -1 | awk '{print $1}')"
echo "- Componentes React: $(grep -r "export default" src/components/ | wc -l)"
echo "- Funções utilitárias: $(grep -r "export" src/lib/ | wc -l)"

echo ""
echo "✅ Análise de código concluída!"