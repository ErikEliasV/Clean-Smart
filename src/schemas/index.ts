import { z } from 'zod';


export const UserSchema = z.object({
  id: z.number(),
  username: z.string().min(1, 'Nome de usuário é obrigatório'),
  email: z.string().email('Email deve ter um formato válido'),
  is_superuser: z.boolean(),
  groups: z.array(z.number()),
  profile: z.object({
    profile_picture: z.string().nullable(),
  }),
});

export const CreateUserDataSchema = z.object({
  username: z.string().min(3, 'Nome de usuário deve ter pelo menos 3 caracteres'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  confirm_password: z.string(),
  email: z.string().email('Email deve ter um formato válido').optional(),
  is_superuser: z.boolean().optional(),
  groups: z.array(z.number()).optional(),
}).refine((data) => data.password === data.confirm_password, {
  message: 'Senhas não coincidem',
  path: ['confirm_password'],
});

export const ChangePasswordDataSchema = z.object({
  old_password: z.string().min(1, 'Senha atual é obrigatória'),
  new_password: z.string().min(6, 'Nova senha deve ter pelo menos 6 caracteres'),
  confirm_new_password: z.string(),
}).refine((data) => data.new_password === data.confirm_new_password, {
  message: 'Novas senhas não coincidem',
  path: ['confirm_new_password'],
});

export const GroupSchema = z.object({
  id: z.number(),
  name: z.string(),
});

export const ProfileDataSchema = z.object({
  profile_picture: z.string().nullable(),
});

export const DetalhesSujaSchema = z.object({
  data_hora: z.string(),
  reportado_por: z.string(),
  observacoes: z.string(),
});

export const SalaSchema = z.object({
  id: z.number(),
  qr_code_id: z.string(),
  nome_numero: z.string().min(1, 'Nome/número da sala é obrigatório'),
  imagem: z.string().optional(),
  capacidade: z.number().min(1, 'Capacidade deve ser maior que 0'),
  validade_limpeza_horas: z.number().min(1, 'Validade da limpeza deve ser maior que 0'),
  localizacao: z.string().min(1, 'Localização é obrigatória'),
  descricao: z.string().optional(),
  instrucoes: z.string().optional(),
  status_limpeza: z.enum(['Limpa', 'Suja', 'Limpeza Pendente', 'Em Limpeza']),
  ultima_limpeza_data_hora: z.string().nullable(),
  ultima_limpeza_funcionario: z.string().nullable(),
  ativa: z.boolean(),
  responsaveis: z.array(z.string()).optional(),
  detalhes_suja: DetalhesSujaSchema.optional(),
});

export const CreateSalaDataSchema = z.object({
  nome_numero: z.string().min(1, 'Nome/número da sala é obrigatório'),
  capacidade: z.number().min(1, 'Capacidade deve ser maior que 0'),
  validade_limpeza_horas: z.number().min(1, 'Validade da limpeza deve ser maior que 0').optional(),
  localizacao: z.string().min(1, 'Localização é obrigatória'),
  descricao: z.string().optional(),
  instrucoes: z.string().optional(),
  responsaveis: z.array(z.string()).optional(),
  imagem: z.any().optional(),
});

export const UpdateSalaDataSchema = z.object({
  nome_numero: z.string().min(1, 'Nome/número da sala é obrigatório').optional(),
  capacidade: z.number().min(1, 'Capacidade deve ser maior que 0').optional(),
  validade_limpeza_horas: z.number().min(1, 'Validade da limpeza deve ser maior que 0').optional(),
  localizacao: z.string().min(1, 'Localização é obrigatória').optional(),
  descricao: z.string().optional(),
  instrucoes: z.string().optional(),
  responsaveis: z.array(z.string()).optional(),
  status_limpeza: z.enum(['Limpa', 'Suja', 'Limpeza Pendente', 'Em Limpeza']).optional(),
  imagem: z.any().optional(),
  ativa: z.boolean().optional(),
});

export const LimpezaRegistroSchema = z.object({
  id: z.number(),
  sala: z.number(),
  sala_nome: z.string(),
  data_hora_limpeza: z.string(),
  data_hora_inicio: z.string().optional(),
  funcionario_responsavel: z.object({
    id: z.number(),
    username: z.string(),
  }),
  observacoes: z.string().optional(),
  fotos: z.array(z.object({
    id: z.number(),
    imagem: z.string(),
    data_hora_upload: z.string(),
    funcionario_responsavel: z.object({
      id: z.number(),
      username: z.string(),
    }),
  })).optional(),
});

export const MarcarLimpezaDataSchema = z.object({
  observacoes: z.string().optional(),
});

export const IniciarLimpezaResponseSchema = z.object({
  id: z.number(),
  sala: z.number(),
  sala_nome: z.string(),
  data_hora_inicio: z.string(),
  funcionario_responsavel: z.object({
    id: z.number(),
    username: z.string(),
  }),
  data_hora_limpeza: z.string().optional(),
  observacoes: z.string().optional(),
});

export const ConcluirLimpezaDataSchema = z.object({
  observacoes: z.string().optional(),
});

export const MarcarSujaDataSchema = z.object({
  motivo: z.string().optional(),
  observacoes: z.string().optional(),
});

export const FotoLimpezaSchema = z.object({
  id: z.number(),
  imagem: z.string(),
  data_hora_upload: z.string(),
  funcionario_responsavel: z.object({
    id: z.number(),
    username: z.string(),
  }),
});

export const LoginDataSchema = z.object({
  username: z.string().min(1, 'Nome de usuário é obrigatório'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

export type User = z.infer<typeof UserSchema>;
export type CreateUserData = z.infer<typeof CreateUserDataSchema>;
export type ChangePasswordData = z.infer<typeof ChangePasswordDataSchema>;
export type Group = z.infer<typeof GroupSchema>;
export type ProfileData = z.infer<typeof ProfileDataSchema>;
export type DetalhesSuja = z.infer<typeof DetalhesSujaSchema>;
export type Sala = z.infer<typeof SalaSchema>;
export type CreateSalaData = z.infer<typeof CreateSalaDataSchema>;
export type UpdateSalaData = z.infer<typeof UpdateSalaDataSchema>;
export type LimpezaRegistro = z.infer<typeof LimpezaRegistroSchema>;
export type MarcarLimpezaData = z.infer<typeof MarcarLimpezaDataSchema>;
export type IniciarLimpezaResponse = z.infer<typeof IniciarLimpezaResponseSchema>;
export type ConcluirLimpezaData = z.infer<typeof ConcluirLimpezaDataSchema>;
export type MarcarSujaData = z.infer<typeof MarcarSujaDataSchema>;
export type FotoLimpeza = z.infer<typeof FotoLimpezaSchema>;
export type LoginData = z.infer<typeof LoginDataSchema>;

export const validateData = <T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; errors: string[] } => {
  try {
    const validatedData = schema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.issues.map((err: any) => err.message),
      };
    }
    return {
      success: false,
      errors: ['Erro de validação desconhecido'],
    };
  }
};

export const validateDataSafe = <T>(schema: z.ZodSchema<T>, data: unknown) => {
  return schema.safeParse(data);
};
