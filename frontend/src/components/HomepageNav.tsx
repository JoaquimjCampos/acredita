import React from 'react';
import { Link } from 'react-router-dom';
import { Gamepad2, Users, Trophy, Vote, Calendar, User, Home } from 'lucide-react';

const HomepageNav: React.FC = () => (
  <nav aria-label="Navegação principal" className="my-12 animate-fade-in">
    <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      <li>
        <Link to="/dashboard" className="group flex flex-col items-center p-4 rounded-lg bg-white shadow hover:bg-acredita-primary hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-acredita-primary" aria-label="Dashboard">
          <Home className="h-8 w-8 mb-2 group-hover:animate-bounce" aria-hidden="true" />
          <span className="font-semibold">Dashboard</span>
        </Link>
      </li>
      <li>
        <Link to="/games" className="group flex flex-col items-center p-4 rounded-lg bg-white shadow hover:bg-acredita-primary hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-acredita-primary" aria-label="Jogos">
          <Gamepad2 className="h-8 w-8 mb-2 group-hover:animate-bounce" aria-hidden="true" />
          <span className="font-semibold">Jogos</span>
        </Link>
      </li>
      <li>
        <Link to="/participantes" className="group flex flex-col items-center p-4 rounded-lg bg-white shadow hover:bg-acredita-primary hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-acredita-primary" aria-label="Participantes">
          <Users className="h-8 w-8 mb-2 group-hover:animate-bounce" aria-hidden="true" />
          <span className="font-semibold">Participantes</span>
        </Link>
      </li>
      <li>
        <Link to="/ranking" className="group flex flex-col items-center p-4 rounded-lg bg-white shadow hover:bg-acredita-primary hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-acredita-primary" aria-label="Ranking">
          <Trophy className="h-8 w-8 mb-2 group-hover:animate-bounce" aria-hidden="true" />
          <span className="font-semibold">Ranking</span>
        </Link>
      </li>
      <li>
        <Link to="/voting" className="group flex flex-col items-center p-4 rounded-lg bg-white shadow hover:bg-acredita-primary hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-acredita-primary" aria-label="Votar">
          <Vote className="h-8 w-8 mb-2 group-hover:animate-bounce" aria-hidden="true" />
          <span className="font-semibold">Votar</span>
        </Link>
      </li>
      <li>
        <Link to="/temporadas" className="group flex flex-col items-center p-4 rounded-lg bg-white shadow hover:bg-acredita-primary hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-acredita-primary" aria-label="Temporadas">
          <Calendar className="h-8 w-8 mb-2 group-hover:animate-bounce" aria-hidden="true" />
          <span className="font-semibold">Temporadas</span>
        </Link>
      </li>
    </ul>
  </nav>
);

export default HomepageNav;
