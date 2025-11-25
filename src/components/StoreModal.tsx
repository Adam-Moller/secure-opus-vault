import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Store } from "@/types/store";

interface StoreModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (store: Store) => void;
  store?: Store;
}

const emptyStore: Omit<Store, "id" | "dataCriacao" | "funcionarios" | "logsRH" | "logsVisitas" | "contatosGerencia" | "interacoesGerencia"> = {
  nome: "",
  endereco: "",
  regiao: "",
  status: "Operando",
  gerenteNome: "",
  gerenteTelefone: "",
  gerenteEmail: "",
  metaVendasMensal: 0,
  vendasRealizadas: 0,
  ultimaVisitaData: "",
  proximaVisitaData: "",
  notasGerais: "",
};

export const StoreModal = ({ open, onClose, onSave, store }: StoreModalProps) => {
  const [formData, setFormData] = useState(emptyStore);

  useEffect(() => {
    if (store) {
      setFormData({
        nome: store.nome,
        endereco: store.endereco,
        regiao: store.regiao,
        status: store.status,
        gerenteNome: store.gerenteNome,
        gerenteTelefone: store.gerenteTelefone,
        gerenteEmail: store.gerenteEmail,
        metaVendasMensal: store.metaVendasMensal,
        vendasRealizadas: store.vendasRealizadas,
        ultimaVisitaData: store.ultimaVisitaData,
        proximaVisitaData: store.proximaVisitaData,
        notasGerais: store.notasGerais,
      });
    } else {
      setFormData(emptyStore);
    }
  }, [store, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newStore: Store = {
      id: store?.id || `store_${Date.now()}`,
      dataCriacao: store?.dataCriacao || new Date().toISOString(),
      funcionarios: store?.funcionarios || [],
      logsRH: store?.logsRH || [],
      logsVisitas: store?.logsVisitas || [],
      contatosGerencia: store?.contatosGerencia || [],
      interacoesGerencia: store?.interacoesGerencia || [],
      ...formData,
    };

    onSave(newStore);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
        <DialogHeader>
          <DialogTitle>{store ? "Editar Loja" : "Nova Loja"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome da Loja *</Label>
              <Input
                id="nome"
                required
                maxLength={100}
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                onFocus={(e) => {
                  setTimeout(() => {
                    e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }, 300);
                }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value as Store["status"] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  <SelectItem value="Operando">Operando</SelectItem>
                  <SelectItem value="Reforma">Reforma</SelectItem>
                  <SelectItem value="Fechada Temporariamente">Fechada Temporariamente</SelectItem>
                  <SelectItem value="Fechada Definitivamente">Fechada Definitivamente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="endereco">Endereço *</Label>
              <Input
                id="endereco"
                required
                maxLength={200}
                value={formData.endereco}
                onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                onFocus={(e) => {
                  setTimeout(() => {
                    e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }, 300);
                }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="regiao">Região *</Label>
              <Input
                id="regiao"
                required
                maxLength={50}
                value={formData.regiao}
                onChange={(e) => setFormData({ ...formData, regiao: e.target.value })}
                onFocus={(e) => {
                  setTimeout(() => {
                    e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }, 300);
                }}
              />
            </div>
          </div>

          <div className="border-t pt-4 space-y-4">
            <h3 className="font-semibold">Gerente da Loja</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="gerenteNome">Nome *</Label>
                <Input
                  id="gerenteNome"
                  required
                  maxLength={100}
                  value={formData.gerenteNome}
                  onChange={(e) => setFormData({ ...formData, gerenteNome: e.target.value })}
                  onFocus={(e) => {
                    setTimeout(() => {
                      e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }, 300);
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gerenteEmail">Email *</Label>
                <Input
                  id="gerenteEmail"
                  type="email"
                  required
                  maxLength={255}
                  value={formData.gerenteEmail}
                  onChange={(e) => setFormData({ ...formData, gerenteEmail: e.target.value })}
                  onFocus={(e) => {
                    setTimeout(() => {
                      e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }, 300);
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gerenteTelefone">Telefone *</Label>
                <Input
                  id="gerenteTelefone"
                  type="tel"
                  required
                  maxLength={20}
                  value={formData.gerenteTelefone}
                  onChange={(e) => setFormData({ ...formData, gerenteTelefone: e.target.value })}
                  onFocus={(e) => {
                    setTimeout(() => {
                      e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }, 300);
                  }}
                />
              </div>
            </div>
          </div>

          <div className="border-t pt-4 space-y-4">
            <h3 className="font-semibold">Metas e Performance</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="metaVendasMensal">Meta de Vendas Mensal (R$) *</Label>
                <Input
                  id="metaVendasMensal"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={formData.metaVendasMensal}
                  onChange={(e) => setFormData({ ...formData, metaVendasMensal: parseFloat(e.target.value) || 0 })}
                  onFocus={(e) => {
                    setTimeout(() => {
                      e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }, 300);
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="vendasRealizadas">Vendas Realizadas (R$) *</Label>
                <Input
                  id="vendasRealizadas"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={formData.vendasRealizadas}
                  onChange={(e) => setFormData({ ...formData, vendasRealizadas: parseFloat(e.target.value) || 0 })}
                  onFocus={(e) => {
                    setTimeout(() => {
                      e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }, 300);
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ultimaVisitaData">Última Visita (Data)</Label>
                <Input
                  id="ultimaVisitaData"
                  type="date"
                  value={formData.ultimaVisitaData}
                  onChange={(e) => setFormData({ ...formData, ultimaVisitaData: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="proximaVisitaData">Próxima Visita (Data)</Label>
                <Input
                  id="proximaVisitaData"
                  type="date"
                  value={formData.proximaVisitaData}
                  onChange={(e) => setFormData({ ...formData, proximaVisitaData: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notasGerais">Notas Gerais</Label>
            <Textarea
              id="notasGerais"
              rows={4}
              maxLength={2000}
              value={formData.notasGerais}
              onChange={(e) => setFormData({ ...formData, notasGerais: e.target.value })}
              onFocus={(e) => {
                setTimeout(() => {
                  e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 300);
              }}
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
