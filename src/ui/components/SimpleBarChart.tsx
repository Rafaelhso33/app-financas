import React from 'react'
import { formatBRL } from '@/services/money'

export function SimpleBarChart(props: { ativos: number; passivos: number }) {
  const max = Math.max(props.ativos, props.passivos, 1)
  const a = Math.round((props.ativos / max) * 100)
  const p = Math.round((props.passivos / max) * 100)
  return (
    <div className="card">
      <div className="h2">Gráfico (Ativos x Passivos)</div>
      <div style={{height:10}} />
      <div style={{display:'grid', gap:10}}>
        <Bar label="Ativos" pct={a} value={props.ativos} tone="ok" />
        <Bar label="Passivos" pct={p} value={props.passivos} tone="warn" />
      </div>
    </div>
  )
}

function Bar(props: { label: string; pct: number; value: number; tone: 'ok'|'warn'|'danger' }) {
  return (
    <div>
      <div style={{display:'flex', justifyContent:'space-between', gap:10}}>
        <div style={{fontWeight:800}}>{props.label}</div>
        <div className="muted" style={{fontSize:12}}>{formatBRL(props.value)}</div>
      </div>
      <div className="progress" aria-label={props.label} style={{marginTop:6}}>
        <div style={{width: `${props.pct}%`, background: props.tone === 'ok' ? 'rgba(34,197,94,.7)' : 'rgba(245,158,11,.75)'}} />
      </div>
    </div>
  )
}
