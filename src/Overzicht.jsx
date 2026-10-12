import { C, T, R, SCHADUW, inkeping } from "./theme";
import Tijdlijn from "./Tijdlijn.jsx";
import { programmadag, percentageVoorType, huidigeWeek, dagenGeleden } from "./lib/berekeningen.js";

const STIL_NA_DAGEN = 7;

export default function Overzicht({ onboarders, onderwerpen, niveauStand, gesprekken, totaalKoppelingen, mijlpalen, weekcijfers, laatsteBeweging, onSelecteer }) {
  const { jaar, weeknummer } = huidigeWeek();
  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: 16 }}>
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: T.micro, fontWeight: 700, letterSpacing: 2.4, textTransform: "uppercase", color: C.accent }}>
          De weg naar succes
        </div>
        <h1 style={{ color: C.group, fontSize: T.h1, textTransform: "uppercase", marginTop: 4 }}>Onboarders</h1>
      </div>

      {onboarders.length === 0 && (
        <p style={{ color: C.soft, fontSize: T.body }}>Er zijn nog geen actieve onboarders.</p>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(320px, 100%), 1fr))", gap: 16 }}>
        {onboarders.map((o) => {
          const standMap = niveauStand.get(o.id) || new Map();
          const kennis = percentageVoorType(standMap, onderwerpen, "kennis");
          const vaardigheden = percentageVoorType(standMap, onderwerpen, "vaardigheid");
          const gevoerd = (gesprekken.get(o.id) || []).filter((g) => g.status === "gevoerd").length;
          const dag = programmadag(o.startdatum);
          const weekIngevuld = (weekcijfers.get(o.id) || new Map()).has(`${jaar}-${weeknummer}`);
          const dagen = dagenGeleden(laatsteBeweging.get(o.id));
          const stil = dagen !== null && dagen >= STIL_NA_DAGEN;
          const bewegingTekst = dagen === null ? "nog geen wijziging" : dagen === 0 ? "vandaag" : dagen === 1 ? "gisteren" : `${dagen} dagen geleden`;

          return (
            <button
              key={o.id}
              onClick={() => onSelecteer(o.id)}
              style={{
                position: "relative",
                textAlign: "left",
                background: C.card,
                border: "none",
                borderRadius: R.kaart,
                padding: 16,
                boxShadow: SCHADUW.kaart,
                cursor: "pointer",
                minWidth: 0,
                width: "100%",
                boxSizing: "border-box",
              }}
            >
              {stil && <span style={inkeping} />}

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 700, color: C.group, fontSize: T.h3, lineHeight: 1.2 }}>{o.naam}</div>
                  <div style={{ fontSize: T.micro, color: C.soft, textTransform: "uppercase", letterSpacing: 1.2, marginTop: 3 }}>
                    {o.vestigingen?.naam}
                  </div>
                </div>
                <div style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                  <span style={{ fontSize: 30, fontWeight: 700, color: C.accent, lineHeight: 1 }}>{dag}</span>
                  <span style={{ fontSize: T.klein, color: C.soft }}>/{o.programma_dagen}</span>
                </div>
              </div>

              <Tijdlijn dag={dag} programmaDagen={o.programma_dagen} mijlpalen={mijlpalen} />

              <div
                style={{
                  marginTop: 10,
                  padding: "7px 10px",
                  borderRadius: R.chip,
                  borderLeft: `3px solid ${stil ? C.accent : C.line}`,
                  background: stil ? C.zachtOranje : C.zacht,
                  fontSize: T.klein,
                  fontWeight: stil ? 700 : 300,
                  color: stil ? C.accent : C.soft,
                }}
              >
                {stil ? "Staat stil · " : ""}Laatste beweging: {bewegingTekst}
              </div>

              {!weekIngevuld && (
                <div style={{ marginTop: 6 }}>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: 1,
                      textTransform: "uppercase",
                      padding: "4px 9px",
                      borderRadius: R.chip,
                      background: C.zachtOranje,
                      color: C.accent,
                    }}
                  >
                    Week nog invullen
                  </span>
                </div>
              )}

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: 1,
                  marginTop: 14,
                  textAlign: "center",
                  background: C.line,
                  border: `1px solid ${C.line}`,
                }}
              >
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
    <div style={{ background: C.card, padding: "9px 4px" }}>
      <div style={{ fontSize: T.h4, fontWeight: 700, color: kleur, lineHeight: 1.1 }}>{waarde}</div>
      <div style={{ fontSize: 9.5, color: C.soft, textTransform: "uppercase", letterSpacing: 1, marginTop: 3 }}>{label}</div>
    </div>
  );
}
