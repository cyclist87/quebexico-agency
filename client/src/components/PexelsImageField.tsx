import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PexelsImagePicker } from "./PexelsImagePicker";
import { Image, X } from "lucide-react";
import type { PexelsPhoto } from "@/hooks/use-pexels";

interface PexelsImageFieldProps {
  value: string;
  onChange: (url: string, attribution?: { photographer: string; photographerUrl: string; pexelsUrl: string }) => void;
  placeholder?: string;
  className?: string;
}

export function PexelsImageField({ value, onChange, placeholder = "URL Image", className = "" }: PexelsImageFieldProps) {
  const [open, setOpen] = useState(false);

  const handleSelectImage = (photo: PexelsPhoto) => {
    onChange(photo.src.large, {
      photographer: photo.attribution.photographerName,
      photographerUrl: photo.attribution.photographerUrl,
      pexelsUrl: photo.attribution.pexelsUrl,
    });
    setOpen(false);
  };

  const handleClear = () => {
    onChange("");
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex gap-2">
        <Input
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1"
          data-testid="input-pexels-url"
        />
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button type="button" variant="outline" size="icon" data-testid="button-open-pexels">
              <Image className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Choisir une image Pexels</DialogTitle>
            </DialogHeader>
            <PexelsImagePicker onSelect={handleSelectImage} />
          </DialogContent>
        </Dialog>
        {value && (
          <Button type="button" variant="ghost" size="icon" onClick={handleClear} data-testid="button-clear-image">
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {value && (
        <div className="relative aspect-video w-full max-w-xs rounded-md overflow-hidden border">
          <img
            src={value}
            alt="Aperçu"
            className="w-full h-full object-cover"
          />
        </div>
      )}
    </div>
  );
}
