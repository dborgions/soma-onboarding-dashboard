import { useEffect } from "react";
import { C } from "./theme";
import { FEEST_VIDEO, FEEST_AFBEELDING, FEEST_GELUID } from "./feestConfig.js";
import { speelFeestGeluid } from "./lib/geluid.js";

// Op GitHub Pages draait de app onder /soma-onboarding-dashboard/, lokaal onder /.
// Een pad dat met een schuine streep begint wijst daar dus naar de verkeerde plek;
// BASE_URL vult het juiste voorvoegsel in (vite.config.js bepaalt welke).
const FEEST_MAP = `${import.meta.env.BASE_URL}feest/`;

const KLEUREN = [C.accent, C.works, C.green, C.group, "#f4c542"];
const heeftBeeld = Boolean(FEEST_VIDEO || FEEST_AFBEELDING);

export default function Feestscherm({ onKlaar }) {
  useEffect(() => {
    // Bij een eigen video laten we het geluid van de video zelf horen.
    // Anders: het eigen geluidsbestand als dat is ingesteld, of het melodietje.
    if (!FEEST_VIDEO) {
      if (FEEST_GELUID) {
        new Audio(`${FEEST_MAP}${FEEST_GELUID}`).play().catch(() => {});
      } else {
        speelFeestGeluid();
      }
    }
    const t = setTimeout(onKlaar, heeftBeeld ? 4500 : 3000);
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
            src={`${FEEST_MAP}${FEEST_VIDEO}`}
            autoPlay
            playsInline
            style={{ maxWidth: 320, width: "80vw", borderRadius: 14, marginBottom: 18, boxShadow: "0 8px 24px rgba(0,0,0,.25)" }}
          />
        )}
        {!FEEST_VIDEO && FEEST_AFBEELDING && (
          <img
            src={`${FEEST_MAP}${FEEST_AFBEELDING}`}
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
