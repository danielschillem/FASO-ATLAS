"use client";

import { useState, useRef } from "react";
import { uploadApi } from "@/lib/api";
import { Upload, X, Loader2, ImageIcon } from "lucide-react";

interface ImageUploadProps {
  onUploaded: (url: string) => void;
  folder?: string;
  className?: string;
}

export function ImageUpload({
  onUploaded,
  folder = "general",
  className = "",
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      setError("L'image ne doit pas dépasser 10 Mo.");
      return;
    }
    if (!file.type.startsWith("image/")) {
      setError("Seuls les fichiers image sont acceptés.");
      return;
    }

    setError("");
    setPreview(URL.createObjectURL(file));
    setUploading(true);

    try {
      const res = await uploadApi.upload(file, folder);
      onUploaded(res.data.url);
    } catch {
      setError("Échec de l'upload. Réessayez.");
      setPreview(null);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const clear = () => {
    setPreview(null);
    setError("");
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className={className}>
      {preview ? (
        <div className="relative inline-block">
          <img
            src={preview}
            alt="Aperçu"
            className="w-32 h-32 object-cover rounded-lg border border-sable-2"
          />
          {uploading && (
            <div className="absolute inset-0 bg-nuit/50 rounded-lg flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-blanc animate-spin" />
            </div>
          )}
          {!uploading && (
            <button
              onClick={clear}
              className="absolute -top-2 -right-2 w-6 h-6 bg-rouge text-blanc rounded-full flex items-center justify-center hover:bg-rouge/80 transition-colors"
              aria-label="Supprimer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      ) : (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed border-sable-2 rounded-lg p-6 text-center cursor-pointer hover:border-or hover:bg-sable/30 transition-colors"
        >
          <ImageIcon className="w-8 h-8 text-gris mx-auto mb-2" />
          <p className="text-sm text-gris">
            Glissez une image ou{" "}
            <span className="text-rouge font-medium">parcourez</span>
          </p>
          <p className="text-xs text-gris mt-1">PNG, JPG, WebP — max 10 Mo</p>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />

      {error && <p className="text-rouge text-xs mt-2">{error}</p>}
    </div>
  );
}
