import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import { C } from "./theme";
import Overzicht from "./Overzicht.jsx";
import Detail from "./Detail.jsx";

export default function Dashboard({ gebruiker }) {
  const [laden, setLaden] = useState(true);
  const [fout, setFout] = useState("");
  const [onboarders, setOnboarders] = useState([]);
  const [onderwerpen, setOnderwerpen] = useState([]);
  const [niveauStand, setNiveauStand] = useState(new Map()); // onboarder_id -> Map(onderwerp_id -> niveau)
  const [gesprekken, setGesprekken] = useState(new Map()); // onboarder_id -> [gesprek, ...]
  const [totaalKoppelingen, setTotaalKoppelingen] = useState(0);
  const [mijlpalen, setMijlpalen] = useState([]);
  const [niveauLabels, setNiveauLabels] = useState(new Map());
  const [geselecteerd, setGeselecteerd] = useState(null);

  useEffect(() => {
    laadAlles();
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
    ] = await Promise.all([
      supabase.from("onboarders").select("id, naam, startdatum, programma_dagen, vestiging_id, vestigingen(naam)").eq("actief", true),
      supabase.from("onderwerpen").select("*").eq("actief", true).order("volgorde"),
      supabase.from("niveau_stand").select("onboarder_id, onderwerp_id, niveau"),
      supabase.from("specialist_gesprekken").select("onboarder_id, status"),
      supabase.from("competentie_specialisten").select("*", { count: "exact", head: true }),
      supabase.from("mijlpalen").select("id, naam, dag").order("dag"),
      supabase.from("niveau_labels").select("niveau, label"),
    ]);

    const eerste = eOnboarders || eOnderwerpen || eStand || eGesprekken || eKoppelingen || eMijlpalen || eLabels;
    if (eerste) {
      setFout("Het laden van de gegevens is niet gelukt: " + eerste.message);
      setLaden(false);
      return;
    }

    const standMap = new Map();
    for (const rij of standData) {
      if (!standMap.has(rij.onboarder_id)) standMap.set(rij.onboarder_id, new Map());
      standMap.get(rij.onboarder_id).set(rij.onderwerp_id, rij.niveau);
    }

    const gesprekkenMap = new Map();
    for (const rij of gesprekkenData) {
      if (!gesprekkenMap.has(rij.onboarder_id)) gesprekkenMap.set(rij.onboarder_id, []);
      gesprekkenMap.get(rij.onboarder_id).push(rij);
    }

    setOnboarders(onboardersData);
    setOnderwerpen(onderwerpenData);
    setNiveauStand(standMap);
    setGesprekken(gesprekkenMap);
    setTotaalKoppelingen(koppelingenData?.length ?? 0);
    setMijlpalen(mijlpalenData);
    setNiveauLabels(new Map(labelsData.map((l) => [l.niveau, l.label])));
    setLaden(false);
  }

  if (laden) {
    return <Midden><span style={{ color: C.soft }}>Laden...</span></Midden>;
  }

  if (fout) {
    return <Midden><span style={{ color: "#c0392b" }}>{fout}</span></Midden>;
  }

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
        onboarder={eigenOnboarder}
        onderwerpen={onderwerpen}
        standMap={niveauStand.get(eigenOnboarder.id) || new Map()}
        niveauLabels={niveauLabels}
        mijlpalen={mijlpalen}
      />
    );
  }

  // VM en mentor: overzicht met alle onboarders, klik voor het detailscherm.
  if (geselecteerd) {
    const onboarder = onboarders.find((o) => o.id === geselecteerd);
    return (
      <Detail
        onboarder={onboarder}
        onderwerpen={onderwerpen}
        standMap={niveauStand.get(onboarder.id) || new Map()}
        niveauLabels={niveauLabels}
        mijlpalen={mijlpalen}
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
