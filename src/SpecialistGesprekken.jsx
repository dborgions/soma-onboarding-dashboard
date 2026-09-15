import { C } from "./theme";

const STATUSSEN = ["nog niet gepland", "ingepland", "gevoerd"];
const KLEUR = { "nog niet gepland": C.soft, ingepland: C.accent, gevoerd: C.green };

export default function SpecialistGesprekken({ kerncompetenties, specialisten, koppelingen, statusMap, onWijzig }) {
  return (
    <div style={{ background: C.card, borderRadius: 14, padding: 16, boxShadow: "0 1px 6px rgba(0,0,0,0.06)" }}>
      <div style={{ fontWeight: 700, color: C.group, marginBottom: 4 }}>Specialistgesprekken</div>
      <div style={{ fontSize: 12, color: C.soft, marginBottom: 12 }}>
        Geen agendakoppeling — de afspraak zelf maak je in Outlook, hier registreer je alleen de status.
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {kerncompetenties.map((comp) => {
          const specialistIds = koppelingen.filter((k) => k.competentie_id === comp.id).map((k) => k.specialist_id);
          if (specialistIds.length === 0) return null;
          return (
            <div key={comp.id}>
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 6 }}>{comp.naam}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {specialistIds.map((specialistId) => {
                  const specialist = specialisten.find((s) => s.id === specialistId);
                  if (!specialist) return null;
                  const status = statusMap.get(`${comp.id}-${specialistId}`) || "nog niet gepland";
                  return (
                    <div key={specialistId} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 13 }}>{specialist.naam}</span>
                      <button
                        onClick={() => onWijzig(comp.id, specialistId, status)}
                        style={{
                          fontSize: 11,
                          padding: "3px 10px",
                          borderRadius: 99,
                          border: "none",
                          background: KLEUR[status] + "22",
                          color: KLEUR[status],
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        {status}
                      </button>
                    </div>
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
