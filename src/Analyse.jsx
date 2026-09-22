import { useEffect, useState } from "react";
import { C } from "./theme";
import Voortgangsbalk from "./Voortgangsbalk.jsx";
import { bouwAnalyse, CIJFERVELDEN } from "./lib/analyse.js";

// De 100-dagenanalyse (bouwplan hoofdstuk 16). Alles erop komt uit het systeem
// zelf; de VM vult alleen de drie velden onderaan in tijdens het gesprek.
// Bewust geen beoordelingsformulier: geen cijfers, geen scores, geen ranglijst.
export default function Analyse({
  onboarder,
  gebruiker,
  gebruikersNaam,
  onderwerpen,
  standMap,
  niveauLabels,
  fasen,
  weekcijfersMap,
  gesprekkenLijst,
  kerncompetenties,
  specialisten,
  koppelingen,
  nulmetingMap,
  logboekLijst,
  analyse,
  onOpslaan,
  onZetStatus,
  terug,
}) {
  const magInvullen = gebruiker.rol === "vm" || gebruiker.rol === "mentor";
  const data = bouwAnalyse({
    onboarder,
    onderwerpen,
    standMap,
    niveauLabels,
    fasen,
    weekcijfersMap,
    gesprekkenLijst,
    kerncompetenties,
    specialisten,
    koppelingen,
    nulmetingMap,
    logboekLijst,
  });
  const [afrondenOpen, setAfrondenOpen] = useState(null); // 'afgerond' | 'gestopt'
  const [statusFout, setStatusFout] = useState("");
  const onderwerpNaam = new Map(onderwerpen.map((o) => [o.id, o.naam]));
  const competentieNaam = new Map(kerncompetenties.map((c) => [c.id, c.naam]));
  const specialistNaam = new Map(specialisten.map((s) => [s.id, s.naam]));

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 16, paddingBottom: 60 }}>
      <style>{`@media print { .geen-print { display: none !important; } body { background: #fff; } }`}</style>

      <div className="geen-print" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <button onClick={terug} style={{ background: "none", border: "none", color: C.works, fontSize: 14, padding: 0, cursor: "pointer" }}>
          &larr; Terug naar dossier
        </button>
        <button
          onClick={() => window.print()}
          style={{ fontSize: 12, padding: "8px 14px", borderRadius: 8, border: `1px solid ${C.line}`, background: "#fff", color: C.soft, cursor: "pointer" }}
        >
          Afdrukken of opslaan als pdf
        </button>
      </div>

      <div style={{ background: C.group, color: "#fff", borderRadius: 14, padding: 20 }}>
        <div style={{ fontSize: 12, opacity: 0.8 }}>100-dagenanalyse</div>
        <div style={{ fontSize: 24, fontWeight: 800, marginTop: 2 }}>{onboarder.naam}</div>
        <div style={{ fontSize: 13, opacity: 0.85, marginTop: 2 }}>
          {onboarder.vestigingen?.naam} · gestart op {datumNL(onboarder.startdatum)} · dag {data.dag} van {onboarder.programma_dagen}
        </div>
        {onboarder.status !== "actief" && (
          <div style={{ fontSize: 12, marginTop: 8, background: "rgba(255,255,255,0.15)", borderRadius: 8, padding: "6px 10px", display: "inline-block" }}>
            {onboarder.status === "afgerond" ? "Afgerond" : "Gestopt"}
            {onboarder.afgerond_op ? ` op ${datumNL(onboarder.afgerond_op)}` : ""}
            {onboarder.reden ? ` · ${onboarder.reden}` : ""}
          </div>
        )}
      </div>

      <p style={{ fontSize: 12.5, color: C.soft, margin: "12px 2px 0" }}>
        Dit is een foto van honderd dagen plus een afspraak. Geen beoordeling, geen cijfers, geen vergelijking met collega's.
      </p>

      <Blok titel="Voortgang per fase">
        {data.fasenVoortgang.length === 0 && <Leeg>Er zijn nog geen fases ingericht.</Leeg>}
        {data.fasenVoortgang.map(({ fase, percentage, beheerst, nogNiet }) => (
          <div key={fase.id} style={{ borderTop: `1px solid ${C.line}`, paddingTop: 10, marginTop: 10 }}>
            <Voortgangsbalk label={fase.label} percentage={percentage} kleur={fase.kleur} />
            <div style={{ fontSize: 12.5, marginTop: 8 }}>
              <div style={{ color: C.green, fontWeight: 600 }}>
                Beheerst ({beheerst.length}){beheerst.length > 0 && ": "}
                <span style={{ fontWeight: 400, color: "inherit" }}>{beheerst.join(", ")}</span>
              </div>
              {nogNiet.length > 0 && (
                <div style={{ color: C.soft, marginTop: 4 }}>
                  Nog niet af ({nogNiet.length}): {nogNiet.map((o) => `${o.naam} — ${o.label.toLowerCase()}`).join(", ")}
                </div>
              )}
            </div>
          </div>
        ))}
      </Blok>

      <Blok titel="Groei sinds dag 30">
        <div style={{ fontSize: 12, color: C.soft }}>
          Links de nulmeting van dag 30 op de tienpuntsschaal, rechts wat hij er sindsdien aan gedaan heeft.
        </div>
        {data.competenties.map((c) => (
          <div key={c.naam} style={{ borderTop: `1px solid ${C.line}`, paddingTop: 10, marginTop: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
              <span style={{ fontWeight: 600 }}>{c.naam}</span>
              <span style={{ fontSize: 12.5, color: C.soft }}>
                {c.tienpunt === null ? "nulmeting niet ingevuld" : `${c.tienpunt}/10 · ${c.scoreLabel.toLowerCase()}`}
                {" · "}
                {c.gesprekkenGevoerd} van {c.gesprekkenTotaal} gesprekken gevoerd
              </span>
            </div>
            {c.gesprekspartners.length > 0 && (
              <div style={{ fontSize: 12, color: C.soft, marginTop: 3 }}>Sprak met {c.gesprekspartners.join(", ")}.</div>
            )}
            {c.notitie && <div style={{ fontSize: 12.5, marginTop: 4, background: C.bg, borderRadius: 8, padding: "6px 10px" }}>{c.notitie}</div>}
          </div>
        ))}
        {data.investeringsadvies && (
          <div style={{ fontSize: 12.5, color: C.soft, marginTop: 12 }}>
            Investeringsadvies bij de nulmeting: <strong style={{ color: C.group }}>{data.investeringsadvies}</strong>.
          </div>
        )}
      </Blok>

      <Blok titel="Zijn cijfers over de hele periode">
        <div style={{ fontSize: 12, color: C.soft }}>
          {data.cijfers.aantalWeken === 0
            ? "Er zijn nog geen weken ingevuld."
            : `Over ${data.cijfers.aantalWeken} ingevulde ${data.cijfers.aantalWeken === 1 ? "week" : "weken"}.`}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(110px, 100%), 1fr))", gap: 10, marginTop: 10 }}>
          {CIJFERVELDEN.map((veld) => (
            <div key={veld.key} style={{ background: C.bg, borderRadius: 10, padding: "10px 8px", textAlign: "center" }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: C.group }}>{data.cijfers.totalen[veld.key]}</div>
              <div style={{ fontSize: 10.5, color: C.soft }}>{veld.label}</div>
              <div style={{ fontSize: 10.5, color: C.soft, marginTop: 2 }}>
                {data.cijfers.gemiddelden[veld.key].toFixed(1)} per week
              </div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 12.5, color: C.soft, marginTop: 10 }}>
          Conversie:{" "}
          {data.cijfers.conversie
            .map((s) => `${labelVan(s.van)} → ${labelVan(s.naar)} ${s.percentage === null ? "n.v.t." : s.percentage + "%"}`)
            .join(" · ")}
        </div>
      </Blok>

      <Blok titel={`Specialistgesprekken (${data.gesprekken.length})`}>
        {data.gesprekken.length === 0 && <Leeg>Nog geen gesprekken gevoerd.</Leeg>}
        {data.gesprekken.map((g, i) => (
          <div key={i} style={{ fontSize: 12.5, borderTop: `1px solid ${C.line}`, paddingTop: 8, marginTop: 8 }}>
            <strong>{g.specialist}</strong> · {g.competentie}
            <span style={{ color: C.soft }}> · dag {g.programmadag}</span>
          </div>
        ))}
      </Blok>

      <Blok titel={`Uit het logboek (${data.leercurve.length})`}>
        <div style={{ fontSize: 12, color: C.soft }}>Wanneer hij welke stap zette, op volgorde van de eerste tot de laatste.</div>
        {data.leercurve.length === 0 && <Leeg>Nog geen wijzigingen.</Leeg>}
        {data.leercurve.map((r) => {
          const isGesprek = r.onderwerp_id == null;
          return (
            <div key={r.id} style={{ fontSize: 12.5, borderTop: `1px solid ${C.line}`, paddingTop: 8, marginTop: 8 }}>
              <span style={{ color: C.soft }}>Dag {r.programmadag} · </span>
              <strong>
                {isGesprek
                  ? `${competentieNaam.get(r.competentie_id) || "?"} · ${specialistNaam.get(r.specialist_id) || "?"}`
                  : onderwerpNaam.get(r.onderwerp_id) || "?"}
              </strong>
              <span style={{ color: C.soft }}>
                {" — "}
                {isGesprek ? `${r.van_status} → ${r.naar_status}` : `${niveauLabels.get(r.van_niveau)} → ${niveauLabels.get(r.naar_niveau)}`}
                {" · "}
                {gebruikersNaam.get(r.door_gebruiker) || "?"}
              </span>
            </div>
          );
        })}
      </Blok>

      <Blok titel="Het gesprek">
        <div style={{ fontSize: 12, color: C.soft, marginBottom: 4 }}>
          {magInvullen ? "Vul je tijdens het gesprek in; slaat automatisch op zodra je weg klikt." : "Ingevuld door je VM tijdens het eindgesprek."}
        </div>
        <Veld
          label="Waar is hij sterk in?"
          waarde={analyse?.sterk || ""}
          magInvullen={magInvullen}
          onOpslaan={(tekst) => onOpslaan({ sterk: tekst })}
        />
        <Veld
          label="Waar ligt zijn werk voor het komende halfjaar?"
          waarde={analyse?.werk_komend_halfjaar || ""}
          magInvullen={magInvullen}
          onOpslaan={(tekst) => onOpslaan({ werk_komend_halfjaar: tekst })}
        />
        <Veld
          label="Welke afspraak maken we?"
          waarde={analyse?.afspraak || ""}
          magInvullen={magInvullen}
          onOpslaan={(tekst) => onOpslaan({ afspraak: tekst })}
        />

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(220px, 100%), 1fr))", gap: 24, marginTop: 28 }}>
          <Handtekening label={`Handtekening ${onboarder.naam}`} />
          <Handtekening label="Handtekening vestigingsmanager" />
        </div>
      </Blok>

      {magInvullen && onboarder.status === "actief" && (
        <div className="geen-print" style={{ background: C.card, borderRadius: 14, padding: 16, marginTop: 16, boxShadow: "0 1px 6px rgba(0,0,0,0.06)" }}>
          <div style={{ fontWeight: 700, color: C.group }}>Dossier afsluiten</div>
          <div style={{ fontSize: 12.5, color: C.soft, marginTop: 4 }}>
            Daarna verdwijnt hij uit het actieve overzicht en staat hij onder "Afgerond". Het dossier blijft bewaard en je kunt het hier blijven teruglezen.
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
            <button onClick={() => setAfrondenOpen("afgerond")} style={knop(C.works)}>
              Programma afgerond
            </button>
            <button onClick={() => setAfrondenOpen("gestopt")} style={knop(C.accent)}>
              Gestopt
            </button>
          </div>
          {statusFout && <div style={{ fontSize: 12, color: C.error, marginTop: 8 }}>Niet gelukt: {statusFout}</div>}
        </div>
      )}

      {magInvullen && onboarder.status !== "actief" && (
        <div className="geen-print" style={{ marginTop: 16, textAlign: "center" }}>
          <button
            onClick={async () => {
              const resultaat = await onZetStatus("actief", null);
              if (resultaat?.ok === false) setStatusFout(resultaat.fout);
            }}
            style={{ fontSize: 12, background: "none", border: "none", color: C.works, cursor: "pointer" }}
          >
            Toch weer actief maken
          </button>
          {statusFout && <div style={{ fontSize: 12, color: C.error, marginTop: 8 }}>Niet gelukt: {statusFout}</div>}
        </div>
      )}

      {afrondenOpen && (
        <AfrondVenster
          status={afrondenOpen}
          naam={onboarder.naam}
          onAnnuleer={() => setAfrondenOpen(null)}
          onBevestig={async (reden) => {
            const status = afrondenOpen;
            setAfrondenOpen(null);
            setStatusFout("");
            const resultaat = await onZetStatus(status, reden);
            if (resultaat?.ok === false) setStatusFout(resultaat.fout);
          }}
        />
      )}
    </div>
  );
}

