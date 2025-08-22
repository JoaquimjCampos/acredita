import React, { useState } from 'react';
import { Card, Button, LoadingSpinner } from '../components/common';

const VideoUploadSection: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [type, setType] = useState('entrevista');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title) {
      setError('Preencha todos os campos obrigatórios.');
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    formData.append('title', title);
    formData.append('description', description);
    try {
      const res = await fetch('/api/videos/upload/', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error('Erro ao fazer upload do vídeo');
      setSuccess('Vídeo enviado com sucesso! Aguarde processamento.');
      setFile(null);
      setTitle('');
      setDescription('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner size="md" text="A carregar upload de vídeo..." />;
  }

  return (
    <section className="py-8 bg-white animate-fade-in">
      <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-4">Upload de Vídeo</h2>
          <form onSubmit={handleUpload} className="space-y-4">
            <input
              type="file"
              accept="video/*"
              onChange={e => setFile(e.target.files?.[0] || null)}
              className="border rounded px-4 py-2 w-full"
              required
            />
            <input
              type="text"
              placeholder="Título do vídeo"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="border rounded px-4 py-2 w-full"
              required
            />
            <textarea
              placeholder="Descrição"
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="border rounded px-4 py-2 w-full"
              rows={3}
            />
            <select
              value={type}
              onChange={e => setType(e.target.value)}
              className="border rounded px-4 py-2 w-full"
            >
              <option value="entrevista">Entrevista</option>
              <option value="pitch">Pitch</option>
              <option value="aula">Aula</option>
              <option value="outro">Outro</option>
            </select>
            <Button type="submit" disabled={loading || !file || !title}>
              {loading ? 'Enviando...' : 'Enviar Vídeo'}
            </Button>
            {error && <div className="text-red-600 font-semibold text-center" role="alert">{error}</div>}
            {success && <div className="text-green-600 font-semibold text-center" role="status">{success}</div>}
          </form>
        </Card>
      </div>
    </section>
  );
};

export { VideoUploadSection };
