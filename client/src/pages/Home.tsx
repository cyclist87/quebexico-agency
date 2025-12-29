import { motion } from "framer-motion";
import { ArrowRight, Lightbulb, Monitor, PenTool, Layout, Quote, Play } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ServiceCard } from "@/components/ServiceCard";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 }
};

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          {/* unsplash: winter city skyline modern architecture */}
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
            Des problèmes ?<br />
            <span className="text-gradient">Agence Créative.</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-10"
          >
            Experts en résolutions de problèmes. Nous transformons vos défis en opportunités digitales.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link href="/contact">
              <Button size="lg" className="rounded-full text-lg h-14 px-8 shadow-xl shadow-primary/25 hover:shadow-2xl hover:-translate-y-1 transition-all">
                Démarrer un projet <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <a href="#services">
              <Button variant="outline" size="lg" className="rounded-full text-lg h-14 px-8 bg-background/50 backdrop-blur-sm hover:bg-background/80">
                Découvrir nos services
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
              <h2 className="font-display text-4xl font-bold mb-6">Que faisons nous ?</h2>
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                Chez <span className="font-bold text-foreground">QUEBEXICO</span>, nous ne sommes pas juste des designers ou des développeurs. Nous sommes des architectes de solutions.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                Notre approche est simple : analyser, concevoir, délivrer. Que vous ayez besoin d'une refonte complète de votre identité de marque, d'une application complexe ou d'une stratégie marketing percutante, nous avons l'équipe pour relever le défi.
              </p>
              <ul className="space-y-4">
                {['Stratégie Digitale', 'Design Thinking', 'Développement Agile'].map((item) => (
                  <li key={item} className="flex items-center gap-3 font-medium">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent rounded-3xl transform rotate-3 scale-105" />
              {/* unsplash: team working on whiteboard creative */}
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
            <h2 className="font-display text-4xl font-bold mb-4">Nos Services</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Une gamme complète de services pour propulser votre entreprise vers le succès.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <ServiceCard 
              icon={Lightbulb}
              title="Stratégie"
              description="Analyse de marché, positionnement de marque et conseil stratégique pour maximiser votre impact."
            />
            <ServiceCard 
              icon={PenTool}
              title="Design"
              description="Direction artistique, UI/UX design, logos et identité visuelle qui marquent les esprits."
            />
            <ServiceCard 
              icon={Monitor}
              title="Développement"
              description="Sites web performants, applications mobiles et solutions e-commerce sur mesure."
            />
            <ServiceCard 
              icon={Layout}
              title="Marketing"
              description="SEO, gestion des réseaux sociaux et campagnes publicitaires ciblées."
            />
          </div>
        </div>
      </section>

      {/* Demo Reel Section */}
      <section id="demoreel" className="py-24 bg-foreground text-background">
        <div className="container-padding max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display text-4xl font-bold mb-4">Démo Reel</h2>
            <p className="text-white/60 max-w-2xl mx-auto">
              Découvrez un aperçu de notre travail et de notre expertise créative.
            </p>
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="relative max-w-4xl mx-auto aspect-video rounded-2xl overflow-hidden shadow-2xl"
          >
            <iframe
              src="https://www.youtube.com/embed/judToWBm8bU"
              title="Quebexico Demo Reel"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
              data-testid="video-demoreel"
            />
          </motion.div>
        </div>
      </section>

      {/* Testimonials Quote */}
      <section className="py-32 bg-primary/5">
        <div className="container-padding max-w-4xl mx-auto text-center">
          <Quote className="w-12 h-12 text-primary/20 mx-auto mb-8" />
          <blockquote className="font-display text-3xl md:text-4xl font-medium leading-tight mb-8">
            "Un pessimiste voit la difficulté dans chaque opportunité, un optimiste voit l'opportunité dans chaque difficulté."
          </blockquote>
          <cite className="text-lg font-semibold text-primary not-italic">
            — Winston Churchill
          </cite>
        </div>
      </section>

    </div>
  );
}
