import { useState } from "react";
import { StoreCard } from "@/components/StoreCard";
import { StoreModal } from "@/components/StoreModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search } from "lucide-react";
import type { Store } from "@/types/store";

interface StoreManagementProps {
  stores: Store[];
  onSaveStore: (store: Store) => void;
  onDeleteStore: (id: string) => void;
  onAddVisit: (store: Store) => void;
}

export const StoreManagement = ({ 
  stores, 
  onSaveStore, 
  onDeleteStore,
  onAddVisit 
}: StoreManagementProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [regionFilter, setRegionFilter] = useState<string>("all");
  const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<Store | undefined>();

  // Get unique regions for filter
  const uniqueRegions = Array.from(new Set(stores.map(s => s.regiao))).sort();

  const filteredStores = stores.filter((store) => {
    const matchesSearch =
      store.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      store.gerenteNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      store.regiao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      store.endereco.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || store.status === statusFilter;
    const matchesRegion = regionFilter === "all" || store.regiao === regionFilter;

    return matchesSearch && matchesStatus && matchesRegion;
  });

  return (
    <>
      {/* Actions and Filters */}
      <div className="flex items-center gap-4 mb-6 flex-wrap">
        <Button 
          onClick={() => {
            setEditingStore(undefined);
            setIsStoreModalOpen(true);
          }} 
          className="shrink-0"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova Loja
        </Button>

        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por loja, gerente, região..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="bg-popover">
            <SelectItem value="all">Todos os Status</SelectItem>
            <SelectItem value="Operando">Operando</SelectItem>
            <SelectItem value="Reforma">Reforma</SelectItem>
            <SelectItem value="Fechada Temporariamente">Fechada Temporariamente</SelectItem>
            <SelectItem value="Fechada Definitivamente">Fechada Definitivamente</SelectItem>
          </SelectContent>
        </Select>

        <Select value={regionFilter} onValueChange={setRegionFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Região" />
          </SelectTrigger>
          <SelectContent className="bg-popover">
            <SelectItem value="all">Todas as Regiões</SelectItem>
            {uniqueRegions.map((region) => (
              <SelectItem key={region} value={region}>
                {region}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Content */}
      {stores.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">Nenhuma loja cadastrada ainda</p>
          <Button onClick={() => setIsStoreModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Criar Primeira Loja
          </Button>
        </div>
      ) : filteredStores.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Nenhuma loja encontrada</p>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Mostrando {filteredStores.length} de {stores.length} lojas
          </p>
          {filteredStores.map((store) => (
            <StoreCard
              key={store.id}
              store={store}
              onEdit={(s) => {
                setEditingStore(s);
                setIsStoreModalOpen(true);
              }}
              onDelete={onDeleteStore}
              onAddVisit={onAddVisit}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      <StoreModal
        open={isStoreModalOpen}
        onClose={() => {
          setIsStoreModalOpen(false);
          setEditingStore(undefined);
        }}
        onSave={onSaveStore}
        store={editingStore}
      />
    </>
  );
};
