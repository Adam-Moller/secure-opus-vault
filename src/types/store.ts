// Tipos de funcionário
export type EmployeeType = "Gerente" | "Senior" | "Consultor";

// Template de badge (global)
export interface BadgeTemplate {
  id: string;
  nome: string;
  icone: string; // nome do ícone lucide (ex: "star", "award", "heart")
  cor: string; // hex color (ex: "#FFD700")
  descricao: string;
}

// Férias programadas
export interface ScheduledVacation {
  id: string;
  dataInicio: string;
  dataFim: string;
  status: "Programada" | "EmAndamento" | "Concluida" | "Cancelada";
  observacao?: string;
}

// Log de afastamentos/faltas
export interface AbsenceLog {
  id: string;
  data: string;
  tipo: "Falta" | "Afastamento" | "Atestado" | "Licenca";
  motivo: string;
  diasAfastamento?: number;
  dataRetorno?: string;
}

// Conquista/Desenvolvimento
export interface Achievement {
  id: string;
  data: string;
  tipo: "Promocao" | "Transferencia" | "Reconhecimento" | "Meta" | "Treinamento" | "Outro";
  titulo: string;
  descricao: string;
  lojaOrigemId?: string;
  lojaOrigemNome?: string;
  lojaDestinoId?: string;
  lojaDestinoNome?: string;
  cargoAnterior?: EmployeeType;
  cargoNovo?: EmployeeType;
}

// Badge atribuído ao funcionário
export interface EmployeeBadge {
  id: string;
  badgeTemplateId: string;
  dataConcessao: string;
}

// Observação com data
export interface Observation {
  id: string;
  data: string;
  texto: string;
}

export interface ActionItem {
  id: string;
  descricao: string;
  prazo: string;
  concluida: boolean;
}

// Employee expandido
export interface Employee {
  id: string;
  nome: string;
  tipo: EmployeeType;
  cargo: string; // Mantido para compatibilidade e cargo específico
  dataAdmissao: string;
  status: "Ativo" | "Afastado" | "Ferias" | "Desligado";
  telefone: string;
  email: string;
  
  // Relacionamento com loja
  lojaAtualId: string;
  historicoLojas: string[];
  
  // Novos campos
  feriasProgramadas: ScheduledVacation[];
  logAfastamentos: AbsenceLog[];
  conquistas: Achievement[];
  badges: EmployeeBadge[];
  observacoes: Observation[];
}

export interface HRLog {
  id: string;
  data: string;
  tipo: "Admissão" | "Demissão" | "Advertência" | "Promoção" | "Transferência" | "Férias" | "Afastamento" | "Retorno" | "Outro";
  funcionarioId: string;
  funcionarioNome: string;
  descricao: string;
  acoesPendentes: ActionItem[];
}

export interface VisitLog {
  id: string;
  data: string;
  horaInicio: string;
  horaFim: string;
  tipo: "Rotina" | "Auditoria" | "Emergência" | "Treinamento" | "Outro";
  avaliacoes: {
    limpeza: number; // 1-5
    organizacao: number; // 1-5
    atendimento: number; // 1-5
    estoque: number; // 1-5
  };
  observacoesPositivas: string;
  problemasIdentificados: string;
  pessoasPresentes: string[];
  acoesPendentes: ActionItem[];
}

export interface ManagementContact {
  id: string;
  nome: string;
  cargo: string;
  nivel: number; // 1 = chefe direto, 2 = chefe do chefe, etc.
  email: string;
  telefone: string;
}

export interface ManagementInteraction {
  id: string;
  data: string;
  tipo: "Reunião" | "Ligação" | "Email" | "WhatsApp" | "Outro";
  contatoId: string;
  contatoNome: string;
  resumo: string;
  proximaAcao: string;
  proximaAcaoData: string;
}

export interface Store {
  id: string;
  nome: string;
  endereco: string;
  regiao: string;
  status: "Operando" | "Reforma" | "Fechada Temporariamente" | "Fechada Definitivamente";
  gerenteNome: string;
  gerenteTelefone: string;
  gerenteEmail: string;
  metaVendasMensal: number;
  vendasRealizadas: number;
  dataCriacao: string;
  ultimaVisitaData: string;
  proximaVisitaData: string;
  funcionarios: Employee[]; // Mantido para compatibilidade durante migração
  logsRH: HRLog[];
  logsVisitas: VisitLog[];
  contatosGerencia: ManagementContact[];
  interacoesGerencia: ManagementInteraction[];
  notasGerais: string;
}

// Dados do CRM de Workforce (estrutura principal)
export interface WorkforceData {
  stores: Store[];
  employees: Employee[];
  badgeTemplates: BadgeTemplate[];
}
