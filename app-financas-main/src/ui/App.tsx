import React from 'react'
import { NavLink, Route, Routes } from 'react-router-dom'
import DashboardPage from './pages/DashboardPage'
import BillsPage from './pages/BillsPage'
import CreditPage from './pages/CreditPage'
import LoansPage from './pages/LoansPage'
import AssetsPage from './pages/AssetsPage'
import SettingsPage from './pages/SettingsPage'
import LoginPage from './pages/LoginPage'

export default function App() {
  return (
    <>
      <div className="container">
        <div className="header">
          <div className="brand">
            <div style={{
              width:36,height:36,borderRadius:12,
              background:'rgba(59,130,246,.18)',
              border:'1px solid rgba(59,130,246,.35)',
              display:'grid',placeItems:'center',
              fontWeight:900
            }}>₿</div>
            <div>
              <div style={{fontWeight:900}}>Controle Financeiro</div>
              <div className="muted" style={{fontSize:12}}>Offline • PWA • Local</div>
            </div>
          </div>
          <span className="badge">PT-BR</span>
        </div>

        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<DashboardPage />} />
          <Route path="/contas" element={<BillsPage />} />
          <Route path="/cartao" element={<CreditPage />} />
          <Route path="/emprestimos" element={<LoansPage />} />
          <Route path="/ativos" element={<AssetsPage />} />
          <Route path="/config" element={<SettingsPage />} />
        </Routes>
      </div>

      <nav className="nav" aria-label="Navegação">
        <NavLink to="/" end className={({isActive})=>isActive?'active':''}>
          <span>🏠</span><span>Dashboard</span>
        </NavLink>
        <NavLink to="/contas" className={({isActive})=>isActive?'active':''}>
          <span>🧾</span><span>Contas</span>
        </NavLink>
        <NavLink to="/cartao" className={({isActive})=>isActive?'active':''}>
          <span>💳</span><span>Cartão</span>
        </NavLink>
        <NavLink to="/emprestimos" className={({isActive})=>isActive?'active':''}>
          <span>🏦</span><span>Empréstimos</span>
        </NavLink>
        <NavLink to="/ativos" className={({isActive})=>isActive?'active':''}>
          <span>💰</span><span>Ativos</span>
        </NavLink>
        <NavLink to="/config" className={({isActive})=>isActive?'active':''}>
          <span>⚙️</span><span>Config</span>
        </NavLink>
      </nav>
    </>
  )
}
