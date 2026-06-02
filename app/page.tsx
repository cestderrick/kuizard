export default function Home() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="max-w-2xl">
        <p className="text-sm tracking-[0.3em] uppercase text-[var(--color-violet-primary)] font-semibold mb-6">
          ✨ Bienvenue ✨
        </p>

        <h1 className="font-display text-6xl md:text-7xl font-bold text-[var(--color-violet-deep)] mb-4 tracking-wide">
          Kuizard
        </h1>

        <p className="text-lg italic text-[var(--color-violet-primary)] mb-8">
          pour un moment magique
        </p>

        <p className="text-base text-[var(--color-foreground)] max-w-md mx-auto leading-relaxed mb-10">
          Créez des quizz personnalisés pour vos événements ou votre bar.
          Partagez en un QR code, pilotez en direct, et offrez à vos invités
          un moment inoubliable.
        </p>

        <div className="inline-block rounded-xl border-2 border-dashed border-[var(--color-violet-light)] px-6 py-4 text-sm text-[var(--color-violet-primary)]">
          🚧 Projet en cours de développement — version{" "}
          <code className="font-mono">0.1.0</code>
        </div>
      </div>
    </main>
  );
}
