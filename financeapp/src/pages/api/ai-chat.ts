import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const { messages, financialContext } = req.body

  const systemPrompt = `Você é o FinBot, assistente financeiro pessoal inteligente e empático do app FinanceAI. 
Você ajuda brasileiros a controlar melhor seus gastos, economizar dinheiro e tomar decisões financeiras mais conscientes.

CONTEXTO FINANCEIRO ATUAL DO USUÁRIO:
${JSON.stringify(financialContext, null, 2)}

Suas responsabilidades:
- Analisar os dados financeiros e dar insights práticos em português BR
- Identificar padrões de gastos preocupantes
- Sugerir onde o usuário pode economizar
- Responder perguntas sobre saldo, gastos, cartões e contas
- Dar dicas de educação financeira simples e acessíveis
- Responder como se fosse via WhatsApp (mensagens curtas, emojis, linguagem informal mas profissional)
- Sempre ser positivo e encorajador, mesmo ao apontar problemas

Exemplos de perguntas que você responde:
- "Quanto gastei hoje?"
- "Qual meu saldo no Nubank?"
- "Quanto tenho no cartão?"
- "Quais contas vencem essa semana?"
- "Como estou esse mês?"
- "Onde posso economizar?"

Responda sempre em português brasileiro, de forma clara, concisa e com emojis relevantes. Máximo 3 parágrafos por resposta.`

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY || '',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1000,
        system: systemPrompt,
        messages,
      }),
    })

    const data = await response.json()
    const text = data.content?.map((c: { type: string; text?: string }) => c.type === 'text' ? c.text : '').join('') || 'Desculpe, não consegui processar sua pergunta.'
    
    res.json({ reply: text })
  } catch {
    res.status(500).json({ reply: 'Erro ao conectar com o assistente. Tente novamente.' })
  }
}
