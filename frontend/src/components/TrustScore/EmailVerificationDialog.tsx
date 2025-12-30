import React, { useState } from 'react';
import { useTrustScore } from '../../hooks/useTrustScore';

interface EmailVerificationDialogProps {
  open: boolean;
  onClose: () => void;
}

export const EmailVerificationDialog: React.FC<EmailVerificationDialogProps> = ({ open, onClose }) => {
  const { requestEmailVerification, confirmEmailVerification } = useTrustScore();
  const [step, setStep] = useState<'request' | 'confirm'>('request');
  const [code, setCode] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleRequestCode = async () => {
    setLoading(true);
    const result = await requestEmailVerification();
    setMessage(result.message);
    setStep('confirm');
    setLoading(false);
  };

  const handleConfirmCode = async () => {
    setLoading(true);
    const result = await confirmEmailVerification(code);
    setMessage(result.message);
    setLoading(false);
    if (result.success) {
      setTimeout(() => {
        onClose();
      }, 1500);
    }
  };

  return (
    <div className="email-verification-dialog">
      <div className="dialog-content">
        <h3>Verificação de Email</h3>
        {step === 'request' && (
          <>
            <p>Para verificar seu email, clique abaixo para receber um código.</p>
            <button onClick={handleRequestCode} disabled={loading} className="verify-btn">
              {loading ? 'Enviando...' : 'Enviar Código'}
            </button>
          </>
        )}
        {step === 'confirm' && (
          <>
            <p>Digite o código que você recebeu por email:</p>
            <input
              type="text"
              value={code}
              onChange={e => setCode(e.target.value)}
              maxLength={6}
              placeholder="Código de 6 dígitos"
              style={{ fontSize: '18px', padding: '8px', marginBottom: '12px', width: '100%' }}
            />
            <button onClick={handleConfirmCode} disabled={loading || code.length !== 6} className="verify-btn">
              {loading ? 'Verificando...' : 'Confirmar'}
            </button>
          </>
        )}
        {message && <p style={{ marginTop: '16px', color: '#10b981' }}>{message}</p>}
        <button onClick={onClose} className="close-btn" style={{ marginTop: '16px' }}>Fechar</button>
      </div>
      <style>{`
        .email-verification-dialog {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        .dialog-content {
          background: white;
          border-radius: 12px;
          padding: 32px;
          min-width: 320px;
          box-shadow: 0 2px 16px rgba(0,0,0,0.15);
          text-align: center;
        }
        .verify-btn {
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 4px;
          padding: 8px 24px;
          font-size: 16px;
          cursor: pointer;
          margin-top: 12px;
        }
        .verify-btn:disabled {
          background: #a5b4fc;
          cursor: not-allowed;
        }
        .close-btn {
          background: #ef4444;
          color: white;
          border: none;
          border-radius: 4px;
          padding: 6px 18px;
          font-size: 14px;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};
