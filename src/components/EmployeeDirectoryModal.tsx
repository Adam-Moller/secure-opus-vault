import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, User, Store, Phone, Mail, Briefcase } from "lucide-react";
import type { Store as StoreType, Employee } from "@/types/store";
import { format } from "date-fns";

interface EmployeeDirectoryModalProps {
  open: boolean;
  onClose: () => void;
  stores: StoreType[];
}

interface EmployeeWithStore extends Employee {
  storeName: string;
  storeId: string;
}

export const EmployeeDirectoryModal = ({
  open,
  onClose,
  stores,
}: EmployeeDirectoryModalProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [storeFilter, setStoreFilter] = useState<string>("all");
  const [positionFilter, setPositionFilter] = useState<string>("all");

  // Flatten all employees with store info
  const allEmployees = useMemo<EmployeeWithStore[]>(() => {
    return stores.flatMap((store) =>
      store.funcionarios.map((emp) => ({
        ...emp,
        storeName: store.nome,
        storeId: store.id,
      }))
    );
  }, [stores]);

  // Get unique positions for filter
  const uniquePositions = useMemo(() => {
    const positions = new Set(allEmployees.map((e) => e.cargo));
    return Array.from(positions).sort();
  }, [allEmployees]);

  // Filtered employees
  const filteredEmployees = useMemo(() => {
    return allEmployees.filter((emp) => {
      const matchesSearch =
        emp.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.cargo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.telefone.includes(searchTerm) ||
        emp.storeName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === "all" || emp.status === statusFilter;
      const matchesStore = storeFilter === "all" || emp.storeId === storeFilter;
      const matchesPosition = positionFilter === "all" || emp.cargo === positionFilter;

      return matchesSearch && matchesStatus && matchesStore && matchesPosition;
    });
  }, [allEmployees, searchTerm, statusFilter, storeFilter, positionFilter]);

  const getStatusColor = (status: Employee["status"]) => {
    switch (status) {
      case "Ativo":
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
      case "Afastado":
        return "bg-amber-500/20 text-amber-400 border-amber-500/30";
      case "Desligado":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy");
    } catch {
      return dateString;
    }
  };

  // Stats
  const stats = useMemo(() => {
    const active = allEmployees.filter((e) => e.status === "Ativo").length;
    const away = allEmployees.filter((e) => e.status === "Afastado").length;
    const terminated = allEmployees.filter((e) => e.status === "Desligado").length;
    return { total: allEmployees.length, active, away, terminated };
  }, [allEmployees]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Diretório de Funcionários
          </DialogTitle>
        </DialogHeader>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-muted-foreground text-xs">Total</div>
          </div>
          <div className="bg-emerald-500/10 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-emerald-400">{stats.active}</div>
            <div className="text-muted-foreground text-xs">Ativos</div>
          </div>
          <div className="bg-amber-500/10 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-amber-400">{stats.away}</div>
            <div className="text-muted-foreground text-xs">Afastados</div>
          </div>
          <div className="bg-red-500/10 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-red-400">{stats.terminated}</div>
            <div className="text-muted-foreground text-xs">Desligados</div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, cargo, email, telefone, loja..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                <SelectItem value="all">Todos Status</SelectItem>
                <SelectItem value="Ativo">Ativo</SelectItem>
                <SelectItem value="Afastado">Afastado</SelectItem>
                <SelectItem value="Desligado">Desligado</SelectItem>
              </SelectContent>
            </Select>

            <Select value={storeFilter} onValueChange={setStoreFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Loja" />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                <SelectItem value="all">Todas Lojas</SelectItem>
                {stores.map((store) => (
                  <SelectItem key={store.id} value={store.id}>
                    {store.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={positionFilter} onValueChange={setPositionFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Cargo" />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                <SelectItem value="all">Todos Cargos</SelectItem>
                {uniquePositions.map((position) => (
                  <SelectItem key={position} value={position}>
                    {position}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results count */}
        <p className="text-sm text-muted-foreground">
          Mostrando {filteredEmployees.length} de {allEmployees.length} funcionários
        </p>

        {/* Employee List */}
        <ScrollArea className="flex-1 -mx-6 px-6">
          {filteredEmployees.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {allEmployees.length === 0
                ? "Nenhum funcionário cadastrado nas lojas"
                : "Nenhum funcionário encontrado com os filtros aplicados"}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredEmployees.map((emp) => (
                <div
                  key={`${emp.storeId}-${emp.id}`}
                  className="bg-card border border-border rounded-lg p-4 hover:bg-accent/30 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-medium truncate">{emp.nome}</h4>
                        <Badge variant="outline" className={getStatusColor(emp.status)}>
                          {emp.status}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1">
                          <Briefcase className="w-3 h-3" />
                          {emp.cargo}
                        </span>
                        <span className="flex items-center gap-1">
                          <Store className="w-3 h-3" />
                          {emp.storeName}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 mt-2 text-sm flex-wrap">
                        {emp.telefone && (
                          <a
                            href={`tel:${emp.telefone}`}
                            className="flex items-center gap-1 text-primary hover:underline"
                          >
                            <Phone className="w-3 h-3" />
                            {emp.telefone}
                          </a>
                        )}
                        {emp.email && (
                          <a
                            href={`mailto:${emp.email}`}
                            className="flex items-center gap-1 text-primary hover:underline truncate"
                          >
                            <Mail className="w-3 h-3" />
                            {emp.email}
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="text-xs text-muted-foreground text-right shrink-0">
                      <div>Admissão</div>
                      <div className="font-medium">{formatDate(emp.dataAdmissao)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
