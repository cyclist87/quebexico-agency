import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Check, 
  Globe, 
  Mail, 
  Smartphone, 
  Palette, 
  Calendar,
  Video,
  MessageSquare,
  Zap,
  Shield,
  Clock,
  Users,
  Star,
  ArrowRight,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { Link } from "wouter";

const autonomeFeatures = [
  { icon: Globe, text: "Site web professionnel clé en main" },
  { icon: Palette, text: "Design personnalisé à vos couleurs" },
  { icon: Mail, text: "Générateur de signature email" },
  { icon: Smartphone, text: "Carte de visite numérique + QR code" },
  { icon: Calendar, text: "Intégration calendrier de réservation" },
  { icon: MessageSquare, text: "Formulaire de contact intelligent" },
  { icon: Shield, text: "Hébergement sécurisé inclus" },
  { icon: Zap, text: "Mises à jour automatiques" },
];

const accompagnementFeatures = [
  { icon: Video, text: "12 rencontres vidéo par année (1/mois)" },
  { icon: Users, text: "Accompagnement personnalisé" },
  { icon: Star, text: "Conseils d'expert sur votre domaine" },
  { icon: Clock, text: "Support prioritaire" },
];

const faqs = [
  {
    question: "Qu'est-ce qui est inclus dans le site web?",
    answer: "Votre site comprend une page d'accueil professionnelle, une section de services/portfolio, un formulaire de contact, l'intégration de vos réseaux sociaux, et tous les outils numériques (signature email, carte de visite). Le tout est optimisé pour mobile et les moteurs de recherche."
  },
  {
    question: "Comment fonctionnent les rencontres mensuelles?",
    answer: "Chaque mois, nous planifions une session vidéo d'environ 45-60 minutes. Nous discutons de vos défis, stratégies, et je vous guide selon votre expertise (positionnement, marketing, développement de clientèle, etc.)."
  },
  {
    question: "Puis-je passer du forfait Autonome à Accompagnement?",
    answer: "Absolument! Vous pouvez upgrader à tout moment. Le montant déjà payé sera déduit au prorata."
  },
  {
    question: "Que se passe-t-il après la première année?",
    answer: "Votre abonnement se renouvelle automatiquement au même tarif. Vous pouvez annuler ou changer de forfait à tout moment avant le renouvellement."
  },
  {
    question: "Est-ce que je peux modifier mon site moi-même?",
    answer: "Oui! Vous avez accès à un tableau de bord simple pour mettre à jour vos informations, ajouter du contenu, et gérer vos outils. Pour les modifications majeures, je m'en occupe."
  },
];

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="border-b border-border last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-4 flex items-center justify-between text-left hover-elevate rounded-lg px-2"
        data-testid={`faq-${question.slice(0, 20).replace(/\s/g, '-')}`}
      >
        <span className="font-medium pr-4">{question}</span>
        {isOpen ? <ChevronUp className="h-5 w-5 shrink-0" /> : <ChevronDown className="h-5 w-5 shrink-0" />}
      </button>
      {isOpen && (
        <div className="pb-4 px-2 text-muted-foreground">
          {answer}
        </div>
      )}
    </div>
  );
}

