export interface Sala {
  id: number;
  qr_code_id: string;
  nome_numero: string;
  imagem?: string;
  capacidade: number;
  validade_limpeza_horas: number;
  localizacao: string;
  descricao?: string;
  instrucoes?: string;
  status_limpeza: 'Limpa' | 'Suja' | 'Limpeza Pendente' | 'Em Limpeza';
  ultima_limpeza_data_hora: string | null;
  ultima_limpeza_funcionario: string | null;
  ativa: boolean;
  responsaveis?: string[];
}

export interface CreateSalaData {
  nome_numero: string;
  capacidade: number;
  validade_limpeza_horas?: number;
  localizacao: string;
  descricao?: string;
  instrucoes?: string;
  responsaveis?: string[];
  imagem?: any; // Para upload de arquivo
}

export interface UpdateSalaData {
  nome_numero?: string;
  capacidade?: number;
  validade_limpeza_horas?: number;
  localizacao?: string;
  descricao?: string;
  instrucoes?: string;
  responsaveis?: string[];
  status_limpeza?: 'Limpa' | 'Suja' | 'Limpeza Pendente' | 'Em Limpeza';
  imagem?: any; // Para upload de arquivo
}

export interface LimpezaRegistro {
  id: number;
  sala: number;
  sala_nome: string;
  data_hora_limpeza: string;
  data_hora_inicio?: string;
  funcionario_responsavel: {
    id: number;
    username: string;
  };
  observacoes?: string;
  fotos?: FotoLimpeza[];
}

export interface MarcarLimpezaData {
  observacoes?: string;
}

export interface IniciarLimpezaResponse {
  id: number;
  sala: number;
  sala_nome: string;
  data_hora_inicio: string;
  funcionario_responsavel: {
    id: number;
    username: string;
  };
  data_hora_limpeza?: string;
  observacoes?: string;
}

export interface ConcluirLimpezaData {
  observacoes?: string;
}

export interface MarcarSujaData {
  motivo?: string;
  observacoes?: string;
}

export interface FotoLimpeza {
  id: number;
  imagem: string;
  data_hora_upload: string;
  funcionario_responsavel: {
    id: number;
    username: string;
  };
}