import React from 'react'

export function EmptyState(props: { title: string; description?: string; cta?: React.ReactNode }) {
  return (
    <div className="card">
      <div className="h1">{props.title}</div>
      {props.description && <div className="muted" style={{marginTop:6}}>{props.description}</div>}
      {props.cta && <div style={{marginTop:10}}>{props.cta}</div>}
    </div>
  )
}
