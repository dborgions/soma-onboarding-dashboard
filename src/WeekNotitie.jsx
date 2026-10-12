import { useEffect, useState } from "react";
import { C, kaartStijl, kopStijl, veldStijl } from "./theme";

export default function WeekNotitie({ magBewerken, tekst, laatsteDrie, onOpslaan }) {
  const [waarde, setWaarde] = useState(tekst || "");
  const [opgeslagen, setOpgeslagen] = useState(false);

  useEffect(() => {
    setWaarde(tekst || "");
  }, [tekst]);

  return (
    <div style={kaartStijl}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 6 }}>
        <h2 style={{ ...kopStijl, marginBottom: 8 }}>Notitie deze week</h2>
        {opgeslagen && <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: C.green }}>Opgeslagen</span>}
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
            style={{ ...veldStijl, fontSize: 13.5, padding: 10, resize: "vertical" }}
          />
          <div style={{ fontSize: 11, color: C.soft, marginTop: 4 }}>Slaat automatisch op zodra je hier weg klikt.</div>
        </>
      ) : (
        <div style={{ fontSize: 13, color: waarde ? "inherit" : C.soft }}>{waarde || "Nog geen notitie."}</div>
      )}

      {laatsteDrie.length > 0 && (
        <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ fontSize: 10, color: C.soft, textTransform: "uppercase", letterSpacing: 1.2, fontWeight: 700 }}>Eerdere weken</div>
          {laatsteDrie.map((n) => (
            <div key={`${n.jaar}-${n.weeknummer}`} style={{ fontSize: 12, background: C.zacht, borderLeft: `3px solid ${C.line}`, padding: "7px 10px" }}>
              <div style={{ color: C.soft, fontSize: 11 }}>Week {n.weeknummer}</div>
              {n.tekst}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
