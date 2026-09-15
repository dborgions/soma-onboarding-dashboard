import { useEffect, useState } from "react";
import { C } from "./theme";

export default function WeekNotitie({ magBewerken, tekst, laatsteDrie, onOpslaan }) {
  const [waarde, setWaarde] = useState(tekst || "");
  const [opgeslagen, setOpgeslagen] = useState(false);

  useEffect(() => {
    setWaarde(tekst || "");
  }, [tekst]);

  return (
    <div style={{ background: C.card, borderRadius: 14, padding: 16, boxShadow: "0 1px 6px rgba(0,0,0,0.06)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <div style={{ fontWeight: 700, color: C.group, marginBottom: 8 }}>Notitie deze week</div>
        {opgeslagen && <span style={{ fontSize: 11, color: C.green }}>Opgeslagen ✓</span>}
      </div>
      {magBewerken ? (
        <>
          <textarea
            value={waarde}
            onChange={(e) => {
              setWaarde(e.target.value);
              setOpgeslagen(false);
            }}
            onBlur={async () => {
              if (waarde === (tekst || "")) return;
              await onOpslaan(waarde);
              setOpgeslagen(true);
              setTimeout(() => setOpgeslagen(false), 3000);
            }}
            rows={3}
            placeholder="Wat viel op, wat spraken jullie af..."
            style={{ width: "100%", boxSizing: "border-box", borderRadius: 8, border: `1px solid ${C.line}`, padding: 8, fontSize: 13, fontFamily: "inherit" }}
          />
          <div style={{ fontSize: 11, color: C.soft, marginTop: 4 }}>Slaat automatisch op zodra je hier weg klikt.</div>
        </>
      ) : (
        <div style={{ fontSize: 13, color: waarde ? "inherit" : C.soft }}>{waarde || "Nog geen notitie."}</div>
      )}

      {laatsteDrie.length > 0 && (
        <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ fontSize: 11, color: C.soft }}>Eerdere weken</div>
          {laatsteDrie.map((n) => (
            <div key={`${n.jaar}-${n.weeknummer}`} style={{ fontSize: 12, background: C.bg, borderRadius: 8, padding: "6px 10px" }}>
              <div style={{ color: C.soft, fontSize: 11 }}>Week {n.weeknummer}</div>
              {n.tekst}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
