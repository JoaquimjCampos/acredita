import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import CertificationsPage from '../pages/CertificationsPage';
import MarketplacePage from '../pages/MarketplacePage';
import KixikilaPage from '../pages/KixikilaPage';

// Mock do serviço de certificações
jest.mock('../services/certifications/certificationsService', () => ({
  default: {
    getCategories: jest.fn().mockResolvedValue([
      {
        id: 1,
        name: 'Tecnologia',
        description: 'Cursos de tecnologia e programação',
      },
    ]),
    getPrograms: jest.fn().mockResolvedValue({
      results: [
        {
          id: 1,
          title: 'Python Avançado',
          description: 'Aprenda Python em profundidade',
          duration_hours: 40,
          max_participants: 30,
          price: 5000,
          category: { id: 1, name: 'Tecnologia' },
        },
      ],
    }),
  },
}));

// Mock do serviço de marketplace
jest.mock('../services/marketplace/marketplaceService', () => ({
  default: {
    getCategories: jest.fn().mockResolvedValue([
      {
        id: 1,
        name: 'Tecnologia',
        description: 'Serviços de tecnologia',
      },
    ]),
    getListings: jest.fn().mockResolvedValue({
      results: [
        {
          id: 1,
          title: 'Desenvolvimento de Website',
          description: 'Criar um website moderno e responsivo',
          location: 'Luanda',
          price: 10000,
          price_type: 'projeto',
          average_rating: 4.5,
        },
      ],
    }),
  },
}));

// Mock do serviço Kixikila
jest.mock('../services/kixikila/kixikilaService', () => ({
  default: {
    getGroups: jest.fn().mockResolvedValue({
      results: [
        {
          id: 1,
          name: 'Mulheres Empreendedoras',
          description: 'Grupo de apoio para mulheres empreendedoras',
          category: 'Empreendedorismo',
          members: [],
          total_contributions: 15,
          status: 'active',
        },
      ],
    }),
  },
}));

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        {component}
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('CertificationsPage', () => {
  it('should render certifications page with categories', async () => {
    renderWithProviders(<CertificationsPage />);
    
    expect(screen.getByText(/Programas de Certificação/i)).toBeInTheDocument();
    
    // Aguarda o carregamento das categorias
    await screen.findByText('Tecnologia');
    expect(screen.getByText(/Aprenda Python em profundidade/i)).toBeInTheDocument();
  });
});

describe('MarketplacePage', () => {
  it('should render marketplace page with listings', async () => {
    renderWithProviders(<MarketplacePage />);
    
    expect(screen.getByText(/Marketplace de Serviços/i)).toBeInTheDocument();
    
    // Aguarda o carregamento dos serviços
    await screen.findByText('Desenvolvimento de Website');
    expect(screen.getByText(/Criar um website moderno/i)).toBeInTheDocument();
  });
});

describe('KixikilaPage', () => {
  it('should render kixikila page with groups', async () => {
    renderWithProviders(<KixikilaPage />);
    
    expect(screen.getByText(/Associações Comunitárias/i)).toBeInTheDocument();
    
    // Aguarda o carregamento dos grupos
    await screen.findByText('Mulheres Empreendedoras');
    expect(screen.getByText(/Grupo de apoio para mulheres empreendedoras/i)).toBeInTheDocument();
  });
});
