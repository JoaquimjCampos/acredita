/**
 * Design System Tokens para Acredita
 * Centraliza cores, tipografia, espaçamento, sombras, raios e animações.
 * Mantém consistência visual e facilita manutenção e escalabilidade.
 */

export const designTokens = {
  // Cores - Palette Acredita
  colors: {
    primary: '#FF6B35', // Acredita Primary (Orange)
    secondary: '#E63946', // Acredita Secondary (Red)
    accent: '#F1FAEE', // Light Accent
    success: '#2A9D8F', // Success Green
    warning: '#F4A261', // Warning Orange
    error: '#E76F51', // Error Red
    info: '#457B9D', // Info Blue
    
    // Grays - Neutral Scale
    gray: {
      50: '#F9FAFB',
      100: '#F3F4F6',
      200: '#E5E7EB',
      300: '#D1D5DB',
      400: '#9CA3AF',
      500: '#6B7280',
      600: '#4B5563',
      700: '#374151',
      800: '#1F2937',
      900: '#111827',
    },

    // Semantic
    text: {
      primary: '#111827', // gray-900
      secondary: '#6B7280', // gray-500
      muted: '#9CA3AF', // gray-400
      inverse: '#FFFFFF',
    },
    bg: {
      default: '#FFFFFF',
      subtle: '#F9FAFB', // gray-50
      muted: '#F3F4F6', // gray-100
    },
  },

  // Tipografia
  typography: {
    // Escalas responsivas
    heading: {
      h1: 'text-4xl md:text-5xl lg:text-6xl font-bold',
      h2: 'text-3xl md:text-4xl lg:text-5xl font-bold',
      h3: 'text-2xl md:text-3xl lg:text-4xl font-bold',
      h4: 'text-xl md:text-2xl lg:text-3xl font-semibold',
      h5: 'text-lg md:text-xl lg:text-2xl font-semibold',
      h6: 'text-base md:text-lg lg:text-xl font-semibold',
    },
    body: {
      lg: 'text-lg leading-relaxed',
      base: 'text-base leading-normal',
      sm: 'text-sm leading-snug',
      xs: 'text-xs leading-tight',
    },
    weight: {
      light: 'font-light',
      normal: 'font-normal',
      medium: 'font-medium',
      semibold: 'font-semibold',
      bold: 'font-bold',
      extrabold: 'font-extrabold',
    },
  },

  // Espaçamento (Tailwind 8px base)
  spacing: {
    xs: '0.25rem',  // 4px
    sm: '0.5rem',   // 8px
    md: '1rem',     // 16px
    lg: '1.5rem',   // 24px
    xl: '2rem',     // 32px
    '2xl': '3rem',  // 48px
    '3xl': '4rem',  // 64px
  },

  // Raio de borda
  borderRadius: {
    none: '0',
    sm: '0.25rem',     // 4px
    base: '0.375rem', // 6px
    md: '0.5rem',      // 8px
    lg: '0.75rem',     // 12px
    xl: '1rem',        // 16px
    full: '9999px',    // Pílula / Círculo
  },

  // Sombras (apenas 3 níveis para clareza)
  shadows: {
    none: 'none',
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    base: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    md: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    lg: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  },

  // Animações (reduzidas)
  animations: {
    'fade-in': 'fadeIn 0.3s ease-in-out',
    'slide-up': 'slideUp 0.3s ease-in-out',
    'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
    'bounce': 'bounce 1s infinite',
    'shake': 'shake 0.5s ease-in-out',
  },

  // Breakpoints
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },

  // Transições
  transitions: {
    fast: 'transition-all duration-150',
    base: 'transition-all duration-200',
    slow: 'transition-all duration-300',
    slower: 'transition-all duration-500',
  },

  // Z-index scale
  zIndex: {
    hide: '-1',
    base: '0',
    dropdown: '1000',
    sticky: '1020',
    fixed: '1030',
    backdrop: '1040',
    modal: '1050',
    popover: '1060',
    tooltip: '1070',
  },
};

// Helper para aplicar tokens de forma programática
export const useDesignToken = (category: keyof typeof designTokens, key: string) => {
  return (designTokens[category] as any)[key];
};
