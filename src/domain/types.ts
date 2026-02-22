export type ISODate = string // YYYY-MM-DD
export type Competencia = string // YYYY-MM

export type BillStatus = 'PAGO' | 'PENDENTE'

export type BillStatusEntry = {
  status: BillStatus
  pagoEm?: ISODate
}

export type Bill = {
  id: string
  nome: string
  categoria: string
  valor: number
  vencimentoDia: number // 1-31
  recorrente: boolean
  observacoes?: string
  criadoEm: string
  atualizadoEm: string
  statusPorMes: Record<Competencia, BillStatusEntry>
}

export type CreditPurchase = {
  id: string
  descricao: string
  valorTotal: number
  dataCompra: ISODate
  parcelasTotal: number
  parcelaAtual: number
  competenciaInicio: Competencia
  criadoEm: string
  atualizadoEm: string
}

export type LoanPayment = { id: string; data: ISODate; valor: number }

export type Loan = {
  id: string
  descricao: string
  valorEmprestimo: number
  dataInicio: ISODate
  pagamentos: LoanPayment[]
  criadoEm: string
  atualizadoEm: string
}


export type Asset = {
  id: string
  nome: string
  categoria: string // ex: Salário, Adiantamento, Poupança, Outros
  valor: number
  recorrente: boolean // se true, aparece todo mês
  observacoes?: string
  criadoEm: string
  atualizadoEm: string
  valorPorMes: Record<Competencia, number> // permite ajustar valor por mês (opcional)
}

export type Settings = {
  userName?: string
  passwordHash?: string
  authEnabled?: boolean

  moeda: 'BRL'
  notificacoesAtivas: boolean
  diaPadraoVirada?: number // opcional (1-31)
  criadoEm: string
  atualizadoEm: string
}

export type AppData = {
  assets: Asset[]

  bills: Bill[]
  credit: CreditPurchase[]
  loans: Loan[]
  settings: Settings
  meta: { version: number; exportedAt: string }
}
