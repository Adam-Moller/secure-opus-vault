import { useState } from "react";
import { StoreCard } from "@/components/StoreCard";
import { StoreModal } from "@/components/StoreModal";
import { VisitLogModal } from "@/components/VisitLogModal";
import { EmployeeManagementModal } from "@/components/EmployeeManagementModal";
import { HRLogModal } from "@/components/HRLogModal";
import { HRLogTimelineModal } from "@/components/HRLogTimelineModal";
import { ManagementContactsModal } from "@/components/ManagementContactsModal";
import { ManagementHubModal } from "@/components/ManagementHubModal";
import { CalendarViewModal } from "@/components/CalendarViewModal";
import { ActionItemsTrackerModal } from "@/components/ActionItemsTrackerModal";
import { StoreDashboardModal } from "@/components/StoreDashboardModal";
import { EmployeeDirectoryModal } from "@/components/EmployeeDirectoryModal";
import { ExportDataModal } from "@/components/ExportDataModal";
import { PerformanceAnalyticsModal } from "@/components/PerformanceAnalyticsModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Calendar, ClipboardList, Users, LayoutDashboard, UserSearch, Download, TrendingUp, HelpCircle } from "lucide-react";
import HelpModal from "@/components/HelpModal";
import type { Store, VisitLog, HRLog } from "@/types/store";

interface StoreManagementProps {
  stores: Store[];
  onSaveStore: (store: Store) => void;
  onDeleteStore: (id: string) => void;
}

