import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import type { VisitLog } from "@/types/store";

interface VisitLogModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (visitLog: VisitLog) => void;
  storeName: string;
}

const emptyVisitLog: Omit<VisitLog, "id"> = {
  data: new Date().toISOString().split("T")[0],
  horaInicio: "",
  horaFim: "",
  tipo: "Rotina",
  avaliacoes: {
    limpeza: 3,
    organizacao: 3,
    atendimento: 3,
    estoque: 3,
  },
  observacoesPositivas: "",
  problemasIdentificados: "",
  pessoasPresentes: [],
  acoesPendentes: [],
};

export const VisitLogModal = ({ open, onClose, onSave, storeName }: VisitLogModalProps) => {
  const [formData, setFormData] = useState(emptyVisitLog);
  const [pessoasPresentesText, setPessoasPresentesText] = useState("");

  useEffect(() => {
    if (open) {
      setFormData({
        ...emptyVisitLog,
        data: new Date().toISOString().split("T")[0],
      });
      setPessoasPresentesText("");
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newVisitLog: VisitLog = {
      id: `visit_${Date.now()}`,
      ...formData,
      pessoasPresentes: pessoasPresentesText
        .split(",")
        .map((p) => p.trim())
        .filter((p) => p.length > 0),
    };

    onSave(newVisitLog);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
        <DialogHeader>
          <DialogTitle>Nova Visita - {storeName}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="data">Data da Visita *</Label>
              <Input
                id="data"
                type="date"
                required
                value={formData.data}
                onChange={(e) => setFormData({ ...formData, data: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo de Visita *</Label>
              <Select
                value={formData.tipo}
                onValueChange={(value) => setFormData({ ...formData, tipo: value as VisitLog["tipo"] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  <SelectItem value="Rotina">Rotina</SelectItem>
                  <SelectItem value="Auditoria">Auditoria</SelectItem>
                  <SelectItem value="Emergência">Emergência</SelectItem>
                  <SelectItem value="Treinamento">Treinamento</SelectItem>
                  <SelectItem value="Outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="horaInicio">Hora Início</Label>
              <Input
                id="horaInicio"
                type="time"
                value={formData.horaInicio}
                onChange={(e) => setFormData({ ...formData, horaInicio: e.target.value })}
                onFocus={(e) => {
                  setTimeout(() => {
                    e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }, 300);
                }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="horaFim">Hora Fim</Label>
              <Input
                id="horaFim"
                type="time"
                value={formData.horaFim}
                onChange={(e) => setFormData({ ...formData, horaFim: e.target.value })}
                onFocus={(e) => {
                  setTimeout(() => {
                    e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }, 300);
                }}
              />
            </div>
          </div>

          <div className="border-t pt-4 space-y-4">
            <h3 className="font-semibold">Avaliações (1-5)</h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>Limpeza</Label>
                  <span className="text-sm font-medium">{formData.avaliacoes.limpeza}</span>
                </div>
                <Slider
                  value={[formData.avaliacoes.limpeza]}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      avaliacoes: { ...formData.avaliacoes, limpeza: value[0] },
                    })
                  }
                  min={1}
                  max={5}
                  step={1}
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>Organização</Label>
                  <span className="text-sm font-medium">{formData.avaliacoes.organizacao}</span>
                </div>
                <Slider
                  value={[formData.avaliacoes.organizacao]}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      avaliacoes: { ...formData.avaliacoes, organizacao: value[0] },
                    })
                  }
                  min={1}
                  max={5}
                  step={1}
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>Atendimento</Label>
                  <span className="text-sm font-medium">{formData.avaliacoes.atendimento}</span>
                </div>
                <Slider
                  value={[formData.avaliacoes.atendimento]}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      avaliacoes: { ...formData.avaliacoes, atendimento: value[0] },
                    })
                  }
                  min={1}
                  max={5}
                  step={1}
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>Estoque</Label>
                  <span className="text-sm font-medium">{formData.avaliacoes.estoque}</span>
                </div>
                <Slider
                  value={[formData.avaliacoes.estoque]}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      avaliacoes: { ...formData.avaliacoes, estoque: value[0] },
                    })
                  }
                  min={1}
                  max={5}
                  step={1}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoesPositivas">Observações Positivas</Label>
            <Textarea
              id="observacoesPositivas"
              rows={3}
              maxLength={1000}
              value={formData.observacoesPositivas}
              onChange={(e) => setFormData({ ...formData, observacoesPositivas: e.target.value })}
              onFocus={(e) => {
                setTimeout(() => {
                  e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 300);
              }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="problemasIdentificados">Problemas Identificados</Label>
            <Textarea
              id="problemasIdentificados"
              rows={3}
              maxLength={1000}
              value={formData.problemasIdentificados}
              onChange={(e) => setFormData({ ...formData, problemasIdentificados: e.target.value })}
              onFocus={(e) => {
                setTimeout(() => {
                  e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 300);
              }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pessoasPresentes">Pessoas Presentes (separadas por vírgula)</Label>
            <Input
              id="pessoasPresentes"
              maxLength={500}
              placeholder="João Silva, Maria Santos, ..."
              value={pessoasPresentesText}
              onChange={(e) => setPessoasPresentesText(e.target.value)}
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
            <Button type="submit">Salvar Visita</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
