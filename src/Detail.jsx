import { useState } from "react";
import { C } from "./theme";
import Tijdlijn from "./Tijdlijn.jsx";
import Voortgangsbalk from "./Voortgangsbalk.jsx";
import Bolletjes from "./Bolletjes.jsx";
import BevestigingsVenster from "./BevestigingsVenster.jsx";
import Toast from "./Toast.jsx";
import Opmerkingen from "./Opmerkingen.jsx";
import Logboek from "./Logboek.jsx";
import WeekSectie from "./WeekSectie.jsx";
import WeekNotitie from "./WeekNotitie.jsx";
import { programmadag, percentageVoorType, huidigeWeek } from "./lib/berekeningen.js";
import { magTikken, heeftBevestigingNodig } from "./lib/rechten.js";

export default function Detail({
  onboarder,
  onderwerpen,
  standMap,
  niveauLabels,
  mijlpalen,
  fasen,
  gebruiker,
  gebruikersNaam,
  opmerkingenLijst,
  logboekLijst,
  weekcijfersMap,
  weeknotitiesLijst,
  updateNiveau,
  undoNiveau,
  voegOpmerkingToe,
  slaWeekcijfersOp,
  slaWeeknotitieOp,
  terug,
}) {
  const magWeekBewerken = gebruiker.rol === "vm" || gebruiker.rol === "mentor";
  const { jaar, weeknummer } = huidigeWeek();
  const huidigeCijfers = weekcijfersMap.get(`${jaar}-${weeknummer}`);
  const huidigeNotitie = weeknotitiesLijst.find((n) => n.jaar === jaar && n.weeknummer === weeknummer);
  const eerdereNotities = weeknotitiesLijst
    .filter((n) => !(n.jaar === jaar && n.weeknummer === weeknummer))
    .sort((a, b) => b.jaar - a.jaar || b.weeknummer - a.weeknummer)
    .slice(0, 3);
  const [bevestiging, setBevestiging] = useState(null); // { onderwerp, nieuweNiveau }
  const [toast, setToast] = useState(null); // { onderwerpId, vanNiveau, naarNiveau, tekst }
  const [criteriaTonen, setCriteriaTonen] = useState(null); // onderwerp id

  const dag = programmadag(onboarder.startdatum);
  const kennis = percentageVoorType(standMap, onderwerpen, "kennis");
  const vaardigheden = percentageVoorType(standMap, onderwerpen, "vaardigheid");

  const onderwerpenZonderFase = onderwerpen.filter((o) => !o.fase_id);

  async function verwerkTik(onderwerp, huidigeNiveau, getikt) {
    const nieuweNiveau = getikt === huidigeNiveau ? huidigeNiveau - 1 : getikt;
    if (heeftBevestigingNodig(onderwerp, huidigeNiveau, nieuweNiveau)) {
      setBevestiging({ onderwerp, huidigeNiveau, nieuweNiveau });
      return;
    }
    await pasNiveauToe(onderwerp, huidigeNiveau, nieuweNiveau);
  }

  async function pasNiveauToe(onderwerp, huidigeNiveau, nieuweNiveau) {
    const resultaat = await updateNiveau(onboarder.id, onderwerp.id, nieuweNiveau);
    if (resultaat.ok) {
      setToast({
        onderwerpId: onderwerp.id,
        vanNiveau: huidigeNiveau,
        naarNiveau: nieuweNiveau,
        tekst: `${onderwerp.naam}: ${niveauLabels.get(nieuweNiveau)}`,
      });
    }
  }

  async function tochNiet() {
    if (!toast) return;
    await undoNiveau(onboarder.id, toast.onderwerpId, toast.vanNiveau);
    setToast(null);
  }

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", padding: 16, paddingBottom: 60 }}>
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

      {gebruiker.rol === "medewerker" && (
        <div style={{ fontSize: 12, color: C.soft, marginTop: 12, padding: "8px 12px", background: "#eef2f8", borderRadius: 10 }}>
          Stap 1 vink je zelf af. Vanaf stap 2 toon je het aan je VM of mentor.
        </div>
      )}

      <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 12 }}>
        <WeekSectie
          magBewerken={magWeekBewerken}
          cijfers={huidigeCijfers}
          onOpslaan={(waarden) => slaWeekcijfersOp(onboarder.id, waarden)}
        />
        <WeekNotitie
          magBewerken={magWeekBewerken}
          tekst={huidigeNotitie?.tekst}
          laatsteDrie={eerdereNotities}
          onOpslaan={(tekst) => slaWeeknotitieOp(onboarder.id, tekst)}
        />
      </div>

      <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 12 }}>
        {fasen.map((fase) => {
          const items = onderwerpen.filter((o) => o.fase_id === fase.id);
          if (items.length === 0) return null;
          return (
            <details key={fase.id} open style={{ background: C.card, borderRadius: 14, boxShadow: "0 1px 6px rgba(0,0,0,0.06)", borderLeft: `4px solid ${fase.kleur}` }}>
              <summary style={{ padding: "12px 16px", cursor: "pointer" }}>
                <div style={{ fontWeight: 600, color: C.group }}>{fase.label}</div>
                <div style={{ fontSize: 12, color: C.soft, fontWeight: 400 }}>{fase.sub}</div>
              </summary>
              <div style={{ padding: "0 16px 12px", display: "flex", flexDirection: "column", gap: 14 }}>
                {items.map((o) => {
                  const huidigeNiveau = standMap.get(o.id) || 0;
                  return (
                    <OnderwerpRegel
                      key={o.id}
                      onderwerp={o}
                      niveau={huidigeNiveau}
                      label={niveauLabels.get(huidigeNiveau)}
                      gebruiker={gebruiker}
                      onTik={(n) => verwerkTik(o, huidigeNiveau, n)}
                      criteriaOpen={criteriaTonen === o.id}
                      onToggleCriteria={() => setCriteriaTonen(criteriaTonen === o.id ? null : o.id)}
                      opmerkingen={opmerkingenLijst.filter((op) => op.onderwerp_id === o.id)}
                      gebruikersNaam={gebruikersNaam}
                      onOpmerkingToevoegen={(tekst) => voegOpmerkingToe(onboarder, o.id, tekst)}
                    />
                  );
                })}
              </div>
            </details>
          );
        })}
        {onderwerpenZonderFase.length > 0 && (
          <details open style={{ background: C.card, borderRadius: 14, boxShadow: "0 1px 6px rgba(0,0,0,0.06)", borderLeft: `4px solid ${C.soft}` }}>
            <summary style={{ padding: "12px 16px", fontWeight: 600, color: C.group, cursor: "pointer" }}>
              Nog niet ingedeeld
            </summary>
            <div style={{ padding: "0 16px 12px", display: "flex", flexDirection: "column", gap: 14 }}>
              {onderwerpenZonderFase.map((o) => {
                const huidigeNiveau = standMap.get(o.id) || 0;
                return (
                  <OnderwerpRegel
                    key={o.id}
                    onderwerp={o}
                    niveau={huidigeNiveau}
                    label={niveauLabels.get(huidigeNiveau)}
                    gebruiker={gebruiker}
                    onTik={(n) => verwerkTik(o, huidigeNiveau, n)}
                    criteriaOpen={criteriaTonen === o.id}
                    onToggleCriteria={() => setCriteriaTonen(criteriaTonen === o.id ? null : o.id)}
                    opmerkingen={opmerkingenLijst.filter((op) => op.onderwerp_id === o.id)}
                    gebruikersNaam={gebruikersNaam}
                    onOpmerkingToevoegen={(tekst) => voegOpmerkingToe(onboarder, o.id, tekst)}
                  />
                );
              })}
            </div>
          </details>
        )}
      </div>

      <div style={{ marginTop: 16 }}>
        <Logboek regels={logboekLijst} onderwerpNaam={new Map(onderwerpen.map((o) => [o.id, o.naam]))} niveauLabels={niveauLabels} gebruikersNaam={gebruikersNaam} />
      </div>

      {bevestiging && (
        <BevestigingsVenster
          onderwerpNaam={bevestiging.onderwerp.naam}
          niveauLabel={niveauLabels.get(bevestiging.nieuweNiveau)}
          criterium={bevestiging.nieuweNiveau === 3 ? bevestiging.onderwerp.criterium_3 : bevestiging.onderwerp.criterium_4}
          onAnnuleer={() => setBevestiging(null)}
          onBevestig={async () => {
            const { onderwerp, huidigeNiveau, nieuweNiveau } = bevestiging;
            setBevestiging(null);
            await pasNiveauToe(onderwerp, huidigeNiveau, nieuweNiveau);
          }}
        />
      )}

      {toast && <Toast tekst={toast.tekst} onTochNiet={tochNiet} onVerlopen={() => setToast(null)} />}
    </div>
  );
}