export const StoreManagement = ({ 
  stores, 
  onSaveStore, 
  onDeleteStore
}: StoreManagementProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [regionFilter, setRegionFilter] = useState<string>("all");
  const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);
  const [isVisitModalOpen, setIsVisitModalOpen] = useState(false);
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [isHRLogModalOpen, setIsHRLogModalOpen] = useState(false);
  const [isTimelineModalOpen, setIsTimelineModalOpen] = useState(false);
  const [isContactsModalOpen, setIsContactsModalOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isActionsTrackerOpen, setIsActionsTrackerOpen] = useState(false);
  const [isManagementHubOpen, setIsManagementHubOpen] = useState(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [isEmployeeDirectoryOpen, setIsEmployeeDirectoryOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isAnalyticsModalOpen, setIsAnalyticsModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<Store | undefined>();
  const [selectedStoreForVisit, setSelectedStoreForVisit] = useState<Store | undefined>();
  const [selectedStoreForEmployees, setSelectedStoreForEmployees] = useState<Store | undefined>();
  const [selectedStoreForHRLog, setSelectedStoreForHRLog] = useState<Store | undefined>();
  const [selectedStoreForTimeline, setSelectedStoreForTimeline] = useState<Store | undefined>();
  const [selectedStoreForContacts, setSelectedStoreForContacts] = useState<Store | undefined>();
  const [editingHRLog, setEditingHRLog] = useState<HRLog | undefined>();

  // Get unique regions for filter
  const uniqueRegions = Array.from(new Set(stores.map(s => s.regiao))).sort();

  const handleAddVisit = (visitLog: VisitLog) => {
    if (!selectedStoreForVisit) return;

    const updatedStore: Store = {
      ...selectedStoreForVisit,
      logsVisitas: [...selectedStoreForVisit.logsVisitas, visitLog],
      ultimaVisitaData: visitLog.data,
    };

    onSaveStore(updatedStore);
    setSelectedStoreForVisit(undefined);
  };

  const handleSaveHRLog = (hrLog: HRLog) => {
    if (!selectedStoreForHRLog) return;

    const updatedStore: Store = {
      ...selectedStoreForHRLog,
      logsRH: editingHRLog
        ? selectedStoreForHRLog.logsRH.map(log => log.id === hrLog.id ? hrLog : log)
        : [...selectedStoreForHRLog.logsRH, hrLog],
    };

    onSaveStore(updatedStore);
    setSelectedStoreForHRLog(undefined);
    setEditingHRLog(undefined);
    
    // If editing from timeline, update timeline store
    if (selectedStoreForTimeline) {
      setSelectedStoreForTimeline(updatedStore);
    }
  };

  const handleViewHRTimeline = (store: Store) => {
    setSelectedStoreForTimeline(store);
    setIsTimelineModalOpen(true);
  };

  const handleEditHRLogFromTimeline = (log: HRLog) => {
    setEditingHRLog(log);
    setSelectedStoreForHRLog(selectedStoreForTimeline);
    setIsHRLogModalOpen(true);
  };

  const handleManageContacts = (store: Store) => {
    setSelectedStoreForContacts(store);
    setIsContactsModalOpen(true);
  };

  const handleToggleAction = (
    storeId: string, 
    sourceType: "visit" | "hr", 
    sourceId: string, 
    actionId: string, 
    completed: boolean
  ) => {
    const store = stores.find((s) => s.id === storeId);
    if (!store) return;

    let updatedStore: Store;

    if (sourceType === "visit") {
      updatedStore = {
        ...store,
        logsVisitas: store.logsVisitas.map((visit) =>
          visit.id === sourceId
            ? {
                ...visit,
                acoesPendentes: visit.acoesPendentes.map((action) =>
                  action.id === actionId ? { ...action, concluida: completed } : action
                ),
              }
            : visit
        ),
      };
    } else {
      updatedStore = {
        ...store,
        logsRH: store.logsRH.map((hrLog) =>
          hrLog.id === sourceId
            ? {
                ...hrLog,
                acoesPendentes: hrLog.acoesPendentes.map((action) =>
                  action.id === actionId ? { ...action, concluida: completed } : action
                ),
              }
            : hrLog
        ),
      };
    }

    onSaveStore(updatedStore);
  };

  const filteredStores = stores.filter((store) => {
    const matchesSearch =
      store.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      store.gerenteNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      store.regiao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      store.endereco.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || store.status === statusFilter;
    const matchesRegion = regionFilter === "all" || store.regiao === regionFilter;

    return matchesSearch && matchesStatus && matchesRegion;
  });

  return (
    <>
      {/* Actions and Filters */}
      <div className="flex flex-col gap-4 mb-6">
        {/* Primary Actions - Mobile optimized grid */}
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-3">
          <Button 
            onClick={() => {
              setEditingStore(undefined);
              setIsStoreModalOpen(true);
            }} 
            className="col-span-2 sm:col-span-1"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Loja
          </Button>

          <Button 
            variant="outline"
            onClick={() => setIsDashboardOpen(true)}
          >
            <LayoutDashboard className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Dashboard</span>
            <span className="sm:hidden">Dash</span>
          </Button>

          <Button 
            variant="outline"
            onClick={() => setIsCalendarOpen(true)}
          >
            <Calendar className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Calendário</span>
            <span className="sm:hidden">Cal</span>
          </Button>

          <Button 
            variant="outline"
            onClick={() => setIsActionsTrackerOpen(true)}
          >
            <ClipboardList className="w-4 h-4 sm:mr-2" />
            <span>Ações</span>
          </Button>

          <Button 
            variant="outline"
            onClick={() => setIsManagementHubOpen(true)}
          >
            <Users className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Gerência</span>
            <span className="sm:hidden">Ger</span>
          </Button>

          <Button 
            variant="outline"
            onClick={() => setIsEmployeeDirectoryOpen(true)}
          >
            <UserSearch className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Funcionários</span>
            <span className="sm:hidden">Func</span>
          </Button>

          <Button 
            variant="outline"
            onClick={() => setIsAnalyticsModalOpen(true)}
          >
            <TrendingUp className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Análises</span>
            <span className="sm:hidden">Anál</span>
          </Button>

          <Button 
            variant="outline"
            onClick={() => setIsExportModalOpen(true)}
          >
            <Download className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Exportar</span>
            <span className="sm:hidden">Exp</span>
          </Button>

          <Button 
            variant="outline"
            onClick={() => setIsHelpModalOpen(true)}
          >
            <HelpCircle className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Ajuda</span>
            <span className="sm:hidden">?</span>
          </Button>
        </div>

        {/* Search and Filters - Stack on mobile */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por loja, gerente, região..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="flex-1 sm:w-[160px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                <SelectItem value="all">Todos Status</SelectItem>
                <SelectItem value="Operando">Operando</SelectItem>
                <SelectItem value="Reforma">Reforma</SelectItem>
                <SelectItem value="Fechada Temporariamente">Fechada Temp.</SelectItem>
                <SelectItem value="Fechada Definitivamente">Fechada Def.</SelectItem>
              </SelectContent>
            </Select>

            <Select value={regionFilter} onValueChange={setRegionFilter}>
              <SelectTrigger className="flex-1 sm:w-[160px]">
                <SelectValue placeholder="Região" />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                <SelectItem value="all">Todas Regiões</SelectItem>
                {uniqueRegions.map((region) => (
                  <SelectItem key={region} value={region}>
                    {region}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Content */}
      {stores.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">Nenhuma loja cadastrada ainda</p>
          <Button onClick={() => setIsStoreModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Criar Primeira Loja
          </Button>
        </div>
      ) : filteredStores.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Nenhuma loja encontrada</p>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Mostrando {filteredStores.length} de {stores.length} lojas
          </p>
          {filteredStores.map((store) => (
            <StoreCard
              key={store.id}
              store={store}
              onEdit={(s) => {
                setEditingStore(s);
                setIsStoreModalOpen(true);
              }}
              onDelete={onDeleteStore}
              onAddVisit={(s) => {
                setSelectedStoreForVisit(s);
                setIsVisitModalOpen(true);
              }}
              onManageEmployees={(s) => {
                setSelectedStoreForEmployees(s);
                setIsEmployeeModalOpen(true);
              }}
              onAddHRLog={(s) => {
                setSelectedStoreForHRLog(s);
                setEditingHRLog(undefined);
                setIsHRLogModalOpen(true);
              }}
              onViewHRTimeline={handleViewHRTimeline}
              onManageContacts={handleManageContacts}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <StoreModal
        open={isStoreModalOpen}
        onClose={() => {
          setIsStoreModalOpen(false);
          setEditingStore(undefined);
        }}
        onSave={onSaveStore}
        store={editingStore}
      />

      <VisitLogModal
        open={isVisitModalOpen}
        onClose={() => {
          setIsVisitModalOpen(false);
          setSelectedStoreForVisit(undefined);
        }}
        onSave={handleAddVisit}
        storeName={selectedStoreForVisit?.nome || ""}
      />

      <EmployeeManagementModal
        open={isEmployeeModalOpen}
        onClose={() => {
          setIsEmployeeModalOpen(false);
          setSelectedStoreForEmployees(undefined);
        }}
        store={selectedStoreForEmployees}
        onSaveStore={onSaveStore}
      />

      <HRLogModal
        open={isHRLogModalOpen}
        onClose={() => {
          setIsHRLogModalOpen(false);
          setSelectedStoreForHRLog(undefined);
          setEditingHRLog(undefined);
        }}
        onSave={handleSaveHRLog}
        employees={selectedStoreForHRLog?.funcionarios || []}
        storeName={selectedStoreForHRLog?.nome || ""}
        hrLog={editingHRLog}
      />

      {selectedStoreForTimeline && (
        <HRLogTimelineModal
          open={isTimelineModalOpen}
          onClose={() => {
            setIsTimelineModalOpen(false);
            setSelectedStoreForTimeline(undefined);
          }}
          store={selectedStoreForTimeline}
          onEditHRLog={handleEditHRLogFromTimeline}
        />
      )}

      <ManagementContactsModal
        open={isContactsModalOpen}
        onClose={() => {
          setIsContactsModalOpen(false);
          setSelectedStoreForContacts(undefined);
        }}
        store={selectedStoreForContacts}
        onSaveStore={onSaveStore}
      />

      <CalendarViewModal
        open={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        stores={stores}
      />

      <ActionItemsTrackerModal
        open={isActionsTrackerOpen}
        onClose={() => setIsActionsTrackerOpen(false)}
        stores={stores}
        onToggleAction={handleToggleAction}
      />

      <ManagementHubModal
        open={isManagementHubOpen}
        onClose={() => setIsManagementHubOpen(false)}
        stores={stores}
        onSaveStore={onSaveStore}
      />

      <StoreDashboardModal
        open={isDashboardOpen}
        onClose={() => setIsDashboardOpen(false)}
        stores={stores}
      />

      <EmployeeDirectoryModal
        open={isEmployeeDirectoryOpen}
        onClose={() => setIsEmployeeDirectoryOpen(false)}
        stores={stores}
      />

      <ExportDataModal
        open={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        stores={stores}
      />

      <PerformanceAnalyticsModal
        open={isAnalyticsModalOpen}
        onClose={() => setIsAnalyticsModalOpen(false)}
        stores={stores}
      />

      <HelpModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
      />
    </>
  );
};
