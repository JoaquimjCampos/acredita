/**
 * Centralized Games API Service
 * Handles all game-related API calls with consistent error handling
 */

import {
  Quiz,
  Question,
  QuizSubmission,
  QuizResult,
  Association,
  AssociationSubmission,
  Crossword,
  CrosswordSubmission,
  Simulator,
  SimulatorSubmission,
  SimulatorResult,
  LeaderboardEntry,
  GamesApiResponse,
} from '../types/games';

class GamesService {
  private baseUrl = (process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000') + '/api/games';

  private getHeaders(): HeadersInit {
    const token = localStorage.getItem('access_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  // ============= QUIZ METHODS =============

  async getQuizzesBySeason(seasonNumber: number): Promise<Quiz[]> {
    try {
      const url = `${this.baseUrl}/quiz/quizzes/?season_number=${seasonNumber}`;
      console.log('[GamesService] Fetching quizzes from URL:', url);
      
      const response = await fetch(url, { headers: this.getHeaders() });
      
      console.log('[GamesService] Response status:', response.status, response.statusText);
      console.log('[GamesService] Response headers:', Array.from(response.headers.entries()));
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('[GamesService] HTTP Error:', response.status, errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const contentType = response.headers.get('content-type');
      console.log('[GamesService] Content-Type:', contentType);
      
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('[GamesService] Received non-JSON response:', text.substring(0, 200));
        throw new Error('API retornou HTML ao invés de JSON. Verifique se o servidor Django está rodando em http://127.0.0.1:8000');
      }
      
      const data: GamesApiResponse<Quiz> = await response.json();
      console.log('[GamesService] Quiz response:', data);
      return Array.isArray(data) ? data : data.results || [];
    } catch (error) {
      console.error('[GamesService] Error fetching quizzes:', error);
      throw error instanceof Error ? error : new Error('Erro ao carregar quizzes');
    }
  }

  async getQuiz(quizId: number): Promise<Quiz> {
    try {
      const response = await fetch(`${this.baseUrl}/quiz/quizzes/${quizId}/`, {
        headers: this.getHeaders(),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('[GamesService] HTTP Error:', response.status, errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('[GamesService] Error fetching quiz:', error);
      throw error instanceof Error ? error : new Error('Erro ao carregar quiz');
    }
  }

  async getQuizQuestions(quizId: number | string): Promise<Question[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/quiz/questions/?quiz=${quizId}`,
        { headers: this.getHeaders() }
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('[GamesService] HTTP Error:', response.status, errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data: GamesApiResponse<Question> = await response.json();
      return Array.isArray(data) ? data : data.results || [];
    } catch (error) {
      console.error('[GamesService] Error fetching questions:', error);
      throw error instanceof Error ? error : new Error('Erro ao carregar perguntas');
    }
  }

  async submitQuizAnswers(
    quizId: number,
    answers: QuizSubmission[]
  ): Promise<QuizResult> {
    try {
      const response = await fetch(
        `${this.baseUrl}/quiz/quizzes/${quizId}/submit-answers/`,
        {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify({ answers }),
        }
      );
      return await response.json();
    } catch (error) {
      console.error('[GamesService] Error submitting quiz:', error);
      throw new Error('Erro ao submeter respostas');
    }
  }

  async getQuizLeaderboard(
    quizId: number,
    seasonNumber?: number
  ): Promise<LeaderboardEntry[]> {
    try {
      const url = seasonNumber
        ? `${this.baseUrl}/quiz/quizzes/${quizId}/leaderboard/?season_number=${seasonNumber}`
        : `${this.baseUrl}/quiz/quizzes/${quizId}/leaderboard/`;
      const response = await fetch(url, { headers: this.getHeaders() });
      const data: GamesApiResponse<LeaderboardEntry> = await response.json();
      
      if (Array.isArray(data)) return data;
      if (data.leaderboard) return data.leaderboard;
      if (data.results) return data.results;
      return [];
    } catch (error) {
      console.error('[GamesService] Error fetching leaderboard:', error);
      return [];
    }
  }

  // ============= ASSOCIATION METHODS =============

  async getAssociations(): Promise<Association[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/association/associations/`,
        { headers: this.getHeaders() }
      );
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data: GamesApiResponse<Association> = await response.json();
      return Array.isArray(data) ? data : data.results || [];
    } catch (error) {
      console.error('[GamesService] Error fetching associations:', error);
      throw new Error('Erro ao carregar jogos de associação');
    }
  }

  async getAssociation(id: number): Promise<Association> {
    try {
      const response = await fetch(
        `${this.baseUrl}/association/associations/${id}/`,
        { headers: this.getHeaders() }
      );
      return await response.json();
    } catch (error) {
      console.error('[GamesService] Error fetching association:', error);
      throw new Error('Erro ao carregar jogo de associação');
    }
  }

  async submitAssociationAnswers(
    associationId: number,
    matches: Record<string, string>,
    timeTaken: number = 0
  ): Promise<QuizResult> {
    try {
      const response = await fetch(
        `${this.baseUrl}/association/associations/${associationId}/submit-answers/`,
        {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify({ matches, time_taken: timeTaken }),
        }
      );
      return await response.json();
    } catch (error) {
      console.error('[GamesService] Error submitting association:', error);
      throw new Error('Erro ao submeter respostas');
    }
  }

  async getAssociationLeaderboard(
    associationId: number
  ): Promise<LeaderboardEntry[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/association/associations/${associationId}/leaderboard/`,
        { headers: this.getHeaders() }
      );
      const data: GamesApiResponse<LeaderboardEntry> = await response.json();
      
      if (Array.isArray(data)) return data;
      if (data.leaderboard) return data.leaderboard;
      if (data.results) return data.results;
      return [];
    } catch (error) {
      console.error('[GamesService] Error fetching association leaderboard:', error);
      return [];
    }
  }

  // ============= CROSSWORDS METHODS =============

  async getCrosswords(): Promise<Crossword[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/crosswords/crosswords/`,
        { headers: this.getHeaders() }
      );
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data: GamesApiResponse<Crossword> = await response.json();
      return Array.isArray(data) ? data : data.results || [];
    } catch (error) {
      console.error('[GamesService] Error fetching crosswords:', error);
      throw new Error('Erro ao carregar palavras cruzadas');
    }
  }

  async getCrossword(id: number): Promise<Crossword> {
    try {
      const response = await fetch(
        `${this.baseUrl}/crosswords/crosswords/${id}/`,
        { headers: this.getHeaders() }
      );
      return await response.json();
    } catch (error) {
      console.error('[GamesService] Error fetching crossword:', error);
      throw new Error('Erro ao carregar palavra cruzada');
    }
  }

  async submitCrosswordAnswers(
    crosswordId: number,
    answers: Record<string, string>,
    timeTaken: number = 0
  ): Promise<QuizResult> {
    try {
      const response = await fetch(
        `${this.baseUrl}/crosswords/crosswords/${crosswordId}/submit-answers/`,
        {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify({ answers, time_taken: timeTaken }),
        }
      );
      return await response.json();
    } catch (error) {
      console.error('[GamesService] Error submitting crossword:', error);
      throw new Error('Erro ao submeter respostas');
    }
  }

  async getCrosswordLeaderboard(
    crosswordId: number
  ): Promise<LeaderboardEntry[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/crosswords/crosswords/${crosswordId}/leaderboard/`,
        { headers: this.getHeaders() }
      );
      const data: GamesApiResponse<LeaderboardEntry> = await response.json();
      
      if (Array.isArray(data)) return data;
      if (data.leaderboard) return data.leaderboard;
      if (data.results) return data.results;
      return [];
    } catch (error) {
      console.error('[GamesService] Error fetching crossword leaderboard:', error);
      return [];
    }
  }

  // ============= SIMULATOR METHODS =============

  async getSimulators(): Promise<Simulator[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/simulator/simulators/`,
        { headers: this.getHeaders() }
      );
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data: GamesApiResponse<Simulator> = await response.json();
      return Array.isArray(data) ? data : data.results || [];
    } catch (error) {
      console.error('[GamesService] Error fetching simulators:', error);
      throw new Error('Erro ao carregar simuladores');
    }
  }

  async getSimulator(id: number): Promise<Simulator> {
    try {
      const response = await fetch(
        `${this.baseUrl}/simulator/simulators/${id}/`,
        { headers: this.getHeaders() }
      );
      return await response.json();
    } catch (error) {
      console.error('[GamesService] Error fetching simulator:', error);
      throw new Error('Erro ao carregar simulador');
    }
  }

  async runSimulator(
    simulatorId: number,
    inputData: any
  ): Promise<SimulatorResult> {
    try {
      const response = await fetch(
        `${this.baseUrl}/simulator/simulators/${simulatorId}/run/`,
        {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify({ input_data: inputData }),
        }
      );
      return await response.json();
    } catch (error) {
      console.error('[GamesService] Error running simulator:', error);
      throw new Error('Erro ao executar simulador');
    }
  }
}

export const gamesService = new GamesService();
export default gamesService;
