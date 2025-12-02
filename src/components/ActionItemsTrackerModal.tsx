import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ClipboardList, Search, MapPin, User, Calendar, AlertTriangle, CheckCircle2 } from "lucide-react";
import type { Store } from "@/types/store";

interface ActionItemsTrackerModalProps {
  open: boolean;
  onClose: () => void;
  stores: Store[];
  onToggleAction: (storeId: string, sourceType: "visit" | "hr", sourceId: string, actionId: string, completed: boolean) => void;
}

interface TrackedAction {
  id: string;
  descricao: string;
  prazo: string;
  concluida: boolean;
  storeId: string;
  storeName: string;
  sourceType: "visit" | "hr";
  sourceId: string;
  sourceLabel: string;
}

export const ActionItemsTrackerModal = ({ 
  open, 
  onClose, 
  stores,
  onToggleAction 
}: ActionItemsTrackerModalProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [storeFilter, setStoreFilter] = useState<string>("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("pending");
  const [sortBy, setSortBy] = useState<string>("deadline");

  // Collect all actions from stores
  const allActions = useMemo(() => {
    const actions: TrackedAction[] = [];

    stores.forEach((store) => {
      // Actions from visits
      store.logsVisitas.forEach((visit) => {
        visit.acoesPendentes.forEach((action) => {
          actions.push({
            id: action.id,
            descricao: action.descricao,
            prazo: action.prazo,
            concluida: action.concluida,
            storeId: store.id,
            storeName: store.nome,
            sourceType: "visit",
            sourceId: visit.id,
            sourceLabel: `Visita ${visit.tipo} - ${new Date(visit.data + "T12:00:00").toLocaleDateString("pt-BR")}`,
          });
        });
      });

      // Actions from HR logs
      store.logsRH.forEach((hrLog) => {
        hrLog.acoesPendentes.forEach((action) => {
          actions.push({
            id: action.id,
            descricao: action.descricao,
            prazo: action.prazo,
            concluida: action.concluida,
            storeId: store.id,
            storeName: store.nome,
            sourceType: "hr",
            sourceId: hrLog.id,
            sourceLabel: `${hrLog.tipo} - ${hrLog.funcionarioNome}`,
          });
        });
      });
    });

    return actions;
  }, [stores]);

  // Filter and sort actions
  const filteredActions = useMemo(() => {
    let filtered = allActions.filter((action) => {
      const matchesSearch = 
        action.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
        action.storeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        action.sourceLabel.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStore = storeFilter === "all" || action.storeId === storeFilter;
      const matchesSource = sourceFilter === "all" || action.sourceType === sourceFilter;
      
      let matchesStatus = true;
      if (statusFilter === "pending") matchesStatus = !action.concluida;
      else if (statusFilter === "completed") matchesStatus = action.concluida;
      
      return matchesSearch && matchesStore && matchesSource && matchesStatus;
    });

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === "deadline") {
        if (!a.prazo) return 1;
        if (!b.prazo) return -1;
        return a.prazo.localeCompare(b.prazo);
      } else if (sortBy === "store") {
        return a.storeName.localeCompare(b.storeName);
      } else if (sortBy === "source") {
        return a.sourceType.localeCompare(b.sourceType);
      }
      return 0;
    });

    return filtered;
  }, [allActions, searchTerm, storeFilter, sourceFilter, statusFilter, sortBy]);

  // Stats
  const stats = useMemo(() => {
    const total = allActions.length;
    const pending = allActions.filter((a) => !a.concluida).length;
    const completed = allActions.filter((a) => a.concluida).length;
    const overdue = allActions.filter((a) => {
      if (a.concluida || !a.prazo) return false;
      return a.prazo < new Date().toISOString().split("T")[0];
    }).length;
    return { total, pending, completed, overdue };
  }, [allActions]);

  const isOverdue = (prazo: string, concluida: boolean) => {
    if (concluida || !prazo) return false;
    return prazo < new Date().toISOString().split("T")[0];
  };

  const getDaysUntilDeadline = (prazo: string) => {
    if (!prazo) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadline = new Date(prazo + "T12:00:00");
    deadline.setHours(0, 0, 0, 0);
    const diff = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const handleToggle = (action: TrackedAction) => {
    onToggleAction(action.storeId, action.sourceType, action.sourceId, action.id, !action.concluida);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5" />
            Ações Pendentes
          </DialogTitle>
        </DialogHeader>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3 rounded-lg bg-muted/50 text-center">
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </div>
          <div className="p-3 rounded-lg bg-amber-500/10 text-center">
            <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
            <p className="text-xs text-muted-foreground">Pendentes</p>
          </div>
          <div className="p-3 rounded-lg bg-destructive/10 text-center">
            <p className="text-2xl font-bold text-destructive">{stats.overdue}</p>
            <p className="text-xs text-muted-foreground">Atrasadas</p>
          </div>
          <div className="p-3 rounded-lg bg-green-500/10 text-center">
            <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
            <p className="text-xs text-muted-foreground">Concluídas</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar ações..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={storeFilter} onValueChange={setStoreFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Loja" />
            </SelectTrigger>
            <SelectContent className="bg-popover">
              <SelectItem value="all">Todas Lojas</SelectItem>
              {stores.map((store) => (
                <SelectItem key={store.id} value={store.id}>
                  {store.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sourceFilter} onValueChange={setSourceFilter}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Origem" />
            </SelectTrigger>
            <SelectContent className="bg-popover">
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="visit">Visitas</SelectItem>
              <SelectItem value="hr">RH</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-popover">
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="pending">Pendentes</SelectItem>
              <SelectItem value="completed">Concluídas</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Ordenar" />
            </SelectTrigger>
            <SelectContent className="bg-popover">
              <SelectItem value="deadline">Por Prazo</SelectItem>
              <SelectItem value="store">Por Loja</SelectItem>
              <SelectItem value="source">Por Origem</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Actions List */}
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {filteredActions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {allActions.length === 0 
                ? "Nenhuma ação cadastrada" 
                : "Nenhuma ação encontrada com os filtros aplicados"}
            </div>
          ) : (
            filteredActions.map((action) => {
              const daysLeft = getDaysUntilDeadline(action.prazo);
              const overdue = isOverdue(action.prazo, action.concluida);

              return (
                <div
                  key={`${action.sourceType}-${action.sourceId}-${action.id}`}
                  className={`p-3 rounded-lg border ${
                    action.concluida 
                      ? "bg-muted/30 border-muted" 
                      : overdue 
                        ? "bg-destructive/5 border-destructive/30" 
                        : "bg-card border-border"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={action.concluida}
                      onCheckedChange={() => handleToggle(action)}
                      className="mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${action.concluida ? "line-through text-muted-foreground" : ""}`}>
                        {action.descricao}
                      </p>
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="w-3 h-3" />
                          {action.storeName}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          {action.sourceType === "hr" ? <User className="w-3 h-3" /> : <Calendar className="w-3 h-3" />}
                          {action.sourceLabel}
                        </span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      {action.prazo && (
                        <div className="flex items-center gap-1 justify-end">
                          {overdue && !action.concluida && (
                            <AlertTriangle className="w-3 h-3 text-destructive" />
                          )}
                          {action.concluida && (
                            <CheckCircle2 className="w-3 h-3 text-green-600" />
                          )}
                          <span className={`text-xs ${
                            action.concluida 
                              ? "text-muted-foreground" 
                              : overdue 
                                ? "text-destructive font-medium" 
                                : ""
                          }`}>
                            {new Date(action.prazo + "T12:00:00").toLocaleDateString("pt-BR")}
                          </span>
                        </div>
                      )}
                      {!action.concluida && daysLeft !== null && (
                        <Badge 
                          variant={overdue ? "destructive" : daysLeft <= 3 ? "secondary" : "outline"}
                          className="text-[10px] mt-1"
                        >
                          {overdue 
                            ? `${Math.abs(daysLeft)} dias atrasado` 
                            : daysLeft === 0 
                              ? "Hoje" 
                              : `${daysLeft} dias`}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="flex justify-end pt-2">
          <Button variant="outline" onClick={onClose}>Fechar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
