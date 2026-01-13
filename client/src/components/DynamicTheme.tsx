import { useEffect } from "react";
import { useSiteConfig } from "@/hooks/use-site-config";

function hexToHSL(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return "";
  
  let r = parseInt(result[1], 16) / 255;
  let g = parseInt(result[2], 16) / 255;
  let b = parseInt(result[3], 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

export function DynamicTheme() {
  const { primaryColor, secondaryColor, accentColor, fontFamily } = useSiteConfig();

  useEffect(() => {
    const root = document.documentElement;
    
    if (primaryColor && primaryColor !== "#2563eb") {
      const hsl = hexToHSL(primaryColor);
      if (hsl) {
        root.style.setProperty("--primary", hsl);
      }
    }
    
    if (accentColor && accentColor !== "#f59e0b") {
      const hsl = hexToHSL(accentColor);
      if (hsl) {
        root.style.setProperty("--accent", hsl);
      }
    }

    if (fontFamily && fontFamily !== "Inter") {
      root.style.setProperty("--font-sans", `'${fontFamily}', sans-serif`);
    }
    
    return () => {
      root.style.removeProperty("--primary");
      root.style.removeProperty("--accent");
      root.style.removeProperty("--font-sans");
    };
  }, [primaryColor, secondaryColor, accentColor, fontFamily]);

  return null;
}
