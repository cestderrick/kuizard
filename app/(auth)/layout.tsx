import Link from "next/link";
import { KuizardLogo } from "@/components/brand/kuizard-logo";
import { TopLocaleBar } from "@/components/i18n/top-locale-bar";
import { getMessages } from "@/lib/i18n/get-locale";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const messages = await getMessages();
  const t = messages.home;
  const f = messages.footer;
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden bg-[var(--color-night)]">
      <TopLocaleBar variant="night" />

      {/* Halos décoratifs (subtils, comme dans la charte) */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 -left-32 w-[420px] h-[420px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(124, 58, 237, 0.45) 0%, transparent 70%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 -right-24 w-[420px] h-[420px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(217, 70, 239, 0.30) 0%, transparent 70%)",
        }}
      />

      {/* Logo en haut */}
      <Link
        href="/"
        className="mb-8 inline-flex items-center gap-3 text-white"
      >
        <KuizardLogo size={48} />
        <span
          className="font-display text-3xl font-bold tracking-[3px]"
          style={{ color: "var(--color-lavender)" }}
        >
          Kuizard
        </span>
      </Link>

      {/* Carte de contenu */}
      <main className="relative z-10 w-full max-w-md">{children}</main>

      {/* Baseline */}
      <p
        className="relative z-10 mt-6 text-sm italic"
        style={{ color: "var(--color-lavender-2)", opacity: 0.85 }}
      >
        {t.tagline_short ?? "✨ pour un moment magique"}
      </p>

      {/* Liens légaux compacts */}
      <nav
        className="relative z-10 mt-8 flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs"
        style={{ color: "var(--color-lavender-2)", opacity: 0.7 }}
      >
        <Link href="/mentions-legales" className="hover:opacity-100">
          {f.legal}
        </Link>
        <Link href="/cgu" className="hover:opacity-100">
          {f.cgu}
        </Link>
        <Link href="/cgv" className="hover:opacity-100">
          {f.cgv}
        </Link>
        <Link href="/confidentialite" className="hover:opacity-100">
          {f.privacy}
        </Link>
        <Link href="/cookies" className="hover:opacity-100">
          {f.cookies}
        </Link>
      </nav>
    </div>
  );
}
