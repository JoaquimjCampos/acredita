import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Layout } from '../components/layout/Layout';
import { Card, Button, LoadingSpinner } from '../components/common';
import { ErrorMessage } from '../components/common/ErrorMessage';

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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-lg w-full p-8">
          <h1 className="text-2xl font-bold mb-6 text-acredita-primary">Meu Perfil</h1>
          {error && <ErrorMessage message={error} />}
          <form className="space-y-4" onSubmit={e => { e.preventDefault(); handleSave(); }}>
            <div>
              <label className="block text-sm font-medium text-gray-700">Nome</label>
              <input
                type="text"
                name="nome"
                value={form.nome}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-acredita-primary focus:border-acredita-primary"
                disabled={!editMode}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-acredita-primary focus:border-acredita-primary"
                disabled
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Província</label>
              <input
                type="text"
                name="provincia"
                value={form.provincia}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-acredita-primary focus:border-acredita-primary"
                disabled={!editMode}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Idade</label>
              <input
                type="number"
                name="idade"
                value={form.idade}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-acredita-primary focus:border-acredita-primary"
                disabled={!editMode}
              />
            </div>
            <div className="flex justify-end gap-2 mt-6">
              {editMode ? (
                <>
                  <Button type="button" variant="outline" onClick={() => setEditMode(false)} disabled={saving}>Cancelar</Button>
                  <Button type="submit" variant="primary" disabled={saving}>{saving ? 'Salvando...' : 'Salvar'}</Button>
                </>
              ) : (
                <Button type="button" variant="primary" onClick={() => setEditMode(true)}>Editar Perfil</Button>
              )}
            </div>
          </form>
        </Card>
      </div>
    </Layout>
  );
};

export default UserProfilePage;
