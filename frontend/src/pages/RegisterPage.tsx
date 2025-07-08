import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import { Layout } from '../components/layout/Layout';
import { Button, Input, Select, Card } from '../components/common';
import { UserRegistrationData } from '../types';
import { Eye, EyeOff, Heart, UserPlus, Check } from 'lucide-react';
import { PROVINCIAS_ANGOLA, validatePassword } from '../utils';

// Tipo específico para o formulário
interface RegisterFormData {
  username: string;
  email: string;
  password: string;
  confirm_password: string;
  first_name: string;
  last_name: string;
  telefone?: string;
  data_nascimento?: string;
  provincia?: string;
  municipio?: string;
  bairro?: string;
  termos_aceites: boolean;
}

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register: registerUser, isLoading, isAuthenticated } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<{
    isValid: boolean;
    errors: string[];
  }>({ isValid: false, errors: [] });

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
    watch,
    setError,
  } = useForm<RegisterFormData>();

  const watchPassword = watch('password');

  // Verificar força da palavra-passe
  useEffect(() => {
    if (watchPassword) {
      setPasswordStrength(validatePassword(watchPassword));
    } else {
      setPasswordStrength({ isValid: false, errors: [] });
    }
  }, [watchPassword]);

  const onSubmit = async (data: RegisterFormData) => {
    try {
      // Converter para UserRegistrationData
      const userData: UserRegistrationData = {
        username: data.username,
        email: data.email,
        password: data.password,
        confirm_password: data.confirm_password,
        first_name: data.first_name,
        last_name: data.last_name,
        telefone: data.telefone,
        data_nascimento: data.data_nascimento,
        provincia: data.provincia,
        municipio: data.municipio,
        bairro: data.bairro,
        termos_aceites: data.termos_aceites,
      };

      const success = await registerUser(userData);
      if (success) {
        navigate('/login', {
          state: { message: 'Conta criada com sucesso! Pode agora iniciar sessão.' }
        });
      }
    } catch (error: any) {
      setError('root', {
        type: 'manual',
        message: error.message || 'Erro ao criar conta',
      });
    }
  };

  // Opções de província
  const provinciaOptions = PROVINCIAS_ANGOLA.map(provincia => ({
    value: provincia,
    label: provincia,
  }));

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          {/* Logo e título */}
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
            Criar Conta
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Junte-se à comunidade de empreendedores angolanos e comece a sua jornada!
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl">
          <Card>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Erro geral */}
              {errors.root && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <p className="text-sm text-red-600">{errors.root.message}</p>
                </div>
              )}

              {/* Informações de login */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Informações de Acesso
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Nome de Utilizador"
                    type="text"
                    placeholder="Ex: joao_silva"
                    error={errors.username?.message}
                    {...register('username')}
                    required
                  />
                  <Input
                    label="Email"
                    type="email"
                    placeholder="joao@exemplo.com"
                    error={errors.email?.message}
                    {...register('email')}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="relative">
                    <Input
                      label="Palavra-passe"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Crie uma palavra-passe segura"
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

                  <div className="relative">
                    <Input
                      label="Confirmar Palavra-passe"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirme a palavra-passe"
                      error={errors.confirm_password?.message}
                      {...register('confirm_password')}
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Indicador de força da palavra-passe */}
                {watchPassword && (
                  <div className="mt-2">
                    <div className="text-sm">
                      <p className={`font-medium ${passwordStrength.isValid ? 'text-green-600' : 'text-red-600'}`}>
                        Requisitos da palavra-passe:
                      </p>
                      <ul className="mt-1 space-y-1">
                        <li className={`flex items-center ${watchPassword.length >= 8 ? 'text-green-600' : 'text-red-600'}`}>
                          <Check className="h-3 w-3 mr-1" />
                          Pelo menos 8 caracteres
                        </li>
                        <li className={`flex items-center ${/[A-Z]/.test(watchPassword) ? 'text-green-600' : 'text-red-600'}`}>
                          <Check className="h-3 w-3 mr-1" />
                          Uma letra maiúscula
                        </li>
                        <li className={`flex items-center ${/[a-z]/.test(watchPassword) ? 'text-green-600' : 'text-red-600'}`}>
                          <Check className="h-3 w-3 mr-1" />
                          Uma letra minúscula
                        </li>
                        <li className={`flex items-center ${/[0-9]/.test(watchPassword) ? 'text-green-600' : 'text-red-600'}`}>
                          <Check className="h-3 w-3 mr-1" />
                          Um número
                        </li>
                        <li className={`flex items-center ${/[!@#$%^&*(),.?":{}|<>]/.test(watchPassword) ? 'text-green-600' : 'text-red-600'}`}>
                          <Check className="h-3 w-3 mr-1" />
                          Um carácter especial
                        </li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>

              {/* Informações pessoais */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Informações Pessoais
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Primeiro Nome"
                    type="text"
                    placeholder="João"
                    error={errors.first_name?.message}
                    {...register('first_name')}
                    required
                  />
                  <Input
                    label="Último Nome"
                    type="text"
                    placeholder="Silva"
                    error={errors.last_name?.message}
                    {...register('last_name')}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <Input
                    label="Telefone"
                    type="tel"
                    placeholder="+244 900 000 000"
                    error={errors.telefone?.message}
                    {...register('telefone')}
                  />
                  <Input
                    label="Data de Nascimento"
                    type="date"
                    error={errors.data_nascimento?.message}
                    {...register('data_nascimento')}
                  />
                </div>
              </div>

              {/* Localização */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Localização (Opcional)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Select
                    label="Província"
                    placeholder="Selecione a província"
                    options={provinciaOptions}
                    error={errors.provincia?.message}
                    {...register('provincia')}
                  />
                  <Input
                    label="Município"
                    type="text"
                    placeholder="Ex: Belas"
                    error={errors.municipio?.message}
                    {...register('municipio')}
                  />
                  <Input
                    label="Bairro"
                    type="text"
                    placeholder="Ex: Talatona"
                    error={errors.bairro?.message}
                    {...register('bairro')}
                  />
                </div>
              </div>

              {/* Termos e condições */}
              <div>
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="termos_aceites"
                      type="checkbox"
                      className="h-4 w-4 text-acredita-primary focus:ring-acredita-primary border-gray-300 rounded"
                      {...register('termos_aceites')}
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="termos_aceites" className="text-gray-700">
                      Aceito os{' '}
                      <Link
                        to="/termos"
                        className="font-medium text-acredita-primary hover:text-orange-500"
                        target="_blank"
                      >
                        Termos e Condições
                      </Link>
                      {' '}e a{' '}
                      <Link
                        to="/privacidade"
                        className="font-medium text-acredita-primary hover:text-orange-500"
                        target="_blank"
                      >
                        Política de Privacidade
                      </Link>
                      .*
                    </label>
                    {errors.termos_aceites && (
                      <p className="mt-1 text-sm text-red-600">{errors.termos_aceites.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Botão de submit */}
              <Button
                type="submit"
                loading={isLoading}
                disabled={isLoading}
                className="w-full"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                {isLoading ? 'A criar conta...' : 'Criar Conta'}
              </Button>
            </form>

            {/* Link para login */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Já tem conta?</span>
                </div>
              </div>

              <div className="mt-6">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate('/login')}
                >
                  Entrar na Conta Existente
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
                    Porquê registar-se?
                  </h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <ul className="list-disc list-inside space-y-1">
                      <li>Acompanhe os seus participantes favoritos</li>
                      <li>Vote e participe na classificação</li>
                      <li>Candidate-se às próximas temporadas</li>
                      <li>Receba notificações sobre episódios</li>
                      <li>Acesso exclusivo a conteúdos especiais</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default RegisterPage;
