import React from 'react';
import { Card } from './common';
import { Badge, Star, Trophy, Zap, Award } from 'lucide-react';

interface AchievementBadge {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  unlocked: boolean;
  unlockedAt?: string;
  progress?: number;
  maxProgress?: number;
}

interface QuizAchievementsProps {
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  previousBadges?: AchievementBadge[];
}

const QuizAchievements: React.FC<QuizAchievementsProps> = ({
  score,
  totalQuestions,
  correctAnswers,
  previousBadges = [],
}) => {
  const percentage = (correctAnswers / totalQuestions) * 100;

  // Define badges that can be earned from quiz performance
  const possibleBadges: AchievementBadge[] = [
    {
      id: 'first-quiz',
      name: 'Iniciante',
      description: 'Complete seu primeiro quiz',
      icon: <Zap className="h-8 w-8" />,
      unlocked: true,
      progress: 1,
      maxProgress: 1,
    },
    {
      id: 'perfect-score',
      name: 'Maestro',
      description: 'Acerte todas as respostas',
      icon: <Trophy className="h-8 w-8" />,
      unlocked: percentage === 100,
      progress: percentage === 100 ? 1 : 0,
      maxProgress: 1,
    },
    {
      id: 'high-scorer',
      name: 'Excelente',
      description: 'Acerte 90% ou mais das respostas',
      icon: <Star className="h-8 w-8" />,
      unlocked: percentage >= 90,
      progress: Math.min(percentage / 90, 1),
      maxProgress: 1,
    },
    {
      id: 'good-effort',
      name: 'Competente',
      description: 'Acerte 70% ou mais das respostas',
      icon: <Award className="h-8 w-8" />,
      unlocked: percentage >= 70,
      progress: Math.min(percentage / 70, 1),
      maxProgress: 1,
    },
    {
      id: 'learner',
      name: 'Aprendiz',
      description: 'Acerte mais de 50% das respostas',
      icon: <Badge className="h-8 w-8" />,
      unlocked: percentage > 50,
      progress: Math.min(percentage / 50, 1),
      maxProgress: 1,
    },
  ];

  // Filter newly unlocked badges
  const newlyUnlocked = possibleBadges.filter(b => b.unlocked && !previousBadges.find(pb => pb.id === b.id));

  if (newlyUnlocked.length === 0) {
    return null;
  }

  return (
    <div className="mt-8 space-y-4">
      <Card className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 border-l-4 border-purple-500">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="h-6 w-6 text-purple-600" />
          <h3 className="text-lg font-bold text-gray-900">🎉 Novas Conquistas Desbloqueadas!</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {newlyUnlocked.map((badge) => (
            <div
              key={badge.id}
              className="flex items-start gap-3 p-3 bg-white rounded-lg border-2 border-purple-200"
            >
              <div className="flex-shrink-0 text-purple-600 mt-1">
                {badge.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900">{badge.name}</p>
                <p className="text-sm text-gray-600">{badge.description}</p>
              </div>
              <div className="flex-shrink-0">
                <div className="text-2xl">⭐</div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 p-3 bg-purple-100 rounded-lg">
          <p className="text-sm text-purple-900">
            <strong>+{newlyUnlocked.length * 25} XP</strong> por desbloquear novas conquistas!
          </p>
        </div>
      </Card>

      {/* Progress to next badge */}
      {newlyUnlocked.length < possibleBadges.length && (
        <Card className="p-4 bg-blue-50">
          <p className="text-sm text-blue-900">
            💪 <strong>Próximo objetivo:</strong> Acerte mais questões para desbloquear novas conquistas!
          </p>
        </Card>
      )}
    </div>
  );
};

export default QuizAchievements;
