import { C } from "./theme";

export default function Bolletjes({ max, huidigeNiveau, magTikken, onTik }) {
  const dots = [];
  for (let n = 1; n <= max; n++) {
    const gevuld = n <= huidigeNiveau;
    const klikbaar = magTikken(n);
    dots.push(
      <button
        key={n}
        disabled={!klikbaar}
        onClick={() => onTik(n)}
        aria-label={`Niveau ${n}`}
        style={{
          width: 34,
          height: 34,
          borderRadius: "50%",
          border: `2px solid ${gevuld ? C.works : C.line}`,
          background: gevuld ? C.works : "#fff",
          cursor: klikbaar ? "pointer" : "default",
          opacity: klikbaar ? 1 : 0.45,
          padding: 0,
        }}
      />
    );
  }
  return <div style={{ display: "flex", gap: 10 }}>{dots}</div>;
}
