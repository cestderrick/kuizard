import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden bg-[var(--color-night)]">
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
        ✨ pour un moment magique
      </p>
    </div>
  );
}
