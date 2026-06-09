import type { Metadata } from "next";
import { Cinzel, Plus_Jakarta_Sans, Geist } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";
import { CookieBanner } from "@/components/legal/cookie-banner";
import { getLocale } from "@/lib/i18n/get-locale";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["400", "600", "700", "900"],
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://kuizard.com";

export const metadata: Metadata = {
  title: {
    default: "Kuizard — pour un moment magique",
    template: "%s · Kuizard",
  },
  description:
    "Créez des quizz personnalisés pour vos événements (mariage, anniversaire, EVJF…) ou votre bar. Partagez en un QR code, pilotez en direct.",
  metadataBase: new URL(BASE_URL),
  // OG / Twitter / canonical
  openGraph: {
    title: "Kuizard — Quizz magiques pour tes évènements",
    description:
      "Crée un quizz personnalisé pour ton mariage, anniversaire, EVJF, bar… Partage en un QR code, classement en direct.",
    url: BASE_URL,
    siteName: "Kuizard",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "Kuizard — pour un moment magique",
      },
    ],
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kuizard — Quizz magiques",
    description:
      "Crée un quizz personnalisé pour ton évènement. Partage en un QR code.",
    images: ["/og-image.svg"],
  },
  alternates: {
    canonical: BASE_URL,
    languages: {
      fr: BASE_URL,
      en: BASE_URL,
      es: BASE_URL,
      it: BASE_URL,
      de: BASE_URL,
      pt: BASE_URL,
      ru: BASE_URL,
      zh: BASE_URL,
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Locale dynamique pour l'attribut <html lang="...">
  const locale = await getLocale();
  return (
    <html
      lang={locale}
      className={cn("h-full", "antialiased", cinzel.variable, jakarta.variable, "font-sans", geist.variable)}
    >
      <body className="min-h-full flex flex-col font-sans">
        {children}
        <Toaster
          position="top-center"
          richColors
          toastOptions={{
            classNames: {
              success: "bg-green-50 text-green-900 border-green-200",
            },
          }}
        />
        <CookieBanner />
      </body>
    </html>
  );
}
