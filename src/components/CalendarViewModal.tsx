import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Calendar, MapPin, User, ClipboardList, AlertCircle } from "lucide-react";
import type { Store, VisitLog, HRLog, ActionItem } from "@/types/store";

interface CalendarViewModalProps {
  open: boolean;
  onClose: () => void;
  stores: Store[];
}

interface CalendarEvent {
  id: string;
  date: string;
  type: "visit" | "hr" | "action" | "scheduled-visit";
  title: string;
  storeName: string;
  storeId: string;
  details?: string;
  isPending?: boolean;
}

export const CalendarViewModal = ({ open, onClose, stores }: CalendarViewModalProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [eventFilter, setEventFilter] = useState<string>("all");
  const [storeFilter, setStoreFilter] = useState<string>("all");

  // Collect all events from stores
  const allEvents = useMemo(() => {
    const events: CalendarEvent[] = [];

    stores.forEach((store) => {
      // Visit logs
      store.logsVisitas.forEach((visit) => {
        events.push({
          id: `visit-${visit.id}`,
          date: visit.data,
          type: "visit",
          title: `Visita: ${visit.tipo}`,
          storeName: store.nome,
          storeId: store.id,
          details: visit.observacoesPositivas || visit.problemasIdentificados,
        });

        // Pending actions from visits
        visit.acoesPendentes
          .filter((a) => !a.concluida)
          .forEach((action) => {
            events.push({
              id: `action-visit-${action.id}`,
              date: action.prazo,
              type: "action",
              title: action.descricao,
              storeName: store.nome,
              storeId: store.id,
              isPending: true,
            });
          });
      });

      // HR logs
      store.logsRH.forEach((hrLog) => {
        events.push({
          id: `hr-${hrLog.id}`,
          date: hrLog.data,
          type: "hr",
          title: `${hrLog.tipo}: ${hrLog.funcionarioNome}`,
          storeName: store.nome,
          storeId: store.id,
          details: hrLog.descricao,
        });

        // Pending actions from HR
        hrLog.acoesPendentes
          .filter((a) => !a.concluida)
          .forEach((action) => {
            events.push({
              id: `action-hr-${action.id}`,
              date: action.prazo,
              type: "action",
              title: action.descricao,
              storeName: store.nome,
              storeId: store.id,
              isPending: true,
            });
          });
      });

      // Scheduled next visits
      if (store.proximaVisitaData) {
        events.push({
          id: `scheduled-${store.id}`,
          date: store.proximaVisitaData,
          type: "scheduled-visit",
          title: "Visita Agendada",
          storeName: store.nome,
          storeId: store.id,
        });
      }
    });

    return events;
  }, [stores]);

  // Filter events
  const filteredEvents = useMemo(() => {
    return allEvents.filter((event) => {
      const matchesType = eventFilter === "all" || event.type === eventFilter;
      const matchesStore = storeFilter === "all" || event.storeId === storeFilter;
      return matchesType && matchesStore;
    });
  }, [allEvents, eventFilter, storeFilter]);

  // Get calendar data
  const calendarData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startWeekday = firstDay.getDay();

    const days: { date: Date; events: CalendarEvent[] }[] = [];

    // Empty days at start
    for (let i = 0; i < startWeekday; i++) {
      days.push({ date: new Date(year, month, -(startWeekday - i - 1)), events: [] });
    }

    // Days of month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateStr = date.toISOString().split("T")[0];
      const dayEvents = filteredEvents.filter((e) => e.date === dateStr);
      days.push({ date, events: dayEvents });
    }

    // Fill remaining days
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({ date: new Date(year, month + 1, i), events: [] });
    }

    return days;
  }, [currentDate, filteredEvents]);

  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  const navigateMonth = (delta: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + delta, 1));
  };

  const getEventColor = (type: CalendarEvent["type"]) => {
    switch (type) {
      case "visit": return "bg-blue-500";
      case "hr": return "bg-purple-500";
      case "action": return "bg-amber-500";
      case "scheduled-visit": return "bg-green-500";
      default: return "bg-muted";
    }
  };

  const getEventIcon = (type: CalendarEvent["type"]) => {
    switch (type) {
      case "visit": return <MapPin className="w-3 h-3" />;
      case "hr": return <User className="w-3 h-3" />;
      case "action": return <AlertCircle className="w-3 h-3" />;
      case "scheduled-visit": return <Calendar className="w-3 h-3" />;
      default: return null;
    }
  };

  const isCurrentMonth = (date: Date) => date.getMonth() === currentDate.getMonth();
  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  // Get upcoming events for sidebar
  const upcomingEvents = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    return filteredEvents
      .filter((e) => e.date >= today)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 10);
  }, [filteredEvents]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Calendário de Eventos
          </DialogTitle>
        </DialogHeader>

        {/* Filters */}
        <div className="flex items-center gap-4 flex-wrap">
          <Select value={eventFilter} onValueChange={setEventFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Tipo de Evento" />
            </SelectTrigger>
            <SelectContent className="bg-popover">
              <SelectItem value="all">Todos os Eventos</SelectItem>
              <SelectItem value="visit">Visitas Realizadas</SelectItem>
              <SelectItem value="scheduled-visit">Visitas Agendadas</SelectItem>
              <SelectItem value="hr">Eventos RH</SelectItem>
              <SelectItem value="action">Ações Pendentes</SelectItem>
            </SelectContent>
          </Select>

          <Select value={storeFilter} onValueChange={setStoreFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Loja" />
            </SelectTrigger>
            <SelectContent className="bg-popover">
              <SelectItem value="all">Todas as Lojas</SelectItem>
              {stores.map((store) => (
                <SelectItem key={store.id} value={store.id}>
                  {store.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2 ml-auto">
            <Button variant="outline" size="icon" onClick={() => navigateMonth(-1)}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="font-medium min-w-[150px] text-center">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </span>
            <Button variant="outline" size="icon" onClick={() => navigateMonth(1)}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Calendar */}
          <div className="lg:col-span-3">
            {/* Weekday headers */}
            <div className="grid grid-cols-7 gap-1 mb-1">
              {weekDays.map((day) => (
                <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendarData.map((day, idx) => (
                <div
                  key={idx}
                  className={`min-h-[80px] p-1 border rounded-md ${
                    isCurrentMonth(day.date) ? "bg-background" : "bg-muted/30"
                  } ${isToday(day.date) ? "ring-2 ring-primary" : ""}`}
                >
                  <span className={`text-xs font-medium ${
                    isCurrentMonth(day.date) ? "text-foreground" : "text-muted-foreground"
                  }`}>
                    {day.date.getDate()}
                  </span>
                  <div className="space-y-0.5 mt-1">
                    {day.events.slice(0, 3).map((event) => (
                      <div
                        key={event.id}
                        className={`${getEventColor(event.type)} text-white text-[10px] px-1 py-0.5 rounded truncate flex items-center gap-1`}
                        title={`${event.title} - ${event.storeName}`}
                      >
                        {getEventIcon(event.type)}
                        <span className="truncate">{event.title}</span>
                      </div>
                    ))}
                    {day.events.length > 3 && (
                      <span className="text-[10px] text-muted-foreground">
                        +{day.events.length - 3} mais
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming events sidebar */}
          <div className="space-y-3">
            <h3 className="font-medium text-sm flex items-center gap-2">
              <ClipboardList className="w-4 h-4" />
              Próximos Eventos
            </h3>
            
            {upcomingEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum evento agendado</p>
            ) : (
              <div className="space-y-2">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="p-2 rounded-md border bg-card">
                    <div className="flex items-start gap-2">
                      <div className={`${getEventColor(event.type)} p-1 rounded text-white`}>
                        {getEventIcon(event.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{event.title}</p>
                        <p className="text-[10px] text-muted-foreground">{event.storeName}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {new Date(event.date + "T12:00:00").toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Legend */}
            <div className="pt-4 border-t space-y-2">
              <h4 className="text-xs font-medium text-muted-foreground">Legenda</h4>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-3 h-3 rounded bg-blue-500" />
                  <span>Visita Realizada</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-3 h-3 rounded bg-green-500" />
                  <span>Visita Agendada</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-3 h-3 rounded bg-purple-500" />
                  <span>Evento RH</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-3 h-3 rounded bg-amber-500" />
                  <span>Ação Pendente</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
