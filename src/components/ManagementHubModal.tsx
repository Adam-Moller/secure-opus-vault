import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ManagementInteractionModal } from "./ManagementInteractionModal";
import { Plus, Search, Phone, Mail, MessageSquare, Users, Calendar, AlertCircle } from "lucide-react";
import type { Store, ManagementInteraction, ManagementContact } from "@/types/store";

interface ManagementHubModalProps {
  open: boolean;
  onClose: () => void;
  stores: Store[];
  onSaveStore: (store: Store) => void;
}

interface AggregatedContact {
  contact: ManagementContact;
  storeName: string;
  storeId: string;
  interactions: ManagementInteraction[];
}

export const ManagementHubModal = ({
  open,
  onClose,
  stores,
  onSaveStore,
}: ManagementHubModalProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [storeFilter, setStoreFilter] = useState<string>("all");
  const [isInteractionModalOpen, setIsInteractionModalOpen] = useState(false);
  const [selectedContactId, setSelectedContactId] = useState<string | undefined>();

  // Aggregate all contacts and their interactions across stores
  const aggregatedData = useMemo(() => {
    const contacts: AggregatedContact[] = [];
    const allInteractions: (ManagementInteraction & { storeName: string; storeId: string })[] = [];

    stores.forEach((store) => {
      store.contatosGerencia.forEach((contact) => {
        const contactInteractions = store.interacoesGerencia.filter(
          (i) => i.contatoId === contact.id
        );
        contacts.push({
          contact,
          storeName: store.nome,
          storeId: store.id,
          interactions: contactInteractions,
        });
      });

      store.interacoesGerencia.forEach((interaction) => {
        allInteractions.push({
          ...interaction,
          storeName: store.nome,
          storeId: store.id,
        });
      });
    });

    return { contacts, allInteractions };
  }, [stores]);

  // Get all contacts for the interaction modal dropdown
  const allContactsForDropdown = useMemo(() => {
    return aggregatedData.contacts.map(({ contact, storeName }) => ({
      contact,
      storeName,
    }));
  }, [aggregatedData.contacts]);

  // Filter contacts
  const filteredContacts = useMemo(() => {
    return aggregatedData.contacts.filter((item) => {
      const matchesSearch =
        item.contact.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.contact.cargo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.storeName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStore = storeFilter === "all" || item.storeId === storeFilter;

      return matchesSearch && matchesStore;
    });
  }, [aggregatedData.contacts, searchTerm, storeFilter]);

  // Filter and sort interactions (most recent first)
  const filteredInteractions = useMemo(() => {
    return aggregatedData.allInteractions
      .filter((interaction) => {
        const matchesSearch =
          interaction.contatoNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
          interaction.resumo.toLowerCase().includes(searchTerm.toLowerCase()) ||
          interaction.storeName.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStore = storeFilter === "all" || interaction.storeId === storeFilter;

        return matchesSearch && matchesStore;
      })
      .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
  }, [aggregatedData.allInteractions, searchTerm, storeFilter]);

  // Get upcoming follow-ups
  const upcomingFollowUps = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return aggregatedData.allInteractions
      .filter((i) => i.proximaAcaoData && new Date(i.proximaAcaoData) >= today)
      .sort((a, b) => new Date(a.proximaAcaoData).getTime() - new Date(b.proximaAcaoData).getTime())
      .slice(0, 10);
  }, [aggregatedData.allInteractions]);

  // Get overdue follow-ups
  const overdueFollowUps = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return aggregatedData.allInteractions
      .filter((i) => i.proximaAcaoData && new Date(i.proximaAcaoData) < today)
      .sort((a, b) => new Date(a.proximaAcaoData).getTime() - new Date(b.proximaAcaoData).getTime());
  }, [aggregatedData.allInteractions]);

  const handleSaveInteraction = (interaction: ManagementInteraction) => {
    // Find which store the contact belongs to
    const contactData = aggregatedData.contacts.find(
      (c) => c.contact.id === interaction.contatoId
    );
    if (!contactData) return;

    const store = stores.find((s) => s.id === contactData.storeId);
    if (!store) return;

    const existingIndex = store.interacoesGerencia.findIndex(
      (i) => i.id === interaction.id
    );

    const updatedStore: Store = {
      ...store,
      interacoesGerencia:
        existingIndex >= 0
          ? store.interacoesGerencia.map((i) =>
              i.id === interaction.id ? interaction : i
            )
          : [...store.interacoesGerencia, interaction],
    };

    onSaveStore(updatedStore);
    setSelectedContactId(undefined);
  };

  const handleAddInteractionForContact = (contactId: string) => {
    setSelectedContactId(contactId);
    setIsInteractionModalOpen(true);
  };

  const getInteractionIcon = (tipo: string) => {
    switch (tipo) {
      case "Ligação":
        return <Phone className="w-4 h-4" />;
      case "Email":
        return <Mail className="w-4 h-4" />;
      case "WhatsApp":
        return <MessageSquare className="w-4 h-4" />;
      case "Reunião":
        return <Users className="w-4 h-4" />;
      default:
        return <MessageSquare className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  const isOverdue = (dateString: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(dateString) < today;
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Hub de Gerência
            </DialogTitle>
          </DialogHeader>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <Card>
              <CardContent className="p-3 text-center">
                <div className="text-2xl font-bold text-primary">
                  {aggregatedData.contacts.length}
                </div>
                <div className="text-xs text-muted-foreground">Contatos</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <div className="text-2xl font-bold text-primary">
                  {aggregatedData.allInteractions.length}
                </div>
                <div className="text-xs text-muted-foreground">Interações</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <div className="text-2xl font-bold text-blue-500">
                  {upcomingFollowUps.length}
                </div>
                <div className="text-xs text-muted-foreground">Próximas Ações</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <div className="text-2xl font-bold text-destructive">
                  {overdueFollowUps.length}
                </div>
                <div className="text-xs text-muted-foreground">Atrasadas</div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex gap-2 mb-4 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar contatos ou interações..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={storeFilter} onValueChange={setStoreFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrar por loja" />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                <SelectItem value="all">Todas as Lojas</SelectItem>
                {stores.map((store) => (
                  <SelectItem key={store.id} value={store.id}>
                    {store.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={() => setIsInteractionModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Nova Interação
            </Button>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="contacts" className="flex-1 overflow-hidden flex flex-col">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="contacts">Contatos</TabsTrigger>
              <TabsTrigger value="interactions">Interações</TabsTrigger>
              <TabsTrigger value="followups">Próximas Ações</TabsTrigger>
            </TabsList>

            {/* Contacts Tab */}
            <TabsContent value="contacts" className="flex-1 overflow-hidden">
              <ScrollArea className="h-[400px]">
                {filteredContacts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhum contato encontrado
                  </div>
                ) : (
                  <div className="space-y-3 pr-4">
                    {filteredContacts.map(({ contact, storeName, interactions }) => (
                      <Card key={contact.id}>
                        <CardHeader className="pb-2">
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-base">{contact.nome}</CardTitle>
                              <p className="text-sm text-muted-foreground">
                                {contact.cargo} • Nível {contact.nivel}
                              </p>
                              <Badge variant="outline" className="mt-1">
                                {storeName}
                              </Badge>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleAddInteractionForContact(contact.id)}
                            >
                              <Plus className="w-4 h-4 mr-1" />
                              Interação
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="flex gap-4 text-sm text-muted-foreground mb-2">
                            {contact.telefone && (
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {contact.telefone}
                              </span>
                            )}
                            {contact.email && (
                              <span className="flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {contact.email}
                              </span>
                            )}
                          </div>
                          <div className="text-sm">
                            <span className="text-muted-foreground">
                              {interactions.length} interações registradas
                            </span>
                            {interactions.length > 0 && (
                              <span className="text-muted-foreground">
                                {" "}
                                • Última: {formatDate(interactions[interactions.length - 1].data)}
                              </span>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>

            {/* Interactions Tab */}
            <TabsContent value="interactions" className="flex-1 overflow-hidden">
              <ScrollArea className="h-[400px]">
                {filteredInteractions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhuma interação encontrada
                  </div>
                ) : (
                  <div className="space-y-3 pr-4">
                    {filteredInteractions.map((interaction) => (
                      <Card key={interaction.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-primary/10 rounded-full">
                              {getInteractionIcon(interaction.tipo)}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium">{interaction.contatoNome}</span>
                                <Badge variant="secondary" className="text-xs">
                                  {interaction.tipo}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {interaction.storeName}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                {formatDate(interaction.data)}
                              </p>
                              <p className="text-sm">{interaction.resumo}</p>
                              {interaction.proximaAcao && (
                                <div className="mt-2 p-2 bg-muted rounded-md text-sm">
                                  <span className="font-medium">Próxima ação: </span>
                                  {interaction.proximaAcao}
                                  {interaction.proximaAcaoData && (
                                    <span
                                      className={`ml-2 ${
                                        isOverdue(interaction.proximaAcaoData)
                                          ? "text-destructive"
                                          : "text-muted-foreground"
                                      }`}
                                    >
                                      ({formatDate(interaction.proximaAcaoData)})
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>

            {/* Follow-ups Tab */}
            <TabsContent value="followups" className="flex-1 overflow-hidden">
              <ScrollArea className="h-[400px]">
                {overdueFollowUps.length === 0 && upcomingFollowUps.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhuma ação pendente
                  </div>
                ) : (
                  <div className="space-y-4 pr-4">
                    {/* Overdue */}
                    {overdueFollowUps.length > 0 && (
                      <div>
                        <h3 className="font-medium text-destructive flex items-center gap-2 mb-2">
                          <AlertCircle className="w-4 h-4" />
                          Atrasadas ({overdueFollowUps.length})
                        </h3>
                        <div className="space-y-2">
                          {overdueFollowUps.map((interaction) => (
                            <Card key={interaction.id} className="border-destructive/50">
                              <CardContent className="p-3">
                                <div className="flex items-center gap-2 mb-1">
                                  <Calendar className="w-4 h-4 text-destructive" />
                                  <span className="text-sm font-medium text-destructive">
                                    {formatDate(interaction.proximaAcaoData)}
                                  </span>
                                  <Badge variant="outline" className="text-xs">
                                    {interaction.storeName}
                                  </Badge>
                                </div>
                                <p className="text-sm font-medium">{interaction.proximaAcao}</p>
                                <p className="text-xs text-muted-foreground">
                                  Contato: {interaction.contatoNome}
                                </p>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Upcoming */}
                    {upcomingFollowUps.length > 0 && (
                      <div>
                        <h3 className="font-medium flex items-center gap-2 mb-2">
                          <Calendar className="w-4 h-4" />
                          Próximas ({upcomingFollowUps.length})
                        </h3>
                        <div className="space-y-2">
                          {upcomingFollowUps.map((interaction) => (
                            <Card key={interaction.id}>
                              <CardContent className="p-3">
                                <div className="flex items-center gap-2 mb-1">
                                  <Calendar className="w-4 h-4 text-primary" />
                                  <span className="text-sm font-medium">
                                    {formatDate(interaction.proximaAcaoData)}
                                  </span>
                                  <Badge variant="outline" className="text-xs">
                                    {interaction.storeName}
                                  </Badge>
                                </div>
                                <p className="text-sm font-medium">{interaction.proximaAcao}</p>
                                <p className="text-xs text-muted-foreground">
                                  Contato: {interaction.contatoNome}
                                </p>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <ManagementInteractionModal
        open={isInteractionModalOpen}
        onClose={() => {
          setIsInteractionModalOpen(false);
          setSelectedContactId(undefined);
        }}
        onSave={handleSaveInteraction}
        contacts={allContactsForDropdown}
        preselectedContactId={selectedContactId}
      />
    </>
  );
};
