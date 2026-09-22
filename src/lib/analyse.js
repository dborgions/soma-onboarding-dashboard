// De 100-dagenanalyse (bouwplan hoofdstuk 16). Alles op dit document komt uit het
// systeem zelf, dus hier wordt alleen samengesteld — er wordt niets nieuws bedacht
// en niemand hoeft iets over te typen.
import { programmadag, percentageVoorFase } from "./berekeningen.js";
import { scoreNaarTienpunt, SCORE_LABELS } from "./nulmeting.js";

export const CIJFERVELDEN = [
  { key: "intakes", label: "Intakes" },
  { key: "voorstelacties", label: "Voorstelacties (3.1)" },
  { key: "gesprekken", label: "Gesprekken (4.1)" },
  { key: "plaatsingen", label: "Plaatsingen (5.1)" },
  { key: "gestopten", label: "Gestopten" },
];

// De conversiestappen van de funnel; gestopten horen daar niet in thuis.
const FUNNELSTAPPEN = ["intakes", "voorstelacties", "gesprekken", "plaatsingen"];

// Vanaf dag 90 kan de VM de analyse openen, zodat hij zich kan voorbereiden.
export const ANALYSE_VANAF_DAG = 90;

export function magAnalyseOpenen(onboarder) {
  return programmadag(onboarder.startdatum) >= ANALYSE_VANAF_DAG || onboarder.status !== "actief";
}

export function bouwAnalyse({
  onboarder,
  onderwerpen,
  standMap,
  niveauLabels,
  fasen,
  weekcijfersMap,
  gesprekkenLijst,
  kerncompetenties,
  specialisten,
  koppelingen,
  nulmetingMap,
  logboekLijst,
}) {
  const specialistNaam = new Map(specialisten.map((s) => [s.id, s.naam]));

  // Voortgang per fase: het percentage, wat op "beheerst" staat en wat niet af is.
  const fasenVoortgang = fasen
    .map((fase) => {
      const items = onderwerpen.filter((o) => o.fase_id === fase.id);
      if (items.length === 0) return null;
      const beheerst = [];
      const nogNiet = [];
      for (const o of items) {
        const niveau = standMap.get(o.id) || 0;
        if (niveau >= o.max_niveau) beheerst.push(o.naam);
        else nogNiet.push({ naam: o.naam, label: niveauLabels.get(niveau) || "Nog niet gestart" });
      }
      return { fase, percentage: percentageVoorFase(standMap, onderwerpen, fase.id), beheerst, nogNiet };
    })
    .filter(Boolean);

  // Groei sinds dag 30: de nulmeting per kerncompetentie, met daarnaast wat hij
  // er sindsdien aan gedaan heeft — zijn specialistgesprekken voor die competentie.
  const competenties = kerncompetenties.map((c) => {
    const rij = nulmetingMap.get(c.id);
    const specialistIds = koppelingen.filter((k) => k.competentie_id === c.id).map((k) => k.specialist_id);
    const gevoerd = gesprekkenLijst.filter((g) => g.competentie_id === c.id && g.status === "gevoerd");
    return {
      naam: c.naam,
      score: rij?.score ?? null,
      tienpunt: rij?.score ? scoreNaarTienpunt(rij.score) : null,
      scoreLabel: rij?.score ? SCORE_LABELS[rij.score] : null,
      notitie: rij?.notitie || "",
      gesprekkenGevoerd: gevoerd.length,
      gesprekkenTotaal: specialistIds.length,
      gesprekspartners: gevoerd.map((g) => specialistNaam.get(g.specialist_id) || "?"),
    };
  });
  const investeringsadvies = [...nulmetingMap.values()].find((r) => r.investeringsadvies)?.investeringsadvies || null;

  // Zijn cijfers over de hele periode, met het weekgemiddelde en de conversie per stap.
  const weken = [...weekcijfersMap.values()];
  const totalen = {};
  for (const veld of CIJFERVELDEN) {
    totalen[veld.key] = weken.reduce((som, w) => som + (w[veld.key] || 0), 0);
  }
  const gemiddelden = {};
  for (const veld of CIJFERVELDEN) {
    gemiddelden[veld.key] = weken.length === 0 ? 0 : totalen[veld.key] / weken.length;
  }
  const conversie = FUNNELSTAPPEN.slice(1).map((key, i) => {
    const vorigeKey = FUNNELSTAPPEN[i];
    const vorige = totalen[vorigeKey];
    return {
      van: vorigeKey,
      naar: key,
      percentage: vorige > 0 ? Math.round((totalen[key] / vorige) * 100) : null,
    };
  });

  // Specialistgesprekken: met wie hij heeft gesproken en over welke competentie.
  const competentieNaam = new Map(kerncompetenties.map((c) => [c.id, c.naam]));
  const gesprekken = gesprekkenLijst
    .filter((g) => g.status === "gevoerd")
    .map((g) => ({
      competentie: competentieNaam.get(g.competentie_id) || "?",
      specialist: specialistNaam.get(g.specialist_id) || "?",
      programmadag: g.programmadag,
    }))
    .sort((a, b) => a.programmadag - b.programmadag);

  // Uit het logboek: wanneer hij welke stap zette, oplopend, zodat de leercurve zichtbaar is.
  const leercurve = [...logboekLijst].sort((a, b) => new Date(a.tijdstip) - new Date(b.tijdstip));

  return {
    dag: programmadag(onboarder.startdatum),
    fasenVoortgang,
    competenties,
    investeringsadvies,
    cijfers: { totalen, gemiddelden, conversie, aantalWeken: weken.length },
    gesprekken,
    leercurve,
  };
}
