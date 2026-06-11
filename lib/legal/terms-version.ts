// =============================================
// Versioning des CGU/CGV
// =============================================
//
// À incrémenter à chaque modification SUBSTANTIELLE des CGU ou des CGV.
// Toute modification de la version force tous les utilisateurs à ré-accepter
// les conditions à leur prochaine connexion (voir middleware /accept-terms).
//
// Format : YYYY-MM-DD (date de la modif). Un incrément alphabétique optionnel
// peut être ajouté en cas de plusieurs modifs le même jour (ex: "2026-06-11.b").
//
// Modifications mineures (typo, reformulation sans changement de sens, etc.) :
// → on garde la même version, on met juste à jour `lastUpdate` sur la page.
//
// Modifications substantielles (nouvelle clause, changement de tarifs, nouveau
// sous-traitant RGPD, nouvelle obligation, etc.) :
// → on bump la version, ce qui force la ré-acceptation.

export const CURRENT_TERMS_VERSION = "2026-06-11";

// Date d'effet de la version actuelle (pour affichage humain)
export const CURRENT_TERMS_DATE = "11 juin 2026";
