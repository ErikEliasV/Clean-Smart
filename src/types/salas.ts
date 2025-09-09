export interface Sala {
  id: string;
  nome_numero: string;
  capacidade: number;
  localizacao: string;
  descricao?: string;
  status_limpeza: 'Limpa' | 'Suja';
  ultima_limpeza_data_hora: string | null;
  ultima_limpeza_funcionario: string | null;
}