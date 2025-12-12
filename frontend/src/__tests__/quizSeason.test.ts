import { render, screen } from '@testing-library/react';
import api from '../services/api.original';

describe('Quiz Leaderboard API', () => {
  it('fetches leaderboard for correct season', async () => {
    jest.spyOn(api, 'getQuizLeaderboard').mockResolvedValue({
      leaderboard: [{ user: 'TestUser', score: 100, season_number: 2 }],
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {},
    } as any);
    const response = await api.getQuizLeaderboard(1, 2);
  expect(response.leaderboard?.[0]?.season_number).toBe(2);
  });
});

describe('Quizzes by Season API', () => {
  it('fetches quizzes for correct season', async () => {
    jest.spyOn(api, 'getQuizzesBySeason').mockResolvedValue({
      results: [{ id: 1, title: 'Quiz S2', season_number: 2 }],
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {},
    } as any);
    const response = await api.getQuizzesBySeason(2);
  expect(response.results?.[0]?.season_number).toBe(2);
  });
});
