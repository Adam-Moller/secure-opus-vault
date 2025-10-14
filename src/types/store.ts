export interface Employee {
  id: string;
  nome: string;
  cargo: string;
  dataAdmissao: string;
  status: "Ativo" | "Afastado" | "Desligado";
  telefone: string;
  email: string;
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

export interface ActionItem {
  id: string;
  descricao: string;
  prazo: string;
  concluida: boolean;
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
  funcionarios: Employee[];
  logsRH: HRLog[];
  logsVisitas: VisitLog[];
  contatosGerencia: ManagementContact[];
  interacoesGerencia: ManagementInteraction[];
  notasGerais: string;
}
