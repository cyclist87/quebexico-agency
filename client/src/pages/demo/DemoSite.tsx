import { useLocation } from "wouter";
import { ClientNavigation, ClientFooter, DynamicPage } from "@/components/demo";
import type { DemoProfileData, PageConfig } from "@shared/demo-profiles";

interface DemoSiteProps {
  profile: DemoProfileData;
  baseUrl: string;
  heroImage?: string;
  legacyContent?: React.ReactNode;
}

export function DemoSite({ profile, baseUrl, heroImage, legacyContent }: DemoSiteProps) {
  const { config } = profile;
  const pages = config.pages || [];
  const [location] = useLocation();

  const hasPages = pages.length > 0;
  const currentSlug = location.replace(baseUrl, "").replace(/^\//, "") || "";
  const currentPage = pages.find((p) => p.slug === currentSlug) || pages[0];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {hasPages && <ClientNavigation config={config} baseUrl={baseUrl} />}
      
      <main className="flex-1">
        {hasPages && currentPage ? (
          <DynamicPage profile={profile} page={currentPage} heroImage={heroImage} />
        ) : (
          legacyContent
        )}
      </main>

      {hasPages && <ClientFooter config={config} baseUrl={baseUrl} />}
    </div>
  );
}
