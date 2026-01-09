import { 
  HeroSection, 
  SponsorsSection, 
  CalendarSection, 
  PortfolioSection,
  CTASection,
  ServicesSection,
  TestimonialsSection,
  PropertiesSection,
} from "./sections";
import type { DemoProfileData, PageConfig, SectionConfig } from "@shared/demo-profiles";

interface DynamicPageProps {
  profile: DemoProfileData;
  page: PageConfig;
  heroImage?: string;
}

export function DynamicPage({ profile, page, heroImage }: DynamicPageProps) {
  const { config, portfolio, sponsors, calendar, testimonials, services, properties } = profile;

  const renderSection = (section: SectionConfig) => {
    switch (section.type) {
      case "hero":
        return (
          <HeroSection 
            key={section.id} 
            config={config} 
            heroImage={heroImage} 
          />
        );

      case "portfolio":
        if (!portfolio || portfolio.length === 0) return null;
        return (
          <PortfolioSection 
            key={section.id} 
            items={portfolio} 
            section={section} 
          />
        );

      case "sponsors":
        if (!sponsors || sponsors.length === 0) return null;
        return (
          <SponsorsSection 
            key={section.id} 
            sponsors={sponsors} 
            section={section} 
          />
        );

      case "calendar":
        if (!calendar || calendar.length === 0) return null;
        return (
          <CalendarSection 
            key={section.id} 
            events={calendar} 
            section={section} 
          />
        );

      case "cta":
        return (
          <CTASection 
            key={section.id} 
            config={config} 
            section={section} 
          />
        );

      case "testimonials":
        if (!testimonials || testimonials.length === 0) return null;
        return (
          <TestimonialsSection
            key={section.id}
            testimonials={testimonials}
            section={section}
          />
        );

      case "services":
        if (!services || services.length === 0) return null;
        return (
          <ServicesSection
            key={section.id}
            services={services}
            section={section}
          />
        );

      case "properties":
        if (!properties || properties.length === 0) return null;
        return (
          <PropertiesSection
            key={section.id}
            properties={properties}
            section={section}
            config={config}
          />
        );

      case "gallery":
        return null;

      case "contact":
        return null;

      case "richText":
        return null;

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background" data-testid={`page-${page.slug || "home"}`}>
      {page.sections.map(renderSection)}
    </div>
  );
}
