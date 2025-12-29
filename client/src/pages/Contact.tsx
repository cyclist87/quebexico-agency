import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertMessageSchema } from "@shared/schema";
import { useCreateMessage } from "@/hooks/use-messages";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Clock, Video } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";


export default function Contact() {
  const { mutate, isPending } = useCreateMessage();
  const { t } = useLanguage();
  
  const form = useForm({
    resolver: zodResolver(insertMessageSchema),
    defaultValues: {
      name: "",
      email: "",
      message: ""
    }
  });

  function onSubmit(data: any) {
    mutate(data, {
      onSuccess: () => {
        form.reset();
      }
    });
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-12">
      <div className="container-padding max-w-7xl mx-auto">
        
        {/* Booking Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="font-display text-4xl font-bold mb-4">{t.booking.title}</h2>
            <p className="text-lg text-muted-foreground">
              {t.booking.subtitle}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto p-3 rounded-full bg-primary/10 text-primary w-fit mb-2">
                  <Video className="w-6 h-6" />
                </div>
                <CardTitle>{t.booking.discovery.title}</CardTitle>
                <CardDescription>{t.booking.discovery.desc}</CardDescription>
              </CardHeader>
              <CardContent>
                <a href="/book/discovery">
                  <Button variant="outline" className="w-full" data-testid="button-book-discovery">
                    {t.booking.discovery.cta}
                  </Button>
                </a>
              </CardContent>
            </Card>

            <Card className="text-center border-primary">
              <CardHeader>
                <div className="mx-auto p-3 rounded-full bg-primary/10 text-primary w-fit mb-2">
                  <Clock className="w-6 h-6" />
                </div>
                <CardTitle>{t.booking.expert.title}</CardTitle>
                <CardDescription>{t.booking.expert.desc}</CardDescription>
              </CardHeader>
              <CardContent>
                <a href="/book/expert">
                  <Button className="w-full" data-testid="button-book-expert">
                    {t.booking.expert.cta}
                  </Button>
                </a>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Contact Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          
          {/* Contact Info */}
          <div>
            <h1 className="font-display text-4xl font-bold mb-6">{t.contact.title}</h1>
            <p className="text-lg text-muted-foreground mb-12">
              {t.contact.subtitle}
            </p>

            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-full bg-primary/10 text-primary">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Email</h3>
                  <p className="text-muted-foreground">salut@quebexico.co</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-card p-8 rounded-3xl border shadow-lg">
            <h2 className="text-2xl font-bold mb-6">{t.contact.send}</h2>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.contact.name}</FormLabel>
                      <FormControl>
                        <Input placeholder="Jean Dupont" className="h-12 bg-background" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.contact.email}</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="jean@exemple.com" className="h-12 bg-background" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t.contact.message}</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="..." 
                          className="min-h-[150px] bg-background resize-none" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full h-12 text-lg font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 transition-all"
                  disabled={isPending}
                >
                  {isPending ? t.contact.sending : t.contact.send}
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}
