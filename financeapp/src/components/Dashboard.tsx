import { useMemo } from 'react'
import { useFinanceStore } from '@/lib/store'
import { formatCurrency, getCurrentMonth, getMonthName, CATEGORY_COLORS, CATEGORY_ICONS } from '@/lib/utils'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { TrendingUp, TrendingDown, AlertCircle, CreditCard, Landmark, Calendar } from 'lucide-react'

export default function Dashboard() {
  const { transactions, bills, creditCards, banks, monthlyIncome, userName } = useFinanceStore()
  const currentMonth = getCurrentMonth()

  const monthTx = useMemo(() =>
    transactions.filter(t => t.date.startsWith(currentMonth)),
    [transactions, currentMonth]
  )

  const totalExpense = useMemo(() =>
    monthTx.filter(t => t.type === 'expense').reduce((a, t) => a + t.amount, 0),
    [monthTx]
  )
  const totalIncome = useMemo(() =>
    monthTx.filter(t => t.type === 'income').reduce((a, t) => a + t.amount, 0) + monthlyIncome,
    [monthTx, monthlyIncome]
  )

  const totalBankBalance = banks.reduce((a, b) => a + b.balance, 0)

  const categoryData = useMemo(() => {
    const map: Record<string, number> = {}
    monthTx.filter(t => t.type === 'expense').forEach(t => {
      map[t.category] = (map[t.category] || 0) + t.amount
    })
    return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value)
  }, [monthTx])

  const pendingBills = bills.filter(b => !b.paid && b.month === currentMonth)
  const totalPending = pendingBills.reduce((a, b) => a + b.amount, 0)

  const todayStr = new Date().toISOString().slice(0, 10)
  const todayExpenses = transactions.filter(t => t.date.startsWith(todayStr) && t.type === 'expense')
  const todayTotal = todayExpenses.reduce((a, t) => a + t.amount, 0)

  const balance = totalIncome - totalExpense
  const balancePct = totalIncome > 0 ? Math.min((totalExpense / totalIncome) * 100, 100) : 0

  return (
    <div className="page-content p-4 space-y-5">
      {/* Header */}
      <div className="animate-slide-up" style={{ animationDelay: '0ms' }}>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
        <h1 className="text-2xl font-bold mt-1" style={{ fontFamily: 'var(--font-display)' }}>
          Olá{userName ? `, ${userName.split(' ')[0]}` : ''}! 👋
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
          {getMonthName(currentMonth)}
        </p>
      </div>

      {/* Main balance card */}
      <div className="animate-slide-up glass rounded-2xl p-5 relative overflow-hidden" style={{ animationDelay: '60ms' }}>
        <div style={{
          position: 'absolute', top: -40, right: -40,
          width: 160, height: 160, borderRadius: '50%',
          background: balance >= 0 ? 'radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)' : 'radial-gradient(circle, rgba(239,68,68,0.1) 0%, transparent 70%)'
        }} />
        <p className="text-xs uppercase tracking-widest mb-1" style={{ color: 'var(--text-muted)' }}>Balanço do mês</p>
        <p className={`text-4xl font-bold ${balance >= 0 ? 'text-green-400' : 'text-red-400'}`} style={{ fontFamily: 'var(--font-display)' }}>
          {formatCurrency(balance)}
        </p>
        <div className="mt-4 progress-bar">
          <div className="progress-fill" style={{
            width: `${balancePct}%`,
            background: balancePct > 80 ? 'linear-gradient(90deg, #f59e0b, #ef4444)' : 'linear-gradient(90deg, #3b82f6, #10b981)'
          }} />
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Gasto: {formatCurrency(totalExpense)}</span>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Renda: {formatCurrency(totalIncome)}</span>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="rounded-xl p-3" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)' }}>
            <div className="flex items-center gap-1.5 mb-1">
              <TrendingUp size={13} className="text-green-400" />
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Entradas</span>
            </div>
            <p className="font-semibold text-green-400 text-sm">{formatCurrency(totalIncome)}</p>
          </div>
          <div className="rounded-xl p-3" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)' }}>
            <div className="flex items-center gap-1.5 mb-1">
              <TrendingDown size={13} className="text-red-400" />
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Saídas</span>
            </div>
            <p className="font-semibold text-red-400 text-sm">{formatCurrency(totalExpense)}</p>
          </div>
        </div>
      </div>

      {/* Today alert */}
      {todayTotal > 0 && (
        <div className="animate-slide-up rounded-2xl p-4 flex items-center gap-3" style={{
          animationDelay: '100ms',
          background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)'
        }}>
          <div className="text-2xl">📊</div>
          <div>
            <p className="text-sm font-semibold" style={{ color: '#f59e0b' }}>Gasto hoje</p>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              Você gastou <span className="font-bold text-yellow-400">{formatCurrency(todayTotal)}</span> em {todayExpenses.length} transação(ões)
            </p>
          </div>
        </div>
      )}

      {/* Quick stats grid */}
      <div className="grid grid-cols-2 gap-3 animate-slide-up" style={{ animationDelay: '120ms' }}>
        {/* Banks */}
        <div className="glass glass-hover rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Landmark size={14} style={{ color: 'var(--accent)' }} />
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Saldo em bancos</p>
          </div>
          <p className="font-bold text-lg" style={{ fontFamily: 'var(--font-display)' }}>
            {formatCurrency(totalBankBalance)}
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{banks.length} conta(s)</p>
        </div>

        {/* Pending bills */}
        <div className="glass glass-hover rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar size={14} style={{ color: '#f59e0b' }} />
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>A pagar</p>
          </div>
          <p className="font-bold text-lg" style={{ fontFamily: 'var(--font-display)', color: pendingBills.length > 0 ? '#f59e0b' : 'var(--text-primary)' }}>
            {formatCurrency(totalPending)}
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{pendingBills.length} conta(s) pendente</p>
        </div>
      </div>

      {/* Credit cards */}
      {creditCards.length > 0 && (
        <div className="animate-slide-up space-y-3" style={{ animationDelay: '160ms' }}>
          <h2 className="text-sm font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Cartões de Crédito</h2>
          {creditCards.map(card => {
            const pct = card.limit > 0 ? (card.used / card.limit) * 100 : 0
            return (
              <div key={card.id} className="glass glass-hover rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <CreditCard size={16} style={{ color: 'var(--accent)' }} />
                    <span className="font-semibold text-sm">{card.name}</span>
                  </div>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Fecha dia {card.closingDay}</span>
                </div>
                <div className="flex justify-between text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>
                  <span>Usado: <span className="text-red-400 font-semibold">{formatCurrency(card.used)}</span></span>
                  <span>Disponível: <span className="text-green-400 font-semibold">{formatCurrency(card.limit - card.used)}</span></span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{
                    width: `${pct}%`,
                    background: pct > 80 ? 'linear-gradient(90deg, #f59e0b, #ef4444)' : 'linear-gradient(90deg, #3b82f6, #10b981)'
                  }} />
                </div>
                <p className="text-xs mt-1.5 text-right" style={{ color: 'var(--text-muted)' }}>
                  {pct.toFixed(0)}% de {formatCurrency(card.limit)} usado
                </p>
              </div>
            )
          })}
        </div>
      )}

      {/* Spending by category chart */}
      {categoryData.length > 0 && (
        <div className="animate-slide-up glass rounded-2xl p-5" style={{ animationDelay: '200ms' }}>
          <h2 className="text-sm font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--text-muted)' }}>
            Gastos por Categoria
          </h2>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width={120} height={120}>
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={30} outerRadius={55} dataKey="value" strokeWidth={0}>
                  {categoryData.map((entry) => (
                    <Cell key={entry.name} fill={CATEGORY_COLORS[entry.name] || '#94a3b8'} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v: number) => formatCurrency(v)}
                  contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 12 }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2 min-w-0">
              {categoryData.slice(0, 5).map(item => (
                <div key={item.name} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: CATEGORY_COLORS[item.name], flexShrink: 0, display: 'inline-block' }} />
                    <span className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>
                      {CATEGORY_ICONS[item.name]} {item.name}
                    </span>
                  </div>
                  <span className="text-xs font-semibold flex-shrink-0">{formatCurrency(item.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Pending bills list */}
      {pendingBills.length > 0 && (
        <div className="animate-slide-up space-y-2" style={{ animationDelay: '240ms' }}>
          <div className="flex items-center gap-2">
            <AlertCircle size={14} className="text-yellow-400" />
            <h2 className="text-sm font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Contas Pendentes</h2>
          </div>
          {pendingBills.slice(0, 4).map(bill => (
            <div key={bill.id} className="glass rounded-xl p-3 flex justify-between items-center">
              <div>
                <p className="text-sm font-medium">{bill.name}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Vence dia {bill.dueDay}</p>
              </div>
              <p className="font-bold text-yellow-400">{formatCurrency(bill.amount)}</p>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {transactions.length === 0 && banks.length === 0 && (
        <div className="text-center py-10 animate-fade-in">
          <div className="text-5xl mb-3 animate-float">🌱</div>
          <h3 className="font-bold text-lg" style={{ fontFamily: 'var(--font-display)' }}>Comece a controlar!</h3>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Adicione seus bancos, cartões e registre suas transações para ver o painel completo.
          </p>
        </div>
      )}
    </div>
  )
}
