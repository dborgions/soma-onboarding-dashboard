import { useState } from "react";
import { C, kaartStijl, kopStijl, knop } from "./theme";
import Funnel from "./Funnel.jsx";
import WeekBijwerkenVenster from "./WeekBijwerkenVenster.jsx";
import { isVrijdag } from "./lib/berekeningen.js";

const VELDEN = ["intakes", "voorstelacties", "gesprekken", "plaatsingen", "gestopten"];
const LABELS = { intakes: "Intakes", voorstelacties: "Voorstel", gesprekken: "Gesprek", plaatsingen: "Plaatsing", gestopten: "Gestopt" };

export default function WeekSectie({ magBewerken, cijfers, onOpslaan, plaatsingKnop }) {
  const [open, setOpen] = useState(false);
  const huidig = cijfers || { intakes: 0, voorstelacties: 0, gesprekken: 0, plaatsingen: 0, gestopten: 0 };
  const totaal = VELDEN.reduce((s, v) => s + huidig[v], 0);
  const gemiddelde = (totaal / VELDEN.length).toFixed(1);

  return (
    <div style={kaartStijl}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
        <h2 style={kopStijl}>Resultaten deze week</h2>
        {magBewerken && (
          <button
            onClick={() => setOpen(true)}
            data-knop="primair"
            style={{ ...knop("primair"), padding: "8px 13px", fontSize: 10.5 }}
          >
            {isVrijdag() ? "Week afsluiten" : "Week bijwerken"}
          </button>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 4, marginTop: 14 }}>
        {VELDEN.map((v) => (
          <div key={v} style={{ textAlign: "center", minWidth: 0 }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: v === "plaatsingen" ? C.accent : C.group, lineHeight: 1 }}>{huidig[v]}</div>
            <div style={{ fontSize: 8.5, color: C.soft, textTransform: "uppercase", letterSpacing: 0.3, marginTop: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{LABELS[v]}</div>
          </div>
        ))}
      </div>

      <div style={{ fontSize: 11, color: C.soft, marginTop: 12, textAlign: "center", borderTop: `1px solid ${C.line}`, paddingTop: 9 }}>
        Weekgemiddelde {gemiddelde} · Totaal {totaal}
      </div>

      {plaatsingKnop}

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
