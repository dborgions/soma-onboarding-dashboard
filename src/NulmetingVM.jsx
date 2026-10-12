import { useState } from "react";
import { C, R, kaartStijl, kopStijl, knop, veldStijl } from "./theme";
import { SCORE_LABELS, ADVIES_OPTIES, isAfgerond, huidigAdvies } from "./lib/nulmeting.js";

export default function NulmetingVM({ kerncompetenties, indicatoren, nulmetingMap, indicatorenSet, onToggleIndicator, onZetScore, onZetNotitie, onZetAdvies }) {
  const [open, setOpen] = useState(false);
  const [opgeslagen, setOpgeslagen] = useState(false);
  const afgerond = isAfgerond(nulmetingMap, kerncompetenties);
  const advies = huidigAdvies(nulmetingMap);
  const aantalGescoord = kerncompetenties.filter((c) => nulmetingMap.get(c.id)?.score).length;
  const gestart = aantalGescoord > 0 || open;

  function flashOpgeslagen() {
    setOpgeslagen(true);
    setTimeout(() => setOpgeslagen(false), 2000);
  }
  async function metBevestiging(actie) {
    await actie();
    flashOpgeslagen();
  }

  return (
    <div style={kaartStijl}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={kopStijl}>Nulmeting dag 30</h2>
          <div style={{ fontSize: 12, color: afgerond ? C.green : C.soft, fontWeight: afgerond ? 700 : 300, marginTop: 4 }}>
            {afgerond ? "Afgerond" : `${aantalGescoord} van ${kerncompetenties.length} beoordeeld`}
          </div>
        </div>
        {open && opgeslagen && (
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: C.green, marginRight: 10 }}>Opgeslagen</span>
        )}
        {!open && (
          <button
            onClick={() => setOpen(true)}
            data-knop="primair"
            style={{ ...knop("primair"), padding: "9px 14px", fontSize: 10.5, whiteSpace: "nowrap" }}
          >
            {gestart ? "Verder gaan" : "Nulmeting starten"}
          </button>
        )}
        {open && (
          <button
            onClick={() => setOpen(false)}
            data-knop="stil"
            style={{ ...knop("stil"), padding: "9px 14px", fontSize: 10.5, whiteSpace: "nowrap" }}
          >
            Inklappen
          </button>
        )}
      </div>

      {open && (
      <div style={{ paddingTop: 16 }}>
      <div style={{ fontSize: 12, color: C.soft, marginTop: 4, marginBottom: 14, lineHeight: 1.5 }}>
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
            onToggleIndicator={(nr, waargenomen) => metBevestiging(() => onToggleIndicator(comp.id, nr, waargenomen))}
            onZetScore={(score) => metBevestiging(() => onZetScore(comp.id, score))}
            onZetNotitie={(notitie) => metBevestiging(() => onZetNotitie(comp.id, notitie))}
          />
        ))}
      </div>

      <div style={{ marginTop: 18, borderTop: `1px solid ${C.line}`, paddingTop: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <h3 style={{ ...kopStijl, marginBottom: 10 }}>Investeringsadvies</h3>
          {opgeslagen && <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: C.green }}>Opgeslagen</span>}
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {ADVIES_OPTIES.map((optie) => (
            <button
              key={optie}
              onClick={() => metBevestiging(() => onZetAdvies(optie))}
              style={{
                fontSize: 11,
                letterSpacing: 0.8,
                padding: "9px 14px",
                borderRadius: R.chip,
                border: advies === optie ? "none" : `1px solid ${C.line}`,
                background: advies === optie ? C.group : "#fff",
                color: advies === optie ? "#fff" : C.soft,
                fontWeight: 700,
                cursor: "pointer",
                textTransform: "uppercase",
              }}
            >
              {optie}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={() => setOpen(false)}
        data-knop="stil" style={{ ...knop("stil"), width: "100%", marginTop: 18 }}
      >
        Inklappen
      </button>
      </div>
      )}
    </div>
  );
}

function CompetentieBlok({ competentie, indicatoren, rij, indicatorenSet, onToggleIndicator, onZetScore, onZetNotitie }) {
  const [notitie, setNotitie] = useState(rij?.notitie || "");
  const score = rij?.score || 0;

  return (
    <div style={{ borderTop: `1px solid ${C.line}`, paddingTop: 12 }}>
      <div style={{ fontWeight: 700, fontSize: 12, textTransform: "uppercase", letterSpacing: 1.1, color: C.group, marginBottom: 8 }}>{competentie.naam}</div>

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
              fontSize: 10.5,
              fontWeight: 700,
              letterSpacing: 0.8,
              textTransform: "uppercase",
              padding: "7px 11px",
              borderRadius: R.chip,
              border: score === n ? "none" : `1px solid ${C.line}`,
              background: score === n ? C.group : "#fff",
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
        style={{ ...veldStijl, fontSize: 13, padding: 9, resize: "vertical" }}
      />
    </div>
  );
}
