import { C } from "./theme";
import Tijdlijn from "./Tijdlijn.jsx";
import { programmadag, percentageVoorType, huidigeWeek, dagenGeleden, werkdagenGeleden } from "./lib/berekeningen.js";

// Een volle werkweek zonder enige beweging is het signaal. Heeft een onboarder nog
// helemaal niets afgetikt, dan telt de stilstand vanaf zijn startdatum.
const STIL_NA_WERKDAGEN = 5;

export default function Overzicht({ onboarders, onderwerpen, niveauStand, gesprekken, totaalKoppelingen, mijlpalen, weekcijfers, laatsteBeweging, onSelecteer }) {
  const { jaar, weeknummer } = huidigeWeek();
  // Op dag 100 (of bij afvallen) verhuist een dossier naar "Afgerond", zodat het
  // scorebord schoon blijft terwijl je kunt terugkijken (bouwplan hoofdstuk 17).
  const actief = onboarders.filter((o) => (o.status || "actief") === "actief");
  const afgesloten = onboarders.filter((o) => (o.status || "actief") !== "actief");

  const kaart = (o) => (
    <Kaart
      key={o.id}
      o={o}
      jaar={jaar}
      weeknummer={weeknummer}
      onderwerpen={onderwerpen}
      niveauStand={niveauStand}
      gesprekken={gesprekken}
      totaalKoppelingen={totaalKoppelingen}
      mijlpalen={mijlpalen}
      weekcijfers={weekcijfers}
      laatsteBeweging={laatsteBeweging}
      onSelecteer={onSelecteer}
    />
  );

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: 16 }}>
      <h1 style={{ color: C.group, fontSize: 20, marginBottom: 16 }}>Onboarders</h1>
      {actief.length === 0 && <p style={{ color: C.soft }}>Er zijn nog geen actieve onboarders.</p>}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(320px, 100%), 1fr))", gap: 16 }}>
        {actief.map(kaart)}
      </div>

      {afgesloten.length > 0 && (
        <>
          <h2 style={{ color: C.soft, fontSize: 15, margin: "28px 0 12px" }}>Afgerond</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(320px, 100%), 1fr))", gap: 16 }}>
            {afgesloten.map(kaart)}
          </div>
        </>
      )}
    </div>
  );
}

function Kaart({ o, jaar, weeknummer, onderwerpen, niveauStand, gesprekken, totaalKoppelingen, mijlpalen, weekcijfers, laatsteBeweging, onSelecteer }) {
  const standMap = niveauStand.get(o.id) || new Map();
  const kennis = percentageVoorType(standMap, onderwerpen, "kennis");
  const vaardigheden = percentageVoorType(standMap, onderwerpen, "vaardigheid");
  const gevoerd = (gesprekken.get(o.id) || []).filter((g) => g.status === "gevoerd").length;
  const dag = programmadag(o.startdatum);
  const status = o.status || "actief";
  const loopt = status === "actief";
  const weekIngevuld = (weekcijfers.get(o.id) || new Map()).has(`${jaar}-${weeknummer}`);
  const beweging = laatsteBeweging.get(o.id) || null;
  const dagen = dagenGeleden(beweging);
  const werkdagenStil = beweging ? werkdagenGeleden(beweging) : dag;
  const stil = loopt && werkdagenStil >= STIL_NA_WERKDAGEN;
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
        opacity: loopt ? 1 : 0.75,
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

      {loopt ? (
        <>
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
        </>
      ) : (
        <div style={{ marginTop: 8, padding: "6px 10px", borderRadius: 8, background: C.bg, fontSize: 12, color: C.soft }}>
          {status === "afgerond" ? "Afgerond" : "Gestopt"}
          {o.afgerond_op ? ` op ${new Date(o.afgerond_op + "T00:00:00").toLocaleDateString("nl-NL")}` : ""}
          {o.reden ? ` · ${o.reden}` : ""}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginTop: 12, textAlign: "center" }}>
        <Stat label="Kennis" waarde={`${kennis}%`} kleur={C.works} />
        <Stat label="Vaardigh." waarde={`${vaardigheden}%`} kleur={C.accent} />
        <Stat label="Gesprekken" waarde={`${gevoerd}/${totaalKoppelingen}`} kleur={C.green} />
      </div>
    </button>
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
