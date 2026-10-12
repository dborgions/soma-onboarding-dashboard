// SOMA huisstijl, volgens het Brandbook 2025 en de stijl van het inlogscherm.
// Kleuren, typografie, hoeken en knoppen staan hier. Schermen verwijzen hiernaar,
// zodat een wijziging aan de huisstijl op één plek gebeurt.

export const C = {
  // Brandbook kleurenpalet
  group: "#2c2f7b", // SOMA Group, de drager
  diep: "#1b1e46", // donkerder blauw voor balken en overlays
  works: "#3b73ad", // SOMA Works
  accent: "#f18825", // oranje: actie en scoren
  green: "#6db9a0", // SOMA Professionals, hier: afgerond
  rood: "#a42545", // SOMA Personeelsdiensten, hier: signaal
  paars: "#472260", // SOMA Internationals
  geel: "#ddc843", // SOMA Vakmeesters

  bg: "#f3f5f9",
  card: "#ffffff",
  soft: "#6b7280",
  line: "#e3e7ee",
  zacht: "#eef1f7", // rustige vlakken binnen een kaart
  zachtOranje: "#fdeee0",
  error: "#c0392b",
};

// Typografie: de verhoudingen van het brandbook (factor 1,333), teruggeschaald
// naar schermformaat zodat het op een telefoon leesbaar blijft.
export const T = {
  h1: 30,
  h2: 22,
  h3: 18,
  h4: 16,
  body: 14,
  klein: 12.5,
  micro: 11,
};

// Het brandbook is hoekig. Nul is de norm, een paar pixels waar een vlak
// anders te hard tegen de rand aan loopt.
export const R = {
  kaart: 2,
  knop: 3,
  chip: 2,
};

export const SCHADUW = {
  kaart: "0 2px 10px rgba(23,26,64,.07)",
  venster: "0 24px 60px rgba(0,0,0,.42)",
};

export const FONT = "'Mozilla Text', 'Segoe UI', system-ui, -apple-system, sans-serif";

// Sectiekop: hoofdletters met ruime letterspatiëring, zoals op het inlogscherm.
export const kopStijl = {
  fontSize: T.micro,
  fontWeight: 700,
  letterSpacing: 1.6,
  textTransform: "uppercase",
  color: C.group,
  margin: 0,
};

export const kaartStijl = {
  background: C.card,
  borderRadius: R.kaart,
  boxShadow: SCHADUW.kaart,
  padding: 16,
  minWidth: 0,
  boxSizing: "border-box",
};

// Knoppen volgen het brandbook: rechthoekig, hoofdletters, duidelijk gevuld.
export function knop(soort = "primair") {
  const basis = {
    borderRadius: R.knop,
    padding: "12px 18px",
    fontSize: 13,
    fontWeight: 700,
    letterSpacing: 1.1,
    textTransform: "uppercase",
    cursor: "pointer",
    fontFamily: FONT,
    lineHeight: 1.2,
  };
  if (soort === "actie") {
    return { ...basis, border: "none", background: C.accent, color: "#fff" };
  }
  if (soort === "secundair") {
    return { ...basis, border: `1px solid ${C.group}`, background: "transparent", color: C.group };
  }
  if (soort === "stil") {
    return { ...basis, border: `1px solid ${C.line}`, background: "#fff", color: C.soft };
  }
  return { ...basis, border: "none", background: C.group, color: "#fff" };
}

export const veldStijl = {
  width: "100%",
  boxSizing: "border-box",
  padding: "11px 12px",
  borderRadius: R.knop,
  border: `1px solid #d8dde8`,
  background: "#fbfcfe",
  fontSize: 16,
  fontFamily: FONT,
  color: "#22263a",
};

// De driehoekige inkeping uit het beeldmerk, als accent rechtsboven op een kaart.
export const inkeping = {
  position: "absolute",
  top: 0,
  right: 0,
  borderWidth: "0 22px 22px 0",
  borderStyle: "solid",
  borderColor: `transparent ${C.accent} transparent transparent`,
};

export const chipStijl = {
  fontSize: T.micro,
  padding: "3px 9px",
  borderRadius: R.chip,
  background: C.zacht,
  color: C.soft,
  letterSpacing: 0.3,
  whiteSpace: "nowrap",
};
