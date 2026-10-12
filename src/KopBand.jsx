import { C } from "./theme";

const FOTO = `${import.meta.env.BASE_URL}inlog/lasser.jpg`;

// De kopband brengt de sfeer van het inlogscherm mee: de foto, de blauwe laag
// en de titel in koeienletters. Daaronder blijft het werkvlak rustig en wit.
export default function KopBand({ kicker, titel, onderschrift, rechts, donker = false }) {
  return (
    <div
      className="soma-band"
      style={{
        background: `#11142e url('${FOTO}') 56% 42% / cover no-repeat`,
      }}
    >
      <div
        className="soma-band-laag"
        style={{
          background: donker
            ? "linear-gradient(100deg, rgba(17,20,46,.98) 0%, rgba(17,20,46,.95) 45%, rgba(17,20,46,.78) 100%)"
            : "linear-gradient(100deg, rgba(23,26,64,.96) 0%, rgba(23,26,64,.86) 34%, rgba(20,23,56,.42) 100%)",
        }}
      >
        <div className="soma-band-inhoud">
          <div style={{ minWidth: 0 }}>
            {kicker && <div className="soma-band-kicker">{kicker}</div>}
            <h1 className="soma-band-titel">{titel}</h1>
            {onderschrift && <div className="soma-band-onder">{onderschrift}</div>}
          </div>
          {rechts && <div style={{ textAlign: "right", whiteSpace: "nowrap", flexShrink: 0 }}>{rechts}</div>}
        </div>
      </div>
    </div>
  );
}

// Grote dagteller rechts in de band, in dezelfde opmaak als op het inlogscherm.
export function BandCijfer({ waarde, van, label }) {
  return (
    <div>
      <div style={{ lineHeight: 1 }}>
        <span className="soma-band-cijfer" style={{ fontWeight: 700, color: C.accent }}>{waarde}</span>
        {van && <span className="soma-band-van" style={{ color: "rgba(255,255,255,.65)" }}>/{van}</span>}
      </div>
      {label && <div className="soma-band-label">{label}</div>}
    </div>
  );
}
