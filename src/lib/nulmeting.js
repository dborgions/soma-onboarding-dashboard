export const SCORE_LABELS = { 1: "Onder verwachting", 2: "Op niveau", 3: "Boven verwachting" };
export const ADVIES_OPTIES = ["ja", "twijfel", "geen match"];

// Bouwplan hoofdstuk 13: onder verwachting = 2, op niveau = 4, boven verwachting = 6 (van de 10).
export function scoreNaarTienpunt(score) {
  if (score === 1) return 2;
  if (score === 2) return 4;
  if (score === 3) return 6;
  return 0;
}

export function isAfgerond(nulmetingMapVoorOnboarder, kerncompetenties) {
  if (kerncompetenties.length === 0) return false;
  let advies = null;
  for (const c of kerncompetenties) {
    const rij = nulmetingMapVoorOnboarder.get(c.id);
    if (!rij || !rij.score) return false;
    if (rij.investeringsadvies) advies = rij.investeringsadvies;
  }
  return Boolean(advies);
}

export function huidigAdvies(nulmetingMapVoorOnboarder) {
  for (const rij of nulmetingMapVoorOnboarder.values()) {
    if (rij.investeringsadvies) return rij.investeringsadvies;
  }
  return null;
}
