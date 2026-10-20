import React from 'react'

type Props = {
  paid: number
  total: number
  /** Se true, destaca em verde quando todas as parcelas estiverem pagas (quitação total). */
  highlightComplete?: boolean
  onIncrement?: () => void
  onDecrement?: () => void
}

export function InstallmentIndicator(props: Props) {
  const { total } = props
  const highlightComplete = props.highlightComplete ?? true
  const paid = Math.min(total, Math.max(0, props.paid))
  const remaining = Math.max(0, total - paid)
  const isComplete = highlightComplete && paid >= total && total > 0

  const dots = Array.from({ length: total }, (_, i) => {
    const isPaid = i < paid
    const cls = isPaid
      ? (isComplete ? 'installment-dot dot-complete' : 'installment-dot dot-paid')
      : 'installment-dot dot-pending'
    return <span key={i} className={cls} aria-hidden="true" />
  })

  return (
    <div className="installments">
      <div className="installments-header">
        <span className="installments-count">
          {paid}/{total} parcelas pagas
        </span>
        {(props.onIncrement || props.onDecrement) && (
          <div className="installments-actions">
            {props.onDecrement && (
              <button
                type="button"
                className="btn small"
                disabled={paid <= 0}
                onClick={props.onDecrement}
                title="Desmarcar última parcela paga"
              >
                −
              </button>
            )}
            {props.onIncrement && (
              <button
                type="button"
                className="btn small ok"
                disabled={paid >= total}
                onClick={props.onIncrement}
                title="Marcar próxima parcela como paga"
              >
                Marcar paga
              </button>
            )}
          </div>
        )}
      </div>

      <div
        className="installments-dots"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={paid}
        aria-label={`${paid} de ${total} parcelas pagas`}
      >
        {dots}
      </div>

      <div className="installments-legend">
        <span>{paid} {paid === 1 ? 'paga' : 'pagas'}</span>
        <span className="installments-sep">•</span>
        <span>{remaining} {remaining === 1 ? 'restante' : 'restantes'}</span>
        {isComplete && (
          <>
            <span className="installments-sep">•</span>
            <span style={{ color: '#86efac', fontWeight: 700 }}>Quitado ✓</span>
          </>
        )}
      </div>
    </div>
  )
}
