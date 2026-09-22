import { C } from "./theme";
import Tijdlijn from "./Tijdlijn.jsx";
import { programmadag, percentageVoorType, huidigeWeek, dagenGeleden, werkdagenGeleden } from "./lib/berekeningen.js";

// Een volle werkweek zonder enige beweging is het signaal. Heeft een onboarder nog
// helemaal niets afgetikt, dan telt de stilstand vanaf zijn startdatum.
const STIL_NA_WERKDAGEN = 5;

export default function Overzicht({ onboarders, onderwerpen, niveauStand, gesprekken, totaalKoppelingen, mijlpalen, weekcijfers, laatsteBeweging, onSelecteer }) {
  const { jaar, weeknummer } = huidigeWeek();
  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: 16 }}>
      <h1 style={{ color: C.group, fontSize: 20, marginBottom: 16 }}>Onboarders</h1>
      {onboarders.length === 0 && (
        <p style={{ color: C.soft }}>Er zijn nog geen actieve onboarders.</p>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(320px, 100%), 1fr))", gap: 16 }}>
        {onboarders.map((o) => {
          const standMap = niveauStand.get(o.id) || new Map();
          const kennis = percentageVoorType(standMap, onderwerpen, "kennis");
          const vaardigheden = percentageVoorType(standMap, onderwerpen, "vaardigheid");
          const gevoerd = (gesprekken.get(o.id) || []).filter((g) => g.status === "gevoerd").length;
          const dag = programmadag(o.startdatum);
          const weekIngevuld = (weekcijfers.get(o.id) || new Map()).has(`${jaar}-${weeknummer}`);
          const beweging = laatsteBeweging.get(o.id) || null;
          const dagen = dagenGeleden(beweging);
          const werkdagenStil = beweging ? werkdagenGeleden(beweging) : dag;
          const stil = werkdagenStil >= STIL_NA_WERKDAGEN;
          const bewegingTekst =
            beweging === null
              ? "nog geen wijziging"
              : dagen === 0
              ? "vandaag"
              : dagen === 1
              ? "gisteren"
              : `${dagen} dagen geleden`;

          return (
            <button
              key={o.id}
              onClick={() => onSelecteer(o.id)}
              style={{
                textAlign: "left",
                display: "flex",
                flexDirection: "column",
                alignItems: "stretch",
                background: C.card,
                border: "none",
                borderRadius: 14,
                padding: 16,
                boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
                cursor: "pointer",
                minWidth: 0,
                width: "100%",
                boxSizing: "border-box",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 700, color: C.group, fontSize: 17 }}>{o.naam}</div>
                  <div style={{ fontSize: 12, color: C.soft }}>{o.vestigingen?.naam}</div>
                </div>
                <div style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                  <span style={{ fontSize: 28, fontWeight: 800, color: C.accent, lineHeight: 1 }}>{dag}</span>
                  <span style={{ fontSize: 13, color: C.soft }}>/{o.programma_dagen}</span>
                </div>
              </div>

              <Tijdlijn dag={dag} programmaDagen={o.programma_dagen} mijlpalen={mijlpalen} />

              <div
                style={{
                  marginTop: 8,
                  padding: "6px 10px",
                  borderRadius: 8,
                  background: stil ? "#fdeee0" : C.bg,
                  fontSize: 12,
                  fontWeight: stil ? 700 : 400,
                  color: stil ? C.accent : C.soft,
                }}
              >
                {stil ? "Staat stil · " : ""}Laatste beweging: {bewegingTekst}
              </div>

              {!weekIngevuld && (
                <div style={{ marginTop: 6 }}>
                  <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 99, background: "#fdeee0", color: C.accent }}>
                    week nog invullen
                  </span>
                </div>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginTop: 12, textAlign: "center" }}>
                <Stat label="Kennis" waarde={`${kennis}%`} kleur={C.works} />
                <Stat label="Vaardigh." waarde={`${vaardigheden}%`} kleur={C.accent} />
                <Stat label="Gesprekken" waarde={`${gevoerd}/${totaalKoppelingen}`} kleur={C.green} />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Stat({ label, waarde, kleur }) {
  return (
    <div>
      <div style={{ fontSize: 18, fontWeight: 800, color: kleur }}>{waarde}</div>
      <div style={{ fontSize: 10.5, color: C.soft }}>{label}</div>
    </div>
  );
}
