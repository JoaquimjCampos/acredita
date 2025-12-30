/**
 * Trust Score Demo Page
 * Example page showing how to use the TrustScoreCard component
 */

import React from 'react';
import { TrustScoreCard } from '../components/TrustScore';

const TrustScorePage: React.FC = () => {
  return (
    <div style={{ padding: '40px 20px', background: '#f3f4f6', minHeight: '100vh' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <header style={{ marginBottom: '32px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px' }}>
            Meu Trust Score
          </h1>
          <p style={{ fontSize: '16px', color: '#6b7280' }}>
            Acompanhe seu progresso e desbloqueie novos recursos
          </p>
        </header>
        
        <TrustScoreCard />
        
        <footer style={{ marginTop: '32px', padding: '24px', background: 'white', borderRadius: '12px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px' }}>
            💡 Como funciona o Trust Score?
          </h3>
          <div style={{ fontSize: '14px', color: '#4b5563', lineHeight: '1.6' }}>
            <p style={{ marginBottom: '12px' }}>
              O <strong>Trust Score</strong> é um sistema transparente e justo que permite todos os 
              usuários da plataforma Acredita desbloquearem recursos premium através de verificação e engajamento.
            </p>
            <ul style={{ paddingLeft: '20px', marginBottom: '12px' }}>
              <li><strong>15 pontos:</strong> Crie listagens no Marketplace</li>
              <li><strong>20 pontos:</strong> Crie grupos Kixikila</li>
              <li><strong>25 pontos:</strong> Publique artigos no blog (auto-aprovação)</li>
            </ul>
            <p style={{ marginBottom: '12px' }}>
              <strong>Como ganhar pontos:</strong>
            </p>
            <ul style={{ paddingLeft: '20px' }}>
              <li>Verificar email (+5pts)</li>
              <li>Verificar telefone (+5pts)</li>
              <li>Completar perfil (+5pts)</li>
              <li>Votar em conteúdos (+0.5pts por voto, máx 10pts)</li>
              <li>Publicar conteúdo (+2pts por item, máx 10pts)</li>
              <li>Receber feedback positivo (até 10pts)</li>
              <li>Realizar vendas (+2pts por venda, máx 10pts)</li>
              <li>Manter boa avaliação (até 15pts)</li>
              <li>Conta antiga (até 10pts)</li>
            </ul>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default TrustScorePage;