function OnderwerpRegel({ onderwerp, niveau, label, gebruiker, onTik, criteriaOpen, onToggleCriteria, opmerkingen, gebruikersNaam, onOpmerkingToevoegen }) {
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

      <div style={{ fontSize: 13, color: afgerond ? C.green : C.soft, fontWeight: afgerond ? 600 : 400, margin: "4px 0 8px" }}>
        {label}
      </div>

      <Bolletjes
        max={onderwerp.max_niveau}
        huidigeNiveau={niveau}
        magTikken={(n) => magTikken(gebruiker, onderwerp, niveau, n)}
        onTik={onTik}
      />

      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
        {onderwerp.aanspreekpunt && <span style={chipStijl}>Aanspreekpunt · {onderwerp.aanspreekpunt}</span>}
        {onderwerp.welder_link && (
          <a href={onderwerp.welder_link} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: C.works }}>
            Bekijk in Welder
          </a>
        )}
        {gebruiker.rol === "medewerker" && (onderwerp.criterium_3 || onderwerp.criterium_4) && (
          <button onClick={onToggleCriteria} style={{ fontSize: 12, color: C.works, background: "none", border: "none", padding: 0, cursor: "pointer" }}>
            Wat moet ik hiervoor laten zien?
          </button>
        )}
      </div>

      {criteriaOpen && (
        <div style={{ fontSize: 12, color: C.soft, marginTop: 6, background: C.bg, borderRadius: 8, padding: 8 }}>
          {onderwerp.criterium_3 && <div>Kan toepassen: {onderwerp.criterium_3}</div>}
          {onderwerp.criterium_4 && <div style={{ marginTop: 4 }}>Beheerst: {onderwerp.criterium_4}</div>}
        </div>
      )}

      <Opmerkingen opmerkingen={opmerkingen} gebruikersNaam={gebruikersNaam} onToevoegen={onOpmerkingToevoegen} />
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
