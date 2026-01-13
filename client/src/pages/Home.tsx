import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Target, Palette, Globe, Rocket, Quote, Play } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ServiceCard } from "@/components/ServiceCard";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSiteConfig } from "@/hooks/use-site-config";
import { useContentSections } from "@/hooks/use-content-sections";
import wordCloudImage from "@assets/quebexico-trim_1767029606319.png";
import heroBackground from "@assets/IMG_4491_1767057213854.JPG";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 }
};

export default function Home() {
  const { t, language } = useLanguage();
  const { siteName, footerText } = useSiteConfig();
  const { sections } = useContentSections();
  
  const heroSection = sections.find(s => s.sectionType === "hero" && s.isEnabled);
  const aboutSection = sections.find(s => s.sectionType === "about" && s.isEnabled);
  const servicesSection = sections.find(s => s.sectionType === "services" && s.isEnabled);
  const quoteSection = sections.find(s => s.sectionType === "cta" && s.isEnabled);

  const getLocalizedText = (fr: string | null, en: string | null, es: string | null, fallback: string) => {
    if (language === "en" && en) return en;
    if (language === "es" && es) return es;
    if (fr) return fr;
    return fallback;
  };

  const pageTitles = {
    fr: `${siteName} | Agence Créative Stratégique | Québec`,
    en: `${siteName} | Strategic Creative Agency | Quebec`,
    es: `${siteName} | Agencia Creativa Estratégica | Quebec`,
  };

  useEffect(() => {
    document.title = pageTitles[language as keyof typeof pageTitles] || pageTitles.fr;
  }, [language, siteName]);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handlePlayClick = () => {
    if (videoRef.current) {
      videoRef.current.play();
      setIsVideoPlaying(true);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src={heroBackground} 
            alt="Paysage québécois" 
            className="w-full h-full object-cover opacity-25 dark:opacity-15"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/0 via-background/50 to-background" />
        </div>

        <div className="container-padding relative z-10 max-w-5xl mx-auto text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="font-display font-extrabold text-5xl md:text-7xl lg:text-8xl tracking-tight mb-6"
          >
            {heroSection ? (
              getLocalizedText(heroSection.titleFr, heroSection.titleEn, heroSection.titleEs, t.hero.title1)
            ) : (
              <>{t.hero.title1}<br /><span className="text-gradient">{t.hero.title2}</span></>
            )}
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-10"
          >
            {heroSection 
              ? getLocalizedText(heroSection.subtitleFr, heroSection.subtitleEn, heroSection.subtitleEs, t.hero.subtitle)
              : t.hero.subtitle
            }
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link href="/contact">
              <Button size="lg" className="rounded-full text-lg h-14 px-8 shadow-xl shadow-primary/25 hover:shadow-2xl hover:-translate-y-1 transition-all">
                {t.hero.cta} <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <a href="#services">
              <Button variant="outline" size="lg" className="rounded-full text-lg h-14 px-8 bg-background/50 backdrop-blur-sm hover:bg-background/80">
                {t.hero.discover}
              </Button>
            </a>
          </motion.div>
        </div>
      </section>

      {/* About/Approach Section */}
      <section id="about" className="py-24 bg-secondary/30">
        <div className="container-padding max-w-7xl mx-auto">
          <motion.div {...fadeIn} className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="font-display text-4xl font-bold mb-6">
                {aboutSection 
                  ? getLocalizedText(aboutSection.titleFr, aboutSection.titleEn, aboutSection.titleEs, t.about.title)
                  : t.about.title
                }
              </h2>
              {aboutSection ? (
                <div 
                  className="text-lg text-muted-foreground leading-relaxed mb-6"
                  dangerouslySetInnerHTML={{ 
                    __html: getLocalizedText(aboutSection.contentFr, aboutSection.contentEn, aboutSection.contentEs, t.about.p1) 
                  }}
                />
              ) : (
                <>
                  <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                    {t.about.p1.split("QUEBEXICO")[0]}
                    <span className="font-bold text-foreground">QUEBEXICO</span>
                    {t.about.p1.split("QUEBEXICO")[1]}
                  </p>
                  <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                    {t.about.p2}
                  </p>
                </>
              )}
              <div className="flex items-center gap-4">
                {t.about.list.map((item, index) => (
                  <div key={item} className="flex items-center gap-2">
                    <span className="font-display font-bold text-xl text-primary">{item}</span>
                    {index < t.about.list.length - 1 && (
                      <ArrowRight className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="relative flex items-center justify-center">
              <img 
                src={wordCloudImage}
                alt="Quebexico - Créativité québécoise" 
                className="relative w-full h-auto object-contain max-w-md mx-auto"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24">
        <div className="container-padding max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl font-bold mb-4">{t.services.title}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t.services.subtitle}
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <ServiceCard 
              icon={Target}
              title={t.services.strategy.title}
              description={t.services.strategy.desc}
            />
            <ServiceCard 
              icon={Palette}
              title={t.services.branding.title}
              description={t.services.branding.desc}
            />
            <ServiceCard 
              icon={Globe}
              title={t.services.digital.title}
              description={t.services.digital.desc}
            />
            <ServiceCard 
              icon={Rocket}
              title={t.services.activation.title}
              description={t.services.activation.desc}
            />
          </div>
        </div>
      </section>

      {/* Demo Reel Section */}
      <section id="demoreel" className="bg-foreground">
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="relative w-full aspect-video shadow-2xl group cursor-pointer"
          onClick={!isVideoPlaying ? handlePlayClick : undefined}
        >
          <video
            ref={videoRef}
            controls={isVideoPlaying}
            preload="metadata"
            poster="https://media.quebexico.co/quebexico-video.jpg"
            className="absolute inset-0 w-full h-full bg-black"
            data-testid="video-demoreel"
            onPlay={() => setIsVideoPlaying(true)}
            onPause={() => setIsVideoPlaying(false)}
            onEnded={() => setIsVideoPlaying(false)}
          >
            <source src="https://media.quebexico.co/quebexico-demo-reel-2025.mp4" type="video/mp4" />
            Votre navigateur ne supporte pas la lecture vidéo.
          </video>
          
          {/* Dark Overlay + Elegant Play Button */}
          <div 
            className={`absolute inset-0 flex items-center justify-center transition-opacity duration-500 ${
              isVideoPlaying ? 'opacity-0 pointer-events-none' : 'opacity-100'
            }`}
          >
            {/* Vignette effect */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,rgba(0,0,0,0.5)_100%)]" />
            
            {/* Subtle play button */}
            <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/10 backdrop-blur-[2px] border border-white/20 flex items-center justify-center transition-all duration-300 group-hover:scale-105 group-hover:bg-white/15">
              <Play className="w-6 h-6 md:w-7 md:h-7 text-white/80 fill-white/80 ml-0.5" />
            </div>
          </div>
        </motion.div>
      </section>

      {/* Philosophy Quote */}
      <section className="py-32 bg-primary/5">
        <div className="container-padding max-w-4xl mx-auto text-center">
          <Quote className="w-12 h-12 text-primary/20 mx-auto mb-8" />
          <blockquote className="font-display text-3xl md:text-4xl font-medium leading-tight">
            "{quoteSection 
              ? getLocalizedText(quoteSection.contentFr, quoteSection.contentEn, quoteSection.contentEs, t.quote.text)
              : t.quote.text
            }"
          </blockquote>
        </div>
      </section>

    </div>
  );
}