function Veld({ label, waarde, magInvullen, onOpslaan }) {
  const [tekst, setTekst] = useState(waarde);
  const [opgeslagen, setOpgeslagen] = useState(false);
  const [fout, setFout] = useState("");

  useEffect(() => {
    setTekst(waarde);
  }, [waarde]);

  return (
    <div style={{ marginTop: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 6 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: C.group }}>{label}</div>
        {opgeslagen && <span style={{ fontSize: 11, color: C.green }}>Opgeslagen ✓</span>}
        {fout && <span style={{ fontSize: 11, color: C.error }}>Niet opgeslagen: {fout}</span>}
      </div>
      {magInvullen ? (
        <textarea
          value={tekst}
          onChange={(e) => {
            setTekst(e.target.value);
            setOpgeslagen(false);
            setFout("");
          }}
          onBlur={async () => {
            if (tekst === waarde) return;
            const resultaat = await onOpslaan(tekst);
            if (resultaat?.ok === false) {
              setFout(resultaat.fout);
              return;
            }
            setOpgeslagen(true);
            setTimeout(() => setOpgeslagen(false), 3000);
          }}
          rows={3}
          style={{ width: "100%", boxSizing: "border-box", borderRadius: 8, border: `1px solid ${C.line}`, padding: 8, fontSize: 13, fontFamily: "inherit", marginTop: 4 }}
        />
      ) : (
        <div style={{ fontSize: 13, marginTop: 4, color: tekst ? "inherit" : C.soft }}>{tekst || "Nog niet ingevuld."}</div>
      )}
    </div>
  );
}

