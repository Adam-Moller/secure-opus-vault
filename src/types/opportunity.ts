import type { Store } from "./store";

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
  crmType?: "sales" | "workforce"; // Optional for backwards compatibility
  data: Opportunity[] | Store[];
}
