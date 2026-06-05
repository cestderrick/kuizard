// =============================================
// Broadcaster SSE en mémoire (par quizId)
// =============================================
// Stocke les contrôleurs des connexions SSE actives par quizz.
// Permet de notifier tous les joueurs dès que l'admin change l'état.
//
// ⚠️ Limitation : en mémoire = perdu au redémarrage du process. Avec un seul
// process PM2 c'est OK (les clients reconnectent et reçoivent l'état actuel).
// Si on passe à plusieurs instances, il faudra Redis pub/sub.

type SubscriberId = number;

type Subscriber = {
  id: SubscriberId;
  send: (data: string) => void;
};

const subsByQuizId = new Map<string, Map<SubscriberId, Subscriber>>();
let nextId = 1;

export function subscribe(
  quizId: string,
  send: (data: string) => void
): { id: SubscriberId; unsubscribe: () => void } {
  let bucket = subsByQuizId.get(quizId);
  if (!bucket) {
    bucket = new Map();
    subsByQuizId.set(quizId, bucket);
  }
  const id = nextId++;
  bucket.set(id, { id, send });

  return {
    id,
    unsubscribe: () => {
      const b = subsByQuizId.get(quizId);
      if (b) {
        b.delete(id);
        if (b.size === 0) subsByQuizId.delete(quizId);
      }
    },
  };
}

export function broadcast(quizId: string, event: unknown): void {
  const bucket = subsByQuizId.get(quizId);
  if (!bucket) return;
  const payload = `data: ${JSON.stringify(event)}\n\n`;
  for (const sub of bucket.values()) {
    try {
      sub.send(payload);
    } catch {
      // Connexion morte, on l'ignore — Next nettoiera via le abort.
    }
  }
}

export function activeSubscriberCount(quizId: string): number {
  return subsByQuizId.get(quizId)?.size ?? 0;
}
