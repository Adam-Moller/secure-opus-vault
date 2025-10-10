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
import { isFileSystemSupported, saveToFileSystem, downloadEncryptedFile } from "@/utils/fileStorage";

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState("");
  const [fileHandle, setFileHandle] = useState<FileSystemFileHandle | undefined>();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isOpportunityModalOpen, setIsOpportunityModalOpen] = useState(false);
  const [isInteractionModalOpen, setIsInteractionModalOpen] = useState(false);
  const [editingOpportunity, setEditingOpportunity] = useState<Opportunity | undefined>();
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | undefined>();
  const { toast } = useToast();
  const supportsFileSystem = isFileSystemSupported();

  const handleLogin = (data: EncryptedData, loginPassword: string, handle?: FileSystemFileHandle) => {
    setPassword(loginPassword);
    setFileHandle(handle);
    setOpportunities(data.data);
    setIsLoggedIn(true);
    toast({
      title: "Login Successful",
      description: `Loaded ${data.data.length} opportunities`,
    });
  };

  const handleCreateNew = (newPassword: string) => {
    setPassword(newPassword);
    setOpportunities([]);
    setIsLoggedIn(true);
    toast({
      title: "New CRM Created",
      description: "You can now start adding opportunities",
    });
  };

  const saveData = async (data: Opportunity[]) => {
    try {
      const encryptedData: EncryptedData = { data };
      
      if (supportsFileSystem && fileHandle) {
        const newHandle = await saveToFileSystem(encryptedData, password, fileHandle);
        setFileHandle(newHandle);
      } else if (supportsFileSystem) {
        const newHandle = await saveToFileSystem(encryptedData, password);
        setFileHandle(newHandle);
      } else {
        await downloadEncryptedFile(encryptedData, password);
      }

      toast({
        title: "Data Saved",
        description: supportsFileSystem ? "File updated successfully" : "File downloaded successfully",
      });
    } catch (error: any) {
      toast({
        title: "Save Error",
        description: error.message || "Failed to save data",
        variant: "destructive",
      });
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
    if (confirm("Are you sure you want to logout? Make sure you've saved your data!")) {
      setIsLoggedIn(false);
      setPassword("");
      setFileHandle(undefined);
      setOpportunities([]);
    }
  };

  const handleManualSave = () => {
    saveData(opportunities);
  };

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
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <h1 className="text-2xl font-bold">Secure CRM</h1>
            <div className="flex items-center gap-2">
              <Button onClick={handleManualSave} variant="outline" size="sm">
                <Save className="w-4 h-4 mr-2" />
                {supportsFileSystem ? "Save" : "Download"}
              </Button>
              <Button onClick={handleLogout} variant="outline" size="sm">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
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
