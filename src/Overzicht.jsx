import { C } from "./theme";
import Tijdlijn from "./Tijdlijn.jsx";
import Voortgangsbalk from "./Voortgangsbalk.jsx";
import { programmadag, percentageVoorType, percentageGesprekken } from "./lib/berekeningen.js";

export default function Overzicht({ onboarders, onderwerpen, niveauStand, gesprekken, totaalKoppelingen, mijlpalen, onSelecteer }) {
  return (
    <div style={{ maxWidth: 480, margin: "0 auto", padding: 16 }}>
      <h1 style={{ color: C.group, fontSize: 20, marginBottom: 16 }}>Onboarders</h1>
      {onboarders.length === 0 && (
        <p style={{ color: C.soft }}>Er zijn nog geen actieve onboarders.</p>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {onboarders.map((o) => {
          const standMap = niveauStand.get(o.id) || new Map();
          const kennis = percentageVoorType(standMap, onderwerpen, "kennis");
          const vaardigheden = percentageVoorType(standMap, onderwerpen, "vaardigheid");
          const gesprekkenPct = percentageGesprekken(gesprekken.get(o.id) || [], totaalKoppelingen);
          const dag = programmadag(o.startdatum);
          return (
            <button
              key={o.id}
              onClick={() => onSelecteer(o.id)}
              style={{
                textAlign: "left",
                background: C.card,
                border: "none",
                borderRadius: 14,
                padding: 16,
                boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
                cursor: "pointer",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ fontWeight: 700, color: C.group, fontSize: 16 }}>{o.naam}</span>
                <span style={{ fontSize: 12, color: C.soft }}>{o.vestigingen?.naam}</span>
              </div>
              <Tijdlijn dag={dag} programmaDagen={o.programma_dagen} mijlpalen={mijlpalen} />
              <Voortgangsbalk label="Kennis" percentage={kennis} kleur={C.works} />
              <Voortgangsbalk label="Vaardigheden" percentage={vaardigheden} kleur={C.accent} />
              <Voortgangsbalk label="Gesprekken specialisten" percentage={gesprekkenPct} kleur={C.green} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
