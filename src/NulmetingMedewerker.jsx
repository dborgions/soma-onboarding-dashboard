import { C } from "./theme";
import { scoreNaarTienpunt } from "./lib/nulmeting.js";

export default function NulmetingMedewerker({ kerncompetenties, nulmetingMap, koppelingen, specialisten, gesprekkenLijst }) {
  const sterk = kerncompetenties.filter((c) => nulmetingMap.get(c.id)?.score === 3);
  const groei = kerncompetenties.filter((c) => nulmetingMap.get(c.id)?.score === 1);

  function statusVoorSpecialist(competentieId, specialistId) {
    const g = gesprekkenLijst.find((x) => x.competentie_id === competentieId && x.specialist_id === specialistId);
    if (!g) return "nog plannen";
    if (g.status === "ingepland") return "staat gepland";
    return "gevoerd — dus toepassen";
  }

  return (
    <div style={{ background: C.card, borderRadius: 14, padding: 16, boxShadow: "0 1px 6px rgba(0,0,0,0.06)" }}>
      <div style={{ fontWeight: 700, color: C.group, marginBottom: 4 }}>Nulmeting dag 30</div>
      <div style={{ fontSize: 12, color: C.soft, marginBottom: 14 }}>
        Je startpunt en groeipotentieel op de zeven kerncompetenties. Tien is expertniveau — daar groei je naartoe.
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
        {kerncompetenties.map((c) => {
          const punt = scoreNaarTienpunt(nulmetingMap.get(c.id)?.score);
          return (
            <div key={c.id}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 2 }}>
                <span>{c.naam}</span>
                <span style={{ color: C.soft }}>{punt} / 10</span>
              </div>
              <div style={{ background: C.line, borderRadius: 99, height: 7 }}>
                <div style={{ width: `${punt * 10}%`, background: C.works, height: "100%", borderRadius: 99 }} />
              </div>
            </div>
          );
        })}
      </div>

      {sterk.length > 0 && (
        <div style={{ background: "#eafaf3", borderRadius: 10, padding: 12, marginBottom: 12 }}>
          <div style={{ fontWeight: 600, fontSize: 13, color: C.green, marginBottom: 4 }}>Waar je sterk in bent</div>
          <div style={{ fontSize: 12, color: C.soft, marginBottom: 6 }}>
            Juist hier wordt het meeste van je verwacht.
          </div>
          {sterk.map((c) => (
            <div key={c.id} style={{ fontSize: 13, fontWeight: 500 }}>{c.naam}</div>
          ))}
        </div>
      )}

      {groei.length > 0 && (
        <div style={{ background: "#fdeee0", borderRadius: 10, padding: 12 }}>
          <div style={{ fontWeight: 600, fontSize: 13, color: C.accent, marginBottom: 4 }}>Waar je werk ligt</div>
          {groei.map((c) => {
            const specialistIds = koppelingen.filter((k) => k.competentie_id === c.id).map((k) => k.specialist_id);
            const notitie = nulmetingMap.get(c.id)?.notitie;
            return (
              <div key={c.id} style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{c.naam}</div>
                {notitie && <div style={{ fontSize: 12, color: C.soft, marginTop: 2 }}>{notitie}</div>}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6 }}>
                  {specialistIds.map((sid) => {
                    const specialist = specialisten.find((s) => s.id === sid);
                    if (!specialist) return null;
                    return (
                      <span key={sid} style={{ fontSize: 11, padding: "3px 10px", borderRadius: 99, background: "#fff", border: `1px solid ${C.line}`, color: C.soft }}>
                        {specialist.naam} · {statusVoorSpecialist(c.id, sid)}
                      </span>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
