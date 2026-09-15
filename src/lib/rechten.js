// Welke bolletjes (1..max) mag deze gebruiker aantikken voor dit onderwerp,
// gegeven het huidige niveau? Spiegelt de RLS-regels uit supabase/schema.sql —
// die database-regels zijn de echte beveiliging, dit is alleen voor de UI.
export function magTikken(gebruiker, onderwerp, huidigeNiveau, n) {
  if (gebruiker.rol === "mentor" || gebruiker.rol === "vm") {
    return n <= onderwerp.max_niveau;
  }
  if (gebruiker.rol === "medewerker") {
    if (onderwerp.training_verplicht) return false;
    if (huidigeNiveau > 1) return false; // VM/mentor heeft het al overgenomen
    return n === 1;
  }
  return false;
}

// Bevestiging met toetscriteria nodig? Alleen bij een omhoog-tik naar stap 3 of 4,
// en alleen als er voor dat niveau criteria zijn ingevuld (bouwplan 7.3).
export function heeftBevestigingNodig(onderwerp, huidigeNiveau, nieuweNiveau) {
  if (nieuweNiveau <= huidigeNiveau) return false;
  if (nieuweNiveau === 3) return !!onderwerp.criterium_3;
  if (nieuweNiveau === 4) return !!onderwerp.criterium_4;
  return false;
}
