import React from 'react'
import { formatBRL } from '@/services/money'

export type TrendPoint = { competencia: string; ativos: number; passivos: number }

export function MonthlyTrendChart(props: { points: TrendPoint[] }) {
  const max = Math.max(1, ...props.points.flatMap(p => [p.ativos, p.passivos]))
  return (
    <div className="card">
      <div className="h2">Últimos meses</div>
      <div className="muted" style={{fontSize:12}}>Ativos x Passivos</div>
      <div style={{height:10}} />
      <div style={{display:'grid', gap:10}}>
        {props.points.map(p => (
          <div key={p.competencia} style={{display:'grid', gap:6}}>
            <div style={{display:'flex', justifyContent:'space-between', gap:10}}>
              <div style={{fontWeight:800}}>{p.competencia}</div>
              <div className="muted" style={{fontSize:12}}>
                Ativos {formatBRL(p.ativos)} • Passivos {formatBRL(p.passivos)}
              </div>
            </div>
            <div style={{display:'grid', gap:6}}>
              <Bar label="Ativos" value={p.ativos} max={max} color="rgba(34,197,94,.7)" />
              <Bar label="Passivos" value={p.passivos} max={max} color="rgba(239,68,68,.7)" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function Bar(props: { label: string; value: number; max: number; color: string }) {
  const pct = Math.round((props.value / props.max) * 100)
  return (
    <div className="progress" aria-label={props.label} title={`${props.label}: ${props.value}`}>
      <div style={{width: `${pct}%`, background: props.color}} />
    </div>
  )
}
