import { C } from "./theme";

export default function BevestigingsVenster({ onderwerpNaam, niveauLabel, criterium, onBevestig, onAnnuleer }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        zIndex: 100,
      }}
      onClick={onAnnuleer}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: C.card,
          borderRadius: 14,
          padding: 20,
          maxWidth: 360,
          width: "100%",
        }}
      >
        <div style={{ fontWeight: 700, color: C.group, marginBottom: 4 }}>{onderwerpNaam}</div>
        <div style={{ fontSize: 13, color: C.soft, marginBottom: 10 }}>Klopt dit voor "{niveauLabel}"?</div>
        <div style={{ fontSize: 14, marginBottom: 20 }}>{criterium}</div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onAnnuleer} style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: `1px solid ${C.line}`, background: "#fff", color: C.soft, cursor: "pointer" }}>
            Annuleren
          </button>
          <button onClick={onBevestig} style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: "none", background: C.works, color: "#fff", fontWeight: 600, cursor: "pointer" }}>
            Ja, dit klopt
          </button>
        </div>
      </div>
    </div>
  );
}
