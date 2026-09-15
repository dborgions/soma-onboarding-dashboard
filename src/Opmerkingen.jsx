import { useState } from "react";
import { C } from "./theme";

export default function Opmerkingen({ opmerkingen, gebruikersNaam, onToevoegen }) {
  const [tekst, setTekst] = useState("");
  const [open, setOpen] = useState(false);

  function versturen() {
    const t = tekst.trim();
    if (!t) return;
    onToevoegen(t);
    setTekst("");
    setOpen(false);
  }

  return (
    <div style={{ marginTop: 8 }}>
      {opmerkingen.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 8 }}>
          {opmerkingen.map((o) => (
            <div key={o.id} style={{ fontSize: 13, background: C.bg, borderRadius: 8, padding: "6px 10px" }}>
              <div style={{ color: C.soft, fontSize: 11 }}>
                {gebruikersNaam.get(o.door_gebruiker) || "?"} · dag {o.programmadag}
              </div>
              <div>{o.tekst}</div>
            </div>
          ))}
        </div>
      )}

      {open ? (
        <div>
          <textarea
            value={tekst}
            onChange={(e) => setTekst(e.target.value)}
            rows={2}
            placeholder="Opmerking..."
            style={{ width: "100%", boxSizing: "border-box", borderRadius: 8, border: `1px solid ${C.line}`, padding: 8, fontSize: 13, fontFamily: "inherit" }}
          />
          <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
            <button onClick={versturen} style={{ fontSize: 12, padding: "6px 12px", borderRadius: 8, border: "none", background: C.works, color: "#fff", cursor: "pointer" }}>
              Plaatsen
            </button>
            <button onClick={() => setOpen(false)} style={{ fontSize: 12, padding: "6px 12px", borderRadius: 8, border: "none", background: "none", color: C.soft, cursor: "pointer" }}>
              Annuleren
            </button>
          </div>
        </div>
      ) : (
        <button onClick={() => setOpen(true)} style={{ fontSize: 12, color: C.works, background: "none", border: "none", padding: 0, cursor: "pointer" }}>
          + Opmerking toevoegen
        </button>
      )}
    </div>
  );
}
