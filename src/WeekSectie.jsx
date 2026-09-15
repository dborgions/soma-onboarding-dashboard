import { useState } from "react";
import { C } from "./theme";
import Funnel from "./Funnel.jsx";
import WeekBijwerkenVenster from "./WeekBijwerkenVenster.jsx";
import { isVrijdag } from "./lib/berekeningen.js";

const VELDEN = ["intakes", "voorstelacties", "gesprekken", "plaatsingen", "gestopten"];
const LABELS = { intakes: "Intakes", voorstelacties: "Voorstelacties", gesprekken: "Gesprekken", plaatsingen: "Plaatsingen", gestopten: "Gestopt" };

export default function WeekSectie({ magBewerken, cijfers, onOpslaan }) {
  const [open, setOpen] = useState(false);
  const huidig = cijfers || { intakes: 0, voorstelacties: 0, gesprekken: 0, plaatsingen: 0, gestopten: 0 };
  const totaal = VELDEN.reduce((s, v) => s + huidig[v], 0);
  const gemiddelde = (totaal / VELDEN.length).toFixed(1);

  return (
    <div style={{ background: C.card, borderRadius: 14, padding: 16, boxShadow: "0 1px 6px rgba(0,0,0,0.06)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontWeight: 700, color: C.group }}>Deze week</div>
        {magBewerken && (
          <button
            onClick={() => setOpen(true)}
            style={{ fontSize: 12, padding: "6px 12px", borderRadius: 8, border: "none", background: C.works, color: "#fff", cursor: "pointer" }}
          >
            {isVrijdag() ? "Week afsluiten" : "Week bijwerken"}
          </button>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 4, marginTop: 12 }}>
        {VELDEN.map((v) => (
          <div key={v} style={{ textAlign: "center" }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: C.group }}>{huidig[v]}</div>
            <div style={{ fontSize: 10, color: C.soft }}>{LABELS[v]}</div>
          </div>
        ))}
      </div>

      <div style={{ fontSize: 12, color: C.soft, marginTop: 10, textAlign: "center" }}>
        Weekgemiddelde {gemiddelde} · Totaal {totaal}
      </div>

      <Funnel cijfers={huidig} />

      {open && (
        <WeekBijwerkenVenster
          huidig={huidig}
          onAnnuleer={() => setOpen(false)}
          onOpslaan={async (waarden) => {
            setOpen(false);
            await onOpslaan(waarden);
          }}
        />
      )}
    </div>
  );
}
