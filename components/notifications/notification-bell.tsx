import Link from "next/link";

import { auth } from "@/auth";
import { countUnreadForUser } from "@/lib/actions/messages";

/**
 * Cloche de notifs dans la navbar — server component qui calcule le compteur
 * à chaque render. Pour l'instant on agrège juste les messages non lus, mais
 * on pourra ajouter suggestions traitées, paiements récents, etc.
 */
export async function NotificationBell() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const unreadMessages = await countUnreadForUser(session.user.id);
  const total = unreadMessages;

  return (
    <Link
      href="/dashboard/messages"
      className="relative inline-flex items-center justify-center w-9 h-9 rounded-full hover:bg-violet-50 transition"
      aria-label={`${total} notification(s) non lue(s)`}
      title={total > 0 ? `${total} message(s) non lu(s)` : "Aucune notification"}
    >
      <span className="text-xl" aria-hidden>
        🔔
      </span>
      {total > 0 && (
        <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[var(--color-gold)] text-[var(--color-violet-deep)] text-[10px] font-bold flex items-center justify-center">
          {total > 9 ? "9+" : total}
        </span>
      )}
    </Link>
  );
}
