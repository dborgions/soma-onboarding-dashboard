import { C } from "./theme";

const STATUSSEN = ["nog niet gepland", "ingepland", "gevoerd"];
const STIJL = {
  "nog niet gepland": { bg: C.bg, rand: C.line, tekst: C.soft },
  ingepland: { bg: "#fdeedd", rand: "#f7d3ab", tekst: "#9a5200" },
  gevoerd: { bg: "#e5f3ee", rand: "#bfe3d6", tekst: "#256b57" },
};

export default function SpecialistGesprekken({ kerncompetenties, specialisten, koppelingen, statusMap, onWijzig }) {
  return (
    <div style={{ background: C.card, borderRadius: 14, padding: 16, boxShadow: "0 1px 6px rgba(0,0,0,0.06)" }}>
      <div style={{ fontWeight: 700, color: C.group, marginBottom: 4 }}>Specialistgesprekken</div>
      <div style={{ fontSize: 12, color: C.soft, marginBottom: 12 }}>
        Geen agendakoppeling — de afspraak zelf maak je in Outlook, hier registreer je alleen de status.
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {kerncompetenties.map((comp) => {
          const specialistIds = koppelingen.filter((k) => k.competentie_id === comp.id).map((k) => k.specialist_id);
          if (specialistIds.length === 0) return null;
          const gevoerd = specialistIds.filter((sid) => statusMap.get(`${comp.id}-${sid}`) === "gevoerd").length;
          const compleet = gevoerd === specialistIds.length;

          return (
            <div key={comp.id} style={{ border: `1px solid ${compleet ? C.green : C.line}`, borderRadius: 12, padding: "10px 12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontWeight: 700, fontSize: 13.5 }}>{comp.naam}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: compleet ? C.green : C.soft }}>
                  {gevoerd}/{specialistIds.length}
                </span>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {specialistIds.map((specialistId) => {
                  const specialist = specialisten.find((s) => s.id === specialistId);
                  if (!specialist) return null;
                  const status = statusMap.get(`${comp.id}-${specialistId}`) || "nog niet gepland";
                  const stijl = STIJL[status];
                  return (
                    <button
                      key={specialistId}
                      onClick={() => onWijzig(comp.id, specialistId, status)}
                      style={{
                        textAlign: "left",
                        border: `1px solid ${stijl.rand}`,
                        background: stijl.bg,
                        color: stijl.tekst,
                        borderRadius: 10,
                        padding: "6px 11px",
                        cursor: "pointer",
                      }}
                    >
                      <span style={{ display: "block", fontSize: 12, fontWeight: 700, lineHeight: 1.2 }}>{specialist.naam}</span>
                      <span style={{ display: "block", fontSize: 9.5, opacity: 0.85, marginTop: 1 }}>{status}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export { STATUSSEN };
