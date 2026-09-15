import { C } from "./theme";
import Tijdlijn from "./Tijdlijn.jsx";
import Voortgangsbalk from "./Voortgangsbalk.jsx";
import { programmadag, percentageVoorType } from "./lib/berekeningen.js";

const CATEGORIE_KLEUREN = [C.group, C.works, "#2c9c8f", C.accent, C.green, "#9b5bb5"];

export default function Detail({ onboarder, onderwerpen, standMap, niveauLabels, mijlpalen, terug }) {
  const dag = programmadag(onboarder.startdatum);
  const kennis = percentageVoorType(standMap, onderwerpen, "kennis");
  const vaardigheden = percentageVoorType(standMap, onderwerpen, "vaardigheid");

  const categorieen = [];
  for (const o of onderwerpen) {
    if (!categorieen.includes(o.categorie)) categorieen.push(o.categorie);
  }

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", padding: 16 }}>
      {terug && (
        <button onClick={terug} style={terugKnopStijl}>
          &larr; Terug naar overzicht
        </button>
      )}

      <div style={{ background: C.card, borderRadius: 14, padding: 16, boxShadow: "0 1px 6px rgba(0,0,0,0.06)" }}>
        <div style={{ fontWeight: 700, color: C.group, fontSize: 18 }}>{onboarder.naam}</div>
        <div style={{ fontSize: 12, color: C.soft }}>{onboarder.vestigingen?.naam}</div>
        <Tijdlijn dag={dag} programmaDagen={onboarder.programma_dagen} mijlpalen={mijlpalen} />
        <Voortgangsbalk label="Kennis" percentage={kennis} kleur={C.works} />
        <Voortgangsbalk label="Vaardigheden" percentage={vaardigheden} kleur={C.accent} />
      </div>

      <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 12 }}>
        {categorieen.map((cat, i) => {
          const items = onderwerpen.filter((o) => o.categorie === cat);
          const kleur = CATEGORIE_KLEUREN[i % CATEGORIE_KLEUREN.length];
          return (
            <details key={cat} open style={{ background: C.card, borderRadius: 14, boxShadow: "0 1px 6px rgba(0,0,0,0.06)", borderLeft: `4px solid ${kleur}` }}>
              <summary style={{ padding: "12px 16px", fontWeight: 600, color: C.group, cursor: "pointer" }}>
                {cat}
              </summary>
              <div style={{ padding: "0 16px 12px", display: "flex", flexDirection: "column", gap: 12 }}>
                {items.map((o) => (
                  <OnderwerpRegel key={o.id} onderwerp={o} niveau={standMap.get(o.id) || 0} label={niveauLabels.get(standMap.get(o.id) || 0)} />
                ))}
              </div>
            </details>
          );
        })}
      </div>
    </div>
  );
}

function OnderwerpRegel({ onderwerp, niveau, label }) {
  const afgerond = niveau >= onderwerp.max_niveau;
  return (
    <div style={{ borderTop: `1px solid ${C.line}`, paddingTop: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
        <span style={{ fontWeight: 500 }}>{onderwerp.naam}</span>
        <span
          style={{
            fontSize: 11,
            padding: "2px 8px",
            borderRadius: 99,
            background: onderwerp.type === "kennis" ? "#eef2f8" : "#fdeee0",
            color: onderwerp.type === "kennis" ? C.works : C.accent,
            whiteSpace: "nowrap",
          }}
        >
          {onderwerp.type}
        </span>
      </div>
      <div style={{ fontSize: 13, color: afgerond ? C.green : C.soft, fontWeight: afgerond ? 600 : 400, marginTop: 4 }}>
        {label}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6 }}>
        {onderwerp.aanspreekpunt && (
          <span style={chipStijl}>Aanspreekpunt · {onderwerp.aanspreekpunt}</span>
        )}
        {onderwerp.welder_link && (
          <a href={onderwerp.welder_link} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: C.works }}>
            Bekijk in Welder
          </a>
        )}
      </div>
    </div>
  );
}

const chipStijl = {
  fontSize: 11,
  padding: "3px 10px",
  borderRadius: 99,
  background: C.bg,
  border: `1px solid ${C.line}`,
  color: C.soft,
};

const terugKnopStijl = {
  background: "none",
  border: "none",
  color: C.works,
  fontSize: 14,
  padding: 0,
  marginBottom: 12,
  cursor: "pointer",
};
