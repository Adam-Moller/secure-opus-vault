import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { IconPicker } from "./IconPicker";
import { ColorPicker } from "./ColorPicker";
import { Plus, Edit2, Trash2, X, Save, Award } from "lucide-react";
import * as Icons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { BadgeTemplate } from "@/types/store";

interface BadgeTemplateModalProps {
  open: boolean;
  onClose: () => void;
  badges: BadgeTemplate[];
  onSaveBadges: (badges: BadgeTemplate[]) => void;
}

export function BadgeTemplateModal({ 
  open, 
  onClose, 
  badges, 
  onSaveBadges 
}: BadgeTemplateModalProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBadge, setEditingBadge] = useState<BadgeTemplate | null>(null);
  const [deleteConfirmBadge, setDeleteConfirmBadge] = useState<BadgeTemplate | null>(null);

  // Form state
  const [nome, setNome] = useState("");
  const [icone, setIcone] = useState("Star");
  const [cor, setCor] = useState("#FFD700");
  const [descricao, setDescricao] = useState("");

  const resetForm = () => {
    setNome("");
    setIcone("Star");
    setCor("#FFD700");
    setDescricao("");
    setEditingBadge(null);
  };

  const openNewBadgeForm = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const openEditBadgeForm = (badge: BadgeTemplate) => {
    setNome(badge.nome);
    setIcone(badge.icone);
    setCor(badge.cor);
    setDescricao(badge.descricao);
    setEditingBadge(badge);
    setIsFormOpen(true);
  };

  const handleSave = () => {
    if (!nome.trim()) return;

    if (editingBadge) {
      // Update existing badge
      const updatedBadges = badges.map(b =>
        b.id === editingBadge.id
          ? { ...b, nome, icone, cor, descricao }
          : b
      );
      onSaveBadges(updatedBadges);
    } else {
      // Create new badge
      const newBadge: BadgeTemplate = {
        id: crypto.randomUUID(),
        nome,
        icone,
        cor,
        descricao,
      };
      onSaveBadges([...badges, newBadge]);
    }

    setIsFormOpen(false);
    resetForm();
  };

  const handleDelete = () => {
    if (!deleteConfirmBadge) return;
    const updatedBadges = badges.filter(b => b.id !== deleteConfirmBadge.id);
    onSaveBadges(updatedBadges);
    setDeleteConfirmBadge(null);
  };

  const getIcon = (iconName: string): LucideIcon | null => {
    const IconComponent = (Icons as unknown as Record<string, LucideIcon>)[iconName];
    if (IconComponent && typeof IconComponent === 'function') {
      return IconComponent;
    }
    return null;
  };

  return (
    <>
      <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              Gerenciar Badges
            </DialogTitle>
          </DialogHeader>

          {!isFormOpen ? (
            // Badge List View
            <div className="flex flex-col gap-4 flex-1">
              <Button onClick={openNewBadgeForm} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Criar Novo Badge
              </Button>

              {badges.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Award className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Nenhum badge criado ainda</p>
                  <p className="text-sm">Crie badges para reconhecer seus funcionários</p>
                </div>
              ) : (
                <ScrollArea className="flex-1 max-h-[400px]">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-4">
                    {badges.map((badge) => {
                      const IconComponent = getIcon(badge.icone);
                      return (
                        <div
                          key={badge.id}
                          className="group relative p-4 rounded-lg border bg-card hover:shadow-md transition-all"
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                              style={{ backgroundColor: `${badge.cor}20` }}
                            >
                              {IconComponent && (
                                <IconComponent
                                  className="w-6 h-6"
                                  style={{ color: badge.cor }}
                                />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium truncate">{badge.nome}</h3>
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {badge.descricao || "Sem descrição"}
                              </p>
                            </div>
                          </div>
                          
                          <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => openEditBadgeForm(badge)}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => setDeleteConfirmBadge(badge)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              )}
            </div>
          ) : (
            // Badge Form View
            <ScrollArea className="flex-1 max-h-[70vh]">
              <div className="space-y-6 pr-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">
                    {editingBadge ? "Editar Badge" : "Novo Badge"}
                  </h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setIsFormOpen(false);
                      resetForm();
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                {/* Preview */}
                <div className="flex items-center gap-4 p-4 rounded-lg border bg-muted/50">
                  <div
                    className="w-16 h-16 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${cor}30` }}
                  >
                    {(() => {
                      const IconComponent = getIcon(icone);
                      return IconComponent ? (
                        <IconComponent className="w-8 h-8" style={{ color: cor }} />
                      ) : null;
                    })()}
                  </div>
                  <div>
                    <p className="font-semibold text-lg">{nome || "Nome do Badge"}</p>
                    <p className="text-sm text-muted-foreground">
                      {descricao || "Descrição do badge"}
                    </p>
                  </div>
                </div>

                {/* Nome */}
                <div className="space-y-2">
                  <Label htmlFor="badge-nome">Nome do Badge *</Label>
                  <Input
                    id="badge-nome"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Ex: Estrela do Mês, Top Vendedor, etc."
                  />
                </div>

                {/* Descrição */}
                <div className="space-y-2">
                  <Label htmlFor="badge-descricao">Descrição</Label>
                  <Textarea
                    id="badge-descricao"
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                    placeholder="Descreva o que este badge representa..."
                    rows={2}
                  />
                </div>

                {/* Ícone */}
                <div className="space-y-2">
                  <Label>Ícone</Label>
                  <IconPicker selectedIcon={icone} onSelectIcon={setIcone} />
                </div>

                {/* Cor */}
                <div className="space-y-2">
                  <Label>Cor</Label>
                  <ColorPicker selectedColor={cor} onSelectColor={setCor} />
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setIsFormOpen(false);
                      resetForm();
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={handleSave}
                    disabled={!nome.trim()}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {editingBadge ? "Salvar Alterações" : "Criar Badge"}
                  </Button>
                </div>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirmBadge} onOpenChange={() => setDeleteConfirmBadge(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Badge</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o badge "{deleteConfirmBadge?.nome}"?
              <br /><br />
              <strong className="text-destructive">
                Atenção: Este badge será removido de todos os funcionários que o possuem.
              </strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
