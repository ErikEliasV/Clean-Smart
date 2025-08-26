export interface Sala {
  id: number;
  nome_numero: string;
  capacidade: number;
  descricao: string;
  localizacao: string;
  status_limpeza: 'Limpa' | 'Limpeza Pendente';
  ultima_limpeza_data_hora: string | null; // ISO 8601 string in UTC
  ultima_limpeza_funcionario: string | null;
}

export interface CreateSalaData {
  nome_numero: string;
  capacidade: number;
  descricao: string;
  localizacao: string;
}

export interface UpdateSalaData {
  nome_numero?: string;
  capacidade?: number;
  descricao?: string;
  localizacao?: string;
}

export interface LimpezaRegistro {
  id: number;
  sala: number;
  sala_nome: string;
  data_hora_limpeza: string; // ISO 8601 string in UTC
  funcionario_responsavel: {
    id: number;
    username: string;
  };
  observacoes: string;
}

export interface MarcarLimpezaData {
  observacoes?: string;
}

