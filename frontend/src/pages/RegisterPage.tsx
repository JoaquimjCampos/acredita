import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../contexts/AuthContext';
import { analyticsService } from '../services/analytics';
import { Layout } from '../components/layout/Layout';
import { Button, Input, Card } from '../components/common';

import { useNavigate } from 'react-router-dom';
import { Heart, UserPlus } from 'lucide-react';

import { UserRegistrationData } from '../types';

const registerSchema = yup.object({
  username: yup.string().required('Nome de utilizador é obrigatório'),
  first_name: yup.string().required('Primeiro nome é obrigatório'),
  last_name: yup.string().required('Último nome é obrigatório'),
  email: yup.string().email('Email inválido').required('Email é obrigatório'),
  password: yup.string().min(6, 'A palavra-passe deve ter pelo menos 6 caracteres').required('Palavra-passe é obrigatória'),
  password_confirm: yup.string()
    .oneOf([yup.ref('password')], 'As senhas não coincidem')
    .required('Confirme a palavra-passe'),
  province: yup.string().required('Província é obrigatória'),
  city: yup.string(),
  phone_number: yup.string()
    .matches(/^\+244\d{9}$/, 'O número deve estar no formato +244XXXXXXXXX'),
  user_type: yup.string()
    .oneOf(['participant', 'voter', 'admin', 'mentor'], 'Tipo de utilizador inválido')
    .required('Tipo de utilizador é obrigatório'),
  terms_accepted: yup.boolean().oneOf([true], 'É necessário aceitar os termos de uso'),
});

const RegisterPage: React.FC = () => {
  const { register: registerUser, isLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<UserRegistrationData>({
    resolver: yupResolver(registerSchema) as any,
  });

  const onSubmit = async (data: UserRegistrationData) => {
    try {
      analyticsService.trackEvent('signup_started', {
        name: 'signup_started',
        page: 'register',
        cta_type: 'register',
        username: data.username,
        user_type: data.user_type,
        timestamp: Date.now(),
      });
      const success = await registerUser(data);
      if (success) {
        analyticsService.trackEvent('signup_completed', {
          name: 'signup_completed',
          page: 'register',
          cta_type: 'register',
          username: data.username,
          user_type: data.user_type,
          timestamp: Date.now(),
        });
        navigate('/login');
      }
    } catch (error: any) {
      analyticsService.trackEvent('signup_failed', {
        name: 'signup_failed',
        page: 'register',
        cta_type: 'register',
        username: data.username,
        error_message: error.message,
        timestamp: Date.now(),
      });
      // AA log for backend error details
      console.log('AA registration error:', error);
      setError('root', {
        type: 'manual',
        message: error.message || 'Erro ao criar conta',
      });
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <div className="flex items-center space-x-2">
              <div className="w-12 h-12 bg-gradient-to-r from-acredita-primary to-acredita-secondary rounded-lg flex items-center justify-center">
                <Heart className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Acredita</h1>
                <p className="text-sm text-gray-600 -mt-1">em Ti, em Angola</p>
              </div>
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
            Criar Conta Nova
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Registe-se gratuitamente para participar, votar e acompanhar o programa.
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <Card>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {/* Erro geral */}
              {errors.root && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
                  <p className="text-sm text-red-600 font-semibold">{errors.root.message}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Input
                    label="Nome de Utilizador"
                    type="text"
                    placeholder="Escolha um nome de utilizador"
                    error={errors.username?.message}
                    {...register('username')}
                    required
                  />
                </div>
                <div>
                  <Input
                    label="Email"
                    type="email"
                    placeholder="Insira o seu email"
                    error={errors.email?.message}
                    {...register('email')}
                    required
                  />
                </div>
                <div>
                  <Input
                    label="Primeiro Nome"
                    type="text"
                    placeholder="Insira o seu primeiro nome"
                    error={errors.first_name?.message}
                    {...register('first_name')}
                    required
                  />
                </div>
                <div>
                  <Input
                    label="Último Nome"
                    type="text"
                    placeholder="Insira o seu último nome"
                    error={errors.last_name?.message}
                    {...register('last_name')}
                    required
                  />
                </div>
                <div>
                  <Input
                    label="Telefone"
                    type="text"
                    placeholder="Ex: +244xxxxxxxxx"
                    error={errors.phone_number?.message}
                    {...register('phone_number')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Utilizador</label>
                  <select
                    {...register('user_type')}
                    className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-acredita-primary focus:ring-acredita-primary sm:text-sm ${errors.user_type ? 'border-red-500' : ''}`}
                    defaultValue=""
                    required
                  >
                    <option value="" disabled>Selecione...</option>
                    <option value="participant">Participante</option>
                    <option value="voter">Eleitor</option>
                    <option value="admin">Administrador</option>
                    <option value="mentor">Mentor</option>
                  </select>
                  {errors.user_type && (
                    <span className="text-red-600 text-xs">{errors.user_type.message}</span>
                  )}
                </div>
                <div>
                  <Input
                    label="Província"
                    type="text"
                    placeholder="Ex: Luanda"
                    error={errors.province?.message}
                    {...register('province')}
                    required
                  />
                </div>
                <div>
                  <Input
                    label="Cidade"
                    type="text"
                    placeholder="Ex: Luanda"
                    error={errors.city?.message}
                    {...register('city')}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Input
                    label="Palavra-passe"
                    type="password"
                    placeholder="Crie uma palavra-passe"
                    error={errors.password?.message}
                    {...register('password')}
                    required
                  />
                </div>
                <div>
                  <Input
                    label="Confirmar Palavra-passe"
                    type="password"
                    placeholder="Confirme a palavra-passe"
                    error={errors.password_confirm?.message}
                    {...register('password_confirm')}
                    required
                  />
                </div>
              </div>

              <div className="flex items-center mt-4">
                <input
                  id="terms_accepted"
                  type="checkbox"
                  {...register('terms_accepted')}
                  className="mr-2 accent-acredita-primary"
                  required
                />
                <label htmlFor="terms_accepted" className="text-sm text-gray-700">
                  Aceito os <button type="button" className="underline text-acredita-primary" onClick={() => alert('Termos de uso em breve!')}>termos de uso</button>
                </label>
                {errors.terms_accepted && (
                  <span className="text-red-600 ml-2 text-xs">{errors.terms_accepted.message}</span>
                )}
              </div>

              <Button
                type="submit"
                loading={isLoading}
                disabled={isLoading}
                className="w-full mt-6"
                data-analytics="register-submit-click"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                {isLoading ? 'A criar conta...' : 'Criar Conta'}
              </Button>
            </form>
            <div className="mt-6 text-center">
              <span className="text-gray-600 text-sm">Já tem conta?</span>
              <Button
                variant="outline"
                className="ml-2"
                onClick={() => navigate('/login')}
              >
                Entrar
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default RegisterPage;
