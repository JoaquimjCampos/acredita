/**
 * Kixikila Constants
 * Centralized payment methods, statuses, and other enums
 */

export const PAYMENT_METHODS = {
  BANK_TRANSFER: 'bank_transfer',
  MOBILE_MONEY: 'mobile_money',
  CASH: 'cash',
  CARD: 'card',
} as const;

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  bank_transfer: 'Transferência Bancária',
  mobile_money: 'Mobile Money',
  cash: 'Dinheiro',
  card: 'Cartão',
};

export const PAYOUT_STATUSES = {
  SCHEDULED: 'scheduled',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
} as const;

export const PAYOUT_STATUS_LABELS: Record<string, string> = {
  scheduled: 'Agendado',
  processing: 'Processando',
  completed: 'Concluído',
  failed: 'Falhado',
};

export const CONTRIBUTION_STATUSES = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
} as const;

export const CONTRIBUTION_STATUS_LABELS: Record<string, string> = {
  pending: 'Pendente',
  confirmed: 'Confirmada',
};

export const GROUP_STATUSES = {
  FORMING: 'forming',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  SUSPENDED: 'suspended',
} as const;

export const GROUP_STATUS_LABELS: Record<string, string> = {
  forming: 'Em Formação',
  active: 'Ativa',
  completed: 'Completa',
  suspended: 'Suspensa',
};

export const PLATFORM_FEE_PERCENTAGE = 2.5;
