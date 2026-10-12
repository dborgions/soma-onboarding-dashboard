import { useState } from "react";
import { C, knop, veldStijl } from "./theme";

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
            <div key={o.id} style={{ fontSize: 13, background: C.zacht, borderLeft: `3px solid ${C.works}`, padding: "7px 10px" }}>
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
            style={{ ...veldStijl, fontSize: 13.5, padding: 10, resize: "vertical" }}
          />
          <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
            <button onClick={versturen} data-knop="primair" style={{ ...knop("primair"), padding: "8px 14px", fontSize: 10.5 }}>
              Plaatsen
            </button>
            <button onClick={() => setOpen(false)} style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", padding: "8px 10px", border: "none", background: "none", color: C.soft, cursor: "pointer" }}>
              Annuleren
            </button>
          </div>
        </div>
      ) : (
        <button onClick={() => setOpen(true)} style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.9, textTransform: "uppercase", color: C.works, background: "none", border: "none", padding: 0, cursor: "pointer" }}>
          + Opmerking toevoegen
        </button>
      )}
    </div>
  );
}
