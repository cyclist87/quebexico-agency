import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
  label?: string;
  maxSizeMB?: number;
  accept?: string;
}

export function ImageUpload({
  value,
  onChange,
  placeholder = "https://...",
  label = "Image",
  maxSizeMB = 2,
  accept = "image/jpeg,image/png,image/webp,image/gif",
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size
    const maxBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxBytes) {
      setError(`Le fichier doit faire moins de ${maxSizeMB} MB`);
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Seules les images sont acceptées");
      return;
    }

    setError(null);
    setIsUploading(true);

    try {
      // Step 1: Request presigned URL
      const urlResponse = await fetch("/api/uploads/request-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: file.name,
          size: file.size,
          contentType: file.type,
        }),
      });

      if (!urlResponse.ok) {
        throw new Error("Erreur lors de la préparation de l'upload");
      }

      const { uploadURL, objectPath } = await urlResponse.json();

      // Step 2: Upload directly to storage
      const uploadResponse = await fetch(uploadURL, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });

      if (!uploadResponse.ok) {
        throw new Error("Erreur lors de l'upload");
      }

      // Convert object path to full URL for proper display in emails and external use
      const fullUrl = objectPath.startsWith("/objects/") 
        ? `${window.location.origin}${objectPath}`
        : objectPath;
      onChange(fullUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur d'upload");
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const clearImage = () => {
    onChange("");
    setError(null);
  };

  // Determine image source - handle object paths, full URLs with /objects/, and external URLs
  const imageSrc = value.startsWith("/objects/") 
    ? value 
    : value.includes("/objects/") || value.startsWith("http")
      ? value 
      : value ? `https://${value}` : "";

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1"
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          title="Téléverser une image"
        >
          {isUploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
        </Button>
        {value && (
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={clearImage}
            title="Supprimer"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
      />

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {value && (
        <div className="mt-2 relative inline-block">
          <img
            src={imageSrc}
            alt="Preview"
            className="h-16 w-auto object-contain rounded border bg-white"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        </div>
      )}
    </div>
  );
}
