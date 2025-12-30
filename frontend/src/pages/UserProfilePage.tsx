import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Layout } from '../components/layout/Layout';
import { Card, Button, LoadingSpinner } from '../components/common';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { User, Edit, Save, X, Mail, MapPin, Calendar } from 'lucide-react';
import KixikilaService from '../services/kixikila/kixikilaService';

const UserProfilePage: React.FC = () => {
  const { user, updateProfile, isLoading } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    nome: user?.nome || '',
    email: user?.email || '',
    provincia: user?.provincia || '',
    idade: user?.idade || '',
  });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [reputation, setReputation] = useState<{
    username: string;
    groups_participated: number;
    contributions_on_time: number;
    contributions_late: number;
    contributions_missed: number;
    reputation_score: number;
    trust_level: 'beginner' | 'reliable' | 'trusted' | 'champion';
  } | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const rep = await KixikilaService.getMyReputation();
        setReputation(rep);
      } catch (e) {
        // silent fail if endpoint not available
      }
    };
    load();
  }, []);

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner size="lg" text="A carregar perfil..." />
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <ErrorMessage message="Utilizador não encontrado." />
        </div>
      </Layout>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const payload = {
        ...form,
        idade: form.idade ? Number(form.idade) : undefined,
      };
      await updateProfile(payload);
      setEditMode(false);
    } catch (err: any) {
      setError('Erro ao atualizar perfil.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center">
              <User className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">{user.nome}</h1>
              <p className="text-blue-100 mt-1">Perfil do Utilizador</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {reputation && (
          <Card className="p-6 mb-6 border-l-4 border-indigo-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Reputação Kixikila</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{reputation.trust_level.toUpperCase()}</p>
                <p className="text-sm text-gray-600 mt-1">
                  Pontuação: <span className="font-semibold text-gray-900">{reputation.reputation_score}</span>
                  {' '}• Em dia: {reputation.contributions_on_time} • Atrasos: {reputation.contributions_late} • Falhas: {reputation.contributions_missed}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Grupos</p>
                <p className="text-xl font-semibold text-gray-900">{reputation.groups_participated}</p>
              </div>
            </div>
          </Card>
        )}
        <Card className="p-8">
          {error && <ErrorMessage message={error} className="mb-6" />}

          <form className="space-y-6" onSubmit={e => { e.preventDefault(); handleSave(); }}>
            {/* Nome */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Nome</label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  name="nome"
                  value={form.nome}
                  onChange={handleChange}
                  disabled={!editMode}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  disabled
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">O email não pode ser alterado</p>
            </div>

            {/* Localização */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Província</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    name="provincia"
                    value={form.provincia}
                    onChange={handleChange}
                    disabled={!editMode}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600"
                    placeholder="Sua província"
                  />
                </div>
              </div>

              {/* Idade */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Idade</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="number"
                    name="idade"
                    value={form.idade}
                    onChange={handleChange}
                    disabled={!editMode}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600"
                    placeholder="Sua idade"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
              {editMode ? (
                <>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setEditMode(false)} 
                    disabled={saving}
                    className="flex items-center gap-2"
                  >
                    <X className="h-4 w-4" />
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    variant="primary" 
                    disabled={saving}
                    className="flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    {saving ? 'Salvando...' : 'Salvar Alterações'}
                  </Button>
                </>
              ) : (
                <Button 
                  type="button" 
                  variant="primary" 
                  onClick={() => setEditMode(true)}
                  className="flex items-center gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Editar Perfil
                </Button>
              )}
            </div>
          </form>
        </Card>
      </div>
    </Layout>
  );
};

export default UserProfilePage;