function AfrondVenster({ status, naam, onAnnuleer, onBevestig }) {
  const [reden, setReden] = useState("");
  const isGestopt = status === "gestopt";

  return (
    <div
      onClick={onAnnuleer}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, zIndex: 100 }}
    >
      <div onClick={(e) => e.stopPropagation()} style={{ background: C.card, borderRadius: 14, padding: 20, maxWidth: 380, width: "100%" }}>
        <div style={{ fontWeight: 700, color: C.group, marginBottom: 4 }}>
          {isGestopt ? `${naam} stopzetten?` : `${naam} afronden?`}
        </div>
        <div style={{ fontSize: 13, color: C.soft, marginBottom: 12 }}>
          {isGestopt
            ? "Het dossier krijgt de status gestopt, met de reden en de datum van vandaag. De analyse hierboven is dan de onderbouwing van het besluit."
            : "Het dossier krijgt de status afgerond, met de datum van vandaag, en verhuist naar het kopje “Afgerond”."}
        </div>
        <textarea
          value={reden}
          onChange={(e) => setReden(e.target.value)}
          rows={2}
          placeholder={isGestopt ? "Reden (bijvoorbeeld: afgevallen in de proeftijd)" : "Eventuele opmerking (mag leeg)"}
          style={{ width: "100%", boxSizing: "border-box", borderRadius: 8, border: `1px solid ${C.line}`, padding: 8, fontSize: 13, fontFamily: "inherit", marginBottom: 14 }}
        />
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onAnnuleer} style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: `1px solid ${C.line}`, background: "#fff", color: C.soft, cursor: "pointer" }}>
            Annuleren
          </button>
          <button
            onClick={() => onBevestig(reden)}
            disabled={isGestopt && !reden.trim()}
            style={{
              flex: 1,
              padding: "10px 0",
              borderRadius: 10,
              border: "none",
              background: isGestopt && !reden.trim() ? C.line : isGestopt ? C.accent : C.works,
              color: "#fff",
              fontWeight: 600,
              cursor: isGestopt && !reden.trim() ? "not-allowed" : "pointer",
            }}
          >
            {isGestopt ? "Stopzetten" : "Afronden"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Blok({ titel, children }) {
  return (
    <div style={{ background: C.card, borderRadius: 14, padding: 16, marginTop: 16, boxShadow: "0 1px 6px rgba(0,0,0,0.06)" }}>
      <div style={{ fontWeight: 700, color: C.group, marginBottom: 6 }}>{titel}</div>
      {children}
    </div>
  );
}

function Leeg({ children }) {
  return <div style={{ fontSize: 12.5, color: C.soft, marginTop: 6 }}>{children}</div>;
}

function Handtekening({ label }) {
  return (
    <div>
      <div style={{ borderBottom: `1px solid ${C.soft}`, height: 34 }} />
      <div style={{ fontSize: 11, color: C.soft, marginTop: 4 }}>{label}</div>
    </div>
  );
}

function knop(kleur) {
  return { padding: "10px 16px", borderRadius: 10, border: "none", background: kleur, color: "#fff", fontWeight: 600, fontSize: 13, cursor: "pointer" };
}

function labelVan(key) {
  return CIJFERVELDEN.find((v) => v.key === key)?.label.replace(/ \(.*\)/, "") || key;
}

function datumNL(datum) {
  if (!datum) return "";
  return new Date(datum + "T00:00:00").toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" });
}
