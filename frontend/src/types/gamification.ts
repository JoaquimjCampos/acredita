export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'quiz' | 'streak' | 'achievement' | 'mastery';
  earnedAt?: string;
  progress?: number;
  maxProgress?: number;
}

export interface UserAchievement {
  id: number;
  userId: number;
  badgeId: string;
  earnedAt: string;
  questsCompleted: number;
  xpEarned: number;
}

export interface GamificationProfile {
  userId: number;
  totalXP: number;
  level: number;
  badges: Badge[];
  streak: number;
  totalQuizzesCompleted: number;
  averageScore: number;
  lastQuizDate?: string;
}
