import { Resend } from 'resend';

let connectionSettings: any;

async function getCredentials() {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=resend',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  if (!connectionSettings || (!connectionSettings.settings.api_key)) {
    throw new Error('Resend not connected');
  }
  return { apiKey: connectionSettings.settings.api_key, fromEmail: connectionSettings.settings.from_email };
}

async function getUncachableResendClient() {
  const { apiKey, fromEmail } = await getCredentials();
  return {
    client: new Resend(apiKey),
    fromEmail
  };
}

interface ReservationEmailData {
  guestName: string;
  guestEmail: string;
  propertyName: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  guests: number;
  confirmationCode: string;
  subtotal: number;
  serviceFee: number;
  cleaningFee: number;
  taxes: number;
  discountAmount?: number;
  couponCode?: string;
  total: number;
  language: 'fr' | 'en' | 'es';
  siteName?: string;
  siteUrl?: string;
}

const translations = {
  fr: {
    subject: 'Confirmation de réservation',
    greeting: 'Bonjour',
    thankYou: 'Merci pour votre réservation!',
    confirmationCode: 'Code de confirmation',
    propertyDetails: 'Détails de la propriété',
    property: 'Propriété',
    checkIn: 'Arrivée',
    checkOut: 'Départ',
    nights: 'nuits',
    guests: 'voyageurs',
    priceDetails: 'Détails du prix',
    nightsTotal: 'nuits',
    serviceFee: 'Frais de service',
    cleaningFee: 'Frais de ménage',
    taxes: 'Taxes',
    discount: 'Rabais',
    total: 'Total',
    footer: 'À bientôt!',
    team: "L'équipe QUEBEXICO"
  },
  en: {
    subject: 'Booking Confirmation',
    greeting: 'Hello',
    thankYou: 'Thank you for your reservation!',
    confirmationCode: 'Confirmation Code',
    propertyDetails: 'Property Details',
    property: 'Property',
    checkIn: 'Check-in',
    checkOut: 'Check-out',
    nights: 'nights',
    guests: 'guests',
    priceDetails: 'Price Details',
    nightsTotal: 'nights',
    serviceFee: 'Service fee',
    cleaningFee: 'Cleaning fee',
    taxes: 'Taxes',
    discount: 'Discount',
    total: 'Total',
    footer: 'See you soon!',
    team: 'The QUEBEXICO Team'
  },
  es: {
    subject: 'Confirmación de reserva',
    greeting: 'Hola',
    thankYou: '¡Gracias por tu reserva!',
    confirmationCode: 'Código de confirmación',
    propertyDetails: 'Detalles de la propiedad',
    property: 'Propiedad',
    checkIn: 'Llegada',
    checkOut: 'Salida',
    nights: 'noches',
    guests: 'huéspedes',
    priceDetails: 'Detalles del precio',
    nightsTotal: 'noches',
    serviceFee: 'Tarifa de servicio',
    cleaningFee: 'Tarifa de limpieza',
    taxes: 'Impuestos',
    discount: 'Descuento',
    total: 'Total',
    footer: '¡Hasta pronto!',
    team: 'El equipo QUEBEXICO'
  }
};

