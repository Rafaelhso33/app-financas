import React from 'react'
import { formatBRL, parseMoneyBR } from '@/services/money'

export function MoneyInput(props: {
  value: number
  onChange: (v: number)=>void
  placeholder?: string
}) {
  const [raw, setRaw] = React.useState<string>(formatBRL(props.value))

  React.useEffect(()=>{
    // quando value muda externamente
    setRaw(formatBRL(props.value))
  }, [props.value])

  function handleBlur(){
    const n = parseMoneyBR(raw)
    props.onChange(n)
    setRaw(formatBRL(n))
  }

  return (
    <input
      className="input"
      inputMode="decimal"
      value={raw}
      placeholder={props.placeholder ?? 'R$ 0,00'}
      onChange={(e)=> setRaw(e.target.value)}
      onBlur={handleBlur}
    />
  )
}
