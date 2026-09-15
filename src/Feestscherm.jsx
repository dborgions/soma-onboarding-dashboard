import { C } from "./theme";

const KLEUREN = [C.accent, C.works, C.green, C.group, "#f4c542"];

export default function Feestscherm({ onKlaar }) {
  const confetti = Array.from({ length: 60 }, (_, i) => ({
    id: i,
    links: Math.random() * 100,
    kleur: KLEUREN[i % KLEUREN.length],
    vertraging: Math.random() * 0.6,
    duur: 1.8 + Math.random() * 1.2,
    draai: Math.random() * 360,
  }));

  return (
    <div
      onClick={onKlaar}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(44,47,123,0.85)",
        zIndex: 300,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        cursor: "pointer",
      }}
    >
      {confetti.map((c) => (
        <span
          key={c.id}
          style={{
            position: "absolute",
            top: -20,
            left: `${c.links}%`,
            width: 10,
            height: 14,
            background: c.kleur,
            transform: `rotate(${c.draai}deg)`,
            animation: `soma-val ${c.duur}s linear ${c.vertraging}s forwards`,
          }}
        />
      ))}
      <div style={{ textAlign: "center", color: "#fff" }}>
        <div style={{ fontSize: 42, fontWeight: 800 }}>Ik heb er eentje! 🎉</div>
        <div style={{ marginTop: 8, opacity: 0.85 }}>Plaatsing gemeld — tik om door te gaan</div>
      </div>
      <style>{`
        @keyframes soma-val {
          to { transform: translateY(110vh) rotate(600deg); }
        }
      `}</style>
    </div>
  );
}
