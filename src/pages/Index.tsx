import { useState, useEffect } from "react";
import { LoginScreen } from "@/components/LoginScreen";
import { OpportunityCard } from "@/components/OpportunityCard";
import { OpportunityModal } from "@/components/OpportunityModal";
import { InteractionModal } from "@/components/InteractionModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Download, LogOut, Save, Search } from "lucide-react";
import type { Opportunity, EncryptedData, Interaction } from "@/types/opportunity";
import type { CRMType } from "@/types/crmData";
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
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isOpportunityModalOpen, setIsOpportunityModalOpen] = useState(false);
  const [isInteractionModalOpen, setIsInteractionModalOpen] = useState(false);
  const [editingOpportunity, setEditingOpportunity] = useState<Opportunity | undefined>();
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | undefined>();
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const { toast } = useToast();
  const supportsFileSystem = isFileSystemSupported();

  const handleLogin = (data: EncryptedData, loginPassword: string, handle?: FileSystemFileHandle) => {
    setPassword(loginPassword);
    setCurrentFileName(data.fileName);
    setCurrentCrmType(data.crmType || "sales"); // Default to sales for backwards compatibility
    setFileHandle(handle);
    setOpportunities(data.data);
    setIsLoggedIn(true);
    
    // Update registry
    updateFileInRegistry(data.fileName, {
      lastOpened: new Date().toISOString(),
      opportunityCount: data.data.length,
      lastModified: data.lastModified,
    });
    
    toast({
      title: "Login Bem-Sucedido",
      description: `Carregadas ${data.data.length} oportunidades de ${data.fileName}`,
    });
  };

  const handleCreateNew = async (newPassword: string, fileName: string, crmType: CRMType) => {
    setPassword(newPassword);
    setCurrentFileName(fileName);
    setCurrentCrmType(crmType);
    const emptyOpportunities: Opportunity[] = [];
    setOpportunities(emptyOpportunities);
    setIsLoggedIn(true);
    
    // Add to registry
    addFileToRegistry({
      fileName,
      lastModified: new Date().toISOString(),
      lastOpened: new Date().toISOString(),
      opportunityCount: 0,
    });
    
    // Save initial empty state to IndexedDB
    try {
      const now = new Date().toISOString();
      const encryptedData: EncryptedData = {
        fileName,
        createdDate: now,
        lastModified: now,
        crmType,
        data: emptyOpportunities,
      };
      
      await saveToIndexedDB(encryptedData, newPassword);
      
      const crmTypeLabel = crmType === "sales" ? "CRM de Vendas" : "CRM de Gestão de Lojas";
      toast({
        title: "Novo CRM Criado",
        description: `${fileName} (${crmTypeLabel}) está pronto para uso`,
      });
    } catch (error: any) {
      toast({
        title: "Erro de Criação",
        description: error.message || "Falha ao criar arquivo",
        variant: "destructive",
      });
    }
  };

  const saveData = async (data: Opportunity[], showToast = true) => {
    if (!currentFileName) return;
    
    setIsAutoSaving(true);
    try {
      const now = new Date().toISOString();
      const encryptedData: EncryptedData = {
        fileName: currentFileName,
        createdDate: now,
        lastModified: now,
        crmType: currentCrmType,
        data,
      };
      
      if (supportsFileSystem && fileHandle) {
        const newHandle = await saveToFileSystem(encryptedData, password, fileHandle);
        setFileHandle(newHandle);
      } else if (supportsFileSystem) {
        const newHandle = await saveToFileSystem(encryptedData, password);
        setFileHandle(newHandle);
      } else {
        await saveToIndexedDB(encryptedData, password);
      }

      // Update registry
      updateFileInRegistry(currentFileName, {
        lastModified: now,
        opportunityCount: data.length,
      });

      if (showToast) {
        toast({
          title: "Dados Salvos",
          description: supportsFileSystem ? "Arquivo atualizado com sucesso" : "Salvo no armazenamento local",
        });
      }
    } catch (error: any) {
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
    saveData(newOpportunities);
    setEditingOpportunity(undefined);
  };

  const handleDeleteOpportunity = (id: string) => {
    if (!confirm("Are you sure you want to delete this opportunity?")) return;

    const newOpportunities = opportunities.filter((o) => o.id !== id);
    setOpportunities(newOpportunities);
    saveData(newOpportunities);
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

  const handleLogout = () => {
    if (confirm("Are you sure you want to logout? All changes are auto-saved.")) {
      setIsLoggedIn(false);
      setPassword("");
      setCurrentFileName("");
      setFileHandle(undefined);
      setOpportunities([]);
    }
  };

  const handleManualSave = () => {
    saveData(opportunities, true);
  };

  const handleExportBackup = async () => {
    if (!currentFileName) return;
    
    try {
      const now = new Date().toISOString();
      const encryptedData: EncryptedData = {
        fileName: currentFileName,
        createdDate: now,
        lastModified: now,
        crmType: currentCrmType,
        data: opportunities,
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

  // Auto-save effect
  useEffect(() => {
    if (opportunities.length > 0 && isLoggedIn && currentFileName) {
      const timer = setTimeout(() => {
        saveData(opportunities, false);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [opportunities, isLoggedIn, currentFileName]);

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
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
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
