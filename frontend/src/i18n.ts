import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  pt: {
    translation: {
      'Início': 'Início',
      'Temporadas': 'Temporadas',
      'Jogos': 'Jogos',
      'Simuladores': 'Simuladores',
      'Participantes': 'Participantes',
      'Ranking': 'Ranking',
      'Votar': 'Votar',
      'Conteúdos': 'Conteúdos',
      'Blog': 'Blog',
      'Começar': 'Começar',
      'Entrar': 'Entrar',
      'Olá': 'Olá',
      'Meu Perfil': 'Meu Perfil',
      'Dashboard': 'Dashboard',
      'Terminar Sessão': 'Terminar Sessão',
      'Registar': 'Registar',
      'Pesquisar jogos...': 'Pesquisar jogos...'
    }
  },
  en: {
    translation: {
      'Início': 'Home',
      'Temporadas': 'Seasons',
      'Jogos': 'Games',
      'Simuladores': 'Simulators',
      'Participantes': 'Participants',
      'Ranking': 'Ranking',
      'Votar': 'Vote',
      'Conteúdos': 'Content',
      'Blog': 'Blog',
      'Começar': 'Start',
      'Entrar': 'Login',
      'Olá': 'Hello',
      'Meu Perfil': 'My Profile',
      'Dashboard': 'Dashboard',
      'Terminar Sessão': 'Logout',
      'Registar': 'Register',
      'Pesquisar jogos...': 'Search games...'
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'pt',
    fallbackLng: 'pt',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
