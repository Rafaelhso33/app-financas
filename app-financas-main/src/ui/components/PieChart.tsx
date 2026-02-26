import React from 'react'
import { formatBRL } from '@/services/money'

type Slice = { label: string; value: number; color: string }

export function PieChart(props: { title: string; slices: Slice[]; centerLabel?: string; centerValue?: number }) {
  const total = Math.max(0, props.slices.reduce((s,x)=>s + (x.value || 0), 0))
  const values = props.slices.map(s => Math.max(0, s.value || 0))
  const safeTotal = total || 1

  let start = 0
  const arcs = values.map((v, i) => {
    const angle = (v / safeTotal) * 360
    const a0 = start
    const a1 = start + angle
    start = a1
    return { a0, a1, v, i }
  })

  const size = 140
  const r0 = 52
  const r1 = 68
  const cx = size/2
  const cy = size/2

  return (
    <div className="card">
      <div className="h2">{props.title}</div>
      <div style={{display:'flex', gap:14, alignItems:'center', marginTop:10, flexWrap:'wrap'}}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={props.title}>
          {arcs.map(a => {
            const s = props.slices[a.i]
            if (a.v <= 0) return null
            return (
              <path key={s.label}
                d={ringArc(cx, cy, r0, r1, a.a0, a.a1)}
                fill={s.color}
              />
            )
          })}
          {/* center */}
          <circle cx={cx} cy={cy} r={r0-6} fill="rgba(17,24,39,0.08)" />
          <text x={cx} y={cy-2} textAnchor="middle" style={{fontSize:12, fontWeight:800, fill:'rgba(255,255,255,0.9)'}}>
            {props.centerLabel ?? 'Total'}
          </text>
          <text x={cx} y={cy+16} textAnchor="middle" style={{fontSize:12, fill:'rgba(255,255,255,0.9)'}}>
            {props.centerValue !== undefined ? formatBRL(props.centerValue) : formatBRL(total)}
          </text>
        </svg>

        <div style={{display:'grid', gap:8, minWidth:220}}>
          {props.slices.map(s => {
            const pct = Math.round((Math.max(0,s.value||0) / safeTotal) * 100)
            return (
              <div key={s.label} style={{display:'flex', justifyContent:'space-between', gap:12, alignItems:'center'}}>
                <div style={{display:'flex', gap:10, alignItems:'center'}}>
                  <span style={{width:12, height:12, borderRadius:4, background:s.color, display:'inline-block'}} />
                  <div style={{fontWeight:700}}>{s.label}</div>
                </div>
                <div className="muted" style={{fontSize:12}}>{formatBRL(s.value)} • {pct}%</div>
              </div>
            )
          })}
        </div>
      </div>
      {total === 0 && <div className="muted" style={{fontSize:12, marginTop:10}}>Sem valores para exibir no gráfico.</div>}
    </div>
  )
}

function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

function ringArc(cx: number, cy: number, rInner: number, rOuter: number, a0: number, a1: number) {
  const p0 = polar(cx, cy, rOuter, a0)
  const p1 = polar(cx, cy, rOuter, a1)
  const p2 = polar(cx, cy, rInner, a1)
  const p3 = polar(cx, cy, rInner, a0)
  const large = (a1 - a0) > 180 ? 1 : 0
  return [
    `M ${p0.x} ${p0.y}`,
    `A ${rOuter} ${rOuter} 0 ${large} 1 ${p1.x} ${p1.y}`,
    `L ${p2.x} ${p2.y}`,
    `A ${rInner} ${rInner} 0 ${large} 0 ${p3.x} ${p3.y}`,
    'Z'
  ].join(' ')
}
