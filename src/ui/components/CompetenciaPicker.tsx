import React from 'react'
import type { Competencia } from '@/domain/types'
import { addMonthsCompetencia, formatCompetenciaBR } from '@/services/date'

export function CompetenciaPicker(props: {
  value: Competencia
  onChange: (c: Competencia)=>void
}) {
  return (
    <div style={{display:'flex', gap:8, alignItems:'center'}}>
      <button className="btn small" onClick={()=>props.onChange(addMonthsCompetencia(props.value, -1))}>◀</button>
      <div className="badge" aria-label="Competência" title={formatCompetenciaBR(props.value)}>
        {formatCompetenciaBR(props.value)}
      </div>
      <button className="btn small" onClick={()=>props.onChange(addMonthsCompetencia(props.value, +1))}>▶</button>
    </div>
  )
}
