import { useState } from "react";
import { C, kaartStijl, kopStijl, knop } from "./theme";
import Funnel from "./Funnel.jsx";
import WeekBijwerkenVenster from "./WeekBijwerkenVenster.jsx";
import { isVrijdag, huidigeWeek } from "./lib/berekeningen.js";

const VELDEN = ["intakes", "voorstelacties", "gesprekken", "plaatsingen", "gestopten"];
const LABELS = { intakes: "Intakes", voorstelacties: "Voorstel", gesprekken: "Gesprek", plaatsingen: "Plaatsing", gestopten: "Gestopt" };
const KORT = { intakes: "Int", voorstelacties: "Vrs", gesprekken: "Gsp", plaatsingen: "Pla", gestopten: "Gst" };

// Alleen de kale getallen per week. Bewust geen pijlen, kleuren of doelen:
// dit is gespreksstof voor het OB-gesprek, geen prestatiemeting.
const AANTAL_STANDAARD = 3;

export default function WeekSectie({ magBewerken, cijfers, alleCijfers, onOpslaan, plaatsingKnop }) {
  const [open, setOpen] = useState(false);
  const [allesTonen, setAllesTonen] = useState(false);
  const huidig = cijfers || { intakes: 0, voorstelacties: 0, gesprekken: 0, plaatsingen: 0, gestopten: 0 };
  const totaal = VELDEN.reduce((s, v) => s + huidig[v], 0);
  const gemiddelde = (totaal / VELDEN.length).toFixed(1);

  const { jaar, weeknummer } = huidigeWeek();
  const eerdere = [...(alleCijfers?.values() || [])]
    .filter((r) => !(r.jaar === jaar && r.weeknummer === weeknummer))
    .sort((a, b) => b.jaar - a.jaar || b.weeknummer - a.weeknummer);
  const getoond = allesTonen ? eerdere : eerdere.slice(0, AANTAL_STANDAARD);

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

      {eerdere.length > 0 && (
        <div style={{ marginTop: 16, borderTop: `1px solid ${C.line}`, paddingTop: 12 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: C.soft, marginBottom: 8 }}>
            Eerdere weken
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "minmax(52px, 1fr) repeat(5, minmax(0, 1fr))", gap: 2, alignItems: "center" }}>
            <span />
            {VELDEN.map((v) => (
              <span key={v} style={{ fontSize: 8.5, color: C.soft, textTransform: "uppercase", letterSpacing: 0.4, textAlign: "center" }}>
                {KORT[v]}
              </span>
            ))}

            {getoond.map((rij) => (
              <WeekRegel key={`${rij.jaar}-${rij.weeknummer}`} rij={rij} />
            ))}
          </div>

          {eerdere.length > AANTAL_STANDAARD && (
            <button
              onClick={() => setAllesTonen(!allesTonen)}
              style={{
                marginTop: 10,
                background: "none",
                border: "none",
                padding: 0,
                fontSize: 10.5,
                fontWeight: 700,
                letterSpacing: 0.9,
                textTransform: "uppercase",
                color: C.works,
                cursor: "pointer",
              }}
            >
              {allesTonen ? "Minder weken" : `Alle weken (${eerdere.length})`}
            </button>
          )}
        </div>
      )}

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

function WeekRegel({ rij }) {
  return (
    <>
      <span style={{ fontSize: 11, color: C.soft, whiteSpace: "nowrap", paddingRight: 4 }}>Week {rij.weeknummer}</span>
      {VELDEN.map((v) => (
        <span
          key={v}
          style={{
            fontSize: 13,
            textAlign: "center",
            color: (rij[v] || 0) === 0 ? C.soft : "#22263a",
            fontWeight: (rij[v] || 0) === 0 ? 300 : 400,
          }}
        >
          {rij[v] || 0}
        </span>
      ))}
    </>
  );
}
