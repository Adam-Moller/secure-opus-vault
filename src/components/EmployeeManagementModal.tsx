import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { EmployeeCard } from "@/components/EmployeeCard";
import { EmployeeModal } from "@/components/EmployeeModal";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import type { Store, Employee, BadgeTemplate } from "@/types/store";

interface EmployeeManagementModalProps {
  open: boolean;
  onClose: () => void;
  store: Store | undefined;
  stores: Store[];
  onSaveStore: (store: Store) => void;
  badgeTemplates?: BadgeTemplate[];
}

export const EmployeeManagementModal = ({ 
  open, 
  onClose, 
  store,
  stores,
  onSaveStore,
  badgeTemplates = []
}: EmployeeManagementModalProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | undefined>();
  const [deleteEmployeeId, setDeleteEmployeeId] = useState<string | null>(null);

  if (!store) return null;

  const handleSaveEmployee = (employee: Employee) => {
    const existingIndex = store.funcionarios.findIndex(e => e.id === employee.id);
    const updatedEmployees = existingIndex >= 0
      ? store.funcionarios.map(e => e.id === employee.id ? employee : e)
      : [...store.funcionarios, employee];

    const updatedStore: Store = {
      ...store,
      funcionarios: updatedEmployees,
    };

    onSaveStore(updatedStore);
  };

  const handleDeleteEmployee = (id: string) => {
    const updatedStore: Store = {
      ...store,
      funcionarios: store.funcionarios.filter(e => e.id !== id),
    };

    onSaveStore(updatedStore);
    setDeleteEmployeeId(null);
  };

  const filteredEmployees = store.funcionarios.filter((employee) =>
    employee.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.cargo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Gerenciar Funcionários - {store.nome}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-center gap-4 flex-wrap">
              <Button 
                onClick={() => {
                  setEditingEmployee(undefined);
                  setIsEmployeeModalOpen(true);
                }} 
                className="shrink-0"
              >
                <Plus className="w-4 h-4 mr-2" />
                Novo Funcionário
              </Button>

              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome ou cargo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {store.funcionarios.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">Nenhum funcionário cadastrado ainda</p>
                <Button onClick={() => setIsEmployeeModalOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Primeiro Funcionário
                </Button>
              </div>
            ) : filteredEmployees.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Nenhum funcionário encontrado</p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Mostrando {filteredEmployees.length} de {store.funcionarios.length} funcionários
                </p>
                <div className="grid gap-4 md:grid-cols-2">
                  {filteredEmployees.map((employee) => (
                    <EmployeeCard
                      key={employee.id}
                      employee={employee}
                      onEdit={(e) => {
                        setEditingEmployee(e);
                        setIsEmployeeModalOpen(true);
                      }}
                      onDelete={(id) => setDeleteEmployeeId(id)}
                      badgeTemplates={badgeTemplates}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <EmployeeModal
        open={isEmployeeModalOpen}
        onClose={() => {
          setIsEmployeeModalOpen(false);
          setEditingEmployee(undefined);
        }}
        onSave={handleSaveEmployee}
        employee={editingEmployee}
        storeName={store.nome}
        storeId={store.id}
        stores={stores}
        badgeTemplates={badgeTemplates}
      />

      <AlertDialog open={deleteEmployeeId !== null} onOpenChange={(open) => !open && setDeleteEmployeeId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Funcionário</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este funcionário? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => deleteEmployeeId && handleDeleteEmployee(deleteEmployeeId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
