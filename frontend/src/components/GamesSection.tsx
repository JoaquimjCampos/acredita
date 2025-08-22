import React from 'react';
import { useGames } from '../hooks/useGames';
import { Card, LoadingSpinner } from '../components/common';

const GamesSection: React.FC = () => {
  const { games, loading, error } = useGames();
  const [search, setSearch] = React.useState('');
  const [type, setType] = React.useState('all');
  const [order, setOrder] = React.useState<'title'|'type'>('title');
  let filteredGames = games.filter(game =>
    (type === 'all' || game.type === type) &&
    game.title.toLowerCase().includes(search.toLowerCase())
  );
  filteredGames = [...filteredGames].sort((a, b) => {
    if (order === 'title') return a.title.localeCompare(b.title);
    if (order === 'type') return (a.type || '').localeCompare(b.type || '');
    return 0;
  });

  if (loading) {
    return <LoadingSpinner size="lg" text="A carregar jogos..." />;
  }

  if (error) {
    return <div className="text-red-600 font-semibold text-center" role="alert">{error}</div>;
  }

  if (!games.length) {
    return (
      <Card className="text-center py-12">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhum jogo disponível</h3>
        <p className="text-gray-600 mb-6">Não há jogos no momento.</p>
      </Card>
    );
  }

  return (
    <section className="py-8 bg-gray-50 animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <input
            type="text"
            placeholder="Pesquisar jogo..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="border rounded px-4 py-2 w-full md:w-1/4"
          />
          <select
            value={type}
            onChange={e => setType(e.target.value)}
            className="border rounded px-4 py-2 w-full md:w-1/4"
          >
            <option value="all">Todos os tipos</option>
            <option value="quiz">Quiz</option>
            <option value="simulador">Simulador</option>
            <option value="associacao">Associação</option>
            <option value="outro">Outro</option>
          </select>
          <select
            value={order}
            onChange={e => setOrder(e.target.value as 'title'|'type')}
            className="border rounded px-4 py-2 w-full md:w-1/4"
          >
            <option value="title">Ordenar por Título</option>
            <option value="type">Ordenar por Tipo</option>
          </select>
        </div>
        {/* Carrossel visual para destaque */}
        {filteredGames.length > 0 ? (
          <div className="overflow-x-auto pb-4">
            <div className="flex gap-8 min-w-full">
              {filteredGames.map(game => (
                <Card key={game.id} className="flex flex-col min-w-[320px] max-w-xs shadow-lg hover:scale-105 transition-transform duration-300 border-2 border-transparent focus-within:border-acredita-primary">
                  {game.image && (
                    <img src={game.image} alt={game.title} className="h-40 w-full object-cover rounded-t" />
                  )}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <h3 className="text-xl font-extrabold text-gray-900 mb-2">{game.title}</h3>
                    <p className="text-gray-700 mb-4 text-base">{game.description}</p>
                    <span className="text-xs text-acredita-primary font-semibold mb-2">Tipo: {game.type}</span>
                    <button
                      className="mt-4 w-full py-3 rounded-lg bg-acredita-primary text-white text-lg font-bold shadow-lg hover:bg-acredita-secondary focus:outline-none focus:ring-4 focus:ring-acredita-primary focus:ring-opacity-50 transition-all duration-200"
                      aria-label={`Jogar ${game.title}`}
                      tabIndex={0}
                      onClick={() => {
                        // Navegação para o jogo
                        if (game.type === 'quiz') {
                          window.location.href = `/quiz/${game.id}`;
                        } else if (game.type === 'simulador') {
                          window.location.href = `/simuladores`;
                        } else if (game.type === 'associacao') {
                          window.location.href = `/associacao`;
                        } else {
                          alert('Tipo de jogo não suportado: ' + game.type);
                        }
                      }}
                    >
                      Jogar
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <Card className="text-center py-12">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhum jogo encontrado</h3>
            <p className="text-gray-600 mb-6">Ajuste os filtros ou tente outra busca.</p>
          </Card>
        )}
      </div>
    </section>
  );
};

export default GamesSection;
