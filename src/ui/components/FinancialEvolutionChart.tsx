import React from 'react'
import { formatBRL } from '@/services/money'

export interface MonthlyEvolutionPoint {
  competencia: string
  label: string
  ativos: number
  poupanca: number
  contas: number
  cartoes: number
  emprestimos: number
}

export function FinancialEvolutionChart(props: { points: MonthlyEvolutionPoint[] }) {
  const [activeSeries, setActiveSeries] = React.useState<Record<string, boolean>>({
    ativos: true,
    poupanca: true,
    contas: true,
    cartoes: true,
    emprestimos: true,
  })

  const seriesConfig = [
    { key: 'ativos', label: 'Ativos', color: '#22c55e' },
    { key: 'poupanca', label: 'Poupança', color: '#3b82f6' },
    { key: 'contas', label: 'Contas', color: '#f59e0b' },
    { key: 'cartoes', label: 'Cartões', color: '#ec4899' },
    { key: 'emprestimos', label: 'Empréstimos', color: '#ef4444' },
  ]

  const toggleSeries = (key: string) => {
    setActiveSeries(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const points = props.points || []
  if (points.length === 0) {
    return (
      <div className="card">
        <div className="h2">Evolução financeira</div>
        <div className="muted" style={{ fontSize: 12 }}>Acompanhe a evolução do seu patrimônio mês a mês</div>
        <div style={{ height: 16 }} />
        <div className="muted" style={{ fontSize: 13 }}>Ainda não existem registros suficientes para montar o histórico.</div>
      </div>
    )
  }

  const allValues = points.flatMap(p => [
    activeSeries.ativos ? p.ativos : 0,
    activeSeries.poupanca ? p.poupanca : 0,
    activeSeries.contas ? p.contas : 0,
    activeSeries.cartoes ? p.cartoes : 0,
    activeSeries.emprestimos ? p.emprestimos : 0,
  ])
  const maxVal = Math.max(1, ...allValues)
  const minVal = Math.min(0, ...allValues)
  const range = Math.max(1, maxVal - minVal)

  const width = 700
  const height = 260
  const paddingLeft = 60
  const paddingRight = 20
  const paddingTop = 20
  const paddingBottom = 40

  const chartWidth = width - paddingLeft - paddingRight
  const chartHeight = height - paddingTop - paddingBottom

  const getX = (index: number) => {
    if (points.length <= 1) return paddingLeft + chartWidth / 2
    return paddingLeft + (index / (points.length - 1)) * chartWidth
  }

  const getY = (val: number) => {
    return paddingTop + chartHeight - ((val - minVal) / range) * chartHeight
  }

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <div className="h2">Evolução financeira</div>
          <div className="muted" style={{ fontSize: 12 }}>Acompanhe a evolução do seu patrimônio mês a mês</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 12, marginBottom: 8 }}>
        {seriesConfig.map(s => {
          const active = activeSeries[s.key]
          return (
            <button
              key={s.key}
              onClick={() => toggleSeries(s.key)}
              className="btn small"
              style={{
                opacity: active ? 1 : 0.4,
                borderColor: active ? s.color : 'transparent',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 11
              }}
              aria-label={`Alternar série ${s.label}`}
            >
              <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: s.color, display: 'inline-block' }} />
              {s.label}
            </button>
          )
        })}
      </div>

      <div style={{ overflowX: 'auto', width: '100%' }}>
        <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto', minWidth: 500, overflow: 'visible' }} role="img" aria-label="Gráfico de evolução financeira mensal">
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
            const val = minVal + range * ratio
            const y = getY(val)
            return (
              <g key={idx}>
                <line x1={paddingLeft} y1={y} x2={width - paddingRight} y2={y} stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" />
                <text x={paddingLeft - 8} y={y + 4} textAnchor="end" style={{ fontSize: 10, fill: 'rgba(255,255,255,0.5)' }}>
                  {formatBRL(val).replace(/\s?[A-Z]{2}\s?/, '')}
                </text>
              </g>
            )
          })}

          <line x1={paddingLeft} y1={paddingTop} x2={paddingLeft} y2={height - paddingBottom} stroke="rgba(255,255,255,0.15)" />
          <line x1={paddingLeft} y1={height - paddingBottom} x2={width - paddingRight} y2={height - paddingBottom} stroke="rgba(255,255,255,0.15)" />

          {seriesConfig.map(s => {
            if (!activeSeries[s.key]) return null
            const coords = points.map((p, idx) => ({
              x: getX(idx),
              y: getY((p as any)[s.key]),
              val: (p as any)[s.key],
              label: p.label
            }))

            const pathD = coords.reduce((acc, curr, i) => {
              return i === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`
            }, '')

            return (
              <g key={s.key}>
                <path d={pathD} fill="none" stroke={s.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                {coords.map((c, i) => (
                  <circle
                    key={i}
                    cx={c.x}
                    cy={c.y}
                    r="3.5"
                    fill={s.color}
                    stroke="#111827"
                    strokeWidth="1.5"
                  >
                    <title>{`${s.label} (${c.label}): ${formatBRL(c.val)}`}</title>
                  </circle>
                ))}
              </g>
            )
          })}

          {points.map((p, idx) => {
            const x = getX(idx)
            return (
              <text
                key={p.competencia}
                x={x}
                y={height - paddingBottom + 18}
                textAnchor="middle"
                style={{ fontSize: 10, fill: 'rgba(255,255,255,0.6)' }}
              >
                {p.label}
              </text>
            )
          })}
        </svg>
      </div>
    </div>
  )
}
