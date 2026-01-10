import { useState, useEffect, useRef } from "react";
import { LoginScreen } from "@/components/LoginScreen";
import { OpportunityCard } from "@/components/OpportunityCard";
import { OpportunityModal } from "@/components/OpportunityModal";
import { InteractionModal } from "@/components/InteractionModal";
import { StoreManagement } from "@/pages/StoreManagement";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Download, LogOut, Save, Search } from "lucide-react";
import type { Opportunity, EncryptedData, Interaction } from "@/types/opportunity";
import type { Store, WorkforceData } from "@/types/store";
import type { CRMType } from "@/types/crmData";
import { ensureWorkforceData } from "@/utils/dataMigration";
import {
  isFileSystemSupported,
  saveToFileSystem,
  downloadEncryptedFile,
  saveToIndexedDB,
} from "@/utils/fileStorage";
import { addFileToRegistry, updateFileInRegistry } from "@/utils/fileRegistry";

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState("");
  const [currentFileName, setCurrentFileName] = useState("");
  const [currentCrmType, setCurrentCrmType] = useState<CRMType>("sales");
  const [fileHandle, setFileHandle] = useState<FileSystemFileHandle | undefined>();
  
  // Sales CRM state
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  
  // Workforce CRM state - agora mantendo WorkforceData completo
  const [workforceData, setWorkforceData] = useState<WorkforceData>({
    stores: [],
    employees: [],
    badgeTemplates: []
  });
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isOpportunityModalOpen, setIsOpportunityModalOpen] = useState(false);
  const [isInteractionModalOpen, setIsInteractionModalOpen] = useState(false);
  const [editingOpportunity, setEditingOpportunity] = useState<Opportunity | undefined>();
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | undefined>();
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);
  const { toast } = useToast();
  const supportsFileSystem = isFileSystemSupported();
  
  // Ref para evitar salvamento em loop
  const isInitialLoad = useRef(true);

  const handleLogin = (data: EncryptedData, loginPassword: string, handle?: FileSystemFileHandle) => {
    console.log("[Index] Login with data:", { fileName: data.fileName, crmType: data.crmType });
    
    setPassword(loginPassword);
    setCurrentFileName(data.fileName);
    const crmType = data.crmType || "sales";
    setCurrentCrmType(crmType);
    setFileHandle(handle);
    
    let itemCount = 0;
    if (crmType === "sales") {
      const opps = data.data as Opportunity[];
      setOpportunities(opps);
      itemCount = opps.length;
      console.log("[Index] Loaded sales data:", opps.length, "opportunities");
    } else {
      // Usa ensureWorkforceData para garantir estrutura correta
      // data.data pode ser Store[] (legado) ou WorkforceData (novo)
      const rawData = data.data as Store[] | WorkforceData;
      const wfData = ensureWorkforceData(rawData);
      setWorkforceData(wfData);
      itemCount = wfData.stores.length;
      console.log("[Index] Loaded workforce data:", {
        stores: wfData.stores.length,
        employees: wfData.employees.length,
        badgeTemplates: wfData.badgeTemplates.length
      });
    }
    
    setIsLoggedIn(true);
    isInitialLoad.current = true; // Marca como carregamento inicial para evitar auto-save imediato
    
    // Update registry
    updateFileInRegistry(data.fileName, {
      lastOpened: new Date().toISOString(),
      crmType: crmType,
      itemCount,
      lastModified: data.lastModified,
    });
    
    const itemLabel = crmType === "sales" ? "oportunidades" : "lojas";
    toast({
      title: "Login Bem-Sucedido",
      description: `Carregadas ${itemCount} ${itemLabel} de ${data.fileName}`,
    });
    
    // Reset o flag após um delay para permitir auto-save futuro
    setTimeout(() => {
      isInitialLoad.current = false;
    }, 3000);
  };

  const handleCreateNew = async (newPassword: string, fileName: string, crmType: CRMType) => {
    console.log("[Index] Creating new CRM:", { fileName, crmType });
    
    setPassword(newPassword);
    setCurrentFileName(fileName);
    setCurrentCrmType(crmType);
    
    if (crmType === "sales") {
      setOpportunities([]);
    } else {
      setWorkforceData({
        stores: [],
        employees: [],
        badgeTemplates: []
      });
    }
    setIsLoggedIn(true);
    isInitialLoad.current = true;
    
    // Add to registry
    addFileToRegistry({
      fileName,
      lastModified: new Date().toISOString(),
      lastOpened: new Date().toISOString(),
      crmType,
      itemCount: 0,
    });
    
    // Save initial empty state to IndexedDB
    try {
      const now = new Date().toISOString();
      const initialData: Opportunity[] | WorkforceData = crmType === "sales" 
        ? [] 
        : { stores: [], employees: [], badgeTemplates: [] };
      
      const encryptedData: EncryptedData = {
        fileName,
        createdDate: now,
        lastModified: now,
        crmType,
        data: initialData,
      };
      
      await saveToIndexedDB(encryptedData, newPassword);
      console.log("[Index] Initial data saved successfully");
      
      const crmTypeLabel = crmType === "sales" ? "CRM de Vendas" : "CRM de Gestão de Lojas";
      toast({
        title: "Novo CRM Criado",
        description: `${fileName} (${crmTypeLabel}) está pronto para uso`,
      });
    } catch (error: any) {
      console.error("[Index] Error creating new CRM:", error);
      toast({
        title: "Erro de Criação",
        description: error.message || "Falha ao criar arquivo",
        variant: "destructive",
      });
    }
    
    setTimeout(() => {
      isInitialLoad.current = false;
    }, 3000);
  };

  const saveData = async (showToast = true) => {
    if (!currentFileName || !password) {
      console.log("[Index] Cannot save: missing fileName or password");
      return;
    }
    
    setIsAutoSaving(true);
    try {
      const now = new Date().toISOString();
      
      // Prepara os dados corretos baseado no tipo de CRM
      let dataToSave: Opportunity[] | WorkforceData;
      let itemCount: number;
      
      if (currentCrmType === "sales") {
        dataToSave = opportunities;
        itemCount = opportunities.length;
      } else {
        // Para workforce, sempre usa o workforceData completo
        dataToSave = workforceData;
        itemCount = workforceData.stores.length;
      }
      
      console.log("[Index] Saving data:", {
        crmType: currentCrmType,
        fileName: currentFileName,
        itemCount,
        ...(currentCrmType === "workforce" && {
          employees: workforceData.employees.length,
          badgeTemplates: workforceData.badgeTemplates.length
        })
      });
      
      const encryptedData: EncryptedData = {
        fileName: currentFileName,
        createdDate: now,
        lastModified: now,
        crmType: currentCrmType,
        data: dataToSave,
      };
      
      // SEMPRE salvar no IndexedDB primeiro (armazenamento primário)
      await saveToIndexedDB(encryptedData, password);
      
      // Se estiver no desktop COM fileHandle existente, também salva no arquivo
      // Não abre dialog de salvar - apenas atualiza arquivo já vinculado
      if (supportsFileSystem && fileHandle) {
        try {
          await saveToFileSystem(encryptedData, password, fileHandle);
          console.log("[Index] Also saved to file system");
        } catch (fsError) {
          console.warn("[Index] Failed to save to file system, but IndexedDB save succeeded:", fsError);
        }
      }

      // Update registry
      updateFileInRegistry(currentFileName, {
        lastModified: now,
        itemCount,
      });
      
      setLastSaveTime(new Date());

      if (showToast) {
        toast({
          title: "Dados Salvos",
          description: "Salvo no armazenamento local",
        });
      }
    } catch (error: any) {
      console.error("[Index] Error saving data:", error);
      toast({
        title: "Erro ao Salvar",
        description: error.message || "Falha ao salvar dados",
        variant: "destructive",
      });
    } finally {
      setIsAutoSaving(false);
    }
  };

  const handleSaveOpportunity = (opportunity: Opportunity) => {
    const newOpportunities = opportunities.some((o) => o.id === opportunity.id)
      ? opportunities.map((o) => (o.id === opportunity.id ? opportunity : o))
      : [...opportunities, opportunity];

    setOpportunities(newOpportunities);
    setEditingOpportunity(undefined);
  };

  const handleDeleteOpportunity = (id: string) => {
    if (!confirm("Are you sure you want to delete this opportunity?")) return;

    const newOpportunities = opportunities.filter((o) => o.id !== id);
    setOpportunities(newOpportunities);
    toast({
      title: "Opportunity Deleted",
      description: "The opportunity has been removed",
    });
  };

  const handleAddInteraction = (interaction: Interaction, nextContactDate?: string) => {
    if (!selectedOpportunity) return;

    const updatedOpportunity = {
      ...selectedOpportunity,
      historicoInteracoes: [...selectedOpportunity.historicoInteracoes, interaction],
      ultimoContatoData: interaction.data,
      ...(nextContactDate && { proximoContatoData: nextContactDate }),
    };

    handleSaveOpportunity(updatedOpportunity);
    setSelectedOpportunity(undefined);
  };

  // Store handlers - agora atualizam workforceData
  const handleSaveStore = (store: Store) => {
    setWorkforceData(prev => {
      const storeExists = prev.stores.some((s) => s.id === store.id);
      const newStores = storeExists
        ? prev.stores.map((s) => (s.id === store.id ? store : s))
        : [...prev.stores, store];
      
      return {
        ...prev,
        stores: newStores
      };
    });
  };

  const handleDeleteStore = (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta loja?")) return;

    setWorkforceData(prev => ({
      ...prev,
      stores: prev.stores.filter((s) => s.id !== id)
    }));
    
    toast({
      title: "Loja Excluída",
      description: "A loja foi removida",
    });
  };

  const handleLogout = () => {
    if (confirm("Tem certeza que deseja sair? Todas as alterações são salvas automaticamente.")) {
      setIsLoggedIn(false);
      setPassword("");
      setCurrentFileName("");
      setFileHandle(undefined);
      setOpportunities([]);
      setWorkforceData({ stores: [], employees: [], badgeTemplates: [] });
      isInitialLoad.current = true;
    }
  };

  const handleManualSave = () => {
    saveData(true);
  };

  const handleExportBackup = async () => {
    if (!currentFileName) return;
    
    try {
      const now = new Date().toISOString();
      const dataToSave: Opportunity[] | WorkforceData = currentCrmType === "sales" 
        ? opportunities
        : workforceData;
      
      const encryptedData: EncryptedData = {
        fileName: currentFileName,
        createdDate: now,
        lastModified: now,
        crmType: currentCrmType,
        data: dataToSave,
      };
      
      await downloadEncryptedFile(encryptedData, password);
      toast({
        title: "Backup Exportado",
        description: "Arquivo baixado com sucesso",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao Exportar",
        description: error.message || "Falha ao exportar backup",
        variant: "destructive",
      });
    }
  };

  // Auto-save effect - agora observa workforceData ao invés de stores separado
  useEffect(() => {
    if (!isLoggedIn || !currentFileName || isInitialLoad.current) {
      return;
    }
    
    const hasData = currentCrmType === "sales" 
      ? opportunities.length > 0 
      : workforceData.stores.length > 0;
    
    if (hasData) {
      const timer = setTimeout(() => {
        console.log("[Index] Auto-saving...");
        saveData(false);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [opportunities, workforceData, isLoggedIn, currentFileName, currentCrmType]);

  const filteredOpportunities = opportunities.filter((opp) => {
    const matchesSearch =
      opp.nomeEmpresa.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opp.contatoPrincipal.nome.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || opp.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (!isLoggedIn) {
    return <LoginScreen onLogin={handleLogin} onCreateNew={handleCreateNew} />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <h1 className="text-xl md:text-2xl font-bold">CRM Seguro</h1>
              <p className="text-xs md:text-sm text-muted-foreground">{currentFileName}</p>
              {lastSaveTime && (
                <p className="text-xs text-muted-foreground">
                  Último save: {lastSaveTime.toLocaleTimeString()}
                </p>
              )}
            </div>
            <Button onClick={handleLogout} variant="outline" size="sm" className="shrink-0">
              <LogOut className="w-4 h-4" />
              <span className="hidden md:inline ml-2">Sair</span>
            </Button>
          </div>

          <div className="flex items-center gap-2 mt-3 flex-wrap">
            {isAutoSaving && (
              <span className="text-xs text-muted-foreground">Salvando...</span>
            )}
            {!supportsFileSystem && (
              <Button onClick={handleExportBackup} variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Exportar Backup</span>
                <span className="sm:hidden">Exportar</span>
              </Button>
            )}
            <Button onClick={handleManualSave} variant="outline" size="sm" disabled={isAutoSaving}>
              <Save className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Salvar Agora</span>
              <span className="sm:hidden">Salvar</span>
            </Button>
          </div>

          {currentCrmType === "sales" && (
            <div className="flex items-center gap-4 mt-4 flex-wrap">
              <Button onClick={() => setIsOpportunityModalOpen(true)} className="shrink-0">
                <Plus className="w-4 h-4 mr-2" />
                Nova Oportunidade
              </Button>

              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por empresa ou contato..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="Lead">Lead</SelectItem>
                  <SelectItem value="Qualificado">Qualificado</SelectItem>
                  <SelectItem value="Proposta">Proposta</SelectItem>
                  <SelectItem value="Negociação">Negociação</SelectItem>
                  <SelectItem value="Fechado">Fechado</SelectItem>
                  <SelectItem value="Perdido">Perdido</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {currentCrmType === "sales" ? (
          <>
            {opportunities.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">Nenhuma oportunidade ainda</p>
                <Button onClick={() => setIsOpportunityModalOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Primeira Oportunidade
                </Button>
              </div>
            ) : filteredOpportunities.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Nenhuma oportunidade encontrada</p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Mostrando {filteredOpportunities.length} de {opportunities.length} oportunidades
                </p>
                {filteredOpportunities.map((opportunity) => (
                  <OpportunityCard
                    key={opportunity.id}
                    opportunity={opportunity}
                    onEdit={(opp) => {
                      setEditingOpportunity(opp);
                      setIsOpportunityModalOpen(true);
                    }}
                    onDelete={handleDeleteOpportunity}
                    onAddInteraction={(opp) => {
                      setSelectedOpportunity(opp);
                      setIsInteractionModalOpen(true);
                    }}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <StoreManagement
            stores={workforceData.stores}
            onSaveStore={handleSaveStore}
            onDeleteStore={handleDeleteStore}
          />
        )}
      </main>

      {/* Modals */}
      <OpportunityModal
        open={isOpportunityModalOpen}
        onClose={() => {
          setIsOpportunityModalOpen(false);
          setEditingOpportunity(undefined);
        }}
        onSave={handleSaveOpportunity}
        opportunity={editingOpportunity}
      />

      <InteractionModal
        open={isInteractionModalOpen}
        onClose={() => {
          setIsInteractionModalOpen(false);
          setSelectedOpportunity(undefined);
        }}
        onSave={handleAddInteraction}
      />
    </div>
  );
};

export default Index;
