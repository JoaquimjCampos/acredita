import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { 
  User, 
  LoginCredentials, 
  UserRegistrationData, 
  AuthResponse, 
  ApiResponse,
  Participant,
  Season,
  Episode,
  Vote,
  VoteData
} from '../types';

// Tipos para jogos e simuladores
export interface Game {
  id: number;
  title: string;
  description: string;
  type: string;
  image?: string;
  instructions?: string;
  assets?: any[];
  [key: string]: any;
}

export interface SimulatorResult {
  result: any;
}

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';

class ApiService {
  // --- Métodos para seasons ---
  async getCurrentSeason(): Promise<ApiResponse<Season>> {
    const response = await this.api.get('/seasons/current/');
    return response.data;
  }
  async getSeasons(): Promise<ApiResponse<Season[]>> {
    const response = await this.api.get('/api/seasons/');
    return response.data;
  }
  async getSeasonEpisodes(seasonId: number): Promise<ApiResponse<Episode[]>> {
    const response = await this.api.get(`/api/seasons/${seasonId}/episodes/`);
    return response.data;
  }

  // --- Métodos para quizzes ---
  async getQuizzesBySeason(seasonNumber: number): Promise<ApiResponse<any>> {
    const response = await this.api.get(`/api/games/quiz/quizzes/?season_number=${seasonNumber}`);
    return response.data;
  }
  async getQuizQuestions(quizId: number | string): Promise<any[]> {
    const response = await this.api.get(`/api/games/quiz/${quizId}/questions/`);
    return response.data.results || response.data;
  }
  async getQuizLeaderboard(quizId: number, seasonNumber: number): Promise<ApiResponse<any>> {
    const response = await this.api.get(`/api/games/quiz/quizzes/${quizId}/leaderboard/?season_number=${seasonNumber}`);
    return response.data;
  }

  // --- Métodos para doações ---
  async getDonationCampaigns(): Promise<ApiResponse<any>> {
    const response = await this.api.get('/api/donations/donations/');
    return response.data;
  }
  async makeDonation(data: { campaign: number; amount: number }): Promise<ApiResponse<any>> {
    const response = await this.api.post('/api/donations/donate/', data);
    return response.data;
  }

  // --- Métodos para participantes ---
  async getParticipant(id: number): Promise<ApiResponse<Participant>> {
    const response = await this.api.get(`/api/participants/${id}/`);
    return response.data;
  }
  async getProfile(): Promise<ApiResponse<User>> {
    const response = await this.api.get('/api/accounts/profile/');
    return response.data;
  }
  async register(userData: UserRegistrationData): Promise<ApiResponse<User>> {
    const response = await this.api.post('/api/accounts/register/', userData);
    return response.data;
  }
  async updateProfile(userData: Partial<User>): Promise<ApiResponse<User>> {
    const response = await this.api.patch('/api/accounts/profile/', userData);
    return response.data;
  }

  // --- Métodos para votação ---
  async vote(voteData: VoteData): Promise<ApiResponse<Vote>> {
    const response = await this.api.post('/api/voting/vote/', voteData);
    return response.data;
  }
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

    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('access_token');
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          const refreshToken = localStorage.getItem('refresh_token');
          if (refreshToken) {
            try {
              const response = await this.refreshToken(refreshToken);
              if (response.sucesso) {
                localStorage.setItem('access_token', response.dados.access);
                const originalRequest = error.config;
                originalRequest._retry = originalRequest._retry || false;
                if (!originalRequest._retry) {
                  originalRequest._retry = true;
                  originalRequest.headers.Authorization = `Bearer ${response.dados.access}`;
                  return this.api.request(originalRequest);
                }
              }
            } catch {
              this.logout();
              // Prevent infinite loop: do not retry after logout
              return Promise.reject(error);
            }
          } else {
            this.logout();
            // Prevent infinite loop: do not retry after logout
            return Promise.reject(error);
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // --- Métodos principais ---
  async getGames(): Promise<Game[]> {
    try {
      const response = await this.api.get('/api/games/');
      if (Array.isArray(response.data)) return response.data;
      if (response.data?.results) return response.data.results;
      if (response.data?.data?.results) return response.data.data.results;
      return [];
    } catch (error: any) {
      throw new Error(error?.response?.data?.detail || error.message || 'Erro ao buscar jogos');
    }
  }

  async runSimulator(simulatorId: number, inputData: any): Promise<SimulatorResult> {
    try {
      const response = await this.api.post(`/api/games/simulator/simulators/${simulatorId}/run/`, inputData);
      if (response.data?.result !== undefined) return { result: response.data.result };
      return { result: response.data };
    } catch (error: any) {
      throw new Error(error?.response?.data?.detail || error.message || 'Erro ao executar simulação');
    }
  }

  async getSimulatorAnalytics(simulatorId: number): Promise<any> {
    try {
      const response = await this.api.get(`/api/games/simulator/simulators/${simulatorId}/analytics/`);
      return response.data;
    } catch (error: any) {
      throw new Error(error?.response?.data?.detail || error.message || 'Erro ao buscar analytics');
    }
  }

  // --- Métodos utilitários e de autenticação ---
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const params = new URLSearchParams();
      params.append('username', credentials.username);
      params.append('password', credentials.password);
      // Use /api/auth/login/ for Django login
      const response: AxiosResponse<any> = await this.api.post('/api/auth/login/', params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      const access = response.data.access_token || response.data.access;
      const refresh = response.data.refresh_token || response.data.refresh;
      if (access) {
        localStorage.setItem('access_token', access);
        if (refresh) localStorage.setItem('refresh_token', refresh);
        let user = null;
        try {
          const profileResp: AxiosResponse<any> = await this.api.get('/api/accounts/profile/');
          user = profileResp.data?.dados || profileResp.data;
          localStorage.setItem('user', JSON.stringify(user));
        } catch {}
        return {
          access,
          refresh,
          user,
          sucesso: true,
          dados: { access, refresh, user },
          mensagem: 'Sessão iniciada com sucesso!'
        };
      }
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    try {
      const response: AxiosResponse<AuthResponse> = await this.api.post('/api/auth/refresh/', {
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

  isAuthenticated(): boolean {
    const token = localStorage.getItem('access_token');
    const user = localStorage.getItem('user');
    return !!(token && user);
  }

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

  private handleError(error: any): Error {
    if (error.response) {
      const message = error.response.data?.mensagem || 
                     error.response.data?.message || 
                     `Erro ${error.response.status}: ${error.response.statusText}`;
      return new Error(message);
    } else if (error.request) {
      return new Error('Erro de conectividade. Verifique a sua ligação à internet.');
    } else {
      return new Error(error.message || 'Ocorreu um erro inesperado.');
    }
  }

  // --- Métodos para doações, quizzes, participantes, seasons, etc. ---
  // Adicione aqui os métodos conforme necessidade, sem duplicidade.
}

export const apiService = new ApiService();
export default apiService;