export default function Offre() {
  return (
    <div className="min-h-screen bg-background">
      <section className="relative py-20 px-4 bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <div className="container mx-auto max-w-4xl text-center">
          <Badge variant="secondary" className="mb-4">
            Offre de lancement
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            Votre présence web professionnelle,<br />
            <span className="text-primary">sans les maux de tête</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Un site web clé en main, des outils numériques puissants, et un accompagnement expert pour développer votre activité. Tout ce qu'il vous faut pour rayonner en ligne.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild data-testid="button-voir-forfaits">
              <a href="#forfaits">Voir les forfaits</a>
            </Button>
            <Button size="lg" variant="outline" asChild data-testid="button-demo">
              <Link href="/demo">Voir des exemples</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-2xl font-bold text-center mb-12">
            Ce qui est inclus dans chaque forfait
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Globe, title: "Site web", desc: "Design pro sur mesure" },
              { icon: Mail, title: "Signature email", desc: "Générateur intégré" },
              { icon: Smartphone, title: "Carte numérique", desc: "Avec QR code" },
              { icon: Calendar, title: "Réservations", desc: "Calendrier intégré" },
            ].map((item, i) => (
              <div key={i} className="text-center p-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <item.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-1">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="forfaits" className="py-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-3xl font-bold text-center mb-4">
            Choisissez votre forfait
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Deux options pour s'adapter à vos besoins. Commencez en autonomie ou bénéficiez d'un accompagnement personnalisé.
          </p>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="relative">
              <CardHeader>
                <CardTitle className="text-2xl">Autonome</CardTitle>
                <CardDescription>
                  Pour ceux qui veulent avancer seuls avec les bons outils
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">250$</span>
                    <span className="text-muted-foreground">/ année</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    ~21$/mois · Facturation annuelle
                  </p>
                </div>

                <Separator />

                <div className="space-y-3">
                  {autonomeFeatures.map((feature, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="h-3 w-3 text-primary" />
                      </div>
                      <span className="text-sm">{feature.text}</span>
                    </div>
                  ))}
                </div>

                <Button className="w-full" size="lg" variant="outline" asChild data-testid="button-choisir-autonome">
                  <Link href="/contact">
                    Choisir Autonome
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="relative border-primary">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground">
                  Recommandé
                </Badge>
              </div>
              <CardHeader>
                <CardTitle className="text-2xl">Accompagnement</CardTitle>
                <CardDescription>
                  Pour maximiser votre impact avec un expert à vos côtés
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">1 000$</span>
                    <span className="text-muted-foreground">/ année</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    ~83$/mois · Facturation annuelle
                  </p>
                </div>

                <Separator />

                <div className="space-y-3">
                  <p className="text-sm font-medium text-muted-foreground">
                    Tout du forfait Autonome, plus:
                  </p>
                  {accompagnementFeatures.map((feature, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="h-3 w-3 text-primary-foreground" />
                      </div>
                      <span className="text-sm font-medium">{feature.text}</span>
                    </div>
                  ))}
                </div>

                <Button className="w-full" size="lg" asChild data-testid="button-choisir-accompagnement">
                  <Link href="/contact">
                    Choisir Accompagnement
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-8">
            Tous les prix sont en dollars canadiens (CAD). Satisfaction garantie 30 jours.
          </p>
        </div>
      </section>

      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-2xl font-bold text-center mb-4">
            Pourquoi cet accompagnement?
          </h2>
          <p className="text-center text-muted-foreground mb-12">
            Après des années à aider des entrepreneurs, voici ce que j'ai appris...
          </p>
          
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
                <span className="text-destructive font-bold">1</span>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Le problème</h3>
                <p className="text-muted-foreground">
                  Vous êtes expert dans votre domaine, mais gérer un site web, créer des outils marketing, et développer votre présence en ligne prend un temps fou. Temps que vous n'avez pas.
                </p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <span className="text-primary font-bold">2</span>
              </div>
              <div>
                <h3 className="font-semibold mb-1">La solution</h3>
                <p className="text-muted-foreground">
                  Je m'occupe de tout le côté technique: votre site, vos outils, votre image professionnelle. Vous vous concentrez sur ce que vous faites de mieux - servir vos clients.
                </p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                <span className="text-green-600 font-bold">3</span>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Le résultat</h3>
                <p className="text-muted-foreground">
                  Une présence professionnelle qui travaille pour vous 24/7, des outils qui impressionnent vos clients, et (avec l'accompagnement) un mentor pour vous guider dans votre croissance.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="container mx-auto max-w-2xl">
          <h2 className="text-2xl font-bold text-center mb-8">
            Questions fréquentes
          </h2>
          <Card>
            <CardContent className="p-4">
              {faqs.map((faq, i) => (
                <FAQItem key={i} question={faq.question} answer={faq.answer} />
              ))}
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="py-20 px-4 bg-primary text-primary-foreground">
        <div className="container mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold mb-4">
            Prêt à rayonner en ligne?
          </h2>
          <p className="text-primary-foreground/80 mb-8 text-lg">
            Réservez un appel découverte gratuit de 15 minutes pour discuter de vos besoins.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild data-testid="button-reserver-appel">
              <Link href="/book/discovery">
                Réserver un appel gratuit
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <footer className="py-8 px-4 border-t">
        <div className="container mx-auto max-w-4xl text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} · Tous droits réservés</p>
        </div>
      </footer>
    </div>
  );
}
