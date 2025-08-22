import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { 
  User, 
  LoginCredentials, 
  UserRegistrationData, 
  AuthResponse, 
  ApiResponse,
  Participant,
  ParticipantRegistrationData,
  Season,
  Episode,
  Vote,
  VoteData
} from '../types';

// Configuração base do Axios
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8001';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      timeout: 10000,
    });

    // Interceptor para adicionar token de autenticação
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('access_token');
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Interceptor para tratar respostas
    this.api.interceptors.response.use(
      (response) => {
        return response;
      },
      async (error) => {
        if (error.response?.status === 401) {
          // Token expirado, tentar renovar
          const refreshToken = localStorage.getItem('refresh_token');
          if (refreshToken) {
            try {
              const response = await this.refreshToken(refreshToken);
              if (response.sucesso) {
                localStorage.setItem('access_token', response.dados.access);
                // Repetir a requisição original
                const originalRequest = error.config;
                originalRequest.headers.Authorization = `Bearer ${response.dados.access}`;
                return this.api.request(originalRequest);
              }
            } catch (refreshError) {
              // Falha ao renovar token, fazer logout
              this.logout();
            }
          } else {
            // Sem refresh token, fazer logout
            this.logout();
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // Métodos de autenticação
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      // FastAPI expects form data for JWT login
      const params = new URLSearchParams();
      params.append('username', credentials.username);
      params.append('password', credentials.password);
      const response: AxiosResponse<any> = await this.api.post('/token/', params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      // Accept both Django REST and FastAPI JWT response formats
      const access = response.data.access || response.data.access_token;
      const refresh = response.data.refresh || response.data.refresh_token;
      if (access) {
        localStorage.setItem('access_token', access);
        if (refresh) localStorage.setItem('refresh_token', refresh);
        // Fetch user profile from FastAPI endpoint (e.g., /me/ or /profile/)
        let user = null;
        try {
          const profileResp: AxiosResponse<any> = await this.api.get('/me/');
          user = profileResp.data?.dados || profileResp.data;
          localStorage.setItem('user', JSON.stringify(user));
        } catch {
          // fallback: no user info
        }
        // Ensure token is set before returning
        return {
          access,
          refresh,
          user,
          sucesso: true,
          dados: { access, refresh, user },
          mensagem: 'Sessão iniciada com sucesso!'
        };
      }
      // If login failed, clear any old tokens
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async register(userData: UserRegistrationData): Promise<ApiResponse<User>> {
    try {
      const response: AxiosResponse<ApiResponse<User>> = await this.api.post('/accounts/register/', userData);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    try {
      const response: AxiosResponse<AuthResponse> = await this.api.post('/accounts/token/refresh/', {
        refresh: refreshToken
      });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }

  // Métodos de utilizador
  async getProfile(): Promise<ApiResponse<User>> {
    try {
      const response: AxiosResponse<ApiResponse<User>> = await this.api.get('/accounts/profile/');
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async updateProfile(userData: Partial<User>): Promise<ApiResponse<User>> {
    try {
      const response: AxiosResponse<ApiResponse<User>> = await this.api.patch('/accounts/profile/', userData);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async getDashboard(): Promise<ApiResponse<any>> {
    try {
      const response: AxiosResponse<ApiResponse<any>> = await this.api.get('/accounts/dashboard/');
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  // Métodos de participantes
  async getParticipants(): Promise<ApiResponse<Participant[]>> {
    try {
      const response: AxiosResponse<ApiResponse<Participant[]>> = await this.api.get('/participants/');
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async getParticipant(id: number): Promise<ApiResponse<Participant>> {
    try {
      const response: AxiosResponse<ApiResponse<Participant>> = await this.api.get(`/participants/${id}/`);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async registerParticipant(data: ParticipantRegistrationData): Promise<ApiResponse<Participant>> {
    try {
      const formData = new FormData();
      
      // Adicionar campos de texto
      Object.entries(data).forEach(([key, value]) => {
        if (key !== 'video_apresentacao' && key !== 'foto_perfil' && value !== undefined) {
          formData.append(key, value.toString());
        }
      });

      // Adicionar arquivos
      if (data.video_apresentacao) {
        formData.append('video_apresentacao', data.video_apresentacao);
      }
      if (data.foto_perfil) {
        formData.append('foto_perfil', data.foto_perfil);
      }

      const response: AxiosResponse<ApiResponse<Participant>> = await this.api.post(
        '/participants/', 
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async getLeaderboard(): Promise<ApiResponse<Participant[]>> {
    try {
      const response: AxiosResponse<ApiResponse<Participant[]>> = await this.api.get('/participants/leaderboard/');
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  // Métodos de temporadas
  async getSeasons(): Promise<ApiResponse<Season[]>> {
    try {
      const response: AxiosResponse<ApiResponse<Season[]>> = await this.api.get('/seasons/');
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async getCurrentSeason(): Promise<ApiResponse<Season>> {
    try {
      const response: AxiosResponse<ApiResponse<Season>> = await this.api.get('/seasons/current/');
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async getSeasonEpisodes(seasonId: number): Promise<ApiResponse<Episode[]>> {
    try {
      const response: AxiosResponse<ApiResponse<Episode[]>> = await this.api.get(`/seasons/${seasonId}/episodes/`);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  // Métodos de votação
  async vote(voteData: VoteData): Promise<ApiResponse<Vote>> {
    try {
      const response: AxiosResponse<ApiResponse<Vote>> = await this.api.post('/voting/vote/', voteData);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async getVotes(): Promise<ApiResponse<Vote[]>> {
    try {
      const response: AxiosResponse<ApiResponse<Vote[]>> = await this.api.get('/voting/votes/');
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async getVotingResults(): Promise<ApiResponse<any>> {
    try {
      const response: AxiosResponse<ApiResponse<any>> = await this.api.get('/voting/results/');
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  // Método auxiliar para tratar erros
  private handleError(error: any): Error {
    if (error.response) {
      // Erro da API
      const message = error.response.data?.mensagem || 
                     error.response.data?.message || 
                     `Erro ${error.response.status}: ${error.response.statusText}`;
      return new Error(message);
    } else if (error.request) {
      // Erro de rede
      return new Error('Erro de conectividade. Verifique a sua ligação à internet.');
    } else {
      // Outro tipo de erro
      return new Error(error.message || 'Ocorreu um erro inesperado.');
    }
  }

  // Método para verificar se o utilizador está autenticado
  isAuthenticated(): boolean {
    const token = localStorage.getItem('access_token');
    const user = localStorage.getItem('user');
    return !!(token && user);
  }

  // Método para obter o utilizador actual do localStorage
  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (error) {
        console.error('Erro ao parsear dados do utilizador:', error);
        return null;
      }
    }
    return null;
  }
}

// Exportar instância única do serviço
export const apiService = new ApiService();
export default apiService;
