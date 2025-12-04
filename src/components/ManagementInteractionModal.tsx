import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ManagementInteraction, ManagementContact } from "@/types/store";

interface ManagementInteractionModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (interaction: ManagementInteraction) => void;
  contacts: { contact: ManagementContact; storeName: string }[];
  interaction?: ManagementInteraction;
  preselectedContactId?: string;
}

export const ManagementInteractionModal = ({
  open,
  onClose,
  onSave,
  contacts,
  interaction,
  preselectedContactId,
}: ManagementInteractionModalProps) => {
  const [contatoId, setContatoId] = useState("");
  const [tipo, setTipo] = useState<ManagementInteraction["tipo"]>("Reunião");
  const [resumo, setResumo] = useState("");
  const [proximaAcao, setProximaAcao] = useState("");
  const [proximaAcaoData, setProximaAcaoData] = useState("");

  useEffect(() => {
    if (interaction) {
      setContatoId(interaction.contatoId);
      setTipo(interaction.tipo);
      setResumo(interaction.resumo);
      setProximaAcao(interaction.proximaAcao);
      setProximaAcaoData(interaction.proximaAcaoData);
    } else {
      setContatoId(preselectedContactId || "");
      setTipo("Reunião");
      setResumo("");
      setProximaAcao("");
      setProximaAcaoData("");
    }
  }, [interaction, preselectedContactId, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const selectedContact = contacts.find(c => c.contact.id === contatoId);
    if (!selectedContact) return;

    const newInteraction: ManagementInteraction = {
      id: interaction?.id || crypto.randomUUID(),
      data: new Date().toISOString().split("T")[0],
      tipo,
      contatoId,
      contatoNome: selectedContact.contact.nome,
      resumo,
      proximaAcao,
      proximaAcaoData,
    };

    onSave(newInteraction);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
        <DialogHeader>
          <DialogTitle>
            {interaction ? "Editar Interação" : "Nova Interação"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="contato">Contato *</Label>
            <Select value={contatoId} onValueChange={setContatoId} required>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um contato" />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                {contacts.map(({ contact, storeName }) => (
                  <SelectItem key={contact.id} value={contact.id}>
                    {contact.nome} - {contact.cargo} ({storeName})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tipo">Tipo de Interação *</Label>
            <Select value={tipo} onValueChange={(v) => setTipo(v as ManagementInteraction["tipo"])}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                <SelectItem value="Reunião">Reunião</SelectItem>
                <SelectItem value="Ligação">Ligação</SelectItem>
                <SelectItem value="Email">Email</SelectItem>
                <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                <SelectItem value="Outro">Outro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="resumo">Resumo *</Label>
            <Textarea
              id="resumo"
              required
              rows={4}
              value={resumo}
              onChange={(e) => setResumo(e.target.value)}
              placeholder="Descreva o que foi discutido..."
              onFocus={(e) => {
                setTimeout(() => {
                  e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 300);
              }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="proximaAcao">Próxima Ação</Label>
            <Input
              id="proximaAcao"
              value={proximaAcao}
              onChange={(e) => setProximaAcao(e.target.value)}
              placeholder="O que precisa ser feito..."
              onFocus={(e) => {
                setTimeout(() => {
                  e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 300);
              }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="proximaAcaoData">Data da Próxima Ação</Label>
            <Input
              id="proximaAcaoData"
              type="date"
              value={proximaAcaoData}
              onChange={(e) => setProximaAcaoData(e.target.value)}
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
            <Button type="submit" disabled={!contatoId}>
              {interaction ? "Salvar" : "Adicionar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
