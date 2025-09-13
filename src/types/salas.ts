export interface Sala {
  id: number;
  qr_code_id: string;
  nome_numero: string;
  capacidade: number;
  validade_limpeza_horas: number;
  localizacao: string;
  descricao?: string;
  instrucoes?: string;
  status_limpeza: 'Limpa' | 'Suja' | 'Limpeza Pendente';
  ultima_limpeza_data_hora: string | null;
  ultima_limpeza_funcionario: string | null;
  ativa: boolean;
  responsaveis?: Array<{
    id: number;
    username: string;
  }>;
}

export interface CreateSalaData {
  nome_numero: string;
  capacidade: number;
  validade_limpeza_horas?: number;
  localizacao: string;
  descricao?: string;
  instrucoes?: string;
  responsaveis?: number[];
}

export interface UpdateSalaData {
  nome_numero?: string;
  capacidade?: number;
  validade_limpeza_horas?: number;
  localizacao?: string;
  descricao?: string;
  instrucoes?: string;
  responsaveis?: number[];
  status_limpeza?: 'Limpa' | 'Suja' | 'Limpeza Pendente';
}

export interface LimpezaRegistro {
  id: number;
  sala: number;
  sala_nome: string;
  data_hora_limpeza: string;
  funcionario_responsavel: {
    id: number;
    username: string;
  };
  observacoes?: string;
}

export interface MarcarLimpezaData {
  observacoes?: string;
}