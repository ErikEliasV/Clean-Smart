export type ProfileStackParamList = {
  ProfileMain: undefined;
  ChangePassword: undefined;
  UserManagement: undefined;
};

export type SalasStackParamList = {
  SalasMain: undefined;
  SalaForm: { sala?: { id: string } };
  LimpezaProcesso: { salaId: string; salaNome?: string };
  RegistrosLimpeza: { salaId: string; salaNome?: string };
};