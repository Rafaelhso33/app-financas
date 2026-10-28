import { useState } from "react";
import {
  BarChart3,
  Users,
  MousePointer2,
  Globe2,
  Download,
  Settings,
  Activity,
  Eye,
} from "lucide-react";
import type { TemplateProps } from "../types";
import { list } from "../types";
import {
  AppFrame,
  PageHead,
  Button,
  Stat,
  Panel,
  LineChart,
  Bars,
  Progress,
  SettingPanel,
  exportCSV,
  Tabs,
} from "../shared/ui";
export default function Dashboard({ config }: TemplateProps) {
  const [view, setView] = useState("overview"),
    [period, setPeriod] = useState("7 dias");
  const channels = list(config, "channels");
  const factor = period === "7 dias" ? 1 : 3.6;
  const series = [710, 1120, 920, 1620, 1340, 1850, 2170].map((v) =>
    Math.round(v * factor),
  );
  const total = channels.reduce((s, c) => s + (c.value || 0) * factor, 0);
  return (
    <AppFrame
      config={config}
      active={view}
      onNav={setView}
      nav={[
        { id: "overview", label: "Visão geral", icon: <BarChart3 size={18} /> },
        { id: "audience", label: "Audiência", icon: <Users size={18} /> },
        { id: "settings", label: "Preferências", icon: <Settings size={18} /> },
      ]}
    >
      <PageHead
        eyebrow="ANALYTICS / ACOMPANHAMENTO"
        title={config.content.headline}
        description={config.content.description}
      >
        <Tabs
          items={["7 dias", "30 dias"]}
          value={period}
          onChange={setPeriod}
        />
        <Button
          variant="secondary"
          onClick={() =>
            exportCSV(
              "analytics.csv",
              ["Canal", "Visitas"],
              channels.map((c) => [
                c.title,
                Math.round((c.value || 0) * factor),
              ]),
            )
          }
        >
          <Download size={16} />
          Exportar
        </Button>
      </PageHead>
      {view === "settings" ? (
        <SettingPanel />
      ) : (
        <>
          <div className="stat-grid">
            <Stat
              label="Visitas no período"
              value={Math.round(total).toLocaleString("pt-BR")}
              change="Soma dos canais de exemplo"
              icon={<Eye size={18} />}
            />
            <Stat
              label="Visitantes únicos"
              value={Math.round(total * 0.72).toLocaleString("pt-BR")}
              change="Estimativa ilustrativa"
              icon={<Users size={18} />}
            />
            <Stat
              label="Conversões"
              value={Math.round(total * 0.043).toLocaleString("pt-BR")}
              change="4,3% das visitas de exemplo"
              icon={<MousePointer2 size={18} />}
            />
            <Stat
              label="Tempo médio"
              value="3m 42s"
              change="Amostra de demonstração"
              icon={<Activity size={18} />}
              accent
            />
          </div>
          <div className="grid-2">
            <Panel
              title={
                view === "audience"
                  ? "Atividade da audiência"
                  : "Tráfego que conta uma história"
              }
              subtitle={`Visitas · últimos ${period} · dados ilustrativos`}
              action={<span className="badge accent">Visão do período</span>}
            >
              <div className="metric-inline">
                <b>{Math.round(total).toLocaleString("pt-BR")}</b>
                <span>visitas em todos os canais</span>
              </div>
              <LineChart
                values={series}
                labels={
                  period === "7 dias"
                    ? ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"]
                    : ["01", "05", "10", "15", "20", "25", "30"]
                }
              />
            </Panel>
            <Panel title="De onde vêm" subtitle="Distribuição dos canais">
              <div className="panel-body channel-list">
                {channels.map((c, i) => (
                  <div key={c.id}>
                    <div className="between">
                      <span>
                        <i
                          className="channel-dot"
                          style={{ opacity: 1 - i * 0.15 }}
                        />
                        {c.title}
                      </span>
                      <b>
                        {Math.round((c.value || 0) * factor).toLocaleString(
                          "pt-BR",
                        )}
                      </b>
                    </div>
                    <Progress
                      value={(((c.value || 0) * factor) / total) * 100}
                    />
                  </div>
                ))}
              </div>
            </Panel>
          </div>
          <div className="grid-equal" style={{ marginTop: 24 }}>
            <Panel title="Dispositivos" subtitle="Acessos por tipo de tela">
              <Bars
                items={[
                  { label: "Desktop", value: Math.round(total * 0.54) },
                  { label: "Mobile", value: Math.round(total * 0.4) },
                  { label: "Tablet", value: Math.round(total * 0.06) },
                ]}
              />
            </Panel>
            <Panel
              title="Páginas em destaque"
              subtitle="Visualizações ilustrativas"
            >
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Página</th>
                      <th>Visitas</th>
                      <th>Participação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {["/início", "/produtos", "/sobre", "/contato"].map(
                      (p, i) => (
                        <tr key={p}>
                          <td>
                            <b>{p}</b>
                          </td>
                          <td>
                            {Math.round(
                              total * [0.48, 0.28, 0.16, 0.08][i],
                            ).toLocaleString("pt-BR")}
                          </td>
                          <td>
                            <Progress value={[48, 28, 16, 8][i]} />
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>
            </Panel>
          </div>
        </>
      )}
    </AppFrame>
  );
}
