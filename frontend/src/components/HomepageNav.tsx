import React, { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Gamepad2, Users, Trophy, Vote, Calendar, Home, Lock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { usePermissions } from '../hooks/usePermissions';

type RoleKey = 'voter' | 'participant' | 'mentor' | 'admin';

interface NavItem {
  key: string;
  path: string;
  label: string;
  icon: React.ElementType;
  // relevance rank per role (lower = higher priority)
  relevance: Record<RoleKey, number>;
  // lock when user not allowed; show PLG unlock affordance
  requiresAuth?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  {
    key: 'voting',
    path: '/voting',
    label: 'Votar',
    icon: Vote,
    relevance: { voter: 1, participant: 2, mentor: 3, admin: 4 },
  },
  {
    key: 'participants',
    path: '/participantes',
    label: 'Participantes',
    icon: Users,
    relevance: { voter: 2, participant: 3, mentor: 4, admin: 5 },
  },
  {
    key: 'seasons',
    path: '/temporadas',
    label: 'Temporadas',
    icon: Calendar,
    relevance: { voter: 3, participant: 4, mentor: 5, admin: 6 },
  },
  {
    key: 'ranking',
    path: '/ranking',
    label: 'Ranking',
    icon: Trophy,
    relevance: { voter: 4, participant: 5, mentor: 6, admin: 7 },
  },
  {
    key: 'games',
    path: '/games',
    label: 'Jogos',
    icon: Gamepad2,
    relevance: { voter: 5, participant: 6, mentor: 3, admin: 3 },
  },
  {
    key: 'dashboard',
    path: '/dashboard',
    label: 'Dashboard',
    icon: Home,
    relevance: { voter: 6, participant: 1, mentor: 1, admin: 1 },
    requiresAuth: true,
  },
];

const HomepageNav: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const perms = usePermissions();

  const role: RoleKey = useMemo(() => {
    if (perms.isAdmin) return 'admin';
    if (perms.isMentor) return 'mentor';
    if (perms.isParticipant) return 'participant';
    return 'voter';
  }, [perms]);

  const sortedItems = useMemo(
    () => [...NAV_ITEMS].sort((a, b) => a.relevance[role] - b.relevance[role]),
    [role]
  );

  return (
    <nav aria-label="Navegação principal" className="my-12 animate-fade-in">
      <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {sortedItems.map((item) => {
          const Icon = item.icon;
          const locked = !!item.requiresAuth && !isAuthenticated;

          const content = (
            <div
              className={`group relative flex flex-col items-center p-4 rounded-lg bg-white shadow transition-colors focus:outline-none focus:ring-2 focus:ring-acredita-primary ${
                locked ? 'opacity-80' : 'hover:bg-acredita-primary hover:text-white'
              }`}
              aria-label={item.label}
            >
              <Icon className="h-8 w-8 mb-2 group-hover:animate-bounce" aria-hidden="true" />
              <span className="font-semibold">{item.label}</span>
              {locked && (
                <span className="absolute -top-2 -right-2 flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 border border-yellow-300">
                  <Lock className="h-3 w-3" /> Desbloquear
                </span>
              )}
            </div>
          );

          return (
            <li key={item.key}>
              {locked ? (
                <button
                  type="button"
                  className="w-full"
                  onClick={() => navigate('/registo')}
                >
                  {content}
                </button>
              ) : (
                <Link to={item.path} className="w-full">
                  {content}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default HomepageNav;
