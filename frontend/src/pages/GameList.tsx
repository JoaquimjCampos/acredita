import React, { useEffect, useState } from "react";
import axios from "axios";
import { Layout } from "../components/layout/Layout";
import { Card, LoadingSpinner } from "../components/common";
import { Gamepad2, Filter, Search, Share2, MessageCircle } from "lucide-react";

// Game type matches backend response
export type Game = {
  id: number;
  type: string;
  title: string;
  description: string;
  difficulty?: string;
  category?: string;
  asset_url?: string;
  is_active: boolean;
};


// --- PLG Features State ---
const GameList: React.FC = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [filter, setFilter] = useState<{ category?: string; difficulty?: string }>({});
  const [search, setSearch] = useState("");
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState({ name: "", email: "", comments: "" });
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [shareMsg, setShareMsg] = useState("");

  useEffect(() => {
    axios.get("/api/games/").then((res) => setGames(res.data.results));
  }, []);

  // Filter and search logic
  const filteredGames = games.filter(
    (g) =>
      (!filter.category || g.category === filter.category) &&
      (!filter.difficulty || g.difficulty === filter.difficulty) &&
      (g.title.toLowerCase().includes(search.toLowerCase()) || g.description.toLowerCase().includes(search.toLowerCase()))
  );

  // Unique categories/difficulties for filter dropdowns
  const categories = Array.from(new Set(games.map((g) => g.category).filter(Boolean)));
  const difficulties = Array.from(new Set(games.map((g) => g.difficulty).filter(Boolean)));

  // --- Feedback submit handler ---
  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post("/api/feedback/", feedback);
      setFeedbackSent(true);
    } catch {
      setFeedbackSent(false);
    }
  };

  // --- Share handler ---
  const handleShare = async () => {
    const url = window.location.href;
    const text = "Check out these innovative games on Acredita!";
    if (navigator.share) {
      try {
        await navigator.share({ title: "Acredita Games", text, url });
        setShareMsg("Thanks for sharing!");
      } catch {
        setShareMsg("Share cancelled.");
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        setShareMsg("Link copied to clipboard!");
      } catch {
        setShareMsg("Could not copy link.");
      }
    }
    setTimeout(() => setShareMsg(""), 2000);
  };

  return (
    <Layout>
      <div className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center">
              <Gamepad2 className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">Explorar Jogos</h1>
              <p className="text-purple-100 mt-1">Filtro, pesquisa e partilha de jogos integrados com o backend.</p>
            </div>
            <button
              onClick={handleShare}
              className="ml-auto inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg"
            >
              <Share2 className="h-4 w-4" /> Partilhar
            </button>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 min-h-screen py-12">
        <div className="max-w-6xl mx-auto px-4 space-y-6">
          <Card className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Pesquisar jogos..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div className="flex gap-3 md:w-80">
                <div className="relative flex-1">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <select
                    onChange={(e) => setFilter((f) => ({ ...f, category: e.target.value || undefined }))}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 appearance-none"
                  >
                    <option value="">Todas as categorias</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="relative flex-1">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <select
                    onChange={(e) => setFilter((f) => ({ ...f, difficulty: e.target.value || undefined }))}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 appearance-none"
                  >
                    <option value="">Todas as dificuldades</option>
                    {difficulties.map((diff) => (
                      <option key={diff} value={diff}>{diff}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </Card>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowOnboarding(true)}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm border border-purple-200 text-purple-700 rounded-lg hover:bg-purple-50"
            >
              <MessageCircle className="h-4 w-4" /> Dicas rápidas
            </button>
            {shareMsg && <span className="text-sm text-green-700">{shareMsg}</span>}
          </div>

          {showOnboarding && (
            <Card className="p-6 border-l-4 border-purple-500">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Bem-vindo aos Jogos Acredita!</h3>
                  <ul className="mt-3 text-gray-700 space-y-2 text-sm list-disc list-inside">
                    <li>Filtre e pesquise jogos rapidamente</li>
                    <li>Jogue instantaneamente</li>
                    <li>Envie feedback para a equipa</li>
                    <li>Partilhe com amigos</li>
                  </ul>
                </div>
                <button onClick={() => setShowOnboarding(false)} className="text-sm text-gray-600 hover:text-gray-800">Fechar</button>
              </div>
            </Card>
          )}

          {showFeedback && (
            <Card className="p-6 border-l-4 border-purple-500">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-semibold text-gray-900">Envie o seu feedback</h3>
                <button onClick={() => { setShowFeedback(false); setFeedbackSent(false); }} className="text-sm text-gray-600 hover:text-gray-800">Fechar</button>
              </div>
              <form onSubmit={handleFeedbackSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" placeholder="Nome" value={feedback.name} onChange={e => setFeedback(f => ({ ...f, name: e.target.value }))} required className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500" />
                <input type="email" placeholder="Email" value={feedback.email} onChange={e => setFeedback(f => ({ ...f, email: e.target.value }))} required className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500" />
                <textarea placeholder="Comentários" value={feedback.comments} onChange={e => setFeedback(f => ({ ...f, comments: e.target.value }))} required className="md:col-span-2 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500" rows={3} />
                <div className="flex items-center gap-3 md:col-span-2">
                  <button type="submit" className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">Enviar</button>
                  <button type="button" onClick={() => { setShowFeedback(false); setFeedbackSent(false); }} className="px-4 py-2 border rounded-lg">Fechar</button>
                  {feedbackSent && <span className="text-green-700 text-sm">Obrigado pelo feedback!</span>}
                </div>
              </form>
            </Card>
          )}

          {!games.length ? (
            <div className="flex justify-center py-12"><LoadingSpinner text="Carregando jogos..." /></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGames.map((game) => (
                <Card key={game.id} className="p-6 border-l-4 border-purple-500 hover:shadow-md transition-shadow">
                  {game.asset_url && <img src={game.asset_url} alt={game.title} className="w-full h-40 object-cover rounded mb-4" />}
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">{game.title}</h2>
                      <p className="text-sm text-gray-600 capitalize">{game.type}</p>
                    </div>
                    <Gamepad2 className="h-5 w-5 text-purple-600" />
                  </div>
                  <p className="text-gray-700 text-sm mb-4 line-clamp-3">{game.description}</p>
                  <div className="flex flex-wrap gap-2 text-xs text-gray-600 mb-4">
                    {game.category && <span className="px-2 py-1 rounded-full bg-purple-50 text-purple-700">{game.category}</span>}
                    {game.difficulty && <span className="px-2 py-1 rounded-full bg-gray-100">{game.difficulty}</span>}
                  </div>
                  <button
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg"
                    onClick={() => window.location.href = `/games/${game.type}`}
                  >
                    Jogar agora
                  </button>
                </Card>
              ))}
              {filteredGames.length === 0 && (
                <Card className="p-8 text-center">
                  <Gamepad2 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-700">Nenhum jogo encontrado. Ajuste filtros ou pesquisa.</p>
                </Card>
              )}
            </div>
          )}

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFeedback(true)}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm border border-purple-200 text-purple-700 rounded-lg hover:bg-purple-50"
            >
              <MessageCircle className="h-4 w-4" /> Enviar Feedback
            </button>
            {shareMsg && <span className="text-sm text-green-700">{shareMsg}</span>}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default GameList;
