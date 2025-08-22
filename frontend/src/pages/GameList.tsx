import React, { useEffect, useState } from "react";
import axios from "axios";
import './GameList.css';

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
    <div className="game-list-container">
      {/* Onboarding Modal */}
      {showOnboarding && (
        <div className="plg-modal-overlay">
          <div className="plg-modal">
            <h2>Welcome to Acredita Games!</h2>
            <p>Discover, play, and share feedback. Filter games, try instantly, and help us grow with your ideas!</p>
            <ul>
              <li>🔍 Filter & search games</li>
              <li>🚀 Play instantly</li>
              <li>💬 Share feedback</li>
              <li>📤 Share with friends</li>
            </ul>
            <button className="plg-modal-close" onClick={() => setShowOnboarding(false)}>Get Started</button>
          </div>
        </div>
      )}

      {/* Feedback Widget */}
      <button className="plg-feedback-btn" onClick={() => setShowFeedback(true)} title="Send Feedback">💬</button>
      {showFeedback && (
        <div className="plg-modal-overlay">
          <div className="plg-modal">
            <h2>Send us your feedback!</h2>
            <form onSubmit={handleFeedbackSubmit} className="plg-feedback-form">
              <input type="text" placeholder="Name" value={feedback.name} onChange={e => setFeedback(f => ({ ...f, name: e.target.value }))} required />
              <input type="email" placeholder="Email" value={feedback.email} onChange={e => setFeedback(f => ({ ...f, email: e.target.value }))} required />
              <textarea placeholder="Your comments..." value={feedback.comments} onChange={e => setFeedback(f => ({ ...f, comments: e.target.value }))} required />
              <button type="submit">Submit</button>
              <button type="button" onClick={() => { setShowFeedback(false); setFeedbackSent(false); }}>Close</button>
            </form>
            {feedbackSent && <div className="plg-feedback-success">Thank you for your feedback!</div>}
          </div>
        </div>
      )}

      {/* Share Widget */}
      <button className="plg-share-btn" onClick={handleShare} title="Share Games">📤</button>
      {shareMsg && <div className="plg-share-msg">{shareMsg}</div>}

      <header className="game-list-header">
        <h1>🎮 Explore & Play</h1>
        <p>Discover innovative games. Filter, search, and play instantly. Powered by PLG (Product-Led Growth) principles.</p>
      </header>
      <div className="game-list-controls">
        <input
          type="text"
          placeholder="Search games..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="game-search-input"
        />
        <select onChange={(e) => setFilter((f) => ({ ...f, category: e.target.value || undefined }))} className="game-filter-select">
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <select onChange={(e) => setFilter((f) => ({ ...f, difficulty: e.target.value || undefined }))} className="game-filter-select">
          <option value="">All Difficulties</option>
          {difficulties.map((diff) => (
            <option key={diff} value={diff}>{diff}</option>
          ))}
        </select>
      </div>
      <div className="game-list-grid">
        {filteredGames.map((game) => (
          <div key={game.id} className="game-card">
            {game.asset_url && <img src={game.asset_url} alt={game.title} className="game-card-image" />}
            <div className="game-card-content">
              <h2 className="game-card-title">{game.title}</h2>
              <p className="game-card-description">{game.description}</p>
              <div className="game-card-badges">
                {game.type && <span className="badge badge-type">{game.type}</span>}
                {game.category && <span className="badge badge-category">{game.category}</span>}
                {game.difficulty && <span className="badge badge-difficulty">{game.difficulty}</span>}
              </div>
              <button className="game-card-play" onClick={() => window.location.href = `/games/${game.type}`}>Play Now</button>
            </div>
          </div>
        ))}
        {filteredGames.length === 0 && <div className="game-list-empty">No games found. Try adjusting your filters or search.</div>}
      </div>
      <footer className="game-list-footer">
        <small>🚀 Product-Led Growth: Try games instantly, share feedback, and help us improve!</small>
      </footer>
    </div>
  );
};

export default GameList;
