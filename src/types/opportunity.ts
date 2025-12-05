import type { Store } from "./store";
import type { CRMType } from "./crmData";

export interface Contact {
  nome: string;
  cargo: string;
  email: string;
  telefone: string;
}

export interface Interaction {
  data: string;
  tipo: string;
  resumo: string;
}

export interface Opportunity {
  id: string;
  nomeEmpresa: string;
  status: "Lead" | "Qualificado" | "Proposta" | "Negociação" | "Fechado" | "Perdido";
  valorPotencial: number;
  primeiroContatoData: string;
  ultimoContatoData: string;
  proximoContatoData: string;
  contatoPrincipal: Contact;
  dataCriacao: string;
  notasGerais: string;
  historicoInteracoes: Interaction[];
}

export interface EncryptedData {
  fileName: string;
  createdDate: string;
  lastModified: string;
  crmType: CRMType;
  data: Opportunity[] | Store[];
}

// Helper to get item count from encrypted data
export function getEncryptedDataItemCount(data: EncryptedData): number {
  return Array.isArray(data.data) ? data.data.length : 0;
}

// Helper to determine CRM type from data (for backwards compatibility)
export function inferCRMType(data: EncryptedData): CRMType {
  if (data.crmType) return data.crmType;
  
  // Try to infer from data structure
  if (data.data && data.data.length > 0) {
    const firstItem = data.data[0];
    // Workforce stores have funcionarios array, opportunities have nomeEmpresa
    if ('funcionarios' in firstItem) return "workforce";
    if ('nomeEmpresa' in firstItem) return "sales";
  }
  
  // Default to sales for backwards compatibility
  return "sales";
}
