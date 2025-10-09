import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Interaction } from "@/types/opportunity";

interface InteractionModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (interaction: Interaction) => void;
}

export const InteractionModal = ({ open, onClose, onSave }: InteractionModalProps) => {
  const [tipo, setTipo] = useState("Ligação");
  const [resumo, setResumo] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const interaction: Interaction = {
      data: new Date().toISOString(),
      tipo,
      resumo,
    };

    onSave(interaction);
    setTipo("Ligação");
    setResumo("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Nova Interação</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tipo">Tipo de Interação *</Label>
            <Select value={tipo} onValueChange={setTipo}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Ligação">Ligação</SelectItem>
                <SelectItem value="Email">Email</SelectItem>
                <SelectItem value="Reunião">Reunião</SelectItem>
                <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                <SelectItem value="Outro">Outro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="resumo">Resumo da Interação *</Label>
            <Textarea
              id="resumo"
              required
              rows={5}
              value={resumo}
              onChange={(e) => setResumo(e.target.value)}
              placeholder="Descreva o que foi discutido..."
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">Adicionar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
