#!/bin/bash

echo "🔧 Verificação de Configurações de Segurança"
echo "==========================================="

# Verificar se as implementações de segurança estão presentes
echo ""
echo "📁 Verificando arquivos de código..."

# Verificar criptografia
if grep -q "crypto-js" "src/lib/store.ts"; then
    echo "✅ Criptografia localStorage: IMPLEMENTADA"
else
    echo "❌ Criptografia localStorage: NÃO ENCONTRADA"
fi

# Verificar sanitização
if grep -q "DOMPurify" "src/components/AIChat.tsx"; then
    echo "✅ Sanitização HTML: IMPLEMENTADA"
else
    echo "❌ Sanitização HTML: NÃO ENCONTRADA"
fi

# Verificar anonimização
if grep -q "getRange" "src/components/AIChat.tsx"; then
    echo "✅ Anonimização de dados IA: IMPLEMENTADA"
else
    echo "❌ Anonimização de dados IA: NÃO ENCONTRADA"
fi

# Verificar botão de limpeza
if grep -q "handleClearData" "src/pages/index.tsx"; then
    echo "✅ Controle de dados do usuário: IMPLEMENTADO"
else
    echo "❌ Controle de dados do usuário: NÃO ENCONTRADO"
fi

echo ""
echo "📦 Verificando dependências de segurança..."
if grep -q "crypto-js" "package.json"; then
    echo "✅ crypto-js: INSTALADO"
else
    echo "❌ crypto-js: NÃO ENCONTRADO"
fi

if grep -q "dompurify" "package.json"; then
    echo "✅ dompurify: INSTALADO"
else
    echo "❌ dompurify: NÃO ENCONTRADO"
fi

echo ""
echo "🔍 Verificações adicionais..."

# Verificar se há chaves hardcoded (simples)
if grep -q "ANTHROPIC_API_KEY" "src/pages/api/ai-chat.ts"; then
    echo "⚠️  API key referenciada no código (verificar se é segura)"
else
    echo "❌ API key não encontrada no código"
fi

# Verificar localStorage usage
if grep -q "localStorage" "src/lib/store.ts"; then
    echo "ℹ️  localStorage ainda referenciado (verificar se é via encryptedStorage)"
else
    echo "✅ localStorage não usado diretamente"
fi

echo ""
echo "📋 Status das implementações de segurança:"
echo "- Criptografia: $(grep -q "crypto-js" "src/lib/store.ts" && echo "✅" || echo "❌")"
echo "- Sanitização: $(grep -q "DOMPurify" "src/components/AIChat.tsx" && echo "✅" || echo "❌")"
echo "- Anonimização: $(grep -q "getRange" "src/components/AIChat.tsx" && echo "✅" || echo "❌")"
echo "- Controle usuário: $(grep -q "handleClearData" "src/pages/index.tsx" && echo "✅" || echo "❌")"

echo ""
echo "✅ Verificação de configurações concluída!"