import { useState } from "react";
import { usePexelsSearch, usePexelsCurated, type PexelsPhoto } from "@/hooks/use-pexels";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Search, Check } from "lucide-react";

interface PexelsImagePickerProps {
  onSelect: (photo: PexelsPhoto) => void;
  selectedId?: number;
}

export function PexelsImagePicker({ onSelect, selectedId }: PexelsImagePickerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [page, setPage] = useState(1);

  const { data: searchResults, isLoading: isSearching } = usePexelsSearch({
    query: debouncedQuery,
    perPage: 20,
    page,
    enabled: debouncedQuery.length > 0,
  });

  const { data: curatedResults, isLoading: isCuratedLoading } = usePexelsCurated({
    perPage: 20,
    page,
    enabled: debouncedQuery.length === 0,
  });

  const results = debouncedQuery ? searchResults : curatedResults;
  const isLoading = debouncedQuery ? isSearching : isCuratedLoading;

  const handleSearch = () => {
    setDebouncedQuery(searchQuery);
    setPage(1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="Rechercher des images..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          data-testid="input-pexels-search"
        />
        <Button onClick={handleSearch} size="icon" data-testid="button-pexels-search">
          <Search className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="h-[400px]">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : results?.photos && results.photos.length > 0 ? (
          <div className="grid grid-cols-3 gap-2">
            {results.photos.map((photo) => (
              <button
                key={photo.id}
                onClick={() => onSelect(photo)}
                className={`relative aspect-square overflow-hidden rounded-md border-2 transition-all ${
                  selectedId === photo.id
                    ? "border-primary ring-2 ring-primary"
                    : "border-transparent hover:border-muted-foreground/30"
                }`}
                data-testid={`button-pexels-image-${photo.id}`}
              >
                <img
                  src={photo.src.small}
                  alt={photo.alt}
                  className="h-full w-full object-cover"
                  loading="lazy"
                  style={{ backgroundColor: photo.avgColor }}
                />
                {selectedId === photo.id && (
                  <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                    <Check className="h-6 w-6 text-primary" />
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] px-1 py-0.5 truncate">
                  {photo.photographer}
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            {debouncedQuery
              ? "Aucune image trouvée"
              : "Entrez un terme de recherche"}
          </div>
        )}
      </ScrollArea>

      {results?.hasMore && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            data-testid="button-pexels-prev"
          >
            Précédent
          </Button>
          <span className="text-sm text-muted-foreground py-2">Page {page}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => p + 1)}
            disabled={!results?.hasMore}
            data-testid="button-pexels-next"
          >
            Suivant
          </Button>
        </div>
      )}

      <p className="text-xs text-muted-foreground text-center">
        Images fournies par{" "}
        <a
          href="https://www.pexels.com"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:no-underline"
        >
          Pexels
        </a>
      </p>
    </div>
  );
}
