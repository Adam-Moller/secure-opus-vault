import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  User, Calendar, Award, MessageSquare, Plane, Plus, Trash2, X, Check, AlertTriangle, FileText, Trophy, ArrowRightLeft
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import * as LucideIcons from "lucide-react";
import type { Employee, EmployeeType, BadgeTemplate, ScheduledVacation, Observation, EmployeeBadge, AbsenceLog, Achievement, Store } from "@/types/store";

interface EmployeeModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (employee: Employee) => void;
  employee?: Employee;
  storeName: string;
  storeId: string;
  stores?: Store[];
  badgeTemplates?: BadgeTemplate[];
}

const emptyEmployee: Omit<Employee, "id"> = {
  nome: "",
  tipo: "Consultor",
  cargo: "",
  dataAdmissao: new Date().toISOString().split("T")[0],
  status: "Ativo",
  telefone: "",
  email: "",
  lojaAtualId: "",
  historicoLojas: [],
  feriasProgramadas: [],
  logAfastamentos: [],
  conquistas: [],
  badges: [],
  observacoes: [],
};

const getIcon = (iconName: string) => {
  const iconKey = iconName.charAt(0).toUpperCase() + iconName.slice(1).replace(/-([a-z])/g, (_, c) => c.toUpperCase());
  const IconComponent = (LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>>)[iconKey];
  return IconComponent || LucideIcons.Award;
};

