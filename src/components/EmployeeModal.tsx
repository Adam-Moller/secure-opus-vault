import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Employee } from "@/types/store";

interface EmployeeModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (employee: Employee) => void;
  employee?: Employee;
  storeName: string;
}

const emptyEmployee: Omit<Employee, "id"> = {
  nome: "",
  cargo: "",
  dataAdmissao: new Date().toISOString().split("T")[0],
  status: "Ativo",
  telefone: "",
  email: "",
};

export const EmployeeModal = ({ open, onClose, onSave, employee, storeName }: EmployeeModalProps) => {
  const [formData, setFormData] = useState<Omit<Employee, "id">>(emptyEmployee);

  useEffect(() => {
    if (employee) {
      const { id, ...rest } = employee;
      setFormData(rest);
    } else {
      setFormData(emptyEmployee);
    }
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

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {employee ? "Editar Funcionário" : "Novo Funcionário"} - {storeName}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
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
              <Label htmlFor="cargo">Cargo *</Label>
              <Input
                id="cargo"
                value={formData.cargo}
                onChange={(e) => handleInputChange("cargo", e.target.value)}
                onFocus={(e) => e.target.scrollIntoView({ behavior: "smooth", block: "center" })}
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

            <div className="space-y-2">
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

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              {employee ? "Salvar Alterações" : "Adicionar Funcionário"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
