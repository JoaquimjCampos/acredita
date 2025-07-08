import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Função para combinar classes CSS com Tailwind
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Função para formatar datas para o contexto angolano
export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    timeZone: 'Africa/Luanda',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    ...options,
  };

  return dateObj.toLocaleDateString('pt-AO', defaultOptions);
}

// Função para formatar data e hora
export function formatDateTime(date: string | Date): string {
  return formatDate(date, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Função para formatar números no contexto angolano
export function formatNumber(number: number): string {
  return number.toLocaleString('pt-AO');
}

// Função para formatar moeda angolana (Kwanza)
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('pt-AO', {
    style: 'currency',
    currency: 'AOA',
    minimumFractionDigits: 2,
  }).format(amount);
}

// Função para validar email
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Função para validar telefone angolano
export function isValidAngolanPhone(phone: string): boolean {
  // Formato: +244 XXX XXX XXX ou 244XXXXXXXXX ou 9XXXXXXXX
  const phoneRegex = /^(\+244|244)?[0-9]{9}$/;
  const cleanPhone = phone.replace(/\s+/g, '');
  return phoneRegex.test(cleanPhone);
}

// Função para formatar telefone angolano
export function formatAngolanPhone(phone: string): string {
  const cleanPhone = phone.replace(/\s+/g, '').replace(/\+244|244/, '');
  if (cleanPhone.length === 9) {
    return `+244 ${cleanPhone.slice(0, 3)} ${cleanPhone.slice(3, 6)} ${cleanPhone.slice(6)}`;
  }
  return phone;
}

// Função para validar palavra-passe
export function validatePassword(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('A palavra-passe deve ter pelo menos 8 caracteres');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('A palavra-passe deve conter pelo menos uma letra maiúscula');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('A palavra-passe deve conter pelo menos uma letra minúscula');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('A palavra-passe deve conter pelo menos um número');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('A palavra-passe deve conter pelo menos um carácter especial');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Função para gerar ID único
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Função para truncar texto
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

// Função para capitalizar primeira letra
export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

// Função para converter para slug (URL amigável)
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// Função para calcular idade
export function calculateAge(birthDate: string): number {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
}

// Função para debounce (evitar muitas chamadas seguidas)
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

// Função para verificar se é um dispositivo móvel
export function isMobileDevice(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

// Função para copiar texto para a área de transferência
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Erro ao copiar para a área de transferência:', error);
    return false;
  }
}

// Provincias de Angola
export const PROVINCIAS_ANGOLA = [
  'Bengo',
  'Benguela',
  'Bié',
  'Cabinda',
  'Cuando Cubango',
  'Cuanza Norte',
  'Cuanza Sul',
  'Cunene',
  'Huambo',
  'Huíla',
  'Luanda',
  'Lunda Norte',
  'Lunda Sul',
  'Malanje',
  'Moxico',
  'Namibe',
  'Uíge',
  'Zaire'
];

// Função para obter saudação baseada na hora
export function getGreeting(): string {
  const hour = new Date().getHours();
  
  if (hour < 12) {
    return 'Bom dia';
  } else if (hour < 18) {
    return 'Boa tarde';
  } else {
    return 'Boa noite';
  }
}

// Função para obter tempo relativo (ex: "há 2 horas")
export function getRelativeTime(date: string | Date): string {
  const now = new Date();
  const targetDate = typeof date === 'string' ? new Date(date) : date;
  const diffInSeconds = Math.floor((now.getTime() - targetDate.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'Agora mesmo';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `Há ${minutes} minuto${minutes !== 1 ? 's' : ''}`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `Há ${hours} hora${hours !== 1 ? 's' : ''}`;
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `Há ${days} dia${days !== 1 ? 's' : ''}`;
  } else {
    return formatDate(targetDate);
  }
}
