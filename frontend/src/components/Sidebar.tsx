import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../utils/index.original';
import DonationSection from './DonationSection';
import SidebarAd from './SidebarAd';
import InviteFriendsWidget from './InviteFriendsWidget';
import SeasonCountdownWidget from './SeasonCountdownWidget';
import FeedbackWidget from './FeedbackWidget';
import { getSidebarItems, type NavigationItem } from '../config/navigationConfig';

const Sidebar: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  
  // Get sidebar items from config
  const sidebarItems = getSidebarItems(isAuthenticated);

  const isActive = (path: string) => location.pathname === path;

  return (
    <aside
      className="w-64 bg-white border-r border-gray-100 p-4 flex flex-col gap-6 sticky top-0 h-screen overflow-y-auto shadow-sm"
      aria-label="Navegação lateral"
    >
      {/* Logo/Branding */}
      <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
        <img src="/logo.svg" alt="Acredita em Ti" className="h-10 w-auto" />
        <span className="font-bold text-acredita-primary text-lg hidden sm:inline">Acredita</span>
      </div>

      {/* Primary Navigation */}
      <nav aria-label="Navegação principal" className="flex flex-col gap-1">
        {sidebarItems.map((item: NavigationItem) => (
          <SidebarNavLink key={item.id} item={item} active={isActive(item.path)} />
        ))}
      </nav>

      {/* CRITICAL WIDGETS ONLY */}
      <div className="flex flex-col gap-4 pt-4 border-t border-gray-100">
        {/* Time-sensitive: Season Countdown */}
        <SeasonCountdownWidget />

        {/* Engagement: Invite Friends */}
        {isAuthenticated && <InviteFriendsWidget />}

        {/* Product improvement */}
        <FeedbackWidget />
      </div>

      {/* Removed widgets (moved to other locations): */}
      {/* ❌ LiveLeaderboardWidget -> /ranking page */}
      {/* ❌ SuccessStoriesWidget -> HomePage hero */}
      {/* ❌ QuickPollWidget -> Dashboard */}
      {/* ❌ QuickActionsWidget -> Mobile menu CTA */}

      {/* Contribution */}
      <div className="mt-auto pt-4 border-t border-gray-100">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Contribuir</h3>
        <DonationSection />
      </div>

      {/* Sidebar Ad */}
      <SidebarAd />
    </aside>
  );
};

/**
 * Individual sidebar navigation link
 */
interface SidebarNavLinkProps {
  item: NavigationItem;
  active: boolean;
}

const SidebarNavLink: React.FC<SidebarNavLinkProps> = ({ item, active }) => {
  const Icon = item.icon;

  return (
    <Link
      to={item.path}
      title={item.title}
      className={cn(
        'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200',
        active
          ? 'bg-acredita-primary text-white shadow-md'
          : 'text-gray-700 hover:bg-gray-100 hover:text-acredita-primary'
      )}
    >
      <Icon className="h-5 w-5 flex-shrink-0" />
      <span className="flex-1">{item.label}</span>
    </Link>
  );
};

export default Sidebar;