function generateReservationEmailHtml(data: ReservationEmailData): string {
  const t = translations[data.language];
  const siteName = data.siteName || 'QUEBEXICO';
  const teamName = data.siteName ? `${data.siteName}` : t.team;
  
  const discountRow = data.discountAmount && data.discountAmount > 0 
    ? `<tr>
        <td style="padding: 8px 0; color: #059669;">${t.discount} (${data.couponCode})</td>
        <td style="padding: 8px 0; text-align: right; color: #059669;">-${data.discountAmount}$</td>
      </tr>`
    : '';

  const siteLink = data.siteUrl 
    ? `<a href="${data.siteUrl}" style="color: white; text-decoration: none;">${siteName}</a>`
    : siteName;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f4f4f5;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
      <div style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 32px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">${siteLink}</h1>
      </div>
      
      <div style="padding: 32px;">
        <h2 style="color: #18181b; margin: 0 0 8px 0; font-size: 24px;">${t.greeting} ${data.guestName},</h2>
        <p style="color: #52525b; margin: 0 0 24px 0; font-size: 16px;">${t.thankYou}</p>
        
        <div style="background-color: #dbeafe; border-radius: 8px; padding: 16px; margin-bottom: 24px; text-align: center;">
          <p style="color: #1e40af; margin: 0 0 4px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">${t.confirmationCode}</p>
          <p style="color: #1e40af; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: 2px;">${data.confirmationCode}</p>
        </div>
        
        <div style="margin-bottom: 24px;">
          <h3 style="color: #18181b; margin: 0 0 16px 0; font-size: 18px; border-bottom: 1px solid #e4e4e7; padding-bottom: 8px;">${t.propertyDetails}</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #71717a;">${t.property}</td>
              <td style="padding: 8px 0; text-align: right; color: #18181b; font-weight: 500;">${data.propertyName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #71717a;">${t.checkIn}</td>
              <td style="padding: 8px 0; text-align: right; color: #18181b; font-weight: 500;">${data.checkIn}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #71717a;">${t.checkOut}</td>
              <td style="padding: 8px 0; text-align: right; color: #18181b; font-weight: 500;">${data.checkOut}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #71717a;">${data.nights} ${t.nights}</td>
              <td style="padding: 8px 0; text-align: right; color: #18181b; font-weight: 500;">${data.guests} ${t.guests}</td>
            </tr>
          </table>
        </div>
        
        <div style="margin-bottom: 24px;">
          <h3 style="color: #18181b; margin: 0 0 16px 0; font-size: 18px; border-bottom: 1px solid #e4e4e7; padding-bottom: 8px;">${t.priceDetails}</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #71717a;">${data.nights} ${t.nightsTotal}</td>
              <td style="padding: 8px 0; text-align: right; color: #18181b;">${data.subtotal}$</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #71717a;">${t.serviceFee}</td>
              <td style="padding: 8px 0; text-align: right; color: #18181b;">${data.serviceFee}$</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #71717a;">${t.cleaningFee}</td>
              <td style="padding: 8px 0; text-align: right; color: #18181b;">${data.cleaningFee}$</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #71717a;">${t.taxes}</td>
              <td style="padding: 8px 0; text-align: right; color: #18181b;">${data.taxes}$</td>
            </tr>
            ${discountRow}
            <tr style="border-top: 2px solid #e4e4e7;">
              <td style="padding: 16px 0 0 0; color: #18181b; font-size: 18px; font-weight: 700;">${t.total}</td>
              <td style="padding: 16px 0 0 0; text-align: right; color: #18181b; font-size: 18px; font-weight: 700;">${data.total}$</td>
            </tr>
          </table>
        </div>
        
        <p style="color: #52525b; margin: 24px 0 0 0; font-size: 16px;">${t.footer}</p>
        <p style="color: #18181b; margin: 8px 0 0 0; font-size: 16px; font-weight: 600;">${teamName}</p>
      </div>
    </div>
  </div>
</body>
</html>`;
}

const SUPPORTED_LANGUAGES: Array<'fr' | 'en' | 'es'> = ['fr', 'en', 'es'];

function validateLanguage(lang: string): 'fr' | 'en' | 'es' {
  const normalized = lang.toLowerCase().substring(0, 2) as 'fr' | 'en' | 'es';
  return SUPPORTED_LANGUAGES.includes(normalized) ? normalized : 'fr';
}

export async function sendReservationConfirmation(data: ReservationEmailData): Promise<{ success: boolean; error?: string }> {
  try {
    const { client, fromEmail } = await getUncachableResendClient();
    const validatedLanguage = validateLanguage(data.language);
    const t = translations[validatedLanguage];
    
    const emailData = { ...data, language: validatedLanguage };
    const { error } = await client.emails.send({
      from: fromEmail || 'QUEBEXICO <noreply@resend.dev>',
      to: data.guestEmail,
      subject: `${t.subject} - ${data.confirmationCode}`,
      html: generateReservationEmailHtml(emailData),
    });

    if (error) {
      console.error('Resend error:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Email sending failed:', error);
    return { success: false, error: error.message || 'Email sending failed' };
  }
}
