import type { PexelsPhoto } from "@/hooks/use-pexels";

interface PexelsImageProps {
  photo: PexelsPhoto;
  size?: "tiny" | "small" | "medium" | "large" | "original" | "landscape" | "portrait";
  className?: string;
  showAttribution?: boolean;
  attributionPosition?: "bottom" | "overlay";
}

export function PexelsImage({
  photo,
  size = "medium",
  className = "",
  showAttribution = true,
  attributionPosition = "bottom",
}: PexelsImageProps) {
  const imageSrc = photo.src[size];

  return (
    <figure className="relative">
      <img
        src={imageSrc}
        alt={photo.alt}
        className={className}
        loading="lazy"
        style={{ backgroundColor: photo.avgColor }}
      />
      {showAttribution && (
        <figcaption
          className={
            attributionPosition === "overlay"
              ? "absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs px-2 py-1"
              : "text-xs text-muted-foreground mt-1"
          }
        >
          Photo par{" "}
          <a
            href={photo.attribution.photographerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:no-underline"
          >
            {photo.attribution.photographerName}
          </a>{" "}
          sur{" "}
          <a
            href={photo.attribution.pexelsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:no-underline"
          >
            Pexels
          </a>
        </figcaption>
      )}
    </figure>
  );
}

interface PexelsAttributionProps {
  photo: PexelsPhoto;
  className?: string;
}

export function PexelsAttribution({ photo, className = "" }: PexelsAttributionProps) {
  return (
    <span className={`text-xs text-muted-foreground ${className}`}>
      Photo par{" "}
      <a
        href={photo.attribution.photographerUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="underline hover:no-underline"
      >
        {photo.attribution.photographerName}
      </a>{" "}
      sur{" "}
      <a
        href={photo.attribution.pexelsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="underline hover:no-underline"
      >
        Pexels
      </a>
    </span>
  );
}
