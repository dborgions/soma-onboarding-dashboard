import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import { C } from "./theme";
import Overzicht from "./Overzicht.jsx";
import Detail from "./Detail.jsx";
import { programmadag, huidigeWeek } from "./lib/berekeningen.js";
import { isAfgerond, huidigAdvies } from "./lib/nulmeting.js";

export default function Dashboard({ gebruiker }) {
  const [laden, setLaden] = useState(true);
  const [fout, setFout] = useState("");
  const [onboarders, setOnboarders] = useState([]);
  const [onderwerpen, setOnderwerpen] = useState([]);
  const [niveauStand, setNiveauStand] = useState(new Map()); // onboarder_id -> Map(onderwerp_id -> niveau)
  const [gesprekken, setGesprekken] = useState(new Map()); // onboarder_id -> [gesprek, ...]
  const [totaalKoppelingen, setTotaalKoppelingen] = useState(0);
  const [mijlpalen, setMijlpalen] = useState([]);
  const [fasen, setFasen] = useState([]);
  const [weekcijfers, setWeekcijfers] = useState(new Map()); // onboarder_id -> Map("jaar-week" -> rij)
  const [weeknotities, setWeeknotities] = useState(new Map()); // onboarder_id -> [notitie, ...]
  const [kerncompetenties, setKerncompetenties] = useState([]);
  const [specialisten, setSpecialisten] = useState([]);
  const [koppelingen, setKoppelingen] = useState([]);
  const [indicatoren, setIndicatoren] = useState([]);
  const [nulmeting, setNulmeting] = useState(new Map()); // onboarder_id -> Map(competentie_id -> rij)
  const [nulmetingIndicatoren, setNulmetingIndicatoren] = useState(new Map()); // onboarder_id -> Set("competentieId-nr")
  const [niveauLabels, setNiveauLabels] = useState(new Map());
  const [opmerkingen, setOpmerkingen] = useState(new Map()); // onboarder_id -> [opmerking, ...]
  const [logboek, setLogboek] = useState(new Map()); // onboarder_id -> [logregel, ...]
  const [gebruikersNaam, setGebruikersNaam] = useState(new Map()); // gebruiker_id -> naam
  const [geselecteerd, setGeselecteerd] = useState(null);

  useEffect(() => {
    laadAlles();
  }, []);

  // Wijzigingen in niveau_stand direct zichtbaar bij alle ingelogde gebruikers (bouwplan hoofdstuk 2).
  useEffect(() => {
    const channel = supabase
      .channel("niveau_stand_realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "niveau_stand" }, (payload) => {
        const rij = payload.new;
        if (!rij) return;
        setNiveauStand((huidig) => {
          const kopie = new Map(huidig);
          const perOnboarder = new Map(kopie.get(rij.onboarder_id) || []);
          perOnboarder.set(rij.onderwerp_id, rij.niveau);
          kopie.set(rij.onboarder_id, perOnboarder);
          return kopie;
        });
      })
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, []);

  async function laadAlles() {
    setLaden(true);
    setFout("");
    const [
      { data: onboardersData, error: eOnboarders },
      { data: onderwerpenData, error: eOnderwerpen },
      { data: standData, error: eStand },
      { data: gesprekkenData, error: eGesprekken },
      { data: koppelingenData, error: eKoppelingen },
      { data: mijlpalenData, error: eMijlpalen },
      { data: labelsData, error: eLabels },
      { data: opmerkingenData, error: eOpmerkingen },
      { data: logboekData, error: eLogboek },
      { data: gebruikersData, error: eGebruikers },
      { data: fasenData, error: eFasen },
      { data: weekcijfersData, error: eWeekcijfers },
      { data: weeknotitiesData, error: eWeeknotities },
      { data: kerncompetentiesData, error: eKerncompetenties },
      { data: specialistenData, error: eSpecialisten },
      { data: indicatorenData, error: eIndicatoren },
      { data: nulmetingData, error: eNulmeting },
      { data: nulmetingIndicatorenData, error: eNulmetingIndicatoren },
    ] = await Promise.all([
      supabase.from("onboarders").select("id, naam, startdatum, programma_dagen, vestiging_id, vestigingen(naam)").eq("actief", true),
      supabase.from("onderwerpen").select("*").eq("actief", true).order("volgorde"),
      supabase.from("niveau_stand").select("onboarder_id, onderwerp_id, niveau"),
      supabase.from("specialist_gesprekken").select("*"),
      supabase.from("competentie_specialisten").select("competentie_id, specialist_id"),
      supabase.from("mijlpalen").select("id, naam, dag").order("dag"),
      supabase.from("niveau_labels").select("niveau, label"),
      supabase.from("opmerkingen").select("*").order("tijdstip"),
      supabase.from("logboek").select("*"),
      supabase.from("gebruikers").select("id, naam"),
      supabase.from("fasen").select("id, label, sub, kleur").order("volgorde"),
      supabase.from("weekcijfers").select("*"),
      supabase.from("weeknotities").select("*").order("jaar").order("weeknummer"),
      supabase.from("kerncompetenties").select("id, naam, volgorde").order("volgorde"),
      supabase.from("specialisten").select("id, naam"),
      supabase.from("indicatoren").select("competentie_id, nr, tekst"),
      supabase.from("nulmeting").select("*"),
      supabase.from("nulmeting_indicatoren").select("*"),
    ]);

    const eerste = eOnboarders || eOnderwerpen || eStand || eGesprekken || eKoppelingen || eMijlpalen || eLabels || eOpmerkingen || eLogboek || eGebruikers || eFasen || eWeekcijfers || eWeeknotities || eKerncompetenties || eSpecialisten || eIndicatoren || eNulmeting || eNulmetingIndicatoren;
    if (eerste) {
      setFout("Het laden van de gegevens is niet gelukt: " + eerste.message);
      setLaden(false);
      return;
    }

    setOnboarders(onboardersData);
    setOnderwerpen(onderwerpenData);
    setNiveauStand(groepeerPerOnboarder(standData, (r) => r.onderwerp_id, (r) => r.niveau));
    setGesprekken(groepeerLijstPerOnboarder(gesprekkenData));
    setTotaalKoppelingen(koppelingenData?.length ?? 0);
    setMijlpalen(mijlpalenData);
    setNiveauLabels(new Map(labelsData.map((l) => [l.niveau, l.label])));
    setOpmerkingen(groepeerLijstPerOnboarder(opmerkingenData));
    setLogboek(groepeerLijstPerOnboarder(logboekData));
    setGebruikersNaam(new Map(gebruikersData.map((g) => [g.id, g.naam])));
    setFasen(fasenData);
    setWeekcijfers(groepeerPerOnboarder(weekcijfersData, (r) => `${r.jaar}-${r.weeknummer}`, (r) => r));
    setWeeknotities(groepeerLijstPerOnboarder(weeknotitiesData));
    setKerncompetenties(kerncompetentiesData);
    setSpecialisten(specialistenData);
    setKoppelingen(koppelingenData);
    setIndicatoren(indicatorenData);
    setNulmeting(groepeerPerOnboarder(nulmetingData, (r) => r.competentie_id, (r) => r));
    const nmiMap = new Map();
    for (const r of nulmetingIndicatorenData) {
      if (!nmiMap.has(r.onboarder_id)) nmiMap.set(r.onboarder_id, new Set());
      nmiMap.get(r.onboarder_id).add(`${r.competentie_id}-${r.indicator_nr}`);
    }
    setNulmetingIndicatoren(nmiMap);
    setLaden(false);
  }

  function groepeerPerOnboarder(rijen, sleutelFn, waardeFn) {
    const map = new Map();
    for (const rij of rijen) {
      if (!map.has(rij.onboarder_id)) map.set(rij.onboarder_id, new Map());
      map.get(rij.onboarder_id).set(sleutelFn(rij), waardeFn(rij));
    }
    return map;
  }

  function groepeerLijstPerOnboarder(rijen) {
    const map = new Map();
    for (const rij of rijen) {
      if (!map.has(rij.onboarder_id)) map.set(rij.onboarder_id, []);
      map.get(rij.onboarder_id).push(rij);
    }
    return map;
  }

  async function updateNiveau(onboarderId, onderwerpId, nieuweNiveau) {
    const { error } = await supabase
      .from("niveau_stand")
      .update({ niveau: nieuweNiveau, bijgewerkt_door: gebruiker.id })
      .eq("onboarder_id", onboarderId)
      .eq("onderwerp_id", onderwerpId);
    if (error) return { ok: false, fout: error.message };
    setNiveauStand((huidig) => {
      const kopie = new Map(huidig);
      const perOnboarder = new Map(kopie.get(onboarderId) || []);
      perOnboarder.set(onderwerpId, nieuweNiveau);
      kopie.set(onboarderId, perOnboarder);
      return kopie;
    });
    return { ok: true };
  }

  async function undoNiveau(onboarderId, onderwerpId, terugNaar) {
    const { error } = await supabase.rpc("undo_niveau_wijziging", {
      p_onboarder_id: onboarderId,
      p_onderwerp_id: onderwerpId,
      p_terug_naar: terugNaar,
    });
    if (error) return { ok: false, fout: error.message };
    setNiveauStand((huidig) => {
      const kopie = new Map(huidig);
      const perOnboarder = new Map(kopie.get(onboarderId) || []);
      perOnboarder.set(onderwerpId, terugNaar);
      kopie.set(onboarderId, perOnboarder);
      return kopie;
    });
    setLogboek((huidig) => {
      const kopie = new Map(huidig);
      const lijst = (kopie.get(onboarderId) || []).filter(
        (r) => !(r.onderwerp_id === onderwerpId && r.door_gebruiker === gebruiker.id && Date.now() - new Date(r.tijdstip).getTime() < 30000)
      );
      kopie.set(onboarderId, lijst);
      return kopie;
    });
    return { ok: true };
  }

  async function voegOpmerkingToe(onboarder, onderwerpId, tekst) {
    const dag = programmadag(onboarder.startdatum);
    const { data, error } = await supabase
      .from("opmerkingen")
      .insert({ onboarder_id: onboarder.id, onderwerp_id: onderwerpId, door_gebruiker: gebruiker.id, programmadag: dag, tekst })
      .select()
      .single();
    if (error) return { ok: false, fout: error.message };
    setOpmerkingen((huidig) => {
      const kopie = new Map(huidig);
      kopie.set(onboarder.id, [...(kopie.get(onboarder.id) || []), data]);
      return kopie;
    });
    return { ok: true };
  }

  async function slaWeekcijfersOp(onboarderId, waarden) {
    const { jaar, weeknummer } = huidigeWeek();
    const { error } = await supabase
      .from("weekcijfers")
      .upsert({ onboarder_id: onboarderId, jaar, weeknummer, ...waarden, ingevuld_door: gebruiker.id, tijdstip: new Date().toISOString() });
    if (error) return { ok: false, fout: error.message };
    setWeekcijfers((huidig) => {
      const kopie = new Map(huidig);
      const perOnboarder = new Map(kopie.get(onboarderId) || []);
      perOnboarder.set(`${jaar}-${weeknummer}`, { onboarder_id: onboarderId, jaar, weeknummer, ...waarden });
      kopie.set(onboarderId, perOnboarder);
      return kopie;
    });
    return { ok: true };
  }

  async function slaWeeknotitieOp(onboarderId, tekst) {
    const { jaar, weeknummer } = huidigeWeek();
    const { error } = await supabase
      .from("weeknotities")
      .upsert({ onboarder_id: onboarderId, jaar, weeknummer, tekst, door: gebruiker.id, bijgewerkt_op: new Date().toISOString() });
    if (error) return { ok: false, fout: error.message };
    setWeeknotities((huidig) => {
      const kopie = new Map(huidig);
      const lijst = (kopie.get(onboarderId) || []).filter((n) => !(n.jaar === jaar && n.weeknummer === weeknummer));
      lijst.push({ onboarder_id: onboarderId, jaar, weeknummer, tekst });
      kopie.set(onboarderId, lijst);
      return kopie;
    });
    return { ok: true };
  }

  async function verversLogboek(onboarderId) {
    const { data, error } = await supabase.from("logboek").select("*").eq("onboarder_id", onboarderId);
    if (error) return;
    setLogboek((huidig) => {
      const kopie = new Map(huidig);
      kopie.set(onboarderId, data);
      return kopie;
    });
  }

  async function wijzigGesprekStatus(onboarder, competentieId, specialistId, huidigeStatus) {
    if (huidigeStatus === "gevoerd") {
      const { error } = await supabase
        .from("specialist_gesprekken")
        .delete()
        .eq("onboarder_id", onboarder.id)
        .eq("competentie_id", competentieId)
        .eq("specialist_id", specialistId);
      if (error) return { ok: false, fout: error.message };
      setGesprekken((huidig) => {
        const kopie = new Map(huidig);
        const lijst = (kopie.get(onboarder.id) || []).filter((g) => !(g.competentie_id === competentieId && g.specialist_id === specialistId));
        kopie.set(onboarder.id, lijst);
        return kopie;
      });
      verversLogboek(onboarder.id);
      return { ok: true };
    }

    const nieuweStatus = huidigeStatus === "nog niet gepland" ? "ingepland" : "gevoerd";
    const dag = programmadag(onboarder.startdatum);
    const { data, error } = await supabase
      .from("specialist_gesprekken")
      .upsert({
        onboarder_id: onboarder.id,
        competentie_id: competentieId,
        specialist_id: specialistId,
        status: nieuweStatus,
        bijgewerkt_door: gebruiker.id,
        programmadag: dag,
        tijdstip: new Date().toISOString(),
      })
      .select()
      .single();
    if (error) return { ok: false, fout: error.message };
    setGesprekken((huidig) => {
      const kopie = new Map(huidig);
      const lijst = (kopie.get(onboarder.id) || []).filter((g) => !(g.competentie_id === competentieId && g.specialist_id === specialistId));
      lijst.push(data);
      kopie.set(onboarder.id, lijst);
      return kopie;
    });
    verversLogboek(onboarder.id);
    return { ok: true };
  }

  async function meldPlaatsing(onboarder) {
    const { error } = await supabase.rpc("meld_plaatsing", { p_onboarder_id: onboarder.id });
    if (error) return { ok: false, fout: error.message };
    const { jaar, weeknummer } = huidigeWeek();
    setWeekcijfers((huidig) => {
      const kopie = new Map(huidig);
      const perOnboarder = new Map(kopie.get(onboarder.id) || []);
      const bestaand = perOnboarder.get(`${jaar}-${weeknummer}`) || { intakes: 0, voorstelacties: 0, gesprekken: 0, plaatsingen: 0, gestopten: 0 };
      perOnboarder.set(`${jaar}-${weeknummer}`, { ...bestaand, onboarder_id: onboarder.id, jaar, weeknummer, plaatsingen: (bestaand.plaatsingen || 0) + 1 });
      kopie.set(onboarder.id, perOnboarder);
      return kopie;
    });
    return { ok: true };
  }

  async function toggleIndicator(onboarder, competentieId, nr, huidigWaargenomen) {
    if (huidigWaargenomen) {
      const { error } = await supabase
        .from("nulmeting_indicatoren")
        .delete()
        .eq("onboarder_id", onboarder.id)
        .eq("competentie_id", competentieId)
        .eq("indicator_nr", nr);
      if (error) return { ok: false, fout: error.message };
      setNulmetingIndicatoren((huidig) => {
        const kopie = new Map(huidig);
        const set = new Set(kopie.get(onboarder.id) || []);
        set.delete(`${competentieId}-${nr}`);
        kopie.set(onboarder.id, set);
        return kopie;
      });
    } else {
      const { error } = await supabase
        .from("nulmeting_indicatoren")
        .insert({ onboarder_id: onboarder.id, competentie_id: competentieId, indicator_nr: nr });
      if (error) return { ok: false, fout: error.message };
      setNulmetingIndicatoren((huidig) => {
        const kopie = new Map(huidig);
        const set = new Set(kopie.get(onboarder.id) || []);
        set.add(`${competentieId}-${nr}`);
        kopie.set(onboarder.id, set);
        return kopie;
      });
    }
    return { ok: true };
  }

  async function herbereekenAfgerond(onboarder, bijgewerkteMap) {
    const afgerond = isAfgerond(bijgewerkteMap, kerncompetenties);
    const { error } = await supabase.from("nulmeting").update({ afgerond }).eq("onboarder_id", onboarder.id);
    if (error) return;
    setNulmeting((huidig) => {
      const kopie = new Map(huidig);
      const perOnboarder = new Map(kopie.get(onboarder.id) || []);
      for (const [cid, rij] of perOnboarder) perOnboarder.set(cid, { ...rij, afgerond });
      kopie.set(onboarder.id, perOnboarder);
      return kopie;
    });
  }

  async function zetNulmetingScore(onboarder, competentieId, score) {
    const bestaandeMap = nulmeting.get(onboarder.id) || new Map();
    const bestaand = bestaandeMap.get(competentieId) || {};
    const rij = {
      onboarder_id: onboarder.id,
      competentie_id: competentieId,
      score,
      notitie: bestaand.notitie || "",
      investeringsadvies: huidigAdvies(bestaandeMap),
      afgerond: bestaand.afgerond || false,
      door: gebruiker.id,
      tijdstip: new Date().toISOString(),
    };
    const { data, error } = await supabase.from("nulmeting").upsert(rij).select().single();
    if (error) return { ok: false, fout: error.message };
    const nieuweMap = new Map(bestaandeMap);
    nieuweMap.set(competentieId, data);
    setNulmeting((huidig) => {
      const kopie = new Map(huidig);
      kopie.set(onboarder.id, nieuweMap);
      return kopie;
    });
    await herbereekenAfgerond(onboarder, nieuweMap);
    return { ok: true };
  }

  async function zetNulmetingNotitie(onboarder, competentieId, notitie) {
    const bestaandeMap = nulmeting.get(onboarder.id) || new Map();
    const bestaand = bestaandeMap.get(competentieId) || {};
    const rij = {
      onboarder_id: onboarder.id,
      competentie_id: competentieId,
      score: bestaand.score ?? null,
      notitie,
      investeringsadvies: huidigAdvies(bestaandeMap),
      afgerond: bestaand.afgerond || false,
      door: gebruiker.id,
      tijdstip: new Date().toISOString(),
    };
    const { data, error } = await supabase.from("nulmeting").upsert(rij).select().single();
    if (error) return { ok: false, fout: error.message };
    setNulmeting((huidig) => {
      const kopie = new Map(huidig);
      const perOnboarder = new Map(kopie.get(onboarder.id) || []);
      perOnboarder.set(competentieId, data);
      kopie.set(onboarder.id, perOnboarder);
      return kopie;
    });
    return { ok: true };
  }

  async function zetInvesteringsadvies(onboarder, advies) {
    const bestaandeMap = nulmeting.get(onboarder.id) || new Map();
    const rijen = kerncompetenties.map((c) => {
      const bestaand = bestaandeMap.get(c.id) || {};
      return {
        onboarder_id: onboarder.id,
        competentie_id: c.id,
        score: bestaand.score ?? null,
        notitie: bestaand.notitie || "",
        investeringsadvies: advies,
        afgerond: false,
        door: gebruiker.id,
        tijdstip: new Date().toISOString(),
      };
    });
    const { data, error } = await supabase.from("nulmeting").upsert(rijen).select();
    if (error) return { ok: false, fout: error.message };
    const nieuweMap = new Map(bestaandeMap);
    for (const r of data) nieuweMap.set(r.competentie_id, r);
    setNulmeting((huidig) => {
      const kopie = new Map(huidig);
      kopie.set(onboarder.id, nieuweMap);
      return kopie;
    });
    await herbereekenAfgerond(onboarder, nieuweMap);
    return { ok: true };
  }

  if (laden) {
    return <Midden><span style={{ color: C.soft }}>Laden...</span></Midden>;
  }

  if (fout) {
    return <Midden><span style={{ color: "#c0392b" }}>{fout}</span></Midden>;
  }

  const gedeeld = {
    gebruiker,
    onderwerpen,
    niveauLabels,
    mijlpalen,
    fasen,
    gebruikersNaam,
    updateNiveau,
    undoNiveau,
    voegOpmerkingToe,
    slaWeekcijfersOp,
    slaWeeknotitieOp,
    kerncompetenties,
    specialisten,
    koppelingen,
    wijzigGesprekStatus,
    meldPlaatsing,
    indicatoren,
    toggleIndicator,
    zetNulmetingScore,
    zetNulmetingNotitie,
    zetInvesteringsadvies,
  };

  // Medewerker ziet altijd meteen zijn eigen dossier (bouwplan 7.4); RLS levert hem toch maar 1 rij.
  if (gebruiker.rol === "medewerker") {
    const eigenOnboarder = onboarders[0];
    if (!eigenOnboarder) {
      return (
        <Midden>
          <span style={{ color: C.soft, textAlign: "center" }}>
            Er is nog geen onboarderdossier aan jouw account gekoppeld. Vraag je VM of mentor dit aan te maken.
          </span>
        </Midden>
      );
    }
    return (
      <Detail
        {...gedeeld}
        onboarder={eigenOnboarder}
        standMap={niveauStand.get(eigenOnboarder.id) || new Map()}
        opmerkingenLijst={opmerkingen.get(eigenOnboarder.id) || []}
        logboekLijst={logboek.get(eigenOnboarder.id) || []}
        weekcijfersMap={weekcijfers.get(eigenOnboarder.id) || new Map()}
        weeknotitiesLijst={weeknotities.get(eigenOnboarder.id) || []}
        gesprekkenLijst={gesprekken.get(eigenOnboarder.id) || []}
        nulmetingMap={nulmeting.get(eigenOnboarder.id) || new Map()}
        nulmetingIndicatorenSet={nulmetingIndicatoren.get(eigenOnboarder.id) || new Set()}
      />
    );
  }

  // VM en mentor: overzicht met alle onboarders, klik voor het detailscherm.
  if (geselecteerd) {
    const onboarder = onboarders.find((o) => o.id === geselecteerd);
    return (
      <Detail
        {...gedeeld}
        onboarder={onboarder}
        standMap={niveauStand.get(onboarder.id) || new Map()}
        opmerkingenLijst={opmerkingen.get(onboarder.id) || []}
        logboekLijst={logboek.get(onboarder.id) || []}
        weekcijfersMap={weekcijfers.get(onboarder.id) || new Map()}
        weeknotitiesLijst={weeknotities.get(onboarder.id) || []}
        gesprekkenLijst={gesprekken.get(onboarder.id) || []}
        nulmetingMap={nulmeting.get(onboarder.id) || new Map()}
        nulmetingIndicatorenSet={nulmetingIndicatoren.get(onboarder.id) || new Set()}
        terug={() => setGeselecteerd(null)}
      />
    );
  }

  return (
    <Overzicht
      onboarders={onboarders}
      onderwerpen={onderwerpen}
      niveauStand={niveauStand}
      gesprekken={gesprekken}
      totaalKoppelingen={totaalKoppelingen}
      mijlpalen={mijlpalen}
      weekcijfers={weekcijfers}
      onSelecteer={setGeselecteerd}
    />
  );
}

function Midden({ children }) {
  return (
    <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      {children}
    </div>
  );
}