export const EmployeeModal = ({ 
  open, 
  onClose, 
  onSave, 
  employee, 
  storeName,
  storeId,
  stores = [],
  badgeTemplates = []
}: EmployeeModalProps) => {
  const [formData, setFormData] = useState<Omit<Employee, "id">>(emptyEmployee);
  const [activeTab, setActiveTab] = useState("dados");
  
  // Férias form state
  const [newVacation, setNewVacation] = useState({ dataInicio: "", dataFim: "", observacao: "" });
  
  // Afastamento form state
  const [newAbsence, setNewAbsence] = useState<{
    data: string;
    tipo: AbsenceLog["tipo"];
    motivo: string;
    diasAfastamento: string;
    dataRetorno: string;
  }>({ data: "", tipo: "Falta", motivo: "", diasAfastamento: "", dataRetorno: "" });
  
  // Conquista form state
  const [newAchievement, setNewAchievement] = useState<{
    tipo: Achievement["tipo"];
    titulo: string;
    descricao: string;
    lojaDestinoId: string;
    cargoNovo: EmployeeType;
  }>({ tipo: "Reconhecimento", titulo: "", descricao: "", lojaDestinoId: "", cargoNovo: "Consultor" });
  
  // Observação form state
  const [newObservation, setNewObservation] = useState("");
  
  // Badge assignment state
  const [showBadgeSelector, setShowBadgeSelector] = useState(false);

  useEffect(() => {
    if (employee) {
      const { id, ...rest } = employee;
      setFormData(rest);
    } else {
      setFormData(emptyEmployee);
    }
    setActiveTab("dados");
  }, [employee, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const employeeData: Employee = {
      id: employee?.id || crypto.randomUUID(),
      ...formData,
    };
    onSave(employeeData);
    onClose();
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Férias handlers
  const addVacation = () => {
    if (!newVacation.dataInicio || !newVacation.dataFim) return;
    const vacation: ScheduledVacation = {
      id: crypto.randomUUID(),
      dataInicio: newVacation.dataInicio,
      dataFim: newVacation.dataFim,
      status: "Programada",
      observacao: newVacation.observacao || undefined,
    };
    setFormData(prev => ({
      ...prev,
      feriasProgramadas: [...prev.feriasProgramadas, vacation],
    }));
    setNewVacation({ dataInicio: "", dataFim: "", observacao: "" });
  };

  const removeVacation = (id: string) => {
    setFormData(prev => ({
      ...prev,
      feriasProgramadas: prev.feriasProgramadas.filter(v => v.id !== id),
    }));
  };

  const updateVacationStatus = (id: string, status: ScheduledVacation["status"]) => {
    setFormData(prev => ({
      ...prev,
      feriasProgramadas: prev.feriasProgramadas.map(v => 
        v.id === id ? { ...v, status } : v
      ),
    }));
  };

  // Afastamento handlers
  const addAbsence = () => {
    if (!newAbsence.data || !newAbsence.motivo.trim()) return;
    const absence: AbsenceLog = {
      id: crypto.randomUUID(),
      data: newAbsence.data,
      tipo: newAbsence.tipo,
      motivo: newAbsence.motivo.trim(),
      diasAfastamento: newAbsence.diasAfastamento ? parseInt(newAbsence.diasAfastamento) : undefined,
      dataRetorno: newAbsence.dataRetorno || undefined,
    };
    setFormData(prev => ({
      ...prev,
      logAfastamentos: [absence, ...prev.logAfastamentos],
    }));
    setNewAbsence({ data: "", tipo: "Falta", motivo: "", diasAfastamento: "", dataRetorno: "" });
  };

  const removeAbsence = (id: string) => {
    setFormData(prev => ({
      ...prev,
      logAfastamentos: prev.logAfastamentos.filter(a => a.id !== id),
    }));
  };

  // Conquista handlers
  const addAchievement = () => {
    if (!newAchievement.titulo.trim()) return;
    
    const achievement: Achievement = {
      id: crypto.randomUUID(),
      data: new Date().toISOString().split("T")[0],
      tipo: newAchievement.tipo,
      titulo: newAchievement.titulo.trim(),
      descricao: newAchievement.descricao.trim(),
    };

    // Para transferência, adiciona info das lojas
    if (newAchievement.tipo === "Transferencia" && newAchievement.lojaDestinoId) {
      const lojaDestino = stores.find(s => s.id === newAchievement.lojaDestinoId);
      achievement.lojaOrigemId = storeId;
      achievement.lojaOrigemNome = storeName;
      achievement.lojaDestinoId = newAchievement.lojaDestinoId;
      achievement.lojaDestinoNome = lojaDestino?.nome || "";
    }

    // Para promoção, adiciona info dos cargos
    if (newAchievement.tipo === "Promocao") {
      achievement.cargoAnterior = formData.tipo;
      achievement.cargoNovo = newAchievement.cargoNovo;
    }

    setFormData(prev => ({
      ...prev,
      conquistas: [achievement, ...prev.conquistas],
    }));
    setNewAchievement({ tipo: "Reconhecimento", titulo: "", descricao: "", lojaDestinoId: "", cargoNovo: "Consultor" });
  };

  const removeAchievement = (id: string) => {
    setFormData(prev => ({
      ...prev,
      conquistas: prev.conquistas.filter(a => a.id !== id),
    }));
  };

  // Observação handlers
  const addObservation = () => {
    if (!newObservation.trim()) return;
    const observation: Observation = {
      id: crypto.randomUUID(),
      data: new Date().toISOString().split("T")[0],
      texto: newObservation.trim(),
    };
    setFormData(prev => ({
      ...prev,
      observacoes: [observation, ...prev.observacoes],
    }));
    setNewObservation("");
  };

  const removeObservation = (id: string) => {
    setFormData(prev => ({
      ...prev,
      observacoes: prev.observacoes.filter(o => o.id !== id),
    }));
  };

  // Badge handlers
  const assignBadge = (templateId: string) => {
    if (formData.badges.some(b => b.badgeTemplateId === templateId)) return;
    const badge: EmployeeBadge = {
      id: crypto.randomUUID(),
      badgeTemplateId: templateId,
      dataConcessao: new Date().toISOString().split("T")[0],
    };
    setFormData(prev => ({
      ...prev,
      badges: [...prev.badges, badge],
    }));
    setShowBadgeSelector(false);
  };

  const removeBadge = (badgeId: string) => {
    setFormData(prev => ({
      ...prev,
      badges: prev.badges.filter(b => b.id !== badgeId),
    }));
  };

  const getBadgeTemplate = (templateId: string) => 
    badgeTemplates.find(t => t.id === templateId);

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR });
    } catch {
      return dateString;
    }
  };

  const getVacationStatusColor = (status: ScheduledVacation["status"]) => {
    switch (status) {
      case "Programada": return "bg-blue-500/10 text-blue-700 border-blue-500/20";
      case "EmAndamento": return "bg-green-500/10 text-green-700 border-green-500/20";
      case "Concluida": return "bg-gray-500/10 text-gray-700 border-gray-500/20";
      case "Cancelada": return "bg-red-500/10 text-red-700 border-red-500/20";
    }
  };

  const getAbsenceTypeColor = (tipo: AbsenceLog["tipo"]) => {
    switch (tipo) {
      case "Falta": return "bg-red-500/10 text-red-700 border-red-500/20";
      case "Atestado": return "bg-amber-500/10 text-amber-700 border-amber-500/20";
      case "Afastamento": return "bg-orange-500/10 text-orange-700 border-orange-500/20";
      case "Licenca": return "bg-purple-500/10 text-purple-700 border-purple-500/20";
    }
  };

  const getAbsenceTypeLabel = (tipo: AbsenceLog["tipo"]) => {
    switch (tipo) {
      case "Falta": return "Falta";
      case "Atestado": return "Atestado";
      case "Afastamento": return "Afastamento";
      case "Licenca": return "Licença";
    }
  };

  const getAchievementTypeColor = (tipo: Achievement["tipo"]) => {
    switch (tipo) {
      case "Promocao": return "bg-green-500/10 text-green-700 border-green-500/20";
      case "Transferencia": return "bg-blue-500/10 text-blue-700 border-blue-500/20";
      case "Reconhecimento": return "bg-yellow-500/10 text-yellow-700 border-yellow-500/20";
      case "Meta": return "bg-purple-500/10 text-purple-700 border-purple-500/20";
      case "Treinamento": return "bg-cyan-500/10 text-cyan-700 border-cyan-500/20";
      case "Outro": return "bg-gray-500/10 text-gray-700 border-gray-500/20";
    }
  };

  const getAchievementTypeLabel = (tipo: Achievement["tipo"]) => {
    switch (tipo) {
      case "Promocao": return "Promoção";
      case "Transferencia": return "Transferência";
      case "Reconhecimento": return "Reconhecimento";
      case "Meta": return "Meta Alcançada";
      case "Treinamento": return "Treinamento";
      case "Outro": return "Outro";
    }
  };

  const getAchievementIcon = (tipo: Achievement["tipo"]) => {
    switch (tipo) {
      case "Promocao": return Trophy;
      case "Transferencia": return ArrowRightLeft;
      case "Reconhecimento": return Award;
      case "Meta": return Trophy;
      case "Treinamento": return FileText;
      case "Outro": return Calendar;
    }
  };

  const availableBadges = badgeTemplates.filter(
    t => !formData.badges.some(b => b.badgeTemplateId === t.id)
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            {employee ? "Editar Funcionário" : "Novo Funcionário"} - {storeName}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid grid-cols-6 w-full shrink-0">
            <TabsTrigger value="dados" className="gap-1 text-xs sm:text-sm px-1 sm:px-2">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Dados</span>
            </TabsTrigger>
            <TabsTrigger value="ferias" className="gap-1 text-xs sm:text-sm px-1 sm:px-2">
              <Plane className="w-4 h-4" />
              <span className="hidden sm:inline">Férias</span>
            </TabsTrigger>
            <TabsTrigger value="afastamentos" className="gap-1 text-xs sm:text-sm px-1 sm:px-2">
              <AlertTriangle className="w-4 h-4" />
              <span className="hidden sm:inline">Afastam.</span>
            </TabsTrigger>
            <TabsTrigger value="conquistas" className="gap-1 text-xs sm:text-sm px-1 sm:px-2">
              <Trophy className="w-4 h-4" />
              <span className="hidden sm:inline">Conquist.</span>
            </TabsTrigger>
            <TabsTrigger value="badges" className="gap-1 text-xs sm:text-sm px-1 sm:px-2">
              <Award className="w-4 h-4" />
              <span className="hidden sm:inline">Badges</span>
            </TabsTrigger>
            <TabsTrigger value="observacoes" className="gap-1 text-xs sm:text-sm px-1 sm:px-2">
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">Notas</span>
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1 mt-4">
            <form id="employee-form" onSubmit={handleSubmit}>
              {/* Dados Básicos */}
              <TabsContent value="dados" className="mt-0 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome Completo *</Label>
                    <Input
                      id="nome"
                      value={formData.nome}
                      onChange={(e) => handleInputChange("nome", e.target.value)}
                      onFocus={(e) => e.target.scrollIntoView({ behavior: "smooth", block: "center" })}
                      required
                      maxLength={100}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tipo">Tipo *</Label>
                    <Select
                      value={formData.tipo}
                      onValueChange={(value) => handleInputChange("tipo", value as EmployeeType)}
                    >
                      <SelectTrigger id="tipo">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-popover">
                        <SelectItem value="Gerente">Gerente</SelectItem>
                        <SelectItem value="Senior">Sênior</SelectItem>
                        <SelectItem value="Consultor">Consultor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cargo">Cargo Específico *</Label>
                    <Input
                      id="cargo"
                      value={formData.cargo}
                      onChange={(e) => handleInputChange("cargo", e.target.value)}
                      onFocus={(e) => e.target.scrollIntoView({ behavior: "smooth", block: "center" })}
                      placeholder="Ex: Gerente de Vendas, Consultor Jr."
                      required
                      maxLength={50}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dataAdmissao">Data de Admissão *</Label>
                    <Input
                      id="dataAdmissao"
                      type="date"
                      value={formData.dataAdmissao}
                      onChange={(e) => handleInputChange("dataAdmissao", e.target.value)}
                      onFocus={(e) => e.target.scrollIntoView({ behavior: "smooth", block: "center" })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">Status *</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => handleInputChange("status", value)}
                    >
                      <SelectTrigger id="status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-popover">
                        <SelectItem value="Ativo">Ativo</SelectItem>
                        <SelectItem value="Afastado">Afastado</SelectItem>
                        <SelectItem value="Ferias">Férias</SelectItem>
                        <SelectItem value="Desligado">Desligado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="telefone">Telefone</Label>
                    <Input
                      id="telefone"
                      type="tel"
                      value={formData.telefone}
                      onChange={(e) => handleInputChange("telefone", e.target.value)}
                      onFocus={(e) => e.target.scrollIntoView({ behavior: "smooth", block: "center" })}
                      maxLength={20}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      onFocus={(e) => e.target.scrollIntoView({ behavior: "smooth", block: "center" })}
                      maxLength={100}
                    />
                  </div>
                </div>
              </TabsContent>

              {/* Férias Programadas */}
              <TabsContent value="ferias" className="mt-0 space-y-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      Agendar Férias
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Início</Label>
                        <Input
                          type="date"
                          value={newVacation.dataInicio}
                          onChange={e => setNewVacation(prev => ({ ...prev, dataInicio: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Fim</Label>
                        <Input
                          type="date"
                          value={newVacation.dataFim}
                          onChange={e => setNewVacation(prev => ({ ...prev, dataFim: e.target.value }))}
                        />
                      </div>
                    </div>
                    <Input
                      placeholder="Observação (opcional)"
                      value={newVacation.observacao}
                      onChange={e => setNewVacation(prev => ({ ...prev, observacao: e.target.value }))}
                    />
                    <Button type="button" size="sm" onClick={addVacation} className="w-full">
                      <Plus className="w-4 h-4 mr-1" />
                      Adicionar
                    </Button>
                  </CardContent>
                </Card>

                {formData.feriasProgramadas.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Plane className="w-12 h-12 mx-auto mb-2 opacity-30" />
                    <p>Nenhuma férias programada</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {formData.feriasProgramadas.map(vacation => (
                      <Card key={vacation.id} className="p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
                              <span className="font-medium text-sm">
                                {formatDate(vacation.dataInicio)} - {formatDate(vacation.dataFim)}
                              </span>
                              <Badge variant="outline" className={getVacationStatusColor(vacation.status)}>
                                {vacation.status === "EmAndamento" ? "Em Andamento" : vacation.status}
                              </Badge>
                            </div>
                            {vacation.observacao && (
                              <p className="text-xs text-muted-foreground mt-1">{vacation.observacao}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <Select
                              value={vacation.status}
                              onValueChange={(value) => updateVacationStatus(vacation.id, value as ScheduledVacation["status"])}
                            >
                              <SelectTrigger className="h-7 w-[110px] text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-popover">
                                <SelectItem value="Programada">Programada</SelectItem>
                                <SelectItem value="EmAndamento">Em Andamento</SelectItem>
                                <SelectItem value="Concluida">Concluída</SelectItem>
                                <SelectItem value="Cancelada">Cancelada</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => removeVacation(vacation.id)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Afastamentos */}
              <TabsContent value="afastamentos" className="mt-0 space-y-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      Registrar Afastamento
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Data *</Label>
                        <Input
                          type="date"
                          value={newAbsence.data}
                          onChange={e => setNewAbsence(prev => ({ ...prev, data: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Tipo *</Label>
                        <Select
                          value={newAbsence.tipo}
                          onValueChange={(value) => setNewAbsence(prev => ({ ...prev, tipo: value as AbsenceLog["tipo"] }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-popover">
                            <SelectItem value="Falta">Falta</SelectItem>
                            <SelectItem value="Atestado">Atestado</SelectItem>
                            <SelectItem value="Afastamento">Afastamento</SelectItem>
                            <SelectItem value="Licenca">Licença</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Motivo *</Label>
                      <Input
                        placeholder="Descreva o motivo do afastamento"
                        value={newAbsence.motivo}
                        onChange={e => setNewAbsence(prev => ({ ...prev, motivo: e.target.value }))}
                        maxLength={200}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Dias de Afastamento</Label>
                        <Input
                          type="number"
                          min="1"
                          placeholder="Qtd dias"
                          value={newAbsence.diasAfastamento}
                          onChange={e => setNewAbsence(prev => ({ ...prev, diasAfastamento: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Data Retorno</Label>
                        <Input
                          type="date"
                          value={newAbsence.dataRetorno}
                          onChange={e => setNewAbsence(prev => ({ ...prev, dataRetorno: e.target.value }))}
                        />
                      </div>
                    </div>
                    <Button type="button" size="sm" onClick={addAbsence} className="w-full">
                      <Plus className="w-4 h-4 mr-1" />
                      Adicionar
                    </Button>
                  </CardContent>
                </Card>

                {formData.logAfastamentos.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="w-12 h-12 mx-auto mb-2 opacity-30" />
                    <p>Nenhum afastamento registrado</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                      <span>Total: {formData.logAfastamentos.length} registro(s)</span>
                      <span>
                        Faltas: {formData.logAfastamentos.filter(a => a.tipo === "Falta").length}
                      </span>
                    </div>
                    {formData.logAfastamentos.map(absence => (
                      <Card key={absence.id} className="p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <AlertTriangle className="w-4 h-4 text-muted-foreground shrink-0" />
                              <span className="font-medium text-sm">
                                {formatDate(absence.data)}
                              </span>
                              <Badge variant="outline" className={getAbsenceTypeColor(absence.tipo)}>
                                {getAbsenceTypeLabel(absence.tipo)}
                              </Badge>
                            </div>
                            <p className="text-sm">{absence.motivo}</p>
                            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                              {absence.diasAfastamento && (
                                <span>{absence.diasAfastamento} dia(s)</span>
                              )}
                              {absence.dataRetorno && (
                                <span>Retorno: {formatDate(absence.dataRetorno)}</span>
                              )}
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 shrink-0"
                            onClick={() => removeAbsence(absence.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Conquistas */}
              <TabsContent value="conquistas" className="mt-0 space-y-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      Registrar Conquista
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Tipo *</Label>
                        <Select
                          value={newAchievement.tipo}
                          onValueChange={(value) => setNewAchievement(prev => ({ ...prev, tipo: value as Achievement["tipo"] }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-popover">
                            <SelectItem value="Reconhecimento">Reconhecimento</SelectItem>
                            <SelectItem value="Promocao">Promoção</SelectItem>
                            <SelectItem value="Meta">Meta Alcançada</SelectItem>
                            <SelectItem value="Treinamento">Treinamento</SelectItem>
                            <SelectItem value="Transferencia">Transferência</SelectItem>
                            <SelectItem value="Outro">Outro</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Título *</Label>
                        <Input
                          placeholder="Ex: Melhor vendedor do mês"
                          value={newAchievement.titulo}
                          onChange={e => setNewAchievement(prev => ({ ...prev, titulo: e.target.value }))}
                          maxLength={100}
                        />
                      </div>
                    </div>
                    
                    {newAchievement.tipo === "Promocao" && (
                      <div className="space-y-1">
                        <Label className="text-xs">Novo Cargo</Label>
                        <Select
                          value={newAchievement.cargoNovo}
                          onValueChange={(value) => setNewAchievement(prev => ({ ...prev, cargoNovo: value as EmployeeType }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-popover">
                            <SelectItem value="Gerente">Gerente</SelectItem>
                            <SelectItem value="Senior">Sênior</SelectItem>
                            <SelectItem value="Consultor">Consultor</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {newAchievement.tipo === "Transferencia" && stores.length > 1 && (
                      <div className="space-y-1">
                        <Label className="text-xs">Loja Destino</Label>
                        <Select
                          value={newAchievement.lojaDestinoId}
                          onValueChange={(value) => setNewAchievement(prev => ({ ...prev, lojaDestinoId: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a loja destino" />
                          </SelectTrigger>
                          <SelectContent className="bg-popover">
                            {stores.filter(s => s.id !== storeId).map(s => (
                              <SelectItem key={s.id} value={s.id}>{s.nome}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    <div className="space-y-1">
                      <Label className="text-xs">Descrição</Label>
                      <Input
                        placeholder="Detalhes da conquista..."
                        value={newAchievement.descricao}
                        onChange={e => setNewAchievement(prev => ({ ...prev, descricao: e.target.value }))}
                        maxLength={200}
                      />
                    </div>
                    <Button type="button" size="sm" onClick={addAchievement} className="w-full">
                      <Plus className="w-4 h-4 mr-1" />
                      Adicionar
                    </Button>
                  </CardContent>
                </Card>

                {formData.conquistas.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Trophy className="w-12 h-12 mx-auto mb-2 opacity-30" />
                    <p>Nenhuma conquista registrada</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground mb-2">
                      Total: {formData.conquistas.length} conquista(s)
                    </div>
                    {formData.conquistas.map(achievement => {
                      const AchievementIcon = getAchievementIcon(achievement.tipo);
                      return (
                        <Card key={achievement.id} className="p-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <AchievementIcon className="w-4 h-4 text-muted-foreground shrink-0" />
                                <span className="font-medium text-sm">
                                  {achievement.titulo}
                                </span>
                                <Badge variant="outline" className={getAchievementTypeColor(achievement.tipo)}>
                                  {getAchievementTypeLabel(achievement.tipo)}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground mb-1">
                                {formatDate(achievement.data)}
                              </p>
                              {achievement.descricao && (
                                <p className="text-sm">{achievement.descricao}</p>
                              )}
                              {achievement.tipo === "Transferencia" && achievement.lojaDestinoNome && (
                                <p className="text-xs text-blue-600 mt-1">
                                  {achievement.lojaOrigemNome} → {achievement.lojaDestinoNome}
                                </p>
                              )}
                              {achievement.tipo === "Promocao" && achievement.cargoNovo && (
                                <p className="text-xs text-green-600 mt-1">
                                  {achievement.cargoAnterior} → {achievement.cargoNovo}
                                </p>
                              )}
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 shrink-0"
                              onClick={() => removeAchievement(achievement.id)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </TabsContent>

              {/* Badges */}
              <TabsContent value="badges" className="mt-0 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm">Badges Atribuídos</h4>
                  {availableBadges.length > 0 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowBadgeSelector(!showBadgeSelector)}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Atribuir Badge
                    </Button>
                  )}
                </div>

                {showBadgeSelector && (
                  <Card className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Selecione um badge</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => setShowBadgeSelector(false)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {availableBadges.map(template => {
                        const IconComp = getIcon(template.icone);
                        return (
                          <Button
                            key={template.id}
                            type="button"
                            variant="outline"
                            className="h-auto py-2 px-3 justify-start gap-2"
                            onClick={() => assignBadge(template.id)}
                          >
                            <IconComp className="w-4 h-4 shrink-0" style={{ color: template.cor }} />
                            <span className="truncate text-xs">{template.nome}</span>
                          </Button>
                        );
                      })}
                    </div>
                  </Card>
                )}

                {formData.badges.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Award className="w-12 h-12 mx-auto mb-2 opacity-30" />
                    <p>Nenhum badge atribuído</p>
                    {badgeTemplates.length === 0 && (
                      <p className="text-xs mt-1">Crie templates de badges primeiro</p>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {formData.badges.map(badge => {
                      const template = getBadgeTemplate(badge.badgeTemplateId);
                      if (!template) return null;
                      const IconComp = getIcon(template.icone);
                      return (
                        <Card key={badge.id} className="p-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <div 
                                className="p-2 rounded-lg shrink-0"
                                style={{ backgroundColor: `${template.cor}20` }}
                              >
                                <IconComp className="w-5 h-5" style={{ color: template.cor }} />
                              </div>
                              <div className="min-w-0">
                                <p className="font-medium text-sm truncate">{template.nome}</p>
                                <p className="text-xs text-muted-foreground">
                                  {formatDate(badge.dataConcessao)}
                                </p>
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 shrink-0"
                              onClick={() => removeBadge(badge.id)}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </TabsContent>

              {/* Observações */}
              <TabsContent value="observacoes" className="mt-0 space-y-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      Nova Observação
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Textarea
                      placeholder="Escreva uma observação sobre o funcionário..."
                      value={newObservation}
                      onChange={e => setNewObservation(e.target.value)}
                      rows={3}
                    />
                    <Button type="button" size="sm" onClick={addObservation} className="w-full">
                      <Plus className="w-4 h-4 mr-1" />
                      Adicionar
                    </Button>
                  </CardContent>
                </Card>

                {formData.observacoes.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-30" />
                    <p>Nenhuma observação registrada</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {formData.observacoes.map(obs => (
                      <Card key={obs.id} className="p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-muted-foreground mb-1">
                              {formatDate(obs.data)}
                            </p>
                            <p className="text-sm whitespace-pre-wrap">{obs.texto}</p>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 shrink-0"
                            onClick={() => removeObservation(obs.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </form>
          </ScrollArea>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4 border-t shrink-0">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" form="employee-form">
            <Check className="w-4 h-4 mr-1" />
            {employee ? "Salvar Alterações" : "Adicionar Funcionário"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
