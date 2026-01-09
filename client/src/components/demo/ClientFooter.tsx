import { Link } from "wouter";
import { useProfileLocalization } from "@/hooks/use-profile-localization";
import type { ProfileConfig } from "@shared/demo-profiles";

interface ClientFooterProps {
  config: ProfileConfig;
  baseUrl: string;
}

export function ClientFooter({ config, baseUrl }: ClientFooterProps) {
  const navigation = config.navigation || [];
  const currentYear = new Date().getFullYear();
  const { getText } = useProfileLocalization();

  return (
    <footer className="bg-muted py-12 px-4" data-testid="client-footer">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-4">{getText(config.name)}</h3>
            <p className="text-sm text-muted-foreground">{getText(config.tagline)}</p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Navigation</h4>
            <ul className="space-y-2">
              {navigation.map((item) => (
                <li key={item.id}>
                  <Link 
                    href={item.slug ? `${baseUrl}/${item.slug}` : baseUrl}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    data-testid={`footer-link-${item.id}`}
                  >
                    {getText(item.label)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            {config.features.contact && (
              <Link 
                href={`${baseUrl}/contact`}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Nous contacter
              </Link>
            )}
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>© {currentYear} {getText(config.name)}. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
}
