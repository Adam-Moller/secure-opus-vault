import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Opportunity } from "@/types/opportunity";

interface OpportunityModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (opportunity: Opportunity) => void;
  opportunity?: Opportunity;
}

const emptyOpportunity: Omit<Opportunity, "id" | "dataCriacao" | "historicoInteracoes"> = {
  nomeEmpresa: "",
  status: "Lead",
  valorPotencial: 0,
  proximoPassoData: "",
  contatoPrincipal: {
    nome: "",
    cargo: "",
    email: "",
    telefone: "",
  },
  notasGerais: "",
};

export const OpportunityModal = ({ open, onClose, onSave, opportunity }: OpportunityModalProps) => {
  const [formData, setFormData] = useState(emptyOpportunity);

  useEffect(() => {
    if (opportunity) {
      setFormData({
        nomeEmpresa: opportunity.nomeEmpresa,
        status: opportunity.status,
        valorPotencial: opportunity.valorPotencial,
        proximoPassoData: opportunity.proximoPassoData,
        contatoPrincipal: opportunity.contatoPrincipal,
        notasGerais: opportunity.notasGerais,
      });
    } else {
      setFormData(emptyOpportunity);
    }
  }, [opportunity, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newOpportunity: Opportunity = {
      id: opportunity?.id || `opp_${Date.now()}`,
      dataCriacao: opportunity?.dataCriacao || new Date().toISOString(),
      historicoInteracoes: opportunity?.historicoInteracoes || [],
      ...formData,
    };

    onSave(newOpportunity);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{opportunity ? "Editar Oportunidade" : "Nova Oportunidade"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="nomeEmpresa">Nome da Empresa *</Label>
              <Input
                id="nomeEmpresa"
                required
                value={formData.nomeEmpresa}
                onChange={(e) => setFormData({ ...formData, nomeEmpresa: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value as Opportunity["status"] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Lead">Lead</SelectItem>
                  <SelectItem value="Qualificado">Qualificado</SelectItem>
                  <SelectItem value="Proposta">Proposta</SelectItem>
                  <SelectItem value="Negociação">Negociação</SelectItem>
                  <SelectItem value="Fechado">Fechado</SelectItem>
                  <SelectItem value="Perdido">Perdido</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="valorPotencial">Valor Potencial (R$) *</Label>
              <Input
                id="valorPotencial"
                type="number"
                step="0.01"
                required
                value={formData.valorPotencial}
                onChange={(e) => setFormData({ ...formData, valorPotencial: parseFloat(e.target.value) || 0 })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="proximoPassoData">Próximo Passo (Data) *</Label>
              <Input
                id="proximoPassoData"
                type="date"
                required
                value={formData.proximoPassoData}
                onChange={(e) => setFormData({ ...formData, proximoPassoData: e.target.value })}
              />
            </div>
          </div>

          <div className="border-t pt-4 space-y-4">
            <h3 className="font-semibold">Contato Principal</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="contactNome">Nome *</Label>
                <Input
                  id="contactNome"
                  required
                  value={formData.contatoPrincipal.nome}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      contatoPrincipal: { ...formData.contatoPrincipal, nome: e.target.value },
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactCargo">Cargo</Label>
                <Input
                  id="contactCargo"
                  value={formData.contatoPrincipal.cargo}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      contatoPrincipal: { ...formData.contatoPrincipal, cargo: e.target.value },
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactEmail">Email *</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  required
                  value={formData.contatoPrincipal.email}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      contatoPrincipal: { ...formData.contatoPrincipal, email: e.target.value },
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactTelefone">Telefone</Label>
                <Input
                  id="contactTelefone"
                  value={formData.contatoPrincipal.telefone}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      contatoPrincipal: { ...formData.contatoPrincipal, telefone: e.target.value },
                    })
                  }
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notasGerais">Notas Gerais</Label>
            <Textarea
              id="notasGerais"
              rows={4}
              value={formData.notasGerais}
              onChange={(e) => setFormData({ ...formData, notasGerais: e.target.value })}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">Salvar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
