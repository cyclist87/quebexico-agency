import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import type { ProfileConfig } from "@shared/demo-profiles";

interface ClientNavigationProps {
  config: ProfileConfig;
  baseUrl: string;
}

export function ClientNavigation({ config, baseUrl }: ClientNavigationProps) {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = config.navigation || [];
  
  const isActive = (slug: string) => {
    const fullPath = slug ? `${baseUrl}/${slug}` : baseUrl;
    return location === fullPath || (slug === "" && location === baseUrl);
  };

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href={baseUrl} data-testid="link-logo">
            <span className="font-bold text-xl">{config.name}</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1" data-testid="nav-desktop">
            {navigation.map((item) => (
              <Button
                key={item.id}
                variant="ghost"
                className={isActive(item.slug) ? "bg-accent" : ""}
                data-testid={`nav-link-${item.id}`}
                asChild
              >
                <Link href={item.slug ? `${baseUrl}/${item.slug}` : baseUrl}>
                  {item.label}
                </Link>
              </Button>
            ))}
          </nav>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            data-testid="button-mobile-menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {mobileMenuOpen && (
          <nav className="md:hidden py-4 border-t" data-testid="nav-mobile">
            <div className="flex flex-col gap-1">
              {navigation.map((item) => (
                <Button
                  key={item.id}
                  variant="ghost"
                  className={`w-full justify-start ${isActive(item.slug) ? "bg-accent" : ""}`}
                  onClick={() => setMobileMenuOpen(false)}
                  data-testid={`nav-mobile-link-${item.id}`}
                  asChild
                >
                  <Link href={item.slug ? `${baseUrl}/${item.slug}` : baseUrl}>
                    {item.label}
                  </Link>
                </Button>
              ))}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
