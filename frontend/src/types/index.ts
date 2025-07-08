// Tipos de utilizador
export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  telefone?: string;
  data_nascimento?: string;
  provincia?: string;
  municipio?: string;
  bairro?: string;
  foto_perfil?: string;
  is_verificado: boolean;
  termos_aceites: boolean;
  date_joined: string;
  last_login?: string;
}

// Dados de registo de utilizador
export interface UserRegistrationData {
  username: string;
  email: string;
  password: string;
  confirm_password: string;
  first_name: string;
  last_name: string;
  telefone?: string;
  data_nascimento?: string;
  provincia?: string;
  municipio?: string;
  bairro?: string;
  termos_aceites: boolean;
}

// Dados de login
export interface LoginCredentials {
  username: string;
  password: string;
}

// Resposta de autenticação
export interface AuthResponse {
  sucesso: boolean;
  mensagem: string;
  dados: {
    access: string;
    refresh: string;
    user: User;
  };
  mcp_message_id: string;
}

// Resposta de API genérica
export interface ApiResponse<T = any> {
  sucesso: boolean;
  mensagem: string;
  dados: T;
  mcp_message_id: string;
}

// Participante
// Participante simplificado para frontend
export interface ParticipantSimple {
  id: string;
  nome: string;
  idade: number;
  provincia: string;
  historia: string;
  foto_perfil?: string | null;
  total_votos: number;
  data_inscricao: string;
  status: 'ativo' | 'inativo' | 'eliminado';
  redes_sociais?: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
  };
}

export interface Participant {
  id: number;
  utilizador: User;
  nome_completo: string;
  idade: number;
  profissao: string;
  localizacao: string;
  biografia: string;
  video_apresentacao?: string;
  foto_perfil?: string;
  estado: 'pendente' | 'aprovado' | 'rejeitado' | 'eliminado';
  pontuacao_total: number;
  posicao_ranking: number;
  data_inscricao: string;
  temporada: number;
}

// Dados de inscrição de participante
export interface ParticipantRegistrationData {
  nome_completo: string;
  idade: number;
  profissao: string;
  localizacao: string;
  biografia: string;
  video_apresentacao?: File;
  foto_perfil?: File;
  temporada: number;
}

// Temporada
export interface Season {
  id: number;
  numero: number;
  titulo: string;
  descricao: string;
  data_inicio: string;
  data_fim?: string;
  ativa: boolean;
  inscricoes_abertas: boolean;
  total_participantes: number;
  total_episodios: number;
  data_criacao: string;
}

// Episódio
export interface Episode {
  id: number;
  temporada: number;
  numero: number;
  titulo: string;
  descricao: string;
  data_exibicao: string;
  link_video?: string;
  thumbnail?: string;
  duracao?: number;
  visualizacoes: number;
  publicado: boolean;
  data_criacao: string;
}

// Voto
export interface Vote {
  id: number;
  utilizador: number;
  participante: number;
  episodio?: number;
  comentario?: string;
  data_voto: string;
}

// Dados de votação
export interface VoteData {
  participante: number;
  episodio?: number;
  comentario?: string;
}

// Contexto de autenticação
export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  register: (data: UserRegistrationData) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<boolean>;
}

// Notificação/Toast
export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

// Provincias de Angola
export type Provincia = 
  | 'Bengo'
  | 'Benguela'
  | 'Bié'
  | 'Cabinda'
  | 'Cuando Cubango'
  | 'Cuanza Norte'
  | 'Cuanza Sul'
  | 'Cunene'
  | 'Huambo'
  | 'Huíla'
  | 'Luanda'
  | 'Lunda Norte'
  | 'Lunda Sul'
  | 'Malanje'
  | 'Moxico'
  | 'Namibe'
  | 'Uíge'
  | 'Zaire';

// Estado da aplicação
export interface AppState {
  user: User | null;
  participants: Participant[];
  seasons: Season[];
  episodes: Episode[];
  currentSeason: Season | null;
  isLoading: boolean;
  error: string | null;
}

// Props de componentes comuns
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface PageProps extends BaseComponentProps {
  title?: string;
}

export interface FormFieldProps extends BaseComponentProps {
  label: string;
  error?: string;
  required?: boolean;
}
