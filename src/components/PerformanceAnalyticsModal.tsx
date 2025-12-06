import { useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, Users, Calendar, Store } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import type { Store as StoreType } from "@/types/store";
import { format, parseISO, differenceInMonths, startOfMonth, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";

interface PerformanceAnalyticsModalProps {
  open: boolean;
  onClose: () => void;
  stores: StoreType[];
}

const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

export const PerformanceAnalyticsModal = ({
  open,
  onClose,
  stores,
}: PerformanceAnalyticsModalProps) => {
  // Employee Analytics
  const employeeAnalytics = useMemo(() => {
    const allEmployees = stores.flatMap((s) => s.funcionarios);
    
    // Tenure distribution
    const tenureGroups = { "< 6 meses": 0, "6-12 meses": 0, "1-2 anos": 0, "2-5 anos": 0, "5+ anos": 0 };
    allEmployees.forEach((emp) => {
      try {
        const months = differenceInMonths(new Date(), parseISO(emp.dataAdmissao));
        if (months < 6) tenureGroups["< 6 meses"]++;
        else if (months < 12) tenureGroups["6-12 meses"]++;
        else if (months < 24) tenureGroups["1-2 anos"]++;
        else if (months < 60) tenureGroups["2-5 anos"]++;
        else tenureGroups["5+ anos"]++;
      } catch {
        tenureGroups["< 6 meses"]++;
      }
    });

    const tenureData = Object.entries(tenureGroups).map(([name, value]) => ({ name, value }));

    // Status by store
    const statusByStore = stores.map((store) => ({
      name: store.nome.length > 15 ? store.nome.substring(0, 15) + "..." : store.nome,
      ativos: store.funcionarios.filter((e) => e.status === "Ativo").length,
      afastados: store.funcionarios.filter((e) => e.status === "Afastado").length,
      desligados: store.funcionarios.filter((e) => e.status === "Desligado").length,
    }));

    // Position distribution
    const positionCount: Record<string, number> = {};
    allEmployees.forEach((emp) => {
      positionCount[emp.cargo] = (positionCount[emp.cargo] || 0) + 1;
    });
    const positionData = Object.entries(positionCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, value]) => ({ name, value }));

    return { tenureData, statusByStore, positionData, total: allEmployees.length };
  }, [stores]);

  // Visit Analytics
  const visitAnalytics = useMemo(() => {
    const allVisits = stores.flatMap((s) =>
      s.logsVisitas.map((v) => ({ ...v, storeName: s.nome }))
    );

    // Visits per month (last 6 months)
    const monthlyVisits: Record<string, number> = {};
    for (let i = 5; i >= 0; i--) {
      const month = startOfMonth(subMonths(new Date(), i));
      const key = format(month, "MMM/yy", { locale: ptBR });
      monthlyVisits[key] = 0;
    }

    allVisits.forEach((visit) => {
      try {
        const visitDate = parseISO(visit.data);
        const key = format(visitDate, "MMM/yy", { locale: ptBR });
        if (key in monthlyVisits) {
          monthlyVisits[key]++;
        }
      } catch {
        // Skip invalid dates
      }
    });

    const trendsData = Object.entries(monthlyVisits).map(([name, visitas]) => ({
      name,
      visitas,
    }));

    // Average ratings by store
    const ratingsByStore = stores
      .filter((s) => s.logsVisitas.length > 0)
      .map((store) => {
        const visits = store.logsVisitas;
        const avgLimpeza = visits.reduce((acc, v) => acc + v.avaliacoes.limpeza, 0) / visits.length;
        const avgOrganizacao = visits.reduce((acc, v) => acc + v.avaliacoes.organizacao, 0) / visits.length;
        const avgAtendimento = visits.reduce((acc, v) => acc + v.avaliacoes.atendimento, 0) / visits.length;
        const avgEstoque = visits.reduce((acc, v) => acc + v.avaliacoes.estoque, 0) / visits.length;
        const avgTotal = (avgLimpeza + avgOrganizacao + avgAtendimento + avgEstoque) / 4;

        return {
          name: store.nome.length > 12 ? store.nome.substring(0, 12) + "..." : store.nome,
          media: Number(avgTotal.toFixed(1)),
          limpeza: Number(avgLimpeza.toFixed(1)),
          organizacao: Number(avgOrganizacao.toFixed(1)),
          atendimento: Number(avgAtendimento.toFixed(1)),
          estoque: Number(avgEstoque.toFixed(1)),
        };
      })
      .sort((a, b) => b.media - a.media);

    // Visit type distribution
    const typeCount: Record<string, number> = {};
    allVisits.forEach((visit) => {
      typeCount[visit.tipo] = (typeCount[visit.tipo] || 0) + 1;
    });
    const typeData = Object.entries(typeCount).map(([name, value]) => ({ name, value }));

    return { trendsData, ratingsByStore, typeData, total: allVisits.length };
  }, [stores]);

  // Store Performance
  const storePerformance = useMemo(() => {
    // Sales performance ranking
    const salesRanking = stores
      .filter((s) => s.metaVendasMensal > 0)
      .map((store) => ({
        name: store.nome.length > 15 ? store.nome.substring(0, 15) + "..." : store.nome,
        percentual: Number(((store.vendasRealizadas / store.metaVendasMensal) * 100).toFixed(1)),
        meta: store.metaVendasMensal,
        realizado: store.vendasRealizadas,
      }))
      .sort((a, b) => b.percentual - a.percentual);

    // HR activity by store
    const hrActivity = stores.map((store) => ({
      name: store.nome.length > 12 ? store.nome.substring(0, 12) + "..." : store.nome,
      eventos: store.logsRH.length,
      funcionarios: store.funcionarios.length,
    }));

    return { salesRanking, hrActivity };
  }, [stores]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Análise de Performance
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="employees" className="flex-1 flex flex-col min-h-0">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="employees" className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Funcionários</span>
            </TabsTrigger>
            <TabsTrigger value="visits" className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Visitas</span>
            </TabsTrigger>
            <TabsTrigger value="stores" className="flex items-center gap-1">
              <Store className="w-4 h-4" />
              <span className="hidden sm:inline">Lojas</span>
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1 -mx-6 px-6 mt-4">
            {/* Employees Tab */}
            <TabsContent value="employees" className="mt-0 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Tenure Distribution */}
                <div className="bg-card border border-border rounded-lg p-4">
                  <h3 className="font-medium mb-4">Tempo de Casa</h3>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={employeeAnalytics.tenureData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" fontSize={11} width={80} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                        />
                        <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Position Distribution */}
                <div className="bg-card border border-border rounded-lg p-4">
                  <h3 className="font-medium mb-4">Distribuição por Cargo</h3>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={employeeAnalytics.positionData}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={80}
                          dataKey="value"
                          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                          labelLine={false}
                        >
                          {employeeAnalytics.positionData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Status by Store */}
                <div className="bg-card border border-border rounded-lg p-4 lg:col-span-2">
                  <h3 className="font-medium mb-4">Status por Loja</h3>
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={employeeAnalytics.statusByStore}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                        />
                        <Bar dataKey="ativos" name="Ativos" stackId="a" fill="hsl(142, 76%, 36%)" />
                        <Bar dataKey="afastados" name="Afastados" stackId="a" fill="hsl(38, 92%, 50%)" />
                        <Bar dataKey="desligados" name="Desligados" stackId="a" fill="hsl(0, 84%, 60%)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Visits Tab */}
            <TabsContent value="visits" className="mt-0 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Visit Trends */}
                <div className="bg-card border border-border rounded-lg p-4 lg:col-span-2">
                  <h3 className="font-medium mb-4">Tendência de Visitas (Últimos 6 meses)</h3>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={visitAnalytics.trendsData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="visitas"
                          name="Visitas"
                          stroke="hsl(var(--primary))"
                          strokeWidth={2}
                          dot={{ fill: "hsl(var(--primary))" }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Visit Type Distribution */}
                <div className="bg-card border border-border rounded-lg p-4">
                  <h3 className="font-medium mb-4">Tipos de Visita</h3>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={visitAnalytics.typeData}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}`}
                        >
                          {visitAnalytics.typeData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Store Ratings */}
                <div className="bg-card border border-border rounded-lg p-4">
                  <h3 className="font-medium mb-4">Média de Avaliação por Loja</h3>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={visitAnalytics.ratingsByStore} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis type="number" domain={[0, 5]} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" fontSize={11} width={100} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                        />
                        <Bar dataKey="media" name="Média" fill="hsl(var(--chart-2))" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Stores Tab */}
            <TabsContent value="stores" className="mt-0 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Sales Performance */}
                <div className="bg-card border border-border rounded-lg p-4 lg:col-span-2">
                  <h3 className="font-medium mb-4">Performance de Vendas (% da Meta)</h3>
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={storePerformance.salesRanking}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} unit="%" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                          formatter={(value: number) => [`${value}%`, "Meta Atingida"]}
                        />
                        <Bar
                          dataKey="percentual"
                          name="% Meta"
                          fill="hsl(var(--primary))"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* HR Activity */}
                <div className="bg-card border border-border rounded-lg p-4 lg:col-span-2">
                  <h3 className="font-medium mb-4">Atividade de RH por Loja</h3>
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={storePerformance.hrActivity}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                        />
                        <Bar dataKey="funcionarios" name="Funcionários" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="eventos" name="Eventos RH" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
