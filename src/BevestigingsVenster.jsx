import { C, R, SCHADUW, knop, inkeping } from "./theme";

export default function BevestigingsVenster({ onderwerpNaam, niveauLabel, criterium, onBevestig, onAnnuleer }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(23,26,64,0.55)",
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
          borderRadius: R.kaart,
          padding: 24,
          maxWidth: 380,
          width: "100%",
          position: "relative",
          boxShadow: SCHADUW.venster,
        }}
      >
        <span style={inkeping} />
        <div style={{ fontWeight: 700, color: C.group, fontSize: 16, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 4 }}>{onderwerpNaam}</div>
        <div style={{ fontSize: 12.5, color: C.soft, marginBottom: 12 }}>Klopt dit voor "{niveauLabel}"?</div>
        <div style={{ fontSize: 14, marginBottom: 22, lineHeight: 1.5, borderLeft: `3px solid ${C.accent}`, paddingLeft: 12 }}>{criterium}</div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onAnnuleer} data-knop="stil" style={{ ...knop("stil"), flex: 1, padding: "11px 0" }}>
            Annuleren
          </button>
          <button onClick={onBevestig} data-knop="primair" style={{ ...knop("primair"), flex: 1, padding: "11px 0" }}>
            Ja, dit klopt
          </button>
        </div>
      </div>
    </div>
  );
}
