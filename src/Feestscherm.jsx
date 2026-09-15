import { useEffect } from "react";
import { C } from "./theme";
import { FEEST_VIDEO, FEEST_AFBEELDING } from "./feestConfig.js";
import { speelFeestGeluid } from "./lib/geluid.js";

const KLEUREN = [C.accent, C.works, C.green, C.group, "#f4c542"];
const heeftMedia = Boolean(FEEST_VIDEO || FEEST_AFBEELDING);

export default function Feestscherm({ onKlaar }) {
  useEffect(() => {
    // Bij een eigen video laten we het geluid van de video zelf horen, anders het melodietje.
    if (!heeftMedia) speelFeestGeluid();
    const t = setTimeout(onKlaar, heeftMedia ? 4500 : 3000);
    return () => clearTimeout(t);
  }, [onKlaar]);

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
        {FEEST_VIDEO && (
          <video
            src={`/feest/${FEEST_VIDEO}`}
            autoPlay
            playsInline
            style={{ maxWidth: 320, width: "80vw", borderRadius: 14, marginBottom: 18, boxShadow: "0 8px 24px rgba(0,0,0,.25)" }}
          />
        )}
        {!FEEST_VIDEO && FEEST_AFBEELDING && (
          <img
            src={`/feest/${FEEST_AFBEELDING}`}
            alt=""
            style={{ maxWidth: 320, width: "80vw", borderRadius: 14, marginBottom: 18, boxShadow: "0 8px 24px rgba(0,0,0,.25)" }}
          />
        )}
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
