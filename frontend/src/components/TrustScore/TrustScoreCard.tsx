/**
 * TrustScoreCard Component
 * Displays user's trust score with progress visualization and recommendations
 */

import React from 'react';
import { useTrustScore } from '../../hooks/useTrustScore';
import './TrustScoreCard.css';
import { EmailVerificationDialog } from './EmailVerificationDialog';
import { PhoneVerificationDialog } from './PhoneVerificationDialog';

export const TrustScoreCard: React.FC = () => {
  const { trustScore, loading, error, verifyEmail, verifyPhone } = useTrustScore();
  const [showEmailDialog, setShowEmailDialog] = React.useState(false);
  const [showPhoneDialog, setShowPhoneDialog] = React.useState(false);

  if (loading) {
    return (
      <div className="trust-score-card loading">
        <div className="spinner"></div>
        <p>Carregando Trust Score...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="trust-score-card error">
        <p>❌ {error}</p>
      </div>
    );
  }

  if (!trustScore) {
    return null;
  }

  const scorePercentage = trustScore.total_score;
  const getScoreColor = (score: number): string => {
    if (score >= 70) return '#10b981'; // green
    if (score >= 40) return '#f59e0b'; // yellow
    return '#ef4444'; // red
  };

  const handleVerifyEmail = () => {
    setShowEmailDialog(true);
  };

  const handleVerifyPhone = () => {
    setShowPhoneDialog(true);
  };

  return (
    <div className="trust-score-card">
      {showEmailDialog && (
        <EmailVerificationDialog open={showEmailDialog} onClose={() => setShowEmailDialog(false)} />
      )}
      {showPhoneDialog && (
        <PhoneVerificationDialog open={showPhoneDialog} onClose={() => setShowPhoneDialog(false)} />
      )}
      {/* Header with Score */}
      <div className="trust-score-header">
        <h3>🛡️ Trust Score</h3>
        <div className="score-display">
          <span className="score-value" style={{ color: getScoreColor(scorePercentage) }}>
            {scorePercentage.toFixed(1)}
          </span>
          <span className="score-max">/100</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="progress-bar-container">
        <div 
          className="progress-bar-fill" 
          style={{ 
            width: `${scorePercentage}%`,
            backgroundColor: getScoreColor(scorePercentage)
          }}
        />
      </div>

      {/* Permissions Status */}
      <div className="permissions-section">
        <h4>Recursos Desbloqueados</h4>
        <div className="permissions-grid">
          <div className={`permission-item ${trustScore.can_create_marketplace ? 'unlocked' : 'locked'}`}>
            <span className="icon">{trustScore.can_create_marketplace ? '✓' : '🔒'}</span>
            <span className="label">Marketplace</span>
            {!trustScore.can_create_marketplace && (
              <span className="requirement">15pts</span>
            )}
          </div>
          <div className={`permission-item ${trustScore.can_create_kixikila ? 'unlocked' : 'locked'}`}>
            <span className="icon">{trustScore.can_create_kixikila ? '✓' : '🔒'}</span>
            <span className="label">Kixikila</span>
            {!trustScore.can_create_kixikila && (
              <span className="requirement">20pts</span>
            )}
          </div>
          <div className={`permission-item ${trustScore.can_publish_blog ? 'unlocked' : 'locked'}`}>
            <span className="icon">{trustScore.can_publish_blog ? '✓' : '⚠️'}</span>
            <span className="label">Blog Auto-Publicação</span>
            {!trustScore.can_publish_blog && (
              <span className="requirement">25pts</span>
            )}
          </div>
        </div>
      </div>

      {/* Score Breakdown */}
      <div className="breakdown-section">
        <h4>Composição do Score</h4>
        
        <div className="breakdown-item">
          <div className="breakdown-header">
            <span>🔐 Verificações</span>
            <span className="points">
              {trustScore.verification_breakdown.points}/{trustScore.verification_breakdown.max_points}
            </span>
          </div>
          <div className="verification-checks">
            <label className={trustScore.verification_breakdown.email_verified ? 'verified' : 'unverified'}>
              {trustScore.verification_breakdown.email_verified ? '✓' : '○'} Email
              {!trustScore.verification_breakdown.email_verified && (
                <button onClick={handleVerifyEmail} className="verify-btn">Verificar</button>
              )}
            </label>
            <label className={trustScore.verification_breakdown.phone_verified ? 'verified' : 'unverified'}>
              {trustScore.verification_breakdown.phone_verified ? '✓' : '○'} Telefone
              {!trustScore.verification_breakdown.phone_verified && (
                <button onClick={handleVerifyPhone} className="verify-btn">Verificar</button>
              )}
            </label>
            <label className={trustScore.verification_breakdown.profile_complete ? 'verified' : 'unverified'}>
              {trustScore.verification_breakdown.profile_complete ? '✓' : '○'} Perfil Completo
            </label>
          </div>
        </div>

        <div className="breakdown-item">
          <div className="breakdown-header">
            <span>💬 Engajamento</span>
            <span className="points">
              {trustScore.engagement_breakdown.points.toFixed(1)}/{trustScore.engagement_breakdown.max_points}
            </span>
          </div>
          <div className="engagement-stats">
            <span>Votos: {trustScore.engagement_breakdown.votes_cast}</span>
            <span>Conteúdo: {trustScore.engagement_breakdown.content_published}</span>
            <span>Feedback: {trustScore.engagement_breakdown.positive_feedback_received}</span>
          </div>
        </div>

        <div className="breakdown-item">
          <div className="breakdown-header">
            <span>⭐ Criador</span>
            <span className="points">
              {trustScore.creator_breakdown.points.toFixed(1)}/{trustScore.creator_breakdown.max_points}
            </span>
          </div>
          <div className="creator-stats">
            <span>Vendas: {trustScore.creator_breakdown.sales_completed}</span>
            <span>Avaliação: {trustScore.creator_breakdown.average_rating.toFixed(1)}★</span>
            <span>Disputas: {trustScore.creator_breakdown.dispute_count}</span>
          </div>
        </div>

        <div className="breakdown-item">
          <div className="breakdown-header">
            <span>📅 Conta</span>
            <span className="points">
              {trustScore.account_status.points.toFixed(1)}/{trustScore.account_status.max_points}
            </span>
          </div>
          <div className="account-stats">
            <span>Idade: {trustScore.account_status.account_age_days} dias</span>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      {trustScore.recommendations && trustScore.recommendations.length > 0 && (
        <div className="recommendations-section">
          <h4>🎯 Próximas Ações</h4>
          <div className="recommendations-list">
            {trustScore.recommendations.slice(0, 3).map((rec, idx) => (
              <div key={idx} className={`recommendation-item priority-${rec.priority}`}>
                <div className="rec-header">
                  <span className="rec-title">{rec.title}</span>
                  <span className="rec-points">+{rec.points}pts</span>
                </div>
                <p className="rec-description">{rec.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Next Milestone */}
      {trustScore.milestones.next && (
        <div className="next-milestone">
          <h4>🎖️ Próximo Marco</h4>
          <p className="milestone-name">{trustScore.milestones.next.name}</p>
          <p className="milestone-progress">
            Faltam {trustScore.milestones.progress_to_next.toFixed(1)} pontos
          </p>
          <ul className="milestone-requirements">
            {trustScore.milestones.next.requirements.map((req, idx) => (
              <li key={idx}>{req}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
