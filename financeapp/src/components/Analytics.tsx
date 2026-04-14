import { useMemo } from 'react'
import { useFinanceStore } from '@/lib/store'
import { formatCurrency, getCurrentMonth, CATEGORY_COLORS, CATEGORY_ICONS } from '@/lib/utils'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, CartesianGrid, Legend
} from 'recharts'

const MONTH_NAMES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{name: string; value: number; color: string}>; label?: string }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '10px 14px', fontSize: 12 }}>
      <p style={{ color: 'var(--text-muted)', marginBottom: 4 }}>{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color, fontWeight: 600 }}>{p.name}: {formatCurrency(p.value)}</p>
      ))}
    </div>
  )
}

export default function Analytics() {
  const { transactions, monthlyIncome } = useFinanceStore()
  const currentMonth = getCurrentMonth()

  // Monthly trend (last 6 months)
  const monthlyTrend = useMemo(() => {
    const now = new Date()
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      const monthTx = transactions.filter(t => t.date.startsWith(key))
      const income = monthTx.filter(t => t.type === 'income').reduce((a, t) => a + t.amount, 0) + (key === currentMonth ? monthlyIncome : 0)
      const expense = monthTx.filter(t => t.type === 'expense').reduce((a, t) => a + t.amount, 0)
      return { month: MONTH_NAMES[d.getMonth()], receitas: income, gastos: expense, saldo: income - expense }
    })
  }, [transactions, currentMonth, monthlyIncome])

  // Category breakdown this month
  const categoryBreakdown = useMemo(() => {
    const map: Record<string, number> = {}
    transactions.filter(t => t.type === 'expense' && t.date.startsWith(currentMonth)).forEach(t => {
      map[t.category] = (map[t.category] || 0) + t.amount
    })
    const total = Object.values(map).reduce((a, b) => a + b, 0)
    return Object.entries(map)
      .map(([name, value]) => ({ name, value, pct: total > 0 ? (value / total) * 100 : 0 }))
      .sort((a, b) => b.value - a.value)
  }, [transactions, currentMonth])

  // Payment method breakdown
  const paymentBreakdown = useMemo(() => {
    const map: Record<string, number> = {}
    transactions.filter(t => t.type === 'expense' && t.date.startsWith(currentMonth)).forEach(t => {
      map[t.paymentMethod] = (map[t.paymentMethod] || 0) + t.amount
    })
    return Object.entries(map).map(([name, value]) => ({ name, value }))
  }, [transactions, currentMonth])

  // Daily spending this month
  const dailySpending = useMemo(() => {
    const map: Record<string, number> = {}
    transactions.filter(t => t.type === 'expense' && t.date.startsWith(currentMonth)).forEach(t => {
      const day = t.date.slice(8, 10)
      map[day] = (map[day] || 0) + t.amount
    })
    return Object.entries(map).sort(([a], [b]) => parseInt(a) - parseInt(b)).map(([day, value]) => ({ day: `Dia ${parseInt(day)}`, value }))
  }, [transactions, currentMonth])

  const totalExpense = categoryBreakdown.reduce((a, c) => a + c.value, 0)

  const PAYMENT_COLORS: Record<string, string> = { pix: '#3b82f6', dinheiro: '#10b981', débito: '#8b5cf6', crédito: '#ef4444' }

  return (
    <div className="page-content p-4 space-y-6">
      <div className="animate-slide-up">
        <h1 className="text-xl font-bold" style={{ fontFamily: 'var(--font-display)' }}>Planilha Visual</h1>
        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Onde seu dinheiro vai — visualizado</p>
      </div>

      {/* Monthly trend */}
      <div className="glass rounded-2xl p-4 animate-slide-up" style={{ animationDelay: '40ms' }}>
        <h2 className="text-sm font-bold mb-4" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-secondary)' }}>
          📈 Tendência dos últimos 6 meses
        </h2>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={monthlyTrend}>
            <defs>
              <linearGradient id="income" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="expense" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} tickFormatter={v => `R$${(v/1000).toFixed(0)}k`} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="receitas" name="Receitas" stroke="#10b981" strokeWidth={2} fill="url(#income)" />
            <Area type="monotone" dataKey="gastos" name="Gastos" stroke="#ef4444" strokeWidth={2} fill="url(#expense)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Category breakdown */}
      {categoryBreakdown.length > 0 && (
        <div className="glass rounded-2xl p-4 animate-slide-up" style={{ animationDelay: '80ms' }}>
          <h2 className="text-sm font-bold mb-4" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-secondary)' }}>
            🗂️ Gastos por Categoria — este mês
          </h2>
          <div className="flex justify-center mb-4">
            <ResponsiveContainer width={180} height={180}>
              <PieChart>
                <Pie data={categoryBreakdown} cx="50%" cy="50%" innerRadius={45} outerRadius={80} dataKey="value" paddingAngle={2} strokeWidth={0}>
                  {categoryBreakdown.map(entry => (
                    <Cell key={entry.name} fill={CATEGORY_COLORS[entry.name] || '#94a3b8'} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2">
            {categoryBreakdown.map(item => (
              <div key={item.name} className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span style={{ width: 10, height: 10, borderRadius: '50%', background: CATEGORY_COLORS[item.name], display: 'inline-block', flexShrink: 0 }} />
                    <span className="text-sm">{CATEGORY_ICONS[item.name]} {item.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{item.pct.toFixed(1)}%</span>
                    <span className="text-sm font-semibold">{formatCurrency(item.value)}</span>
                  </div>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${item.pct}%`, background: CATEGORY_COLORS[item.name] }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
            <div className="flex justify-between">
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Total gasto este mês</span>
              <span className="font-bold text-red-400">{formatCurrency(totalExpense)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Daily spending */}
      {dailySpending.length > 0 && (
        <div className="glass rounded-2xl p-4 animate-slide-up" style={{ animationDelay: '120ms' }}>
          <h2 className="text-sm font-bold mb-4" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-secondary)' }}>
            📅 Gastos por dia
          </h2>
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={dailySpending} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} tickFormatter={v => `R$${v}`} />
              <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 12 }} />
              <Bar dataKey="value" name="Gasto" radius={[6, 6, 0, 0]} fill="url(#bar-gradient)">
                {dailySpending.map((_, i) => (
                  <Cell key={i} fill={`rgba(59,130,246,${0.4 + (i / dailySpending.length) * 0.6})`} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Payment method */}
      {paymentBreakdown.length > 0 && (
        <div className="glass rounded-2xl p-4 animate-slide-up" style={{ animationDelay: '160ms' }}>
          <h2 className="text-sm font-bold mb-4" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-secondary)' }}>
            💳 Forma de pagamento
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {paymentBreakdown.map(item => {
              const total = paymentBreakdown.reduce((a, b) => a + b.value, 0)
              const pct = total > 0 ? (item.value / total) * 100 : 0
              return (
                <div key={item.name} className="rounded-xl p-3" style={{ background: PAYMENT_COLORS[item.name] + '15', border: `1px solid ${PAYMENT_COLORS[item.name]}33` }}>
                  <p className="text-xs capitalize mb-1" style={{ color: 'var(--text-muted)' }}>{item.name}</p>
                  <p className="font-bold text-sm" style={{ color: PAYMENT_COLORS[item.name] }}>{formatCurrency(item.value)}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{pct.toFixed(0)}%</p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Monthly bar comparison */}
      <div className="glass rounded-2xl p-4 animate-slide-up" style={{ animationDelay: '200ms' }}>
        <h2 className="text-sm font-bold mb-4" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-secondary)' }}>
          📊 Comparativo mensal
        </h2>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={monthlyTrend} barCategoryGap="25%">
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000).toFixed(1)}k`} />
            <Tooltip content={<CustomTooltip />} />
            <Legend formatter={(v) => <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{v}</span>} />
            <Bar dataKey="receitas" name="Receitas" radius={[4, 4, 0, 0]} fill="#10b981" opacity={0.8} />
            <Bar dataKey="gastos" name="Gastos" radius={[4, 4, 0, 0]} fill="#ef4444" opacity={0.8} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {transactions.length === 0 && (
        <div className="text-center py-16 animate-fade-in">
          <div className="text-5xl mb-3 animate-float">📊</div>
          <p className="font-semibold text-lg" style={{ fontFamily: 'var(--font-display)' }}>Sem dados ainda</p>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Registre transações para ver seus gráficos aqui.</p>
        </div>
      )}
    </div>
  )
}
