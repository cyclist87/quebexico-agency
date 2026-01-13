import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, User, Mail, Phone, Users, MessageSquare } from "lucide-react";
import { GuestInfoSchema, type GuestInfo } from "@shared/hostpro";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface BookingFormProps {
  onSubmit: (data: GuestInfo) => void;
  isLoading?: boolean;
  isInstantBooking?: boolean;
  maxGuests?: number;
}

export function BookingForm({
  onSubmit,
  isLoading,
  isInstantBooking = true,
  maxGuests = 10,
}: BookingFormProps) {
  const form = useForm<GuestInfo>({
    resolver: zodResolver(GuestInfoSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      guests: 2,
      message: "",
    },
  });

  return (
    <div data-testid="card-booking-form" className="space-y-4">
      <h3 className="font-semibold flex items-center gap-2">
        <User className="h-4 w-4" />
        Vos informations
      </h3>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prénom</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Jean"
                        {...field}
                        data-testid="input-first-name"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Tremblay"
                        {...field}
                        data-testid="input-last-name"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    Courriel
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="jean@exemple.com"
                      {...field}
                      data-testid="input-email"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    Téléphone
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      placeholder="418-555-1234"
                      {...field}
                      data-testid="input-phone"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="guests"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    Nombre d'invités
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      max={maxGuests}
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                      data-testid="input-guests"
                    />
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
                  <FormLabel className="flex items-center gap-1">
                    <MessageSquare className="h-3 w-3" />
                    Message (optionnel)
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Questions ou demandes spéciales..."
                      className="resize-none"
                      rows={3}
                      {...field}
                      data-testid="input-message"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={isLoading}
            data-testid="button-submit-booking"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Envoi en cours...
              </>
            ) : isInstantBooking ? (
              "Réserver maintenant"
            ) : (
              "Envoyer la demande"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
