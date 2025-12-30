import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Language } from "@/lib/translations";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const languageLabels: Record<Language, string> = {
  fr: "FR",
  en: "EN",
  es: "ES",
};

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [location] = useLocation();
  const { language, setLanguage, t } = useLanguage();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: t.nav.about, href: "/#about" },
    { name: t.nav.services, href: "/#services" },
    { name: t.nav.demoReel, href: "/#demoreel" },
    { name: t.nav.blog, href: "/blog" },
  ];

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled ? "glass shadow-sm py-4" : "bg-transparent py-6"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <Link href="/" className="hover:opacity-80 transition-opacity flex flex-col">
            <span className="font-display font-bold text-2xl tracking-tighter flex items-center gap-2">
              <span className="text-primary text-3xl">Q</span>UEBEXICO
            </span>
            <span className="text-xs text-muted-foreground tracking-wide">{t.footer.tagline}</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors"
              >
                {link.name}
              </a>
            ))}
            
            {/* Language Switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2" data-testid="button-language">
                  <Globe className="w-4 h-4" />
                  {languageLabels[language]}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-background border shadow-lg">
                <DropdownMenuItem onClick={() => setLanguage("fr")} data-testid="lang-fr">
                  Français
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage("en")} data-testid="lang-en">
                  English
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage("es")} data-testid="lang-es">
                  Español
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Link href="/contact">
              <Button variant="default" className="rounded-full px-6 font-semibold shadow-lg shadow-primary/20">
                {t.nav.contact}
              </Button>
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" data-testid="button-language-mobile">
                  <Globe className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-background border shadow-lg">
                <DropdownMenuItem onClick={() => setLanguage("fr")}>Français</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage("en")}>English</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage("es")}>Español</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <button
              className="p-2 text-foreground"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-background border-b border-border"
          >
            <div className="px-4 py-6 space-y-4">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="block text-lg font-medium py-2 hover:text-primary transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </a>
              ))}
              <Link href="/contact">
                <Button className="w-full rounded-full" onClick={() => setIsOpen(false)}>
                  {t.nav.contact}
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
