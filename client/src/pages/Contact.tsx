import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertMessageSchema } from "@shared/schema";
import { useCreateMessage } from "@/hooks/use-messages";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Clock, Video, Calendar } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "wouter";

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
      <div className="container-padding max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">{t.contact.title}</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t.contact.subtitle}
          </p>
        </div>

        {/* Two columns: Contact Form + Booking */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Contact Form */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-full bg-primary/10 text-primary">
                  <Mail className="w-5 h-5" />
                </div>
                <CardTitle>{t.contact.send}</CardTitle>
              </div>
              <CardDescription>salut@quebexico.co</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t.contact.name}</FormLabel>
                        <FormControl>
                          <Input placeholder="Jean Dupont" className="bg-background" {...field} />
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
                          <Input type="email" placeholder="jean@exemple.com" className="bg-background" {...field} />
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
                            className="min-h-[120px] bg-background resize-none" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={isPending}
                    data-testid="button-send-message"
                  >
                    {isPending ? t.contact.sending : t.contact.send}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Booking Options */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-full bg-primary/10 text-primary">
                  <Calendar className="w-5 h-5" />
                </div>
                <CardTitle>{t.booking.title}</CardTitle>
              </div>
              <CardDescription>{t.booking.subtitle}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              
              {/* Discovery Call */}
              <div className="p-4 rounded-lg border bg-background">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-full bg-muted">
                    <Video className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{t.booking.discovery.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{t.booking.discovery.desc}</p>
                    <Link href="/book/discovery">
                      <Button variant="outline" size="sm" data-testid="button-book-discovery">
                        {t.booking.discovery.cta}
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Expert Consultation */}
              <div className="p-4 rounded-lg border border-primary bg-primary/5">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-full bg-primary/10 text-primary">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{t.booking.expert.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{t.booking.expert.desc}</p>
                    <Link href="/book/expert">
                      <Button size="sm" data-testid="button-book-expert">
                        {t.booking.expert.cta}
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>

            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
