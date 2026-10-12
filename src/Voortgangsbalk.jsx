import { C } from "./theme";

export default function Voortgangsbalk({ label, percentage, kleur }) {
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10.5, color: C.soft, marginBottom: 4, textTransform: "uppercase", letterSpacing: 1 }}>
        <span>{label}</span>
        <span>{percentage}%</span>
      </div>
      <div style={{ background: C.line, height: 7 }}>
        <div
          style={{
            width: `${percentage}%`,
            background: kleur || C.works,
            height: "100%",
          }}
        />
      </div>
    </div>
  );
}
