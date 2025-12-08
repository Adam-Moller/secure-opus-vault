import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, Edit, Trash2, Search, Mail, Phone, Building2, ChevronRight } from "lucide-react";
import { ManagementContactModal } from "./ManagementContactModal";
import type { Store, ManagementContact } from "@/types/store";

interface ManagementContactsModalProps {
  open: boolean;
  onClose: () => void;
  store?: Store;
  onSaveStore: (store: Store) => void;
}

export const ManagementContactsModal = ({ 
  open, 
  onClose, 
  store,
  onSaveStore 
}: ManagementContactsModalProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<ManagementContact | undefined>();
  const [hierarchyLevels, setHierarchyLevels] = useState(3);

  const filteredContacts = useMemo(() => {
    if (!store) return [];
    return store.contatosGerencia
      .filter(contact => 
        contact.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.cargo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => a.nivel - b.nivel);
  }, [store?.contatosGerencia, searchTerm]);

  const contactsByLevel = useMemo(() => {
    const grouped: Record<number, ManagementContact[]> = {};
    filteredContacts.forEach(contact => {
      if (!grouped[contact.nivel]) {
        grouped[contact.nivel] = [];
      }
      grouped[contact.nivel].push(contact);
    });
    return grouped;
  }, [filteredContacts]);

  if (!store) return null;

  const handleSaveContact = (contact: ManagementContact) => {
    const existingIndex = store.contatosGerencia.findIndex(c => c.id === contact.id);
    
    const updatedContacts = existingIndex >= 0
      ? store.contatosGerencia.map(c => c.id === contact.id ? contact : c)
      : [...store.contatosGerencia, contact];

    const updatedStore: Store = {
      ...store,
      contatosGerencia: updatedContacts,
    };

    onSaveStore(updatedStore);
    setEditingContact(undefined);
  };

  const handleDeleteContact = (id: string) => {
    const updatedStore: Store = {
      ...store,
      contatosGerencia: store.contatosGerencia.filter(c => c.id !== id),
    };
    onSaveStore(updatedStore);
  };

  const getLevelLabel = (level: number) => {
    if (level === 1) return "Nível 1 - Chefe Direto";
    if (level === 2) return "Nível 2 - Chefe do Chefe";
    return `Nível ${level}`;
  };

  const maxLevel = Math.max(hierarchyLevels, ...store.contatosGerencia.map(c => c.nivel));

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Contatos da Gerência - {store.nome}</span>
              <Badge variant="outline" className="text-sm">
                {store.contatosGerencia.length} contatos
              </Badge>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={() => {
                  setEditingContact(undefined);
                  setIsContactModalOpen(true);
                }}
                className="shrink-0"
              >
                <Plus className="w-4 h-4 mr-2" />
                Novo Contato
              </Button>

              <Button
                variant="outline"
                onClick={() => setHierarchyLevels(prev => prev + 1)}
                className="shrink-0"
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Nível Hierárquico
              </Button>

              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar contatos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Hierarchy Display */}
            <ScrollArea className="h-[55vh] pr-4">
              {store.contatosGerencia.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Building2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum contato cadastrado ainda</p>
                  <Button
                    variant="outline"
                    onClick={() => setIsContactModalOpen(true)}
                    className="mt-4"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Primeiro Contato
                  </Button>
                </div>
              ) : filteredContacts.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <p>Nenhum contato encontrado</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {Array.from({ length: maxLevel }, (_, i) => i + 1).map(level => {
                    const contacts = contactsByLevel[level] || [];
                    if (contacts.length === 0 && level > 2) return null;

                    return (
                      <div key={level} className="space-y-3">
                        <div className="flex items-center gap-2 sticky top-0 bg-background py-2 z-10">
                          <ChevronRight className="w-4 h-4 text-muted-foreground" />
                          <h3 className="font-semibold text-sm">{getLevelLabel(level)}</h3>
                          <Badge variant="outline" className="text-xs">
                            {contacts.length}
                          </Badge>
                        </div>

                        {contacts.length === 0 ? (
                          <div className="text-sm text-muted-foreground pl-6">
                            Nenhum contato neste nível
                          </div>
                        ) : (
                          <div className="space-y-2 pl-6">
                            {contacts.map((contact) => (
                              <div
                                key={contact.id}
                                className="bg-card border rounded-lg p-4 space-y-2"
                              >
                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex-1 space-y-2">
                                    <div className="flex items-center gap-2">
                                      <h4 className="font-semibold">{contact.nome}</h4>
                                      <Badge variant="secondary" className="text-xs">
                                        {contact.cargo}
                                      </Badge>
                                    </div>
                                    <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                                      <div className="flex items-center gap-2">
                                        <Mail className="w-3 h-3" />
                                        {contact.email}
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Phone className="w-3 h-3" />
                                        {contact.telefone}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex gap-1 shrink-0">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        setEditingContact(contact);
                                        setIsContactModalOpen(true);
                                      }}
                                    >
                                      <Edit className="w-4 h-4" />
                                    </Button>
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="text-destructive hover:text-destructive"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </Button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>Excluir Contato</AlertDialogTitle>
                                          <AlertDialogDescription>
                                            Tem certeza que deseja excluir {contact.nome}? Esta ação não pode ser desfeita.
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                          <AlertDialogAction
                                            onClick={() => handleDeleteContact(contact.id)}
                                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                          >
                                            Excluir
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </div>

          <div className="flex justify-end pt-4 border-t">
            <Button onClick={onClose}>Fechar</Button>
          </div>
        </DialogContent>
      </Dialog>

      <ManagementContactModal
        open={isContactModalOpen}
        onClose={() => {
          setIsContactModalOpen(false);
          setEditingContact(undefined);
        }}
        onSave={handleSaveContact}
        contact={editingContact}
        maxLevel={maxLevel}
      />
    </>
  );
};
