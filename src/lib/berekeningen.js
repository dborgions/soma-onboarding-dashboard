// Werkdagen (ma–vr) tussen startdatum en vandaag, startdatum zelf telt als dag 1.
// Zelfde logica als de SQL-functie bereken_programmadag in supabase/schema.sql.
export function programmadag(startdatum) {
  const start = new Date(startdatum + "T00:00:00");
  const vandaag = new Date();
  vandaag.setHours(0, 0, 0, 0);
  let dag = 0;
  const cursor = new Date(start);
  while (cursor <= vandaag) {
    const dow = cursor.getDay(); // 0 = zondag, 6 = zaterdag
    if (dow !== 0 && dow !== 6) dag++;
    cursor.setDate(cursor.getDate() + 1);
  }
  return Math.max(dag, 0);
}

// Percentage kennis of vaardigheden: som van de behaalde niveaus gedeeld door
// de som van de maximumniveaus van de onderwerpen van dat type (bouwplan 7.2).
export function percentageVoorType(niveauStandVoorOnboarder, onderwerpen, type) {
  const items = onderwerpen.filter((o) => o.type === type);
  const behaald = items.reduce((som, o) => som + (niveauStandVoorOnboarder.get(o.id) || 0), 0);
  const maximaal = items.reduce((som, o) => som + o.max_niveau, 0);
  if (maximaal === 0) return 0;
  return Math.round((behaald / maximaal) * 100);
}

// Percentage gevoerde specialistgesprekken t.o.v. het totaal aantal koppelingen (bouwplan 7.2).
export function percentageGesprekken(gesprekkenVoorOnboarder, totaalKoppelingen) {
  if (totaalKoppelingen === 0) return 0;
  const gevoerd = gesprekkenVoorOnboarder.filter((g) => g.status === "gevoerd").length;
  return Math.round((gevoerd / totaalKoppelingen) * 100);
}

// ISO 8601 weeknummer (maandag t/m zondag), zoals gebruikelijk bij weekcijfers.
export function isoWeek(datum) {
  const d = new Date(Date.UTC(datum.getFullYear(), datum.getMonth(), datum.getDate()));
  const dagNr = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dagNr);
  const jaarStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weeknummer = Math.ceil(((d - jaarStart) / 86400000 + 1) / 7);
  return { jaar: d.getUTCFullYear(), weeknummer };
}

export function huidigeWeek() {
  return isoWeek(new Date());
}

// Vrijdag is de dag van het OB-gesprek: dan heet de knop "Week afsluiten" (bouwplan 12).
export function isVrijdag() {
  return new Date().getDay() === 5;
}
