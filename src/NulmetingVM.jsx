import { useState } from "react";
import { C } from "./theme";
import { SCORE_LABELS, ADVIES_OPTIES, isAfgerond, huidigAdvies } from "./lib/nulmeting.js";

export default function NulmetingVM({ kerncompetenties, indicatoren, nulmetingMap, indicatorenSet, onToggleIndicator, onZetScore, onZetNotitie, onZetAdvies }) {
  const afgerond = isAfgerond(nulmetingMap, kerncompetenties);
  const advies = huidigAdvies(nulmetingMap);
  const aantalGescoord = kerncompetenties.filter((c) => nulmetingMap.get(c.id)?.score).length;

  return (
    <div style={{ background: C.card, borderRadius: 14, padding: 16, boxShadow: "0 1px 6px rgba(0,0,0,0.06)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <div style={{ fontWeight: 700, color: C.group }}>Nulmeting dag 30</div>
        <span style={{ fontSize: 12, color: afgerond ? C.green : C.soft, fontWeight: afgerond ? 600 : 400 }}>
          {afgerond ? "Afgerond" : `${aantalGescoord} van ${kerncompetenties.length} beoordeeld`}
        </span>
      </div>
      <div style={{ fontSize: 12, color: C.soft, marginTop: 4, marginBottom: 12 }}>
        Geen prestatiemeting, maar een inventarisatie van startpunt en groeipotentieel.
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {kerncompetenties.map((comp) => (
          <CompetentieBlok
            key={comp.id}
            competentie={comp}
            indicatoren={indicatoren.filter((i) => i.competentie_id === comp.id)}
            rij={nulmetingMap.get(comp.id)}
            indicatorenSet={indicatorenSet}
            onToggleIndicator={(nr, waargenomen) => onToggleIndicator(comp.id, nr, waargenomen)}
            onZetScore={(score) => onZetScore(comp.id, score)}
            onZetNotitie={(notitie) => onZetNotitie(comp.id, notitie)}
          />
        ))}
      </div>

      <div style={{ marginTop: 18, borderTop: `1px solid ${C.line}`, paddingTop: 14 }}>
        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 8 }}>Investeringsadvies</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {ADVIES_OPTIES.map((optie) => (
            <button
              key={optie}
              onClick={() => onZetAdvies(optie)}
              style={{
                fontSize: 13,
                padding: "8px 14px",
                borderRadius: 8,
                border: advies === optie ? "none" : `1px solid ${C.line}`,
                background: advies === optie ? C.works : "#fff",
                color: advies === optie ? "#fff" : "inherit",
                fontWeight: advies === optie ? 600 : 400,
                cursor: "pointer",
                textTransform: "capitalize",
              }}
            >
              {optie}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function CompetentieBlok({ competentie, indicatoren, rij, indicatorenSet, onToggleIndicator, onZetScore, onZetNotitie }) {
  const [notitie, setNotitie] = useState(rij?.notitie || "");
  const score = rij?.score || 0;

  return (
    <div style={{ borderTop: `1px solid ${C.line}`, paddingTop: 12 }}>
      <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 6 }}>{competentie.naam}</div>

      <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 8 }}>
        {indicatoren.map((ind) => {
          const gevinkt = indicatorenSet.has(`${competentie.id}-${ind.nr}`);
          return (
            <label key={ind.nr} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 12.5, cursor: "pointer" }}>
              <input type="checkbox" checked={gevinkt} onChange={() => onToggleIndicator(ind.nr, gevinkt)} style={{ marginTop: 2 }} />
              <span>{ind.tekst}</span>
            </label>
          );
        })}
      </div>

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
        {[1, 2, 3].map((n) => (
          <button
            key={n}
            onClick={() => onZetScore(n)}
            style={{
              fontSize: 11.5,
              padding: "5px 10px",
              borderRadius: 99,
              border: score === n ? "none" : `1px solid ${C.line}`,
              background: score === n ? C.works : "#fff",
              color: score === n ? "#fff" : C.soft,
              cursor: "pointer",
            }}
          >
            {SCORE_LABELS[n]}
          </button>
        ))}
      </div>

      <textarea
        value={notitie}
        onChange={(e) => setNotitie(e.target.value)}
        onBlur={() => {
          if (notitie !== (rij?.notitie || "")) onZetNotitie(notitie);
        }}
        rows={2}
        placeholder="Wat is er concreet gezien..."
        style={{ width: "100%", boxSizing: "border-box", borderRadius: 8, border: `1px solid ${C.line}`, padding: 6, fontSize: 12.5, fontFamily: "inherit" }}
      />
    </div>
  );
}
