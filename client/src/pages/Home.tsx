import { motion } from "framer-motion";
import { ArrowRight, Lightbulb, Monitor, PenTool, Layout, Quote, Calendar } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ServiceCard } from "@/components/ServiceCard";
import { useLanguage } from "@/contexts/LanguageContext";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 }
};

export default function Home() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=2000" 
            alt="Background" 
            className="w-full h-full object-cover opacity-20 dark:opacity-10"
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
            {t.hero.title1}<br />
            <span className="text-gradient">{t.hero.title2}</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-10"
          >
            {t.hero.subtitle}
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

      {/* About Section */}
      <section id="about" className="py-24 bg-secondary/30">
        <div className="container-padding max-w-7xl mx-auto">
          <motion.div {...fadeIn} className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="font-display text-4xl font-bold mb-6">{t.about.title}</h2>
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                {t.about.p1.split("QUEBEXICO")[0]}
                <span className="font-bold text-foreground">QUEBEXICO</span>
                {t.about.p1.split("QUEBEXICO")[1]}
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                {t.about.p2}
              </p>
              <ul className="space-y-4">
                {t.about.list.map((item) => (
                  <li key={item} className="flex items-center gap-3 font-medium">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent rounded-3xl transform rotate-3 scale-105" />
              <img 
                src="https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&q=80&w=1000" 
                alt="Notre équipe" 
                className="relative rounded-3xl shadow-2xl w-full h-auto object-cover"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24">
        <div className="container-padding max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl font-bold mb-4">{t.services.title}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t.services.subtitle}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8">
            <ServiceCard 
              icon={Lightbulb}
              title={t.services.strategy.title}
              description={t.services.strategy.desc}
            />
            <ServiceCard 
              icon={PenTool}
              title={t.services.design.title}
              description={t.services.design.desc}
            />
            <ServiceCard 
              icon={Monitor}
              title={t.services.development.title}
              description={t.services.development.desc}
            />
            <ServiceCard 
              icon={Layout}
              title={t.services.marketing.title}
              description={t.services.marketing.desc}
            />
            <ServiceCard 
              icon={Calendar}
              title={t.services.events.title}
              description={t.services.events.desc}
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
          className="relative w-full aspect-video shadow-2xl"
        >
          <iframe
            src="https://www.youtube.com/embed/judToWBm8bU?modestbranding=1&rel=0&showinfo=0&iv_load_policy=3"
            title="Quebexico Demo Reel"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
            data-testid="video-demoreel"
          />
        </motion.div>
      </section>

      {/* Testimonials Quote */}
      <section className="py-32 bg-primary/5">
        <div className="container-padding max-w-4xl mx-auto text-center">
          <Quote className="w-12 h-12 text-primary/20 mx-auto mb-8" />
          <blockquote className="font-display text-3xl md:text-4xl font-medium leading-tight mb-8">
            "{t.quote.text}"
          </blockquote>
          <cite className="text-lg font-semibold text-primary not-italic">
            — {t.quote.author}
          </cite>
        </div>
      </section>

    </div>
  );
}
