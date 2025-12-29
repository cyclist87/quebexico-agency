import { Facebook, Instagram, Twitter, Linkedin, Send } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertSubscriberSchema } from "@shared/schema";
import { useCreateSubscriber } from "@/hooks/use-messages";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";

export function Footer() {
  const { mutate, isPending } = useCreateSubscriber();
  
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
            <h2 className="font-display font-bold text-3xl mb-4 tracking-tighter">
              QUEBEXICO
            </h2>
            <p className="text-muted-foreground mb-6">
              Nous résolvons des problèmes complexes avec des solutions créatives simples.
            </p>
            <div className="flex gap-4">
              {[Facebook, Instagram, Twitter, Linkedin].map((Icon, i) => (
                <a key={i} href="#" className="p-2 bg-background/5 rounded-full hover:bg-primary hover:text-white transition-colors">
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-bold text-lg mb-4">Navigation</h3>
            <ul className="space-y-3">
              {['Accueil', 'À Propos', 'Services', 'Portfolio', 'Contact'].map((item) => (
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
            <h3 className="font-bold text-lg mb-4">Légal</h3>
            <ul className="space-y-3">
              {['Mentions Légales', 'Politique de Confidentialité', 'CGV', 'Cookies'].map((item) => (
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
            <h3 className="font-bold text-lg mb-4">Newsletter</h3>
            <p className="text-muted-foreground mb-4 text-sm">
              Abonnez-vous pour recevoir nos dernières actualités.
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
                            placeholder="votre@email.com" 
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
          &copy; {new Date().getFullYear()} Quebexico. Tous droits réservés.
        </div>
      </div>
    </footer>
  );
}
