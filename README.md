# 🧹 CleanSmart

O ***CleanSmart*** é um aplicativo desenvolvido em ***React Native*** com ***Expo*** para auxiliar a equipe de ***zeladoria do Senac*** no gerenciamento de salas, tarefas e rotinas de limpeza.

## 🛠️ Tecnologias Utilizadas

- **React Native** - Framework para desenvolvimento mobile
- **Expo** - Plataforma para desenvolvimento React Native
- **TypeScript** - Linguagem de programação tipada
- **NativeWind** - Framework CSS para React Native
- **Tailwind CSS** - Framework de utilitários CSS
- **React Navigation** - Navegação entre telas
- **Zod** - Validação de schemas
- **AsyncStorage** - Armazenamento local
- **Expo Camera** - Funcionalidades de câmera
- **Expo Barcode Scanner** - Leitura de códigos QR

## 📥 Clonando o repositório

Para baixar o projeto, utilize o comando:

```bash
https://github.com/ErikEliasV/Clean-Smart.git
cd Zela-senac
```

## 🚀 Como Executar o Projeto

### Pré-requisitos

- Node.js (versão 18 ou superior)
- npm ou yarn
- Expo CLI
- Dispositivo móvel com Expo Go ou emulador

### Instalação

1. Clone o repositório:
```bash
git clone <url-do-repositorio>
cd zela-senac
```

2. Instale as dependências:
```bash
npm install
```

3. Inicie o projeto:
```bash
npm start
```

### Scripts Disponíveis

- `npm start` - Inicia o servidor de desenvolvimento
- `npm run dev` - Inicia com túnel para acesso externo
- `npm run build` - Verifica tipos e lint antes do build
- `npm run type-check` - Verifica tipos TypeScript
- `npm run lint-check` - Verifica dependências



## 📁 Estrutura do Projeto

```
zela-senac/
├── 📁 assets/                          # Recursos estáticos
│   ├── adaptive-icon.png               # Ícone adaptativo para Android
│   ├── favicon.png                     # Favicon para web
│   ├── icon.png                        # Ícone principal do app
│   ├── splash-icon.png                 # Ícone da tela de splash
│   └── 📁 images/                      # Imagens do projeto
│       ├── logo_invert.png             # Logo invertido
│       ├── logo_name.png               # Logo com nome
│       └── logo.png                    # Logo principal
│
├── 📁 src/                             # Código fonte principal
│   ├── 📁 components/                  # Componentes reutilizáveis
│   │   ├── ActionSelectionModal.tsx    # Modal de seleção de ações
│   │   ├── CustomAlert.tsx             # Componente de alerta customizado
│   │   ├── MarcarSujaModal.tsx         # Modal para marcar sala como suja
│   │   ├── ProfileImagePicker.tsx      # Seletor de imagem de perfil
│   │   ├── SalaCard.tsx                # Card de exibição de sala
│   │   ├── SalaForm.tsx                # Formulário de sala
│   │   ├── SalaLimpaModal.tsx          # Modal para marcar sala como limpa
│   │   └── Sidebar.tsx                 # Barra lateral de navegação
│   │
│   ├── 📁 constants/                   # Constantes do projeto
│   │   └── colors.ts                   # Definições de cores
│   │
│   ├── 📁 contexts/                    # Contextos React (Estado global)
│   │   ├── AuthContext.tsx             # Contexto de autenticação
│   │   ├── BottomTabsContext.tsx       # Contexto das abas inferiores
│   │   ├── GroupsContext.tsx           # Contexto de grupos
│   │   ├── LimpezaContext.tsx          # Contexto de limpeza
│   │   ├── NotificationsContext.tsx    # Contexto de notificações
│   │   ├── QRCodeContext.tsx           # Contexto de códigos QR
│   │   └── SalasContext.tsx            # Contexto de salas
│   │
│   ├── 📁 hooks/                       # Hooks customizados
│   │   ├── useCustomAlert.ts           # Hook para alertas customizados
│   │   ├── useFormValidation.ts        # Hook para validação de formulários
│   │   ├── useResponsive.ts            # Hook para responsividade
│   │   └── useTokenError.ts            # Hook para tratamento de erros de token
│   │
│   ├── 📁 navigation/                  # Configuração de navegação
│   │   └── AppNavigator.tsx            # Navegador principal da aplicação
│   │
│   ├── 📁 schemas/                     # Schemas de validação
│   │   └── index.ts                    # Schemas Zod para validação
│   │
│   ├── 📁 screens/                     # Telas da aplicação
│   │   ├── ChangePasswordScreen.tsx    # Tela de alteração de senha
│   │   ├── InformationScreen.tsx       # Tela de informações
│   │   ├── LimpezaProcessoScreen.tsx   # Tela do processo de limpeza
│   │   ├── LoginScreen.tsx             # Tela de login
│   │   ├── NotificationsScreen.tsx     # Tela de notificações
│   │   ├── ProfileScreen.tsx           # Tela de perfil do usuário
│   │   ├── RegistrosLimpezaScreen.tsx  # Tela de registros de limpeza
│   │   ├── SalasScreen.tsx             # Tela de gerenciamento de salas
│   │   ├── SettingsScreen.tsx          # Tela de configurações
│   │   └── UserManagementScreen.tsx    # Tela de gerenciamento de usuários
│   │
│   ├── 📁 types/                       # Definições de tipos TypeScript
│   │   └── navigation.ts               # Tipos para navegação
│
├── 📄 App.tsx                          # Componente raiz da aplicação
├── 📄 app.json                         # Configuração do Expo
├── 📄 babel.config.js                  # Configuração do Babel
├── 📄 global.css                       # Estilos globais
├── 📄 index.ts                         # Ponto de entrada da aplicação
├── 📄 metro.config.js                  # Configuração do Metro bundler
├── 📄 nativewind-env.d.ts              # Definições de tipos do NativeWind
├── 📄 package.json                     # Dependências e scripts do projeto
├── 📄 tailwind.config.js               # Configuração do Tailwind CSS
└── 📄 tsconfig.json                    # Configuração do TypeScript
```   

## 🛜 Repsitorio da API

   ```bash
   https://github.com/thalsime/uc8_zeladoria
   ```

## 🛠️ Tecnologias utilizadas

- **React Native** - Framework para desenvolvimento mobile
- **Expo** - Plataforma para desenvolvimento React Native
- **TypeScript** - Linguagem de programação tipada
- **NativeWind** - Framework CSS para React Native
- **Tailwind CSS** - Framework de utilitários CSS
- **React Navigation** - Navegação entre telas
- **Zod** - Validação de schemas
- **AsyncStorage** - Armazenamento local
- **Expo Camera** - Funcionalidades de câmera
- **Expo Barcode Scanner** - Leitura de códigos QRx
