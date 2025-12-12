import React from 'react';
import DonationSection from './DonationSection';
import SidebarAd from './SidebarAd';
import InviteFriendsWidget from './InviteFriendsWidget';
import LiveLeaderboardWidget from './LiveLeaderboardWidget';
import SeasonCountdownWidget from './SeasonCountdownWidget';
import SuccessStoriesWidget from './SuccessStoriesWidget';
import QuickActionsWidget from './QuickActionsWidget';

import FeedbackWidget from './FeedbackWidget';
import QuickPollWidget from './QuickPollWidget';

const Sidebar: React.FC = () => {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      {/* Mobile Sidebar Toggle */}
      <button
        className="fixed bottom-8 left-4 z-50 bg-acredita-primary text-white px-4 py-2 rounded-full shadow-lg md:hidden"
        aria-label={open ? 'Fechar barra lateral' : 'Abrir barra lateral'}
        onClick={() => setOpen(o => !o)}
        tabIndex={0}
      >
        {open ? 'Fechar Menu' : 'Menu'}
      </button>
      {/* Mobile Sidebar Drawer */}
        <aside
          aria-label={open ? 'Fechar barra lateral' : 'Abrir barra lateral'}
          className={`w-full md:w-64 bg-white border-r border-gray-100 p-4 flex flex-col gap-8 transition-all duration-300 fixed md:static top-0 left-0 h-full z-40 ${open ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 shadow-2xl md:shadow-none animate-fade-in`}
          style={{ maxWidth: '320px' }}
        >
          <div className="flex items-center gap-3 mb-6">
            <img src="/logo.svg" alt="Acredita em Ti" className="h-10 w-auto animate-fade-in" />
            <span className="font-bold text-acredita-primary text-lg">Acredita em Ti</span>
          </div>
          <nav aria-label="Navegação rápida" className="mb-6">
            <ul className="flex flex-col gap-3">
            <li><a href="/" className={`flex items-center gap-2 font-semibold hover:underline sidebar-link`} aria-label="Início" title="Ir para a página inicial"><svg width="20" height="20" fill="none" stroke="currentColor" className="animate-bounce"><path d="M10 2L2 10h3v8h10v-8h3L10 2z"/></svg>Início</a></li>
            <li><a href="/temporadas" className={`flex items-center gap-2 font-semibold hover:underline sidebar-link`} aria-label="Temporadas" title="Ver temporadas"><svg width="20" height="20" fill="none" stroke="currentColor" className="animate-bounce"><circle cx="10" cy="10" r="8"/><path d="M10 4v6l4 2"/></svg>Temporadas</a></li>
            <li><a href="/participantes" className={`flex items-center gap-2 font-semibold hover:underline sidebar-link`} aria-label="Participantes" title="Ver participantes"><svg width="20" height="20" fill="none" stroke="currentColor" className="animate-bounce"><circle cx="7" cy="7" r="3"/><circle cx="13" cy="7" r="3"/><path d="M2 18c0-3 4-5 8-5s8 2 8 5"/></svg>Participantes</a></li>
            <li><a href="/ranking" className={`flex items-center gap-2 font-semibold hover:underline sidebar-link`} aria-label="Ranking" title="Ver ranking"><svg width="20" height="20" fill="none" stroke="currentColor" className="animate-bounce"><rect x="3" y="10" width="4" height="7"/><rect x="9" y="7" width="4" height="10"/><rect x="15" y="13" width="4" height="4"/></svg>Ranking</a></li>
            <li><a href="/voting" className={`flex items-center gap-2 font-semibold hover:underline sidebar-link`} aria-label="Votar" title="Votar agora"><svg width="20" height="20" fill="none" stroke="currentColor" className="animate-bounce"><path d="M5 12l5 5 5-5"/><path d="M12 17V3"/></svg>Votar</a></li>
            <li><a href="/faq" className={`flex items-center gap-2 font-semibold hover:underline sidebar-link`} aria-label="Ajuda e FAQ" title="Ajuda e FAQ"><svg width="20" height="20" fill="none" stroke="currentColor" className="animate-bounce"><circle cx="10" cy="10" r="8"/><text x="10" y="15" textAnchor="middle" fontSize="12" fill="currentColor">?</text></svg>Ajuda/FAQ</a></li>
          </ul>
        </nav>
        {/* Mobile Quick Actions Widget */}
        <div className="md:hidden mb-6">
          <QuickActionsWidget />
        </div>
        {/* Widgets Section */}
        <nav aria-label="Widgets de navegação" className="flex flex-col gap-6">
          <SeasonCountdownWidget />
          <InviteFriendsWidget />
          <LiveLeaderboardWidget />
          <SuccessStoriesWidget />
          <QuickPollWidget />
          <FeedbackWidget />
        </nav>
        {/* Contribution Section */}
        <div>
          <h2 className="text-lg font-bold text-acredita-primary mb-2">Contribua</h2>
          <DonationSection />
        </div>
        <SidebarAd />
      </aside>
    </>
  );
}

export default Sidebar;
