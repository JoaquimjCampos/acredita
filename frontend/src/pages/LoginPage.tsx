import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../contexts/AuthContext';
import { analyticsService } from '../services/analytics';
import { Layout } from '../components/layout/Layout';
import { Button, Input, Card } from '../components/common';
import { LoginCredentials } from '../types';
import { Eye, EyeOff, Heart, LogIn } from 'lucide-react';

// Schema de validação
const loginSchema = yup.object({
  username: yup
    .string()
    .required('Nome de utilizador é obrigatório'),
  password: yup
    .string()
    .required('Palavra-passe é obrigatória'),
});

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading, isAuthenticated } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  // Redirecionar se já estiver autenticado
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
  } = useForm<LoginCredentials>({
    resolver: yupResolver(loginSchema),
  });

  const onSubmit = async (data: LoginCredentials) => {
    try {
      analyticsService.trackEvent('login_started', {
        username: data.username,
        timestamp: new Date().toISOString()
      });
      
      const success = await login(data);
      if (success) {
        analyticsService.trackEvent('login_completed', {
          username: data.username,
          timestamp: new Date().toISOString()
        });
        navigate('/dashboard');
      }
    } catch (error: any) {
      analyticsService.trackEvent('login_failed', {
        username: data.username,
        error_message: error.message,
        timestamp: new Date().toISOString()
      });
      setError('root', {
        type: 'manual',
        message: error.message || 'Erro ao iniciar sessão',
      });
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          {/* Logo e título */}
          <div className="flex justify-center">
            <div className="flex items-center space-x-3">
              <Heart className="h-6 w-6 text-acredita-primary" />
              <span className="text-2xl font-bold text-acredita-primary">Acredita</span>
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Entrar na sua conta
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Não tem uma conta?{' '}
            <Link to="/registo" className="font-medium text-acredita-primary hover:text-orange-500">
              Registe-se
            </Link>
          </p>
        </div>

        <Card>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Erro geral */}
            {errors.root && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-sm text-red-600">{errors.root.message}</p>
              </div>
            )}

            {/* Nome de utilizador */}
            <Input
              label="Nome de Utilizador ou Email"
              type="text"
              placeholder="Insira o seu nome de utilizador ou email"
              error={errors.username?.message}
              {...register('username')}
              required
            />

            {/* Palavra-passe */}
            <div className="relative">
              <Input
                label="Palavra-passe"
                type={showPassword ? 'text' : 'password'}
                placeholder="Insira a sua palavra-passe"
                error={errors.password?.message}
                {...register('password')}
                required
              />
              <button
                type="button"
                className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>

            {/* Lembrar-me e recuperar palavra-passe */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-acredita-primary focus:ring-acredita-primary border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Lembrar-me
                </label>
              </div>

              <div className="text-sm">
                <Link
                  to="/recuperar-senha"
                  className="font-medium text-acredita-primary hover:text-orange-500"
                >
                  Esqueceu a palavra-passe?
                </Link>
              </div>
            </div>

            {/* Botão de submit */}
            <Button
              type="submit"
              loading={isLoading}
              disabled={isLoading}
              className="w-full"
              data-analytics="login-submit-click"
            >
              <LogIn className="w-4 h-4 mr-2" />
              {isLoading ? 'A entrar...' : 'Entrar'}
            </Button>
          </form>

          {/* Link para registo */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Ainda não tem conta?</span>
              </div>
            </div>

            <div className="mt-6">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate('/registo')}
                data-analytics="login-register-redirect"
              >
                Criar Conta Nova
              </Button>
            </div>
          </div>
        </Card>

        {/* Informação adicional */}
        <div className="mt-8">
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <Heart className="h-5 w-5 text-blue-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Primeira vez aqui?
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>
                    Registe-se gratuitamente para acompanhar os participantes, votar nos seus favoritos 
                    e candidatar-se às próximas temporadas do programa.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default LoginPage;
