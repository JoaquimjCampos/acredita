import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { FileText, Filter, Plus, Search, Trash2, Upload, X, Edit } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../contexts/AuthContext";
import { Layout } from "../components/layout/Layout";
import { Card, LoadingSpinner } from "../components/common";

export type Content = {
  id: number;
  title: string;
  description: string;
  category: string;
  tags: string;
  author: string | number;
  media_url?: string;
  feedback?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

const PAGE_SIZE = 6;

const ContentList: React.FC = () => {
  const modalRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated, user } = useAuth();

  const [contents, setContents] = useState<Content[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [showEditId, setShowEditId] = useState<number | null>(null);
  const [form, setForm] = useState<Partial<Content>>({});
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [error, setError] = useState<string>("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const isAdmin = isAuthenticated && (user as any)?.is_staff;

  useEffect(() => {
    fetchContents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, category, page]);

  const fetchContents = async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, page_size: PAGE_SIZE };
      if (search) params.search = search;
      if (category) params.category = category;

      const res = await axios.get("/api/content/content/", { params });
      const data = res.data;
      const results: Content[] = data.results ?? data;
      setContents(results);
      setCount(data.count ?? results.length ?? 0);
    } catch (e) {
      toast.error("Não foi possível carregar conteúdos.");
      setContents([]);
      setCount(0);
    } finally {
      setLoading(false);
    }
  };

  const categories = useMemo(
    () => Array.from(new Set(contents.map((c) => c.category).filter(Boolean))),
    [contents]
  );

  const handleOpenCreate = () => {
    setShowCreate(true);
    setShowEditId(null);
    setForm({ is_active: true });
    setMediaFile(null);
    setError("");
    setFieldErrors({});
  };

  const handleOpenEdit = (content: Content) => {
    setShowEditId(content.id);
    setShowCreate(false);
    setForm({ ...content });
    setMediaFile(null);
    setError("");
    setFieldErrors({});
  };

  const handleCloseForm = () => {
    setShowCreate(false);
    setShowEditId(null);
    setForm({});
    setMediaFile(null);
    setError("");
    setFieldErrors({});
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, files, type } = e.target as HTMLInputElement;
    if (type === "file" && files && files[0]) {
      setMediaFile(files[0]);
      return;
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setFieldErrors({});

    try {
      const formData = new FormData();
      formData.append("title", form.title || "");
      formData.append("description", form.description || "");
      formData.append("category", form.category || "");
      formData.append("tags", form.tags || "");
      formData.append("author", String(form.author || user?.nome || ""));
      formData.append("feedback", form.feedback || "");
      formData.append("is_active", String(form.is_active ?? true));
      if (mediaFile) formData.append("media_file", mediaFile);

      const url = showEditId ? `/api/content/content/${showEditId}/` : "/api/content/content/";
      const method = showEditId ? "put" : "post";

      const res = await axios({ url, method, data: formData, headers: { "Content-Type": "multipart/form-data" } });
      const saved = res.data as Content;

      if (showEditId) {
        setContents((prev) => prev.map((c) => (c.id === saved.id ? saved : c)));
      } else {
        setContents((prev) => [saved, ...prev]);
      }

      toast.success(showEditId ? "Conteúdo atualizado" : "Conteúdo criado");
      handleCloseForm();
      fetchContents();
    } catch (err: any) {
      const response = err?.response?.data;
      if (response && typeof response === "object") {
        setFieldErrors(response as Record<string, string>);
      }
      setError("Erro ao salvar conteúdo.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm("Tem certeza que deseja apagar este conteúdo?");
    if (!confirmed) return;
    setLoading(true);
    try {
      await axios.delete(`/api/content/content/${id}/`);
      setContents((prev) => prev.filter((c) => c.id !== id));
      setCount((prev) => Math.max(0, prev - 1));
      toast.success("Conteúdo apagado");
    } catch {
      toast.error("Não foi possível apagar o conteúdo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center">
              <FileText className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">Biblioteca de Conteúdos</h1>
              <p className="text-indigo-100 mt-1">Gerencie artigos, media e recursos integrados ao backend Django.</p>
            </div>
            {isAdmin && (
              <button
                onClick={handleOpenCreate}
                className="ml-auto flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg"
              >
                <Plus className="h-4 w-4" /> Criar Conteúdo
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="bg-gray-50 min-h-screen py-12">
        <div className="max-w-6xl mx-auto px-4 space-y-6">
          <Card className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Pesquisar conteúdos..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="sm:w-60 relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    setPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 appearance-none"
                >
                  <option value="">Todas as categorias</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>
          </Card>

          {loading ? (
            <div className="flex justify-center py-12"><LoadingSpinner text="Carregando conteúdos..." /></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {contents.map((content) => (
                <Card key={content.id} className="p-6 border-l-4 border-indigo-500 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">{content.title}</h2>
                      <p className="text-sm text-gray-600">{content.category || "Sem categoria"}</p>
                    </div>
                    <FileText className="h-6 w-6 text-indigo-600" />
                  </div>

                  {content.media_url && (
                    <div className="mb-4 rounded-lg overflow-hidden bg-gray-100">
                      <img src={content.media_url} alt={content.title} className="w-full h-40 object-cover" />
                    </div>
                  )}

                  <p className="text-gray-700 text-sm mb-4 line-clamp-3">{content.description}</p>

                  <div className="flex flex-wrap gap-2 text-xs text-gray-600 mb-4">
                    {content.tags && <span className="px-2 py-1 rounded-full bg-indigo-50 text-indigo-700">Tags: {content.tags}</span>}
                    <span className="px-2 py-1 rounded-full bg-gray-100">Autor: {content.author}</span>
                    <span className="px-2 py-1 rounded-full bg-gray-100">Atualizado: {new Date(content.updated_at).toLocaleDateString()}</span>
                  </div>

                  {content.feedback && (
                    <blockquote className="text-sm text-gray-600 italic bg-gray-50 p-3 rounded">“{content.feedback}”</blockquote>
                  )}

                  {isAdmin && (
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => handleOpenEdit(content)}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 border border-indigo-200 text-indigo-700 rounded-lg hover:bg-indigo-50"
                      >
                        <Edit className="h-4 w-4" /> Editar
                      </button>
                      <button
                        onClick={() => handleDelete(content.id)}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 border border-red-200 text-red-700 rounded-lg hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" /> Apagar
                      </button>
                    </div>
                  )}
                </Card>
              ))}
              {contents.length === 0 && (
                <Card className="p-8 text-center">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-700">Nenhum conteúdo encontrado.</p>
                </Card>
              )}
            </div>
          )}

          {count > PAGE_SIZE && (
            <div className="flex items-center justify-between bg-white border rounded-lg px-4 py-3">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-3 py-2 rounded border border-gray-200 disabled:opacity-40"
              >Anterior</button>
              <span className="text-sm text-gray-700">Página {page} de {Math.ceil(count / PAGE_SIZE)}</span>
              <button
                disabled={page >= Math.ceil(count / PAGE_SIZE)}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-2 rounded border border-gray-200 disabled:opacity-40"
              >Próxima</button>
            </div>
          )}
        </div>
      </div>

      {(showCreate || showEditId) && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-6 relative" ref={modalRef} tabIndex={-1}>
            <button
              onClick={handleCloseForm}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              aria-label="Fechar"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                <FileText className="h-5 w-5 text-indigo-700" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{showCreate ? "Criar Conteúdo" : "Editar Conteúdo"}</h2>
                <p className="text-sm text-gray-600">Integração direta com o backend Django.</p>
              </div>
            </div>
            {error && <div className="mb-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded p-3">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-700">Título</label>
                  <input name="title" value={form.title || ""} onChange={handleChange} required className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="text-sm text-gray-700">Categoria</label>
                  <input name="category" value={form.category || ""} onChange={handleChange} className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-700">Descrição</label>
                <textarea name="description" value={form.description || ""} onChange={handleChange} required className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" rows={3} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-700">Tags</label>
                  <input name="tags" value={form.tags || ""} onChange={handleChange} className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="text-sm text-gray-700">Autor</label>
                  <input name="author" value={(form.author as string) || ""} onChange={handleChange} className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-700">Feedback</label>
                <textarea name="feedback" value={form.feedback || ""} onChange={handleChange} className="w-full mt-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" rows={2} />
              </div>
              <div>
                <label className="text-sm text-gray-700 flex items-center gap-2">
                  <Upload className="h-4 w-4" /> Media (imagem, vídeo, áudio ou doc)
                </label>
                <input type="file" name="media_file" onChange={handleChange} className="mt-2" />
              </div>

              {Object.keys(fieldErrors).length > 0 && (
                <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded p-3">
                  {Object.entries(fieldErrors).map(([field, msg]) => (
                    <div key={field}>{field}: {msg as string}</div>
                  ))}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                {showEditId && (
                  <button
                    type="button"
                    onClick={() => handleDelete(showEditId)}
                    className="inline-flex items-center gap-2 px-4 py-2 border border-red-200 text-red-700 rounded-lg hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" /> Apagar
                  </button>
                )}
                <button type="button" onClick={handleCloseForm} className="px-4 py-2 border rounded-lg">Cancelar</button>
                <button type="submit" disabled={loading} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-60">
                  {loading ? "Salvando..." : "Salvar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default ContentList;
