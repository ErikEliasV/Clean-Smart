export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  Profile: undefined;
};

export type ProfileStackParamList = {
  ProfileMain: undefined;
  ChangePassword: undefined;
  UserManagement: undefined;
};

export type SalasStackParamList = {
  SalasMain: undefined;
  RegistrosLimpeza: {
    salaId?: number;
    salaNome?: string;
  };
};

export type TabParamList = {
  Salas: undefined;
  Home: undefined;
  Profile: undefined;
};
