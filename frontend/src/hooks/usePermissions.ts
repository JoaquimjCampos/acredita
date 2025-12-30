import { useAuth } from '../contexts/AuthContext';

export type Role = 'voter' | 'participant' | 'mentor' | 'admin';

export interface Permissions {
  isVoter: boolean;
  isParticipant: boolean;
  isMentor: boolean;
  isAdmin: boolean;
  canCreateKixikila: boolean;
  canSellMarketplace: boolean;
  canCreateCertificationCourse: boolean;
  canCreateBlogPost: boolean;
  canPublishContent: boolean;
  canManageUsers: boolean;
  canViewAnalytics: boolean;
  canModerateContent: boolean;
}

export const usePermissions = (): Permissions => {
  const { user } = useAuth();
  const userType: Role = (user?.user_type as Role) || 'voter';

  const isVoter = userType === 'voter';
  const isParticipant = userType === 'participant';
  const isMentor = userType === 'mentor';
  const isAdmin = userType === 'admin';

  return {
    isVoter,
    isParticipant,
    isMentor,
    isAdmin,
    canCreateKixikila: isParticipant || isAdmin,
    canSellMarketplace: isParticipant || isAdmin,
    canCreateCertificationCourse: isMentor || isAdmin,
    canCreateBlogPost: isMentor || isAdmin,
    canPublishContent: isMentor || isAdmin,
    canManageUsers: isAdmin,
    canViewAnalytics: isAdmin,
    canModerateContent: isMentor || isAdmin,
  };
};
