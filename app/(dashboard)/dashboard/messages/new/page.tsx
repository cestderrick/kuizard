import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { NewConversationForm } from "@/components/messages/new-conversation-form";

export const metadata: Metadata = {
  title: "Nouveau message",
};

export default async function NewMessagePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?from=/dashboard/messages/new");

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div>
        <Link
          href="/dashboard/messages"
          className="text-sm text-[var(--color-violet-primary)] hover:underline"
        >
          ← Mes messages
        </Link>
      </div>

      <header>
        <h1
          className="font-display text-3xl md:text-4xl font-bold tracking-wide"
          style={{ color: "var(--color-violet-deep)" }}
        >
          ✉️ Nouveau message
        </h1>
        <p className="mt-2 text-muted-foreground text-sm">
          On lit tout et on te répond rapidement.
        </p>
      </header>

      <NewConversationForm />
    </div>
  );
}
