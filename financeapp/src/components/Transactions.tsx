import { useState, useMemo } from 'react'
import { useFinanceStore, Category } from '@/lib/store'
import { formatCurrency, formatDate, getCurrentMonth, CATEGORY_COLORS, CATEGORY_ICONS } from '@/lib/utils'
import { Plus, Trash2, X, Pencil } from 'lucide-react'
import { v4 as uuid } from 'uuid'

const CATEGORIES: Category[] = ['alimentação', 'transporte', 'moradia', 'saúde', 'lazer', 'educação', 'vestuário', 'investimento', 'cartão', 'outros']

const createEmptyForm = () => ({
  type: 'expense' as 'expense' | 'income',
  amount: '',
  description: '',
  category: 'alimentação' as Category,
  paymentMethod: 'pix' as 'pix' | 'dinheiro' | 'débito' | 'crédito',
  date: new Date().toISOString().slice(0, 10),
  cardId: '',
})

export default function Transactions() {
  const { transactions, addTransaction, updateTransaction, removeTransaction, creditCards, updateCreditCard } = useFinanceStore()
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'expense' | 'income'>('all')
  const [filterCat, setFilterCat] = useState<string>('all')

  const [form, setForm] = useState(createEmptyForm)

  const closeModal = () => {
    setShowModal(false)
    setEditingId(null)
    setForm(createEmptyForm())
  }

  const openEditModal = (id: string) => {
    const transaction = transactions.find(t => t.id === id)
    if (!transaction) return
    setEditingId(id)
    setForm({
      type: transaction.type,
      amount: String(transaction.amount),
      description: transaction.description,
      category: transaction.category,
      paymentMethod: transaction.paymentMethod,
      date: transaction.date.slice(0, 10),
      cardId: transaction.cardId || '',
    })
    setShowModal(true)
  }

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

    const existing = editingId ? transactions.find(t => t.id === editingId) : undefined
    if (editingId && !existing) return

    const transaction = {
      type: form.type,
      amount,
      description: form.description.trim(),
      category: form.type === 'income' ? 'receita' : form.category,
      paymentMethod: form.paymentMethod,
      date: new Date(`${form.date}T00:00:00.000Z`).toISOString(),
      cardId: form.type === 'expense' && form.paymentMethod === 'crédito' ? form.cardId || undefined : undefined,
    }

    const cardUsageChanges = new Map<string, number>()
    if (existing?.type === 'expense' && existing.paymentMethod === 'crédito' && existing.cardId) {
      cardUsageChanges.set(existing.cardId, (cardUsageChanges.get(existing.cardId) || 0) - existing.amount)
    }
    if (transaction.type === 'expense' && transaction.paymentMethod === 'crédito' && transaction.cardId) {
      cardUsageChanges.set(transaction.cardId, (cardUsageChanges.get(transaction.cardId) || 0) + amount)
    }
    cardUsageChanges.forEach((change, cardId) => {
      const card = creditCards.find(c => c.id === cardId)
      if (card && change !== 0) updateCreditCard(card.id, Math.max(0, card.used + change))
    })

    if (editingId) {
      updateTransaction(editingId, transaction)
    } else {
      addTransaction({ id: uuid(), ...transaction })
    }
    closeModal()
  }

  return (
    <div className="page-content p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between animate-slide-up">
        <div>
          <h1 className="text-xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>Transações</h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Registre seus gastos e entradas</p>
        </div>
        <button className="btn-primary flex items-center gap-1.5 py-2 px-4" onClick={() => { setEditingId(null); setForm(createEmptyForm()); setShowModal(true) }}>
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
              <button onClick={() => openEditModal(t.id)} className="p-1 rounded-lg transition-colors hover:bg-blue-500/10" aria-label="Editar transação">
                <Pencil size={13} style={{ color: 'var(--text-muted)' }} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Transaction Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-end justify-center p-1 pb-20 sm:p-3 sm:pb-3" onClick={event => { if (event.target === event.currentTarget) closeModal() }} style={{ zIndex: 9999, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
          <div className="modal-sheet animate-slide-up">
          <div className="modal-sheet-header">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold" style={{ fontFamily: 'var(--font-display)' }}>{editingId ? 'Editar Transação' : 'Nova Transação'}</h2>
              <button onClick={closeModal} className="p-2 rounded-xl" style={{ background: 'var(--bg-card2)' }}>
                <X size={18} />
              </button>
            </div>
          </div>

          <div className="modal-sheet-body space-y-4">

            {/* Type toggle */}
            <div className="grid grid-cols-2 gap-2 p-1 rounded-xl" style={{ background: 'var(--bg-card2)' }}>
              {(['expense', 'income'] as const).map(t => (
                <button key={t} onClick={() => setForm(f => ({ ...f, type: t, cardId: t === 'income' ? '' : f.cardId }))} className="py-2.5 rounded-lg text-sm font-semibold transition-all" style={{
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
              <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Data</label>
              <input className="fin-input" type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
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

            {form.type === 'expense' && form.paymentMethod === 'crédito' && (
              <div>
                <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Cartão de crédito</label>
                {creditCards.length > 0 ? (
                  <select className="fin-input" value={form.cardId} onChange={e => setForm(f => ({ ...f, cardId: e.target.value }))}>
                    <option value="">Selecione um cartão</option>
                    {creditCards.map(card => <option key={card.id} value={card.id}>{card.name}</option>)}
                  </select>
                ) : (
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Cadastre um cartão antes de associá-lo à transação.</p>
                )}
              </div>
            )}

            </div>

            <div className="modal-sheet-footer">
              <button className="btn-primary w-full py-3 text-base" onClick={handleSubmit}>
                {editingId ? 'Salvar Alterações' : 'Confirmar Transação'}
              </button>
            </div>
          </div>
          <button onClick={closeModal} className="fixed p-2 rounded-xl" style={{ top: 'calc(env(safe-area-inset-top, 0px) + 16px)', right: 'calc(env(safe-area-inset-right, 0px) + 16px)', zIndex: 10000, background: 'var(--bg-card2)' }} aria-label="Fechar modal">
            <X size={18} />
          </button>
        </div>
      )}
    </div>
  )
}
