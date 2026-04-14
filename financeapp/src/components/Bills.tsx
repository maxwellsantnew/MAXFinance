import { useState } from 'react'
import { useFinanceStore, Category } from '@/lib/store'
import { formatCurrency, getCurrentMonth, CATEGORY_COLORS, CATEGORY_ICONS } from '@/lib/utils'
import { Plus, X, Check, Trash2 } from 'lucide-react'
import { v4 as uuid } from 'uuid'

const BILL_CATEGORIES: Category[] = ['moradia', 'saúde', 'educação', 'transporte', 'lazer', 'cartão', 'outros']

export default function Bills() {
  const { bills, addBill, toggleBillPaid, removeBill } = useFinanceStore()
  const currentMonth = getCurrentMonth()
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ name: '', amount: '', dueDay: '10', category: 'moradia' as Category })

  const monthBills = bills.filter(b => b.month === currentMonth)
  const totalPending = monthBills.filter(b => !b.paid).reduce((a, b) => a + b.amount, 0)
  const totalPaid = monthBills.filter(b => b.paid).reduce((a, b) => a + b.amount, 0)
  const total = monthBills.reduce((a, b) => a + b.amount, 0)

  const handleAdd = () => {
    const amount = parseFloat(form.amount.replace(',', '.'))
    if (!form.name.trim() || isNaN(amount)) return
    addBill({ id: uuid(), name: form.name.trim(), amount, dueDay: parseInt(form.dueDay), category: form.category, paid: false, month: currentMonth })
    setForm({ name: '', amount: '', dueDay: '10', category: 'moradia' })
    setShowModal(false)
  }

  const pending = monthBills.filter(b => !b.paid).sort((a, b) => a.dueDay - b.dueDay)
  const paid = monthBills.filter(b => b.paid)

  const today = new Date().getDate()

  return (
    <div className="page-content p-4 space-y-4">
      <div className="flex items-center justify-between animate-slide-up">
        <div>
          <h1 className="text-xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>Contas do Mês</h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Controle seus compromissos financeiros</p>
        </div>
        <button className="btn-primary flex items-center gap-1.5 py-2 px-4" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Nova
        </button>
      </div>

      {/* Summary */}
      <div className="animate-slide-up glass rounded-2xl p-4" style={{ animationDelay: '40ms' }}>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Total</p>
            <p className="font-bold" style={{ fontFamily: 'var(--font-display)' }}>{formatCurrency(total)}</p>
          </div>
          <div>
            <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Pendente</p>
            <p className="font-bold text-yellow-400" style={{ fontFamily: 'var(--font-display)' }}>{formatCurrency(totalPending)}</p>
          </div>
          <div>
            <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Pago</p>
            <p className="font-bold text-green-400" style={{ fontFamily: 'var(--font-display)' }}>{formatCurrency(totalPaid)}</p>
          </div>
        </div>
        {total > 0 && (
          <div className="mt-3 progress-bar">
            <div className="progress-fill" style={{ width: `${(totalPaid / total) * 100}%`, background: 'linear-gradient(90deg, #3b82f6, #10b981)' }} />
          </div>
        )}
      </div>

      {/* Pending bills */}
      {pending.length > 0 && (
        <div className="space-y-2 animate-slide-up" style={{ animationDelay: '80ms' }}>
          <h2 className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>⏳ Pendentes</h2>
          {pending.map(bill => {
            const overdue = bill.dueDay < today
            const dueSoon = !overdue && bill.dueDay <= today + 3
            return (
              <div key={bill.id} className="glass glass-hover rounded-xl p-4 flex items-center gap-3">
                <button onClick={() => toggleBillPaid(bill.id)}
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
                  style={{ border: `2px solid ${overdue ? '#ef4444' : dueSoon ? '#f59e0b' : 'var(--border)'}` }}>
                  <Check size={14} style={{ color: 'var(--text-muted)' }} />
                </button>
                <div className="flex items-center gap-2 flex-shrink-0 w-8 h-8 rounded-lg justify-center" style={{ background: CATEGORY_COLORS[bill.category] + '22', fontSize: 16 }}>
                  {CATEGORY_ICONS[bill.category]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{bill.name}</p>
                  <p className="text-xs mt-0.5" style={{ color: overdue ? '#ef4444' : dueSoon ? '#f59e0b' : 'var(--text-muted)' }}>
                    {overdue ? '🔴 Venceu' : dueSoon ? '🟡 Vence em breve' : '🟢 Vence'} dia {bill.dueDay}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm" style={{ color: overdue ? '#ef4444' : 'var(--text-primary)' }}>{formatCurrency(bill.amount)}</span>
                  <button onClick={() => removeBill(bill.id)} className="p-1 rounded-lg hover:bg-red-500/10 transition-colors">
                    <Trash2 size={12} style={{ color: 'var(--text-muted)' }} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Paid bills */}
      {paid.length > 0 && (
        <div className="space-y-2 animate-slide-up" style={{ animationDelay: '120ms' }}>
          <h2 className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>✅ Pagas</h2>
          {paid.map(bill => (
            <div key={bill.id} className="rounded-xl p-4 flex items-center gap-3" style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.12)', opacity: 0.7 }}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-green-500/20 text-green-400">
                <Check size={14} />
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 w-8 h-8 rounded-lg justify-center text-base" style={{ background: CATEGORY_COLORS[bill.category] + '22' }}>
                {CATEGORY_ICONS[bill.category]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium line-through" style={{ color: 'var(--text-secondary)' }}>{bill.name}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Paga ✓</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-green-400">{formatCurrency(bill.amount)}</span>
                <button onClick={() => removeBill(bill.id)} className="p-1 rounded-lg hover:bg-red-500/10 transition-colors">
                  <Trash2 size={12} style={{ color: 'var(--text-muted)' }} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {monthBills.length === 0 && (
        <div className="text-center py-16 animate-fade-in">
          <div className="text-5xl mb-3 animate-float">📅</div>
          <p className="font-semibold text-lg" style={{ fontFamily: 'var(--font-display)' }}>Nenhuma conta cadastrada</p>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Adicione suas contas mensais para não perder nenhum vencimento.</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
          <div className="w-full max-w-lg rounded-t-3xl p-6 space-y-4 animate-slide-up" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold" style={{ fontFamily: 'var(--font-display)' }}>Nova Conta</h2>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-xl" style={{ background: 'var(--bg-card2)' }}><X size={18} /></button>
            </div>

            <div>
              <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Nome da conta</label>
              <input className="fin-input" placeholder="Ex: Aluguel, Internet, Academia..." value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Valor</label>
                <input className="fin-input" placeholder="R$ 0,00" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value.replace(/[^0-9,.]/g, '') }))} />
              </div>
              <div>
                <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Dia do vencimento</label>
                <input className="fin-input" type="number" min="1" max="31" value={form.dueDay} onChange={e => setForm(f => ({ ...f, dueDay: e.target.value }))} />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-muted)' }}>Categoria</label>
              <div className="grid grid-cols-4 gap-2">
                {BILL_CATEGORIES.map(c => (
                  <button key={c} onClick={() => setForm(f => ({ ...f, category: c }))} className="py-2 rounded-xl text-center text-xs flex flex-col items-center gap-1 transition-all" style={{
                    background: form.category === c ? CATEGORY_COLORS[c] + '33' : 'var(--bg-card2)',
                    border: `1px solid ${form.category === c ? CATEGORY_COLORS[c] : 'var(--border)'}`,
                    color: form.category === c ? CATEGORY_COLORS[c] : 'var(--text-muted)',
                  }}>
                    <span className="text-base">{CATEGORY_ICONS[c]}</span>
                    <span style={{ fontSize: 10 }}>{c}</span>
                  </button>
                ))}
              </div>
            </div>

            <button className="btn-primary w-full py-3" onClick={handleAdd}>Adicionar Conta</button>
          </div>
        </div>
      )}
    </div>
  )
}
