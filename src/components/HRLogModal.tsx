import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2 } from "lucide-react";
import type { HRLog, ActionItem, Employee } from "@/types/store";

interface HRLogModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (hrLog: HRLog) => void;
  employees: Employee[];
  storeName: string;
  hrLog?: HRLog;
}

const emptyHRLog: Omit<HRLog, "id"> = {
  data: new Date().toISOString().split("T")[0],
  tipo: "Admissão",
  funcionarioId: "",
  funcionarioNome: "",
  descricao: "",
  acoesPendentes: [],
};

const emptyActionItem: Omit<ActionItem, "id"> = {
  descricao: "",
  prazo: "",
  concluida: false,
};

export const HRLogModal = ({ open, onClose, onSave, employees, storeName, hrLog }: HRLogModalProps) => {
  const [formData, setFormData] = useState<Omit<HRLog, "id">>(emptyHRLog);

  useEffect(() => {
    if (hrLog) {
      const { id, ...rest } = hrLog;
      setFormData(rest);
    } else {
      setFormData(emptyHRLog);
    }
  }, [hrLog, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.funcionarioId || !formData.funcionarioNome) {
      alert("Por favor, selecione um funcionário");
      return;
    }

    const hrLogData: HRLog = {
      id: hrLog?.id || crypto.randomUUID(),
      ...formData,
    };
    onSave(hrLogData);
    onClose();
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleEmployeeChange = (employeeId: string) => {
    const employee = employees.find(e => e.id === employeeId);
    if (employee) {
      setFormData((prev) => ({ 
        ...prev, 
        funcionarioId: employee.id,
        funcionarioNome: employee.nome 
      }));
    }
  };

  const handleAddActionItem = () => {
    const newAction: ActionItem = {
      id: crypto.randomUUID(),
      ...emptyActionItem,
    };
    setFormData((prev) => ({
      ...prev,
      acoesPendentes: [...prev.acoesPendentes, newAction],
    }));
  };

  const handleRemoveActionItem = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      acoesPendentes: prev.acoesPendentes.filter(a => a.id !== id),
    }));
  };

  const handleActionItemChange = (id: string, field: keyof ActionItem, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      acoesPendentes: prev.acoesPendentes.map(a =>
        a.id === id ? { ...a, [field]: value } : a
      ),
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {hrLog ? "Editar Evento RH" : "Novo Evento RH"} - {storeName}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="data">Data *</Label>
              <Input
                id="data"
                type="date"
                value={formData.data}
                onChange={(e) => handleInputChange("data", e.target.value)}
                onFocus={(e) => e.target.scrollIntoView({ behavior: "smooth", block: "center" })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo de Evento *</Label>
              <Select
                value={formData.tipo}
                onValueChange={(value) => handleInputChange("tipo", value)}
              >
                <SelectTrigger id="tipo">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover">
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="funcionario">Funcionário *</Label>
            <Select
              value={formData.funcionarioId}
              onValueChange={handleEmployeeChange}
            >
              <SelectTrigger id="funcionario">
                <SelectValue placeholder="Selecione um funcionário" />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                {employees.length === 0 ? (
                  <SelectItem value="none" disabled>
                    Nenhum funcionário cadastrado
                  </SelectItem>
                ) : (
                  employees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.nome} - {employee.cargo}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição *</Label>
            <Textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) => handleInputChange("descricao", e.target.value)}
              onFocus={(e) => e.target.scrollIntoView({ behavior: "smooth", block: "center" })}
              placeholder="Descreva o evento de RH..."
              required
              rows={4}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Ações Pendentes</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddActionItem}
              >
                <Plus className="w-4 h-4 mr-1" />
                Adicionar Ação
              </Button>
            </div>

            {formData.acoesPendentes.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma ação pendente</p>
            ) : (
              <div className="space-y-3">
                {formData.acoesPendentes.map((action) => (
                  <div key={action.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start gap-2">
                      <Checkbox
                        id={`action-${action.id}`}
                        checked={action.concluida}
                        onCheckedChange={(checked) =>
                          handleActionItemChange(action.id, "concluida", checked === true)
                        }
                      />
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label htmlFor={`desc-${action.id}`} className="text-xs">
                            Descrição
                          </Label>
                          <Input
                            id={`desc-${action.id}`}
                            value={action.descricao}
                            onChange={(e) =>
                              handleActionItemChange(action.id, "descricao", e.target.value)
                            }
                            placeholder="Descrição da ação..."
                            onFocus={(e) => e.target.scrollIntoView({ behavior: "smooth", block: "center" })}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor={`prazo-${action.id}`} className="text-xs">
                            Prazo
                          </Label>
                          <Input
                            id={`prazo-${action.id}`}
                            type="date"
                            value={action.prazo}
                            onChange={(e) =>
                              handleActionItemChange(action.id, "prazo", e.target.value)
                            }
                            onFocus={(e) => e.target.scrollIntoView({ behavior: "smooth", block: "center" })}
                          />
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveActionItem(action.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              {hrLog ? "Salvar Alterações" : "Adicionar Evento"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
