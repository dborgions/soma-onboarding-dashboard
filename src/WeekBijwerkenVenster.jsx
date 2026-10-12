import { useState } from "react";
import { C, R, SCHADUW, kopStijl, knop, inkeping } from "./theme";
import { isVrijdag } from "./lib/berekeningen.js";

const VELDEN = [
  { key: "intakes", label: "Intakes" },
  { key: "voorstelacties", label: "Voorstelacties (3.1)" },
  { key: "gesprekken", label: "Gesprekken (4.1)" },
  { key: "plaatsingen", label: "Plaatsingen (5.1)" },
  { key: "gestopten", label: "Gestopten" },
];

export default function WeekBijwerkenVenster({ huidig, onOpslaan, onAnnuleer }) {
  const [waarden, setWaarden] = useState({
    intakes: huidig.intakes || 0,
    voorstelacties: huidig.voorstelacties || 0,
    gesprekken: huidig.gesprekken || 0,
    plaatsingen: huidig.plaatsingen || 0,
    gestopten: huidig.gestopten || 0,
  });

  function wijzig(key, delta) {
    setWaarden((w) => ({ ...w, [key]: Math.max(0, w[key] + delta) }));
  }

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(23,26,64,0.55)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, zIndex: 100 }}
      onClick={onAnnuleer}
    >
      <div onClick={(e) => e.stopPropagation()} style={{ background: C.card, borderRadius: R.kaart, padding: 24, maxWidth: 380, width: "100%", position: "relative", boxShadow: SCHADUW.venster }}>
        <span style={inkeping} />
        <h2 style={{ ...kopStijl, fontSize: 13, marginBottom: 16 }}>
          {isVrijdag() ? "Week afsluiten" : "Week bijwerken"}
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {VELDEN.map((v) => (
            <div key={v.key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 14 }}>{v.label}</span>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <StapKnop onClick={() => wijzig(v.key, -1)}>&minus;</StapKnop>
                <span style={{ minWidth: 24, textAlign: "center", fontWeight: 700 }}>{waarden[v.key]}</span>
                <StapKnop onClick={() => wijzig(v.key, 1)}>+</StapKnop>
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
          <button onClick={onAnnuleer} data-knop="stil" style={{ ...knop("stil"), flex: 1, padding: "11px 0" }}>
            Annuleren
          </button>
          <button onClick={() => onOpslaan(waarden)} data-knop="primair" style={{ ...knop("primair"), flex: 1, padding: "11px 0" }}>
            Opslaan
          </button>
        </div>
      </div>
    </div>
  );
}

function StapKnop({ onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{ width: 32, height: 32, borderRadius: R.chip, border: `1px solid ${C.line}`, background: "#fff", color: C.group, fontSize: 16, cursor: "pointer" }}
    >
      {children}
    </button>
  );
}
