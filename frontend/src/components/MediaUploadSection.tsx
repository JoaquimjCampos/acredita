import React, { useState, ChangeEvent, FormEvent } from "react";
import { Button, Card } from "./common";

interface MediaUploadSectionProps {
  onUpload?: (formData: FormData) => Promise<void>;
}

const defaultOnUpload = async (formData: FormData) => {
  // TODO: Implementar integração real com backend
  await new Promise((resolve) => setTimeout(resolve, 1200));
};

const MediaUploadSection: React.FC<MediaUploadSectionProps> = ({ onUpload = defaultOnUpload }) => {
  const [files, setFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [mediaType, setMediaType] = useState<string>("");
  const [progress, setProgress] = useState<number>(0);
  const [logs, setLogs] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);

  // Preview selected files
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files ? Array.from(e.target.files) : [];
    setFiles(selectedFiles);
    setPreviewUrls(selectedFiles.map((file) => URL.createObjectURL(file)));
    setError("");
    setSuccess("");
    setLogs("");
  };

  // Handle form submit
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLogs("");
    setProgress(0);
    if (!title || !description || !mediaType || files.length === 0) {
      setError("Preencha todos os campos obrigatórios e selecione pelo menos um arquivo.");
      return;
    }
    setIsUploading(true);
    try {
      const formData = new FormData();
      files.forEach((file) => formData.append("media", file));
      formData.append("title", title);
      formData.append("description", description);
      formData.append("mediaType", mediaType);
      setLogs("Enviando arquivos...");
      await onUpload(formData);
      setSuccess("Upload realizado com sucesso!");
      setFiles([]);
      setPreviewUrls([]);
      setTitle("");
      setDescription("");
      setMediaType("");
    } catch (err: any) {
      setError("Erro ao enviar arquivos: " + (err?.message || "desconhecido"));
    } finally {
      setIsUploading(false);
      setLogs("");
      setProgress(100);
    }
  };

  return (
    <Card className="p-6 max-w-2xl mx-auto mt-8 shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Upload de Mídia</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium mb-1">Tipo de Mídia</label>
          <select
            className="w-full border rounded px-3 py-2"
            value={mediaType}
            onChange={(e) => setMediaType(e.target.value)}
            required
          >
            <option value="">Selecione...</option>
            <option value="entrevista">Entrevista</option>
            <option value="aula">Aula</option>
            <option value="acredita">Acredita</option>
          </select>
        </div>
        <div>
          <label className="block font-medium mb-1">Arquivos de Mídia</label>
          <input
            type="file"
            multiple
            accept="image/*,video/*,audio/*"
            onChange={handleFileChange}
            className="w-full border rounded px-3 py-2"
          />
          {previewUrls.length > 0 && (
            <div className="flex flex-wrap gap-4 mt-2">
              {previewUrls.map((url, idx) => (
                <div key={idx} className="w-24 h-24 border rounded overflow-hidden flex items-center justify-center bg-gray-50">
                  {/* Show preview for images, icon for others */}
                  {files[idx]?.type.startsWith("image") ? (
                    <img src={url} alt="preview" className="object-cover w-full h-full" />
                  ) : files[idx]?.type.startsWith("video") ? (
                    <video src={url} controls className="object-cover w-full h-full" />
                  ) : files[idx]?.type.startsWith("audio") ? (
                    <span className="text-xs">Áudio</span>
                  ) : (
                    <span className="text-xs">Arquivo</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        <div>
          <label className="block font-medium mb-1">Título</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Descrição</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
          />
        </div>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        {success && <div className="text-green-600 text-sm">{success}</div>}
        {logs && <div className="text-gray-500 text-xs">{logs}</div>}
        <div className="flex items-center gap-4">
          <Button type="submit" disabled={isUploading}>
            {isUploading ? "Enviando..." : "Enviar"}
          </Button>
          {progress > 0 && progress < 100 && (
            <div className="w-32 h-2 bg-gray-200 rounded">
              <div
                className="h-2 bg-blue-500 rounded"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>
      </form>
    </Card>
  );
};

export default MediaUploadSection;
