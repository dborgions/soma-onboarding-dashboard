import { useEffect } from "react";
import { C } from "./theme";

export default function Toast({ tekst, onTochNiet, onVerlopen }) {
  useEffect(() => {
    const t = setTimeout(onVerlopen, 5000);
    return () => clearTimeout(t);
  }, [onVerlopen]);

  return (
    <div
      style={{
        position: "fixed",
        bottom: 20,
        left: "50%",
        transform: "translateX(-50%)",
        background: C.group,
        color: "#fff",
        borderRadius: 3,
        borderLeft: `4px solid ${C.accent}`,
        padding: "12px 16px",
        display: "flex",
        alignItems: "center",
        gap: 14,
        boxShadow: "0 4px 16px rgba(0,0,0,0.25)",
        zIndex: 200,
        maxWidth: "calc(100vw - 32px)",
      }}
    >
      <span style={{ fontSize: 13, fontWeight: 300 }}>{tekst}</span>
      {onTochNiet && (
        <button
          onClick={onTochNiet}
          style={{ background: "none", border: "none", color: C.accent, fontWeight: 700, fontSize: 11, letterSpacing: 1.1, textTransform: "uppercase", cursor: "pointer", whiteSpace: "nowrap" }}
        >
          Toch niet
        </button>
      )}
    </div>
  );
}
