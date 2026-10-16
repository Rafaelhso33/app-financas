import React from 'react'
import { EmptyState } from '../components/EmptyState'

interface TrainingItem {
  id: string
  title: string
  category: string
  year: number
  month: number // 1 a 12
  description: string
  url?: string
}

const MOCK_TRAININGS: TrainingItem[] = [
  {
    id: '1',
    title: 'Planejamento Financeiro Anual',
    category: 'Estratégia',
    year: 2024,
    month: 1,
    description: 'Como organizar as metas financeiras do ano.'
  },
  {
    id: '2',
    title: 'Controle de Gastos no Cartão',
    category: 'Crédito',
    year: 2024,
    month: 5,
    description: 'Dicas práticas para evitar juros e rotativo.'
  },
  {
    id: '3',
    title: 'Investimentos para Iniciantes',
    category: 'Ativos',
    year: 2025,
    month: 2,
    description: 'Primeiros passos na renda fixa e variável.'
  }
]

export default function TrainingPage() {
  const [search, setSearch] = React.useState('')
  const [selectedCategory, setSelectedCategory] = React.useState('')
  const [expandedFolders, setExpandedFolders] = React.useState<Record<string, boolean>>({ '2024': true, '2025': true })

  const categories = Array.from(new Set(MOCK_TRAININGS.map(t => t.category))).sort()

  const filtered = MOCK_TRAININGS.filter(t => {
    if (search && !t.title.toLowerCase().includes(search.toLowerCase()) && !t.description.toLowerCase().includes(search.toLowerCase())) {
      return false
    }
    if (selectedCategory && t.category !== selectedCategory) {
      return false
    }
    return true
  })

  // Agrupar por Ano -> Mês
  const grouped: Record<number, Record<number, TrainingItem[]>> = {}
  filtered.forEach(item => {
    if (!grouped[item.year]) grouped[item.year] = {}
    if (!grouped[item.year][item.month]) grouped[item.year][item.month] = []
    grouped[item.year][item.month].push(item)
  })

  const years = Object.keys(grouped).map(Number).sort((a, b) => b - a)

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ]

  function toggleFolder(key: string) {
    setExpandedFolders(prev => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <>
      <div className="row" style={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div className="h1">Treinamento</div>
          <div className="muted">Material educacional organizado por pastas de Ano e Mês</div>
        </div>
      </div>

      <div style={{ height: 10 }} />

      <div className="card">
        <div className="row" style={{ gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            className="input"
            style={{ flex: 1, minWidth: 200 }}
            placeholder="Pesquisar treinamentos..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select
            className="input"
            style={{ width: 180 }}
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
          >
            <option value="">Todas categorias</option>
            {categories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ height: 12 }} />

      {years.length === 0 ? (
        <EmptyState title="Nenhum treinamento encontrado" description="Tente ajustar os filtros de busca ou categoria." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {years.map(year => {
            const yearKey = String(year)
            const isYearExpanded = expandedFolders[yearKey] !== false
            const months = Object.keys(grouped[year]).map(Number).sort((a, b) => b - a)

            return (
              <div key={year} className="card">
                <div
                  onClick={() => toggleFolder(yearKey)}
                  style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontWeight: 700, fontSize: 16 }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span>📁</span>
                    <span>Ano {year}</span>
                  </div>
                  <span className="muted">{isYearExpanded ? '▼' : '▶'}</span>
                </div>

                {isYearExpanded && (
                  <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 12, paddingLeft: 12, borderLeft: '2px solid rgba(59,130,246,0.2)' }}>
                    {months.map(month => {
                      const monthKey = `${year}-${month}`
                      const isMonthExpanded = expandedFolders[monthKey] !== false
                      const items = grouped[year][month]

                      return (
                        <div key={month} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          <div
                            onClick={() => toggleFolder(monthKey)}
                            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontWeight: 600, fontSize: 14, color: 'var(--accent, #3b82f6)' }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span>📂</span>
                              <span>{monthNames[month - 1]}</span>
                              <span className="badge" style={{ fontSize: 11, marginLeft: 4 }}>{items.length}</span>
                            </div>
                            <span className="muted" style={{ fontSize: 12 }}>{isMonthExpanded ? '▼' : '▶'}</span>
                          </div>

                          {isMonthExpanded && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingLeft: 16, marginTop: 4 }}>
                              {items.map(item => (
                                <div key={item.id} className="card" style={{ padding: 12, background: 'rgba(255,255,255,0.02)' }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                      <div style={{ fontWeight: 700, fontSize: 14 }}>{item.title}</div>
                                      <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>{item.description}</div>
                                    </div>
                                    <span className="badge" style={{ fontSize: 11 }}>{item.category}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}
