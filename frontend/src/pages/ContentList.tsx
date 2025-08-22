import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import "./ContentList.css";
import toast from "react-hot-toast";

export type Content = {
  id: number;
  title: string;
  description: string;
  category: string;
  tags: string;
  author: string | number;
  media_url: string;
  feedback: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

const PAGE_SIZE = 5;

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
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({});

  useEffect(() => {
    fetchContents();
    // eslint-disable-next-line
  }, [search, category, page]);

  const fetchContents = async () => {
    setLoading(true);
    try {
      const params: any = { page, page_size: PAGE_SIZE };
      if (search) params.search = search;
      if (category) params.category = category;
      const res = await axios.get("/api/content/content/", { params });
      setContents(res.data.results || res.data);
      setCount(res.data.count || res.data.length || 0);
    } catch {
      setContents([]);
      setCount(0);
    }
    setLoading(false);
  };

  // Unique categories for filter dropdown
  const categories = Array.from(new Set(contents.map((c) => c.category).filter(Boolean)));

  // Check if user is admin
  const isAdmin = user && (user.is_staff || user.user_type === "admin");

  // Handlers for create/edit/delete
  const handleOpenCreate = () => {
    setForm({});
    setShowCreate(true);
    setError("");
    setTimeout(() => {
      modalRef.current?.focus();
    }, 100);
  };
  const handleOpenEdit = (content: Content) => {
    setForm(content);
    setShowEditId(content.id);
    setError("");
    setTimeout(() => {
      modalRef.current?.focus();
    }, 100);
  };
  const handleCloseForm = () => {
    setShowCreate(false);
    setShowEditId(null);
    setForm({});
    setError("");
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (e.target.type === "file") {
      setMediaFile((e.target as HTMLInputElement).files?.[0] || null);
    } else {
      setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    setLoading(true);
    try {
      let response;
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (value !== undefined && value !== null) formData.append(key, value as string);
      });
      if (mediaFile) formData.append("media_file", mediaFile);
      if (showCreate) {
        response = await axios.post("/api/content/content/", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Content created successfully!");
      } else if (showEditId) {
        response = await axios.patch(`/api/content/content/${showEditId}/`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Content updated successfully!");
      }
      handleCloseForm();
      fetchContents();
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Error saving content");
      toast.error(err?.response?.data?.detail || "Error saving content");
      // Field-level errors from DRF
      if (err?.response?.data) {
        setFieldErrors(err.response.data);
      }
    }
    setLoading(false);
  };
  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this content?")) return;
    try {
      await axios.delete(`/api/content/content/${id}/`);
      toast.success("Content deleted successfully!");
      fetchContents();
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Error deleting content");
      toast.error(err?.response?.data?.detail || "Error deleting content");
    }
  };

  return (
    <div className="content-list-container">
      <header>
        <h1>📚 Content Library</h1>
        <p>Browse, search, and filter rich content. Powered by Django backend.</p>
        {isAuthenticated && (
          <button className="content-crud-actions save-btn" onClick={handleOpenCreate}>Create Content</button>
        )}
      </header>
      <div className="content-list-controls">
        <input
          type="text"
          placeholder="Search content..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="content-search-input"
        />
        <select onChange={(e) => { setCategory(e.target.value); setPage(1); }} className="content-filter-select">
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>
      {loading ? <div>Loading...</div> : (
        <div className="content-list-grid">
          {contents.map((content) => (
            <div key={content.id} className="content-card">
              {/* Enhanced media display: supports images, videos, audio, PDFs, docs, and fallback */}
              {content.media_url && (() => {
                const url = content.media_url;
                const ext = url.split('.').pop()?.toLowerCase() || '';
                if (["jpg","jpeg","png","gif","webp","bmp","svg"].includes(ext)) {
                  return (
                    <figure className="content-card-media-container plg-darkmode" tabIndex={0} aria-label={`Image: ${content.title}`}
                      style={{outline:'none',margin:'0 0 8px 0',borderRadius:12,boxShadow:'0 4px 16px #2a2a2a22',maxHeight:220,overflow:'hidden',background:'linear-gradient(90deg,#f8fafc 60%,#e0e7ef 100%)'}}>
                      <img src={url} alt={content.title} className="content-card-image" style={{width:'100%',height:'auto',display:'block',transition:'box-shadow 0.2s',boxShadow:'0 1px 4px #0001'}} />
                      <figcaption className="visually-hidden">Image: {content.title}</figcaption>
                    </figure>
                  );
                }
                if (["mp4","webm","ogg","mkv","mov","avi"].includes(ext)) {
                  return (
                    <figure className="content-card-media-container plg-darkmode" tabIndex={0} aria-label={`Video: ${content.title}`}
                      style={{outline:'none',margin:'0 0 8px 0',borderRadius:12,boxShadow:'0 4px 16px #2a2a2a22',maxHeight:220,overflow:'hidden',background:'linear-gradient(90deg,#f8fafc 60%,#e0e7ef 100%)'}}>
                      <video src={url} controls className="content-card-media" style={{width:'100%',height:'auto',display:'block',transition:'box-shadow 0.2s',boxShadow:'0 1px 4px #0001'}} aria-label={content.title} />
                      <figcaption className="visually-hidden">Video: {content.title}</figcaption>
                    </figure>
                  );
                }
                if (["mp3","wav","aac","flac","m4a"].includes(ext)) {
                  return (
                    <figure className="content-card-media-container plg-darkmode" tabIndex={0} aria-label={`Audio: ${content.title}`}
                      style={{outline:'none',margin:'8px 0',borderRadius:12,boxShadow:'0 4px 16px #2a2a2a22',padding:'4px 0',background:'linear-gradient(90deg,#f8fafc 60%,#e0e7ef 100%)'}}>
                      <audio src={url} controls className="content-card-media" style={{width:'100%'}} aria-label={content.title} />
                      <figcaption className="visually-hidden">Audio: {content.title}</figcaption>
                    </figure>
                  );
                }
                if (["pdf"].includes(ext)) {
                  return (
                    <a href={url} target="_blank" rel="noopener noreferrer" className="content-card-media-link plg-darkmode" tabIndex={0} aria-label={`PDF: ${content.title}`}
                      style={{display:'inline-block',margin:'8px 0',padding:'8px 16px',borderRadius:8,background:'#e0e7ef',boxShadow:'0 2px 8px #0002',fontWeight:600,color:'#1e293b',transition:'background 0.2s'}}
                      onFocus={e => e.currentTarget.style.background = '#cbd5e1'}
                      onBlur={e => e.currentTarget.style.background = '#e0e7ef'}
                      onMouseOver={e => e.currentTarget.style.background = '#cbd5e1'}
                      onMouseOut={e => e.currentTarget.style.background = '#e0e7ef'}>
                      📄 View PDF
                    </a>
                  );
                }
                if (["doc","docx","ppt","pptx","xls","xlsx"].includes(ext)) {
                  return (
                    <a href={url} target="_blank" rel="noopener noreferrer" className="content-card-media-link plg-darkmode" tabIndex={0} aria-label={`Document: ${content.title}`}
                      style={{display:'inline-block',margin:'8px 0',padding:'8px 16px',borderRadius:8,background:'#e0e7ef',boxShadow:'0 2px 8px #0002',fontWeight:600,color:'#1e293b',transition:'background 0.2s'}}
                      onFocus={e => e.currentTarget.style.background = '#cbd5e1'}
                      onBlur={e => e.currentTarget.style.background = '#e0e7ef'}
                      onMouseOver={e => e.currentTarget.style.background = '#cbd5e1'}
                      onMouseOut={e => e.currentTarget.style.background = '#e0e7ef'}>
                      📑 Download Document
                    </a>
                  );
                }
                // Fallback for other files
                return (
                  <a href={url} target="_blank" rel="noopener noreferrer" className="content-card-media-link plg-darkmode" tabIndex={0} aria-label={`File: ${content.title}`}
                    style={{display:'inline-block',margin:'8px 0',padding:'8px 16px',borderRadius:8,background:'#e0e7ef',boxShadow:'0 2px 8px #0002',fontWeight:600,color:'#1e293b',transition:'background 0.2s'}}
                    onFocus={e => e.currentTarget.style.background = '#cbd5e1'}
                    onBlur={e => e.currentTarget.style.background = '#e0e7ef'}
                    onMouseOver={e => e.currentTarget.style.background = '#cbd5e1'}
                    onMouseOut={e => e.currentTarget.style.background = '#e0e7ef'}>
                    🔗 Download File
                  </a>
                );
              })()}
              <div className="content-card-content">
                <h2>{content.title}</h2>
                <p>{content.description}</p>
                <div className="content-card-meta">
                  <span className="badge badge-category">{content.category}</span>
                  <span className="badge badge-tags">{content.tags}</span>
                  <span className="badge badge-active">{content.is_active ? "Active" : "Inactive"}</span>
                </div>
                {content.feedback && <div className="content-card-feedback">💬 {content.feedback}</div>}
                <small>Created: {new Date(content.created_at).toLocaleString()}</small>
                {isAdmin && (
                  <div className="content-crud-actions">
                    <button className="edit-btn" onClick={() => handleOpenEdit(content)}>Edit</button>
                    <button className="delete-btn" onClick={() => handleDelete(content.id)}>Delete</button>
                  </div>
                )}
              </div>
            </div>
          ))}
          {contents.length === 0 && <div className="content-list-empty">No content found. Try adjusting your filters or search.</div>}
        </div>
      )}
      {/* Pagination Controls */}
      <div className="content-list-pagination">
        <button disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</button>
        <span>Page {page}</span>
        <button disabled={page * PAGE_SIZE >= count} onClick={() => setPage(page + 1)}>Next</button>
      </div>

      {/* Create/Edit Modal */}
      {(showCreate || showEditId) && (
        <div
          className="plg-modal-overlay"
          tabIndex={-1}
          aria-modal="true"
          role="dialog"
          ref={modalRef}
          onKeyDown={e => {
            if (e.key === "Escape") handleCloseForm();
            // Focus trap: keep focus inside modal
            const focusable = modalRef.current?.querySelectorAll('input, textarea, select, button');
            if (focusable && e.key === "Tab") {
              const first = focusable[0] as HTMLElement;
              const last = focusable[focusable.length - 1] as HTMLElement;
              if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
              } else if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
              }
            }
          }}
        >
          <div className="plg-modal">
            <h2>{showCreate ? "Create Content" : "Edit Content"}</h2>
            <form onSubmit={handleSubmit} className="plg-feedback-form">
              <input name="title" type="text" placeholder="Title" value={form.title || ""} onChange={handleChange} required autoFocus aria-label="Title" aria-invalid={!!fieldErrors.title} aria-describedby="title-error" />
              {fieldErrors.title && <div id="title-error" className="field-error" role="alert">{fieldErrors.title}</div>}
              <textarea name="description" placeholder="Description" value={form.description || ""} onChange={handleChange} required aria-label="Description" aria-invalid={!!fieldErrors.description} aria-describedby="description-error" />
              {fieldErrors.description && <div id="description-error" className="field-error" role="alert">{fieldErrors.description}</div>}
              <input name="category" type="text" placeholder="Category" value={form.category || ""} onChange={handleChange} required aria-label="Category" aria-invalid={!!fieldErrors.category} aria-describedby="category-error" />
              {fieldErrors.category && <div id="category-error" className="field-error" role="alert">{fieldErrors.category}</div>}
              <input name="tags" type="text" placeholder="Tags (comma separated)" value={form.tags || ""} onChange={handleChange} required aria-label="Tags" aria-invalid={!!fieldErrors.tags} aria-describedby="tags-error" />
              {fieldErrors.tags && <div id="tags-error" className="field-error" role="alert">{fieldErrors.tags}</div>}
              <input name="media_file" type="file" accept="image/*,video/*,audio/*" onChange={handleChange} aria-label="Media File" />
              {fieldErrors.media_file && <div className="field-error" role="alert">{fieldErrors.media_file}</div>}
              <textarea name="feedback" placeholder="Feedback" value={form.feedback || ""} onChange={handleChange} aria-label="Feedback" aria-invalid={!!fieldErrors.feedback} aria-describedby="feedback-error" />
              {fieldErrors.feedback && <div id="feedback-error" className="field-error" role="alert">{fieldErrors.feedback}</div>}
              <select name="is_active" value={form.is_active ? "true" : "false"} onChange={e => setForm(f => ({ ...f, is_active: e.target.value === "true" }))} aria-label="Active Status">
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
              {error && <div style={{ color: "red" }}>{error}</div>}
              <div className="content-crud-actions">
                <button type="submit" className="save-btn" disabled={loading}>{loading ? "Saving..." : "Save"}</button>
                <button type="button" className="cancel-btn" onClick={handleCloseForm}>Cancel</button>
              </div>
            </form>
            {loading && <div style={{ textAlign: "center", marginTop: "1rem" }}><span className="loader"></span> Loading...</div>}
          </div>
        </div>
      )}
      <footer>
        <small>🚀 Powered by Django REST Framework & React.</small>
      </footer>
    </div>
  );
};

export default ContentList;
