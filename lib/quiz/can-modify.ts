// =============================================
// Helper pur — peut-on encore modifier ses réponses ?
// =============================================
// Extrait hors de "use server" car Next 16 exige que tous les exports d'un
// fichier server action soient async. Cette fonction est synchrone et
// déterministe : on la met dans un module helper standard.
//
// Règles :
// - LIVE_MANUAL : une fois completedAt set, plus de modif possible
// - SCHEDULED : on peut modifier tant que now < scheduledCloseAt
// - PUBLISHED (sans mode actif) : on peut tant que pas completedAt

export function canModifyAnswers(
  mode: string,
  status: string,
  completedAt: Date | null,
  scheduledCloseAt: Date | null
): boolean {
  if (status !== "PUBLISHED" && status !== "RUNNING") return false;

  if (mode === "SCHEDULED") {
    if (scheduledCloseAt && new Date() > scheduledCloseAt) return false;
    // V47.20 : une fois soumis (completedAt set), la participation est
    // DÉFINITIVE — plus de modif possible. Le user a 1 chance par créneau.
    if (completedAt !== null) return false;
    return true;
  }

  // LIVE_MANUAL ou autre
  return completedAt === null;
}
