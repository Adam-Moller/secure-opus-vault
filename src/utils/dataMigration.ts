import type { Store, Employee, WorkforceData, BadgeTemplate } from "@/types/store";

/**
 * Migrates old employee data embedded in stores to the new independent structure.
 * Creates WorkforceData with:
 * - employees[] as independent entities with lojaAtualId reference
 * - stores[] with funcionarios[] kept for backward compatibility
 * - badgeTemplates[] initialized as empty
 */
export function migrateToWorkforceData(stores: Store[]): WorkforceData {
  const employees: Employee[] = [];
  
  // Extract all employees from stores and add new fields
  stores.forEach((store) => {
    if (store.funcionarios && store.funcionarios.length > 0) {
      store.funcionarios.forEach((emp) => {
        // Check if employee already migrated (has lojaAtualId)
        const migratedEmployee: Employee = {
          id: emp.id,
          nome: emp.nome,
          tipo: emp.tipo || inferEmployeeType(emp.cargo),
          cargo: emp.cargo,
          dataAdmissao: emp.dataAdmissao,
          status: migrateStatus(emp.status),
          telefone: emp.telefone,
          email: emp.email,
          lojaAtualId: emp.lojaAtualId || store.id,
          historicoLojas: emp.historicoLojas || [store.id],
          feriasProgramadas: emp.feriasProgramadas || [],
          logAfastamentos: emp.logAfastamentos || [],
          conquistas: emp.conquistas || [],
          badges: emp.badges || [],
          observacoes: emp.observacoes || [],
        };
        
        // Avoid duplicates if same employee appears in multiple stores
        const existingIndex = employees.findIndex(e => e.id === migratedEmployee.id);
        if (existingIndex === -1) {
          employees.push(migratedEmployee);
        }
      });
    }
  });
  
  return {
    stores,
    employees,
    badgeTemplates: [],
  };
}

/**
 * Infers employee type from cargo string
 */
function inferEmployeeType(cargo: string): Employee['tipo'] {
  const cargoLower = cargo.toLowerCase();
  if (cargoLower.includes('gerente') || cargoLower.includes('supervisor')) {
    return 'Gerente';
  }
  if (cargoLower.includes('senior') || cargoLower.includes('sênior') || cargoLower.includes('especialista')) {
    return 'Senior';
  }
  return 'Consultor';
}

/**
 * Migrates old status values to new format
 */
function migrateStatus(status: string): Employee['status'] {
  const statusMap: Record<string, Employee['status']> = {
    'Ativo': 'Ativo',
    'Afastado': 'Afastado',
    'Férias': 'Ferias',
    'Ferias': 'Ferias',
    'Desligado': 'Desligado',
  };
  return statusMap[status] || 'Ativo';
}

/**
 * Checks if data needs migration (old format = Store[], new format = WorkforceData)
 */
export function needsMigration(data: Store[] | WorkforceData): data is Store[] {
  return Array.isArray(data);
}

/**
 * Ensures data is in WorkforceData format, migrating if necessary
 */
export function ensureWorkforceData(data: Store[] | WorkforceData): WorkforceData {
  if (needsMigration(data)) {
    return migrateToWorkforceData(data);
  }
  return data;
}

/**
 * Syncs employee data back to store.funcionarios for backwards compatibility
 */
export function syncEmployeesToStores(workforceData: WorkforceData): WorkforceData {
  const updatedStores = workforceData.stores.map(store => {
    const storeEmployees = workforceData.employees.filter(
      emp => emp.lojaAtualId === store.id
    );
    return {
      ...store,
      funcionarios: storeEmployees,
    };
  });
  
  return {
    ...workforceData,
    stores: updatedStores,
  };
}
