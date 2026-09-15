import { C } from "./theme";

export default function Voortgangsbalk({ label, percentage, kleur }) {
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: C.soft, marginBottom: 3 }}>
        <span>{label}</span>
        <span>{percentage}%</span>
      </div>
      <div style={{ background: C.line, borderRadius: 99, height: 7 }}>
        <div
          style={{
            width: `${percentage}%`,
            background: kleur || C.works,
            height: "100%",
            borderRadius: 99,
          }}
        />
      </div>
    </div>
  );
}
