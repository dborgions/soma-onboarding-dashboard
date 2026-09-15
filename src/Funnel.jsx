import { C } from "./theme";

const STAPPEN = [
  { key: "intakes", label: "Intakes" },
  { key: "voorstelacties", label: "Voorstelacties" },
  { key: "gesprekken", label: "Gesprekken" },
  { key: "plaatsingen", label: "Plaatsingen" },
];

export default function Funnel({ cijfers }) {
  const max = Math.max(1, ...STAPPEN.map((s) => cijfers[s.key] || 0));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10 }}>
      {STAPPEN.map((s, i) => {
        const waarde = cijfers[s.key] || 0;
        const vorige = i > 0 ? cijfers[STAPPEN[i - 1].key] || 0 : null;
        const conversie = vorige ? Math.round((waarde / vorige) * 100) : null;
        return (
          <div key={s.key}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: C.soft, marginBottom: 2 }}>
              <span>{s.label}</span>
              <span>
                {waarde}
                {conversie !== null && ` · ${conversie}%`}
              </span>
            </div>
            <div style={{ background: C.line, borderRadius: 6, height: 14 }}>
              <div style={{ width: `${(waarde / max) * 100}%`, background: C.works, height: "100%", borderRadius: 6 }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
