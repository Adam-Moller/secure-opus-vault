import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ManagementContact } from "@/types/store";

interface ManagementContactModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (contact: ManagementContact) => void;
  contact?: ManagementContact;
  maxLevel: number;
}

const emptyContact: Omit<ManagementContact, "id"> = {
  nome: "",
  cargo: "",
  nivel: 1,
  email: "",
  telefone: "",
};

export const ManagementContactModal = ({ 
  open, 
  onClose, 
  onSave, 
  contact,
  maxLevel 
}: ManagementContactModalProps) => {
  const [formData, setFormData] = useState<Omit<ManagementContact, "id">>(emptyContact);

  useEffect(() => {
    if (contact) {
      const { id, ...rest } = contact;
      setFormData(rest);
    } else {
      setFormData(emptyContact);
    }
  }, [contact, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const contactData: ManagementContact = {
      id: contact?.id || crypto.randomUUID(),
      ...formData,
    };
    onSave(contactData);
    onClose();
  };

  const handleInputChange = (field: keyof typeof formData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Generate level options
  const levelOptions = Array.from({ length: maxLevel }, (_, i) => i + 1);

  const getLevelLabel = (level: number) => {
    if (level === 1) return "Nível 1 - Chefe Direto";
    if (level === 2) return "Nível 2 - Chefe do Chefe";
    return `Nível ${level}`;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {contact ? "Editar Contato da Gerência" : "Novo Contato da Gerência"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome Completo *</Label>
              <Input
                id="nome"
                required
                maxLength={100}
                value={formData.nome}
                onChange={(e) => handleInputChange("nome", e.target.value)}
                onFocus={(e) => e.target.scrollIntoView({ behavior: "smooth", block: "center" })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cargo">Cargo *</Label>
              <Input
                id="cargo"
                required
                maxLength={100}
                value={formData.cargo}
                onChange={(e) => handleInputChange("cargo", e.target.value)}
                onFocus={(e) => e.target.scrollIntoView({ behavior: "smooth", block: "center" })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nivel">Nível Hierárquico *</Label>
              <Select
                value={formData.nivel.toString()}
                onValueChange={(value) => handleInputChange("nivel", parseInt(value))}
              >
                <SelectTrigger id="nivel">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  {levelOptions.map((level) => (
                    <SelectItem key={level} value={level.toString()}>
                      {getLevelLabel(level)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone *</Label>
              <Input
                id="telefone"
                type="tel"
                required
                maxLength={20}
                value={formData.telefone}
                onChange={(e) => handleInputChange("telefone", e.target.value)}
                onFocus={(e) => e.target.scrollIntoView({ behavior: "smooth", block: "center" })}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                required
                maxLength={255}
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                onFocus={(e) => e.target.scrollIntoView({ behavior: "smooth", block: "center" })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              {contact ? "Salvar Alterações" : "Adicionar Contato"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
