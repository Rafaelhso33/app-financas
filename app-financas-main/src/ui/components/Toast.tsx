import React from 'react'

export function Toast(props: { message: string; actionLabel?: string; onAction?: ()=>void; onClose: ()=>void }) {
  return (
    <div className="toast" role="status" aria-live="polite">
      <div style={{minWidth:0}}>
        <div style={{fontWeight:800}}>Aviso</div>
        <div className="muted" style={{fontSize:13, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{props.message}</div>
      </div>
      <div style={{display:'flex', gap:8}}>
        {props.onAction && <button className="btn small primary" onClick={props.onAction}>{props.actionLabel ?? 'OK'}</button>}
        <button className="btn small" onClick={props.onClose}>Fechar</button>
      </div>
    </div>
  )
}
