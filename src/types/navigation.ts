export type ProfileStackParamList = {
  ProfileMain: undefined;
  Notifications: undefined;
  ChangePassword: undefined;
  UserManagement: undefined;
};

export type SettingsStackParamList = {
  SettingsMain: undefined;
  ChangePassword: undefined;
  UserManagement: undefined;
};

export type SalasStackParamList = {
  SalasMain: undefined;
  SalaForm: { sala?: { id: string } };
  LimpezaProcesso: { salaId: string; salaNome?: string; qrCodeScanned?: boolean };
  RegistrosLimpeza: { salaId: number; salaNome?: string };
};
