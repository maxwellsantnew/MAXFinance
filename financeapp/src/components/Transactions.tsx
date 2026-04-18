import { useState, useMemo } from 'react'
import { useFinanceStore, Category } from '@/lib/store'
import { formatCurrency, formatDate, getCurrentMonth, CATEGORY_COLORS, CATEGORY_ICONS } from '@/lib/utils'
import { Plus, Trash2, X } from 'lucide-react'
import { v4 as uuid } from 'uuid'

const CATEGORIES: Category[] = ['alimentação', 'transporte', 'moradia', 'saúde', 'lazer', 'educação', 'vestuário', 'investimento', 'cartão', 'outros']

export default function Transactions() {
  const { transactions, addTransaction, removeTransaction, creditCards, updateCreditCard } = useFinanceStore()
  const [showModal, setShowModal] = useState(false)
  const [filter, setFilter] = useState<'all' | 'expense' | 'income'>('all')
  const [filterCat, setFilterCat] = useState<string>('all')

  const [form, setForm] = useState({
    type: 'expense' as 'expense' | 'income',
    amount: '',
    description: '',
    category: 'alimentação' as Category,
    paymentMethod: 'pix' as 'pix' | 'dinheiro' | 'débito' | 'crédito',
    date: new Date().toISOString().slice(0, 10),
    cardId: '',
  })

  const currentMonth = getCurrentMonth()
  const filtered = useMemo(() => {
    let list = transactions
    if (filter !== 'all') list = list.filter(t => t.type === filter)
    if (filterCat !== 'all') list = list.filter(t => t.category === filterCat)
    return list.slice(0, 50)
  }, [transactions, filter, filterCat])

  const thisMonthExpense = useMemo(() =>
    transactions.filter(t => t.type === 'expense' && t.date.startsWith(currentMonth)).reduce((a, t) => a + t.amount, 0),
    [transactions, currentMonth]
  )
  const thisMonthIncome = useMemo(() =>
    transactions.filter(t => t.type === 'income' && t.date.startsWith(currentMonth)).reduce((a, t) => a + t.amount, 0),
    [transactions, currentMonth]
  )

  const handleSubmit = () => {
    const amount = parseFloat(form.amount.replace(',', '.'))
    if (!amount || !form.description.trim()) return

    addTransaction({
      id: uuid(),
      type: form.type,
      amount,
      description: form.description.trim(),
      category: form.type === 'income' ? 'receita' : form.category,
      paymentMethod: form.paymentMethod,
      date: new Date().toISOString(),
    })

    // Update card usage if credit payment
    if (form.type === 'expense' && form.paymentMethod === 'crédito' && form.cardId) {
      const card = creditCards.find(c => c.id === form.cardId)
      if (card) updateCreditCard(card.id, card.used + amount)
    }

    setForm({ type: 'expense', amount: '', description: '', category: 'alimentação', paymentMethod: 'pix', date: new Date().toISOString().slice(0, 10), cardId: '' })
    setShowModal(false)
  }

  return (
    <div className="page-content p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between animate-slide-up">
        <div>
          <h1 className="text-xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>Transações</h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Registre seus gastos e entradas</p>
        </div>
        <button className="btn-primary flex items-center gap-1.5 py-2 px-4" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Nova
        </button>
      </div>

      {/* Month summary */}
      <div className="grid grid-cols-2 gap-3 animate-slide-up" style={{ animationDelay: '40ms' }}>
        <div className="glass rounded-2xl p-3 text-center">
          <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Entradas do mês</p>
          <p className="font-bold text-green-400" style={{ fontFamily: 'var(--font-display)' }}>{formatCurrency(thisMonthIncome)}</p>
        </div>
        <div className="glass rounded-2xl p-3 text-center">
          <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Saídas do mês</p>
          <p className="font-bold text-red-400" style={{ fontFamily: 'var(--font-display)' }}>{formatCurrency(thisMonthExpense)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-1 animate-slide-up" style={{ animationDelay: '60ms' }}>
        {(['all', 'expense', 'income'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all" style={{
            background: filter === f ? 'var(--accent)' : 'var(--bg-card2)',
            color: filter === f ? 'white' : 'var(--text-secondary)',
            border: `1px solid ${filter === f ? 'var(--accent)' : 'var(--border)'}`,
          }}>
            {f === 'all' ? 'Todas' : f === 'expense' ? 'Gastos' : 'Entradas'}
          </button>
        ))}
        <div style={{ width: 1, background: 'var(--border)', flexShrink: 0 }} />
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => setFilterCat(filterCat === c ? 'all' : c)} className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all" style={{
            background: filterCat === c ? CATEGORY_COLORS[c] + '33' : 'var(--bg-card2)',
            color: filterCat === c ? CATEGORY_COLORS[c] : 'var(--text-secondary)',
            border: `1px solid ${filterCat === c ? CATEGORY_COLORS[c] : 'var(--border)'}`,
          }}>
            {CATEGORY_ICONS[c]} {c}
          </button>
        ))}
      </div>

      {/* Transaction list */}
      <div className="space-y-2 animate-slide-up" style={{ animationDelay: '80ms' }}>
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">📭</div>
            <p className="font-semibold">Nenhuma transação</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Toque em Nova para registrar</p>
          </div>
        ) : filtered.map((t, i) => (
          <div key={t.id} className="glass glass-hover rounded-xl p-3.5 flex items-center gap-3 animate-slide-up" style={{ animationDelay: `${i * 20}ms` }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0" style={{ background: CATEGORY_COLORS[t.category] + '22' }}>
              {CATEGORY_ICONS[t.category]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{t.description}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs px-1.5 py-0.5 rounded-md" style={{ background: CATEGORY_COLORS[t.category] + '22', color: CATEGORY_COLORS[t.category], fontSize: 10 }}>
                  {t.category}
                </span>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{formatDate(t.date)}</span>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>· {t.paymentMethod}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className={`font-bold text-sm ${t.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
              </span>
              <button onClick={() => removeTransaction(t.id)} className="p-1 rounded-lg transition-colors hover:bg-red-500/10">
                <Trash2 size={13} style={{ color: 'var(--text-muted)' }} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Transaction Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
          <div className="w-full max-w-lg flex flex-col rounded-t-3xl animate-slide-up" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', maxHeight: '90vh' }}>
          <div className="p-6 pb-2 space-y-4 overflow-y-auto flex-1">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold" style={{ fontFamily: 'var(--font-display)' }}>Nova Transação</h2>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-xl" style={{ background: 'var(--bg-card2)' }}>
                <X size={18} />
              </button>
            </div>

            {/* Type toggle */}
            <div className="grid grid-cols-2 gap-2 p-1 rounded-xl" style={{ background: 'var(--bg-card2)' }}>
              {(['expense', 'income'] as const).map(t => (
                <button key={t} onClick={() => setForm(f => ({ ...f, type: t }))} className="py-2.5 rounded-lg text-sm font-semibold transition-all" style={{
                  background: form.type === t ? (t === 'income' ? '#10b981' : '#ef4444') : 'transparent',
                  color: form.type === t ? 'white' : 'var(--text-muted)',
                }}>
                  {t === 'expense' ? '💸 Gasto' : '💰 Entrada'}
                </button>
              ))}
            </div>

            <div>
              <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Valor</label>
              <input className="fin-input text-xl font-bold" placeholder="R$ 0,00" value={form.amount}
                onChange={e => setForm(f => ({ ...f, amount: e.target.value.replace(/[^0-9,.]/g, '') }))} />
            </div>

            <div>
              <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Descrição</label>
              <input className="fin-input" placeholder="Ex: Almoço, Uber, Mercado..." value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>

            {form.type === 'expense' && (
              <div>
                <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Categoria</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {CATEGORIES.map(c => (
                    <button key={c} onClick={() => setForm(f => ({ ...f, category: c }))} className="p-2 rounded-xl text-xs flex flex-col items-center gap-1 transition-all" style={{
                      background: form.category === c ? CATEGORY_COLORS[c] + '33' : 'var(--bg-card2)',
                      border: `1px solid ${form.category === c ? CATEGORY_COLORS[c] : 'var(--border)'}`,
                      color: form.category === c ? CATEGORY_COLORS[c] : 'var(--text-muted)',
                    }}>
                      <span className="text-lg">{CATEGORY_ICONS[c]}</span>
                      <span>{c}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Forma de pagamento</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(['pix', 'dinheiro', 'débito', 'crédito'] as const).map(m => (
                  <button key={m} onClick={() => setForm(f => ({ ...f, paymentMethod: m }))} className="py-2 rounded-xl text-xs font-medium transition-all capitalize" style={{
                    background: form.paymentMethod === m ? 'var(--accent)' : 'var(--bg-card2)',
                    color: form.paymentMethod === m ? 'white' : 'var(--text-muted)',
                    border: `1px solid ${form.paymentMethod === m ? 'var(--accent)' : 'var(--border)'}`,
                  }}>
                    {m}
                  </button>
                ))}
              </div>
            </div>

            </div>

            {/* Botão fixo no rodapé */}
            <div className="p-4" style={{ borderTop: '1px solid var(--border)', flexShrink: 0 }}>
              <button className="btn-primary w-full py-3 text-base" onClick={handleSubmit}>
                Registrar Transação
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
