import { useState, useRef, useEffect } from 'react'
import { useFinanceStore } from '@/lib/store'
import { getCurrentMonth, getRange, getPercentRange } from '@/lib/utils'
import { Send, Bot, Sparkles } from 'lucide-react'
import DOMPurify from 'dompurify'

interface Message {
  role: 'user' | 'assistant'
  content: string
  time: string
}

const QUICK_QUESTIONS = [
  '💰 Quanto gastei hoje?',
  '📊 Como estou esse mês?',
  '💳 Quanto tenho no cartão?',
  '🏦 Qual meu saldo total?',
  '⚠️ Quais contas vencem essa semana?',
  '💡 Onde posso economizar?',
  '📈 Análise dos meus gastos',
]

export default function AIChat() {
  const store = useFinanceStore()
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Oi! 👋 Sou o **FinBot**, seu assistente financeiro pessoal!\n\nPosso te ajudar a:\n• Consultar saldos e gastos 💰\n• Analisar seus hábitos financeiros 📊\n• Ver contas a vencer 📅\n• Dar dicas de economia 💡\n\nComo posso te ajudar hoje?`,
      time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const buildContext = () => {
    const currentMonth = getCurrentMonth()
    const monthTx = store.transactions.filter(t => t.date.startsWith(currentMonth))
    const todayStr = new Date().toISOString().slice(0, 10)
    const todayTx = store.transactions.filter(t => t.date.startsWith(todayStr))
    
    const monthExpense = monthTx.filter(t => t.type === 'expense').reduce((a, t) => a + t.amount, 0)
    const monthIncome = monthTx.filter(t => t.type === 'income').reduce((a, t) => a + t.amount, 0) + store.monthlyIncome
    const todayExpense = todayTx.filter(t => t.type === 'expense').reduce((a, t) => a + t.amount, 0)
    
    const catMap: Record<string, number> = {}
    monthTx.filter(t => t.type === 'expense').forEach(t => { catMap[t.category] = (catMap[t.category] || 0) + t.amount })
    
    const weekBills = store.bills.filter(b => {
      const today = new Date().getDate()
      return !b.paid && b.dueDay >= today && b.dueDay <= today + 7 && b.month === currentMonth
    })
    
    // Anonymize data: use ranges instead of exact values
    
    return {
      usuario: store.userName || 'usuário',
      dataHoje: new Date().toLocaleDateString('pt-BR'),
      gastosHoje: getRange(todayExpense),
      transacoesHoje: todayTx.filter(t => t.type === 'expense').length, // count only
      mesAtual: {
        gastoTotal: getRange(monthExpense),
        receitaTotal: getRange(monthIncome),
        saldo: monthIncome - monthExpense > 0 ? 'positivo' : 'negativo',
        gastosPorCategoria: Object.keys(catMap).sort((a, b) => catMap[b] - catMap[a]).slice(0, 3), // top 3 categories only
      },
      bancos: store.banks.length, // count only
      saldoBancarioTotal: getRange(store.banks.reduce((a, b) => a + b.balance, 0)),
      cartoes: store.creditCards.map(c => ({
        percentUsado: getPercentRange(c.used, c.limit),
        venceDia: c.dueDay,
      })),
      contasVencendoEssaSemana: weekBills.length, // count only
      totalAPagarMes: getRange(store.bills.filter(b => !b.paid && b.month === currentMonth).reduce((a, b) => a + b.amount, 0)),
      ultimasTransacoes: store.transactions.slice(0, 5).map(t => ({
        tipo: t.type === 'expense' ? 'gasto' : 'entrada',
        categoria: t.category,
      })) // no amounts or descriptions
    }
  }

  const sendMessage = async (text?: string) => {
    const msg = (text || input).trim()
    if (!msg) return

    const userMsg: Message = { role: 'user', content: msg, time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const apiMessages = [...messages, userMsg].map(m => ({ role: m.role, content: m.content }))
      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages, financialContext: buildContext() }),
      })
      if (!res.ok) throw new Error(`API error: ${res.status}`)
      const data = await res.json()
      const reply = typeof data.reply === 'string' ? data.reply : 'Desculpe, não consegui processar sua pergunta.'
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: reply,
        time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      }])
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Desculpe, ocorreu um erro. Tente novamente! 😅',
        time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      }])
    } finally {
      setLoading(false)
    }
  }

  const formatText = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/•/g, '•')
      .split('\n').map((line, i) => `<span key="${i}">${line}</span>`).join('<br/>')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', paddingBottom: 70 }}>
      {/* Header */}
      <div className="glass p-4 flex items-center gap-3 flex-shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="relative">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl" style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>
            <Bot size={20} color="white" />
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-400" style={{ border: '2px solid var(--bg)' }} />
        </div>
        <div>
          <p className="font-bold text-sm" style={{ fontFamily: 'var(--font-display)' }}>FinBot IA</p>
          <p className="text-xs" style={{ color: 'var(--accent2)' }}>● Online • Assistente Financeiro</p>
        </div>
        <div className="ml-auto">
          <Sparkles size={18} style={{ color: 'var(--accent)' }} />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ overflowY: 'auto' }}>
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-chat-in`}>
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full flex items-center justify-center mr-2 flex-shrink-0 mt-auto" style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', flexShrink: 0 }}>
                <Bot size={14} color="white" />
              </div>
            )}
            <div>
              <div className={msg.role === 'user' ? 'bubble-user' : 'bubble-bot'}>
                <p className="text-sm leading-relaxed" style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</p>
              </div>
              <p className="text-xs mt-1 px-1" style={{ color: 'var(--text-muted)', textAlign: msg.role === 'user' ? 'right' : 'left' }}>{msg.time}</p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start animate-chat-in">
            <div className="w-8 h-8 rounded-full flex items-center justify-center mr-2" style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', flexShrink: 0 }}>
              <Bot size={14} color="white" />
            </div>
            <div className="bubble-bot flex items-center gap-1.5">
              {[0, 1, 2].map(d => (
                <div key={d} style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', animation: `pulse-glow 1.2s ${d * 0.2}s infinite` }} />
              ))}
            </div>
          </div>
        )}

        {/* Quick questions (only if few messages) */}
        {messages.length <= 1 && (
          <div className="space-y-2 animate-fade-in">
            <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>Perguntas rápidas:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {QUICK_QUESTIONS.map((q, i) => (
                <button key={i} onClick={() => sendMessage(q)} className="px-3 py-1.5 rounded-full text-xs font-medium transition-all glass-hover" style={{
                  background: 'var(--bg-card2)', border: '1px solid var(--border)', color: 'var(--text-secondary)'
                }}>
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-3 flex-shrink-0" style={{ background: 'var(--bg)', borderTop: '1px solid var(--border)' }}>
        <div className="flex gap-2 items-center max-w-2xl mx-auto">
          <input
            ref={inputRef}
            className="fin-input flex-1"
            placeholder="Pergunte sobre seus gastos..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            disabled={loading}
          />
          <button onClick={() => sendMessage()} disabled={loading || !input.trim()} className="w-11 h-11 rounded-xl flex items-center justify-center transition-all flex-shrink-0" style={{
            background: input.trim() && !loading ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)' : 'var(--bg-card2)',
            opacity: !input.trim() || loading ? 0.5 : 1,
          }}>
            <Send size={16} color="white" />
          </button>
        </div>
      </div>
    </div>
  )
}
