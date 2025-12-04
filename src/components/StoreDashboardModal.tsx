import { useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  LayoutDashboard,
  Store,
  Users,
  TrendingUp,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
} from "lucide-react";
import type { Store as StoreType } from "@/types/store";

interface StoreDashboardModalProps {
  open: boolean;
  onClose: () => void;
  stores: StoreType[];
}

const COLORS = ["hsl(var(--primary))", "hsl(var(--destructive))", "hsl(var(--muted))", "#f59e0b"];

export const StoreDashboardModal = ({
  open,
  onClose,
  stores,
}: StoreDashboardModalProps) => {
  // Calculate summary stats
  const stats = useMemo(() => {
    const totalEmployees = stores.reduce((sum, s) => sum + s.funcionarios.length, 0);
    const activeEmployees = stores.reduce(
      (sum, s) => sum + s.funcionarios.filter((e) => e.status === "Ativo").length,
      0
    );
    const totalVisits = stores.reduce((sum, s) => sum + s.logsVisitas.length, 0);
    const totalHRLogs = stores.reduce((sum, s) => sum + s.logsRH.length, 0);
    const totalSales = stores.reduce((sum, s) => sum + s.vendasRealizadas, 0);
    const totalTarget = stores.reduce((sum, s) => sum + s.metaVendasMensal, 0);

    // Pending actions
    let pendingActions = 0;
    let overdueActions = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    stores.forEach((store) => {
      store.logsVisitas.forEach((visit) => {
        visit.acoesPendentes.forEach((action) => {
          if (!action.concluida) {
            pendingActions++;
            if (action.prazo && new Date(action.prazo) < today) {
              overdueActions++;
            }
          }
        });
      });
      store.logsRH.forEach((hr) => {
        hr.acoesPendentes.forEach((action) => {
          if (!action.concluida) {
            pendingActions++;
            if (action.prazo && new Date(action.prazo) < today) {
              overdueActions++;
            }
          }
        });
      });
    });

    return {
      totalStores: stores.length,
      operatingStores: stores.filter((s) => s.status === "Operando").length,
      totalEmployees,
      activeEmployees,
      totalVisits,
      totalHRLogs,
      totalSales,
      totalTarget,
      salesPercentage: totalTarget > 0 ? Math.round((totalSales / totalTarget) * 100) : 0,
      pendingActions,
      overdueActions,
    };
  }, [stores]);

  // Store status distribution for pie chart
  const statusData = useMemo(() => {
    const statusCounts: Record<string, number> = {};
    stores.forEach((store) => {
      statusCounts[store.status] = (statusCounts[store.status] || 0) + 1;
    });
    return Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
  }, [stores]);

  // Sales performance by store for bar chart
  const salesData = useMemo(() => {
    return stores
      .map((store) => ({
        name: store.nome.length > 10 ? store.nome.substring(0, 10) + "..." : store.nome,
        meta: store.metaVendasMensal,
        vendas: store.vendasRealizadas,
        percentage: store.metaVendasMensal > 0
          ? Math.round((store.vendasRealizadas / store.metaVendasMensal) * 100)
          : 0,
      }))
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 8);
  }, [stores]);

  // Recent activity
  const recentActivity = useMemo(() => {
    const activities: { date: string; type: string; description: string; store: string }[] = [];

    stores.forEach((store) => {
      store.logsVisitas.slice(-3).forEach((visit) => {
        activities.push({
          date: visit.data,
          type: "Visita",
          description: `${visit.tipo}`,
          store: store.nome,
        });
      });
      store.logsRH.slice(-3).forEach((hr) => {
        activities.push({
          date: hr.data,
          type: "RH",
          description: `${hr.tipo} - ${hr.funcionarioNome}`,
          store: store.nome,
        });
      });
    });

    return activities
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10);
  }, [stores]);

  // Top/bottom performing stores
  const storePerformance = useMemo(() => {
    return stores
      .map((store) => ({
        ...store,
        percentage: store.metaVendasMensal > 0
          ? Math.round((store.vendasRealizadas / store.metaVendasMensal) * 100)
          : 0,
      }))
      .sort((a, b) => b.percentage - a.percentage);
  }, [stores]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1">
          <div className="space-y-6 pr-4">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-full">
                      <Store className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats.totalStores}</p>
                      <p className="text-xs text-muted-foreground">
                        Lojas ({stats.operatingStores} operando)
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-full">
                      <Users className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats.totalEmployees}</p>
                      <p className="text-xs text-muted-foreground">
                        Funcionários ({stats.activeEmployees} ativos)
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-500/10 rounded-full">
                      <TrendingUp className="w-5 h-5 text-green-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats.salesPercentage}%</p>
                      <p className="text-xs text-muted-foreground">Meta de Vendas</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${stats.overdueActions > 0 ? "bg-destructive/10" : "bg-green-500/10"}`}>
                      {stats.overdueActions > 0 ? (
                        <AlertTriangle className="w-5 h-5 text-destructive" />
                      ) : (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      )}
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats.pendingActions}</p>
                      <p className="text-xs text-muted-foreground">
                        Ações pendentes ({stats.overdueActions} atrasadas)
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts Row */}
            <div className="grid md:grid-cols-2 gap-4">
              {/* Sales Performance Chart */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Desempenho de Vendas por Loja</CardTitle>
                </CardHeader>
                <CardContent>
                  {salesData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={salesData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" width={80} fontSize={12} />
                        <Tooltip
                          formatter={(value: number, name: string) => [
                            formatCurrency(value),
                            name === "vendas" ? "Vendas" : "Meta",
                          ]}
                        />
                        <Bar dataKey="meta" fill="hsl(var(--muted))" name="Meta" />
                        <Bar dataKey="vendas" fill="hsl(var(--primary))" name="Vendas" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                      Sem dados de vendas
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Store Status Pie Chart */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Status das Lojas</CardTitle>
                </CardHeader>
                <CardContent>
                  {statusData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={statusData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}`}
                          labelLine={false}
                        >
                          {statusData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Legend />
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                      Sem dados
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Bottom Row */}
            <div className="grid md:grid-cols-2 gap-4">
              {/* Store Performance Ranking */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Ranking de Desempenho</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {storePerformance.slice(0, 5).map((store, index) => (
                      <div key={store.id} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-2">
                            <span className="font-medium text-muted-foreground">
                              #{index + 1}
                            </span>
                            {store.nome}
                          </span>
                          <Badge
                            variant={
                              store.percentage >= 100
                                ? "default"
                                : store.percentage >= 70
                                ? "secondary"
                                : "destructive"
                            }
                          >
                            {store.percentage}%
                          </Badge>
                        </div>
                        <Progress value={Math.min(store.percentage, 100)} className="h-2" />
                      </div>
                    ))}
                    {storePerformance.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        Nenhuma loja cadastrada
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Atividade Recente
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentActivity.map((activity, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 text-sm border-b border-border pb-2 last:border-0"
                      >
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3 h-3 text-muted-foreground" />
                          <span className="text-muted-foreground text-xs">
                            {formatDate(activity.date)}
                          </span>
                        </div>
                        <div className="flex-1">
                          <Badge variant="outline" className="text-xs mb-1">
                            {activity.type}
                          </Badge>
                          <p className="text-xs">{activity.description}</p>
                          <p className="text-xs text-muted-foreground">{activity.store}</p>
                        </div>
                      </div>
                    ))}
                    {recentActivity.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        Nenhuma atividade recente
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Total Sales Summary */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Total de Vendas</p>
                    <p className="text-3xl font-bold text-primary">
                      {formatCurrency(stats.totalSales)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Meta Total</p>
                    <p className="text-xl font-semibold">
                      {formatCurrency(stats.totalTarget)}
                    </p>
                  </div>
                  <div className="flex-1 max-w-xs">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progresso</span>
                      <span className="font-medium">{stats.salesPercentage}%</span>
                    </div>
                    <Progress value={Math.min(stats.salesPercentage, 100)} className="h-3" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
