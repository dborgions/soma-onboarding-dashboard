import { C } from "./theme";

export default function Tijdlijn({ dag, programmaDagen, mijlpalen }) {
  const p = Math.min((dag / programmaDagen) * 100, 100);
  return (
    <div>
      <div style={{ position: "relative", background: C.line, borderRadius: 99, height: 10, marginTop: 10 }}>
        <div style={{ width: `${p}%`, background: C.accent, height: "100%", borderRadius: 99 }} />
        {mijlpalen.map((m) => (
          <div
            key={m.id}
            title={`${m.naam} (dag ${m.dag})`}
            style={{
              position: "absolute",
              left: `${Math.min((m.dag / programmaDagen) * 100, 100)}%`,
              top: -3,
              width: 2,
              height: 16,
              background: C.group,
            }}
          />
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: C.soft, marginTop: 6 }}>
        <span>Dag {dag} van {programmaDagen}</span>
        <span>{mijlpalen.map((m) => `${m.naam} (dag ${m.dag})`).join(" · ")}</span>
      </div>
    </div>
  );
}
