import { C } from "./theme";

export default function Logboek({ regels, onderwerpNaam, niveauLabels, gebruikersNaam }) {
  const gesorteerd = [...regels].sort((a, b) => new Date(b.tijdstip) - new Date(a.tijdstip));
  return (
    <details style={{ background: C.card, borderRadius: 14, boxShadow: "0 1px 6px rgba(0,0,0,0.06)" }}>
      <summary style={{ padding: "12px 16px", fontWeight: 600, color: C.group, cursor: "pointer" }}>
        Logboek ({gesorteerd.length})
      </summary>
      <div style={{ padding: "0 16px 12px", display: "flex", flexDirection: "column", gap: 8 }}>
        {gesorteerd.length === 0 && <div style={{ fontSize: 13, color: C.soft }}>Nog geen wijzigingen.</div>}
        {gesorteerd.map((r) => (
          <div key={r.id} style={{ fontSize: 13, borderTop: `1px solid ${C.line}`, paddingTop: 8 }}>
            <strong>{onderwerpNaam.get(r.onderwerp_id) || "?"}</strong>
            <div style={{ color: C.soft, fontSize: 12 }}>
              {niveauLabels.get(r.van_niveau)} &rarr; {niveauLabels.get(r.naar_niveau)} · {gebruikersNaam.get(r.door_gebruiker) || "?"} · dag {r.programmadag}
            </div>
          </div>
        ))}
      </div>
    </details>
  );
}
