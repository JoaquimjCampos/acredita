// Base props for all UI components
export interface BaseComponentProps {
  children?: React.ReactNode;
  className?: string;
}
export interface User {
  id: string;
  nome: string;
  email: string;
  foto_perfil?: string;
  provincia?: string;
  idade?: number;
  first_name?: string;
  last_name?: string;
  user_type?: string;
  is_staff?: boolean;
}

export interface ParticipantSimple {
  id: string;
  nome: string;
  idade: number;
  provincia: string;
  historia: string;
  foto_perfil: string | null;
  total_votos: number;
  data_inscricao: string;
  status: string;
  redes_sociais: {
    instagram?: string;
    facebook?: string;
    tiktok?: string;
    twitter?: string;
  };
}

export interface RankingData extends ParticipantSimple {
  posicao: number;
  variacao_posicao: number;
  votos_semana: number;
  percentual_votos: number;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  register: (userData: UserRegistrationData) => Promise<boolean>;
  logout: () => void;
  updateProfile: (userData: Partial<User>) => Promise<boolean>;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface UserRegistrationData {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  user_type?: string;
  province?: string;
  city?: string;
  terms_accepted: boolean;
}



export interface AuthResponse {
  access: string;
  refresh: string;
  user: User;
  sucesso: boolean;
  dados: any;
  mensagem: string;
}



export interface ApiResponse<T> {
  results?: T[];
  count?: number;
  sucesso?: boolean;
  dados?: any;
  mensagem?: string;
  leaderboard?: any[];
  data?: any;
}

export interface Participant {
  id: string;
  nome: string;
  idade: number;
  provincia: string;
  historia: string;
  foto_perfil: string | null;
  total_votos: number;
  data_inscricao: string;
  status: string;
  posicao: number;
  variacao_posicao: number;
  votos_semana: number;
  percentual_votos: number;
  redes_sociais: {
    instagram?: string;
    facebook?: string;
    tiktok?: string;
    twitter?: string;
  };
}


export interface ParticipantRegistrationData {
  nome: string;
  idade: number;
  provincia: string;
  historia: string;
  email: string;
  password: string;
  video_apresentacao?: File;
  foto_perfil?: File;
}

export interface Season {
  id: string;
  nome: string;
  ano: number;
  status: string;
}

export interface Episode {
  id: string;
  titulo: string;
  data_exibicao: string;
  descricao: string;
}

export interface Vote {
  id: string;
  participante: string;
  usuario: string;
  data_voto: string;
}

export interface VoteData {
  participante: string;
}
