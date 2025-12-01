import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar, CheckCircle2, Circle, Edit, AlertCircle } from "lucide-react";
import type { HRLog, Store } from "@/types/store";
import { format } from "date-fns";

interface HRLogTimelineModalProps {
  open: boolean;
  onClose: () => void;
  store: Store;
  onEditHRLog: (log: HRLog) => void;
}

const eventTypeColors: Record<HRLog["tipo"], string> = {
  "Admissão": "bg-green-500",
  "Demissão": "bg-red-500",
  "Advertência": "bg-orange-500",
  "Promoção": "bg-blue-500",
  "Transferência": "bg-purple-500",
  "Férias": "bg-cyan-500",
  "Afastamento": "bg-yellow-500",
  "Retorno": "bg-green-400",
  "Outro": "bg-gray-500",
};

export const HRLogTimelineModal = ({ open, onClose, store, onEditHRLog }: HRLogTimelineModalProps) => {
  const [filterType, setFilterType] = useState<string>("all");
  const [showPendingOnly, setShowPendingOnly] = useState(false);

  const filteredLogs = useMemo(() => {
    let logs = [...store.logsRH].sort((a, b) => 
      new Date(b.data).getTime() - new Date(a.data).getTime()
    );

    if (filterType !== "all") {
      logs = logs.filter(log => log.tipo === filterType);
    }

    if (showPendingOnly) {
      logs = logs.filter(log => 
        log.acoesPendentes.some(action => !action.concluida)
      );
    }

    return logs;
  }, [store.logsRH, filterType, showPendingOnly]);

  const totalPendingActions = useMemo(() => {
    return store.logsRH.reduce((total, log) => {
      return total + log.acoesPendentes.filter(action => !action.concluida).length;
    }, 0);
  }, [store.logsRH]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Linha do Tempo RH - {store.nome}</span>
            <Badge variant="outline" className="text-sm">
              {totalPendingActions} ações pendentes
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por tipo" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  <SelectItem value="Admissão">Admissão</SelectItem>
                  <SelectItem value="Demissão">Demissão</SelectItem>
                  <SelectItem value="Advertência">Advertência</SelectItem>
                  <SelectItem value="Promoção">Promoção</SelectItem>
                  <SelectItem value="Transferência">Transferência</SelectItem>
                  <SelectItem value="Férias">Férias</SelectItem>
                  <SelectItem value="Afastamento">Afastamento</SelectItem>
                  <SelectItem value="Retorno">Retorno</SelectItem>
                  <SelectItem value="Outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="pending"
                checked={showPendingOnly}
                onCheckedChange={(checked) => setShowPendingOnly(checked === true)}
              />
              <label htmlFor="pending" className="text-sm cursor-pointer">
                Apenas com ações pendentes
              </label>
            </div>
          </div>

          {/* Timeline */}
          <ScrollArea className="h-[60vh] pr-4">
            {filteredLogs.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum evento encontrado com os filtros selecionados</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredLogs.map((log, index) => (
                  <div key={log.id} className="relative">
                    {/* Timeline line */}
                    {index !== filteredLogs.length - 1 && (
                      <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-border" />
                    )}
                    
                    <div className="flex gap-4">
                      {/* Timeline dot */}
                      <div className="relative flex-shrink-0">
                        <div className={`w-12 h-12 rounded-full ${eventTypeColors[log.tipo]} flex items-center justify-center text-white`}>
                          <Calendar className="w-6 h-6" />
                        </div>
                      </div>

                      {/* Event content */}
                      <div className="flex-1 bg-card border rounded-lg p-4 space-y-3">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge className={eventTypeColors[log.tipo]}>
                                {log.tipo}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                {format(new Date(log.data), "dd/MM/yyyy")}
                              </span>
                            </div>
                            <h4 className="font-semibold">{log.funcionarioNome}</h4>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEditHRLog(log)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>

                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {log.descricao}
                        </p>

                        {/* Pending actions */}
                        {log.acoesPendentes.length > 0 && (
                          <div className="space-y-2 pt-2 border-t">
                            <h5 className="text-sm font-semibold flex items-center gap-2">
                              Ações
                              <Badge variant="outline" className="text-xs">
                                {log.acoesPendentes.filter(a => !a.concluida).length} pendentes
                              </Badge>
                            </h5>
                            <div className="space-y-2">
                              {log.acoesPendentes.map((action) => (
                                <div
                                  key={action.id}
                                  className={`flex items-start gap-2 text-sm p-2 rounded ${
                                    action.concluida ? "bg-muted/50" : "bg-yellow-50 dark:bg-yellow-950/20"
                                  }`}
                                >
                                  {action.concluida ? (
                                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                                  ) : (
                                    <Circle className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <p className={action.concluida ? "line-through text-muted-foreground" : ""}>
                                      {action.descricao}
                                    </p>
                                    {action.prazo && (
                                      <p className="text-xs text-muted-foreground mt-1">
                                        Prazo: {format(new Date(action.prazo), "dd/MM/yyyy")}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button onClick={onClose}>Fechar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
