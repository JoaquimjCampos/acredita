module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        'acredita-primary': {
          DEFAULT: '#ff6600',
          dark: '#d35400',
          light: '#ff944d',
        },
        'acredita-secondary': {
          DEFAULT: '#0057b8',
          dark: '#003974',
          light: '#4d8cff',
        },
        'acredita-accent': '#00c48c',
        'acredita-bg': '#f9fafb',
        'acredita-muted': '#f3f4f6',
      },
      fontFamily: {
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Oxygen',
          'Ubuntu',
          'Cantarell',
          'Fira Sans',
          'Droid Sans',
          'Helvetica Neue',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
};
