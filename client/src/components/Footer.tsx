import { Instagram, Linkedin, Send } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertSubscriberSchema } from "@shared/schema";
import { useCreateSubscriber } from "@/hooks/use-messages";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useLanguage } from "@/contexts/LanguageContext";

export function Footer() {
  const { mutate, isPending } = useCreateSubscriber();
  const { t } = useLanguage();
  
  const form = useForm({
    resolver: zodResolver(insertSubscriberSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = (data: { email: string }) => {
    mutate(data, {
      onSuccess: () => form.reset(),
    });
  };

  return (
    <footer className="bg-foreground text-background py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <div className="mb-4">
              <h2 className="font-display font-bold text-3xl tracking-tighter">
                QUEBEXICO
              </h2>
              <span className="text-xs text-white/50 tracking-wide">{t.footer.tagline}</span>
            </div>
            <p className="text-muted-foreground mb-6">
              {t.footer.description}
            </p>
            <div className="flex gap-4">
              <a 
                href="https://www.linkedin.com/company/quebexico/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 bg-background/5 rounded-full hover:bg-primary hover:text-white transition-colors"
                data-testid="link-linkedin"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a 
                href="https://www.instagram.com/quebexicoagency/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 bg-background/5 rounded-full hover:bg-primary hover:text-white transition-colors"
                data-testid="link-instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-bold text-lg mb-4">{t.footer.navigation}</h3>
            <ul className="space-y-3">
              {t.footer.navLinks.map((item) => (
                <li key={item}>
                  <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-bold text-lg mb-4">{t.footer.legal}</h3>
            <ul className="space-y-3">
              {t.footer.legalLinks.map((item) => (
                <li key={item}>
                  <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-bold text-lg mb-4">{t.footer.newsletter}</h3>
            <p className="text-muted-foreground mb-4 text-sm">
              {t.footer.newsletterDesc}
            </p>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex gap-2">
                        <FormControl>
                          <Input 
                            placeholder={t.footer.emailPlaceholder}
                            {...field} 
                            className="bg-background/10 border-white/10 text-white placeholder:text-muted-foreground focus-visible:ring-primary"
                          />
                        </FormControl>
                        <Button type="submit" size="icon" disabled={isPending}>
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 text-center text-muted-foreground text-sm">
          &copy; {new Date().getFullYear()} Quebexico. {t.footer.copyright}
        </div>
      </div>
    </footer>
  );
}
