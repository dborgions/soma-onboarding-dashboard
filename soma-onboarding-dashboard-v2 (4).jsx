import { useState, useRef } from "react";

// ─── SOMA kleuren ──────────────────────────────────────────────
const C = {
  works: "#3b73ad",
  group: "#2c2f7b",
  accent: "#f18825",
  green: "#6db9a0",
  bg: "#f4f6f9",
  card: "#ffffff",
  soft: "#6b7280",
  line: "#e3e7ee",
};

// ─── Eén niveauschaal ──────────────────────────────────────────
const NIVEAUS = ["Nog niet gestart", "Doorgenomen", "Begrijpt", "Kan toepassen", "Beheerst"];

// ─── Onderwerpen (inhoud = data) ───────────────────────────────
const ONDERWERPEN = [
  { id: "dna", naam: "Missie, visie en kernwaarden", cat: "SOMA DNA", type: "kennis", max: 4, aanspreekpunt: "Yvo", welder: "https://somaworks.welder.cloud/v2/content/169778/view/169778", fase: "Basis", c3: "Laat de kernwaarden zien in zijn gesprekken met kandidaten, klanten en collega's.", c4: "Ademt onze manier van werken, ook onder druk." },
  { id: "labels", naam: "SOMA Group | alle labels", cat: "SOMA DNA", type: "kennis", max: 4, aanspreekpunt: "Denis", fase: "Basis", c3: "Verwijst kandidaten en klanten door naar het juiste label, en legt uit waarom.", c4: "Herkent wanneer iets bij een ander label hoort en zet het daar neer, zonder dat iemand hem eraan herinnert.", welder: "https://somaworks.welder.cloud/v2/content/169777/view/169777" },
  { id: "basis", naam: "Terug naar de basis", cat: "SOMA DNA", type: "kennis", max: 4, aanspreekpunt: "Dave", fase: "Basis", welder: "https://somaworks.welder.cloud/v2/content/170812/view/170812", c3: "Pakt op wat binnenkomt en handelt het zo snel mogelijk af.", c4: "Kiest zelf waar de meeste kans zit en legt alles opzij om die plaatsing te pakken." },
  { id: "kostprijs", naam: "Kostprijsberekening", cat: "Uitzendkennis", type: "kennis", max: 4, aanspreekpunt: "Marlin", fase: "2.0", welder: "https://somaworks.welder.cloud/v2/content/169762/view/169762", c3: "Maakt zelfstandig een kostprijs met loon, toeslagen en reserveringen, en die klopt als je hem nareekt.", c4: "Zijn kostprijzen kloppen zonder controle." },
  { id: "cao", naam: "CAO kennis en ADV", cat: "Uitzendkennis", type: "kennis", max: 4, aanspreekpunt: "Marlin", fase: "5.0", welder: "https://somaworks.welder.cloud/v2/content/169763/view/169763", c3: "Kan de juiste CAO en ADV-regeling herkennen en correct toepassen bij een plaatsing.", c4: "Doet dit bij elke plaatsing zonder navraag, en merkt het op als een cao is gewijzigd." },
  { id: "inleners", naam: "Gelijkwaardige arbeidsvoorwaarden", cat: "Uitzendkennis", type: "kennis", max: 4, aanspreekpunt: "Marlin", fase: "5.0", welder: "https://somaworks.welder.cloud/v2/content/169764/view/169764", c3: "Stelt de gelijkwaardige arbeidsvoorwaarden vast en past ze toe bij een plaatsing.", c4: "Haalt de gegevens bij elke nieuwe klant zelf op, zonder dat de backoffice erom moet vragen." },
  { id: "fasen", naam: "Fasen-systeem", cat: "Uitzendkennis", type: "kennis", max: 4, aanspreekpunt: "Marlin", fase: "Basis", welder: "https://somaworks.welder.cloud/v2/content/169765/view/169765", c3: "Bepaalt zelf de juiste fase en past de regels goed toe.", c4: "Ziet een fasewissel aankomen en bespreekt dat met zijn klant voordat de backoffice hem erop wijst." },
  { id: "wtta", naam: "Wtta en toelating", cat: "Uitzendkennis", type: "kennis", max: 2, aanspreekpunt: "Veronique", fase: "3.0", welder: "https://somaworks.welder.cloud/v2/content/169766/view/169766" },
  { id: "subsidies", naam: "Subsidies", cat: "Uitzendkennis", type: "kennis", max: 2, aanspreekpunt: "Marlin", fase: "2.0", welder: "https://somaworks.welder.cloud/v2/content/169768/view/169768" },
  { id: "ziekte", naam: "Ziekte", cat: "Uitzendkennis", type: "kennis", max: 2, aanspreekpunt: "Marlin", fase: "5.0", welder: "https://somaworks.welder.cloud/v2/content/169769/view/169769" },
  { id: "vcu", naam: "VCU", cat: "Uitzendkennis", type: "kennis", max: 2, aanspreekpunt: "Marlin", fase: "5.0", welder: "https://somaworks.welder.cloud/v2/content/169767/view/169767" },
  { id: "carerix", naam: "Carerix cursus", cat: "Systeemvaardigheden", type: "vaardigheid", max: 4, aanspreekpunt: "Yvo", training: "training", fase: "Basis", welder: "https://somaworks.welder.cloud/v2/content/169770/view/169770", c3: "Werkt zelfstandig in Carerix en legt zijn gesprekken en afspraken vast.", c4: "Houdt zijn dossiers structureel bij, zodat een collega zijn kandidaat kan oppakken zonder hem te bellen." },
  { id: "carv", naam: "CARV cursus", cat: "Systeemvaardigheden", type: "vaardigheid", max: 4, aanspreekpunt: "Enzio", training: "training", fase: "Basis", welder: "https://somaworks.welder.cloud/v2/content/169771/view/169771", c3: "Kan met CARV werken.", c4: "Haalt er echt zijn voordeel uit en wint er tijd mee." },
  { id: "easyflex", naam: "Easyflex", cat: "Systeemvaardigheden", type: "vaardigheid", max: 4, aanspreekpunt: "Patrick", training: "training", fase: "Basis", welder: "https://somaworks.welder.cloud/v2/content/169774/view/169774", c3: "Maakt zelfstandig een plaatsing aan en zoekt zelf op wat hij nodig heeft.", c4: "Doet dat structureel foutloos, en zoekt het zelf op in plaats van de backoffice te bellen." },
  { id: "buddee", naam: "Buddee", cat: "Systeemvaardigheden", type: "vaardigheid", max: 2, aanspreekpunt: "Yvo", training: "training", fase: "Basis", welder: "https://somaworks.welder.cloud/v2/content/169772/view/169772" },
  { id: "welder", naam: "Welder", cat: "Systeemvaardigheden", type: "vaardigheid", max: 2, aanspreekpunt: "Yvo", training: "training", fase: "Basis", welder: "https://somaworks.welder.cloud/v2/content/169773/view/169773" },
    { id: "werven", naam: "Kandidaten werven", cat: "Recruitment", type: "vaardigheid", max: 4, aanspreekpunt: "Enzio", fase: "1.0", c3: "Zet meerdere middelen in en vindt daarmee kandidaten.", c4: "Verandert zijn aanpak als een vacature niet loopt, in plaats van hetzelfde nog een keer te proberen.", welder: "https://somaworks.welder.cloud/v2/content/169775/view/169775" },
    { id: "intake", naam: "Intake voeren", cat: "Recruitment", type: "vaardigheid", max: 4, aanspreekpunt: "Jouw VM", fase: "2.0", c3: "Voert zelfstandig een volledige intake. Het verslag is compleet en hij weet waarom deze kandidaat wil wisselen.", c4: "Vraagt overal op door: wat hij deed, waarmee hij werkte, wat hij leerde en waarom hij wegging.", welder: "https://somaworks.welder.cloud/v2/content/169776/view/169776" },
  { id: "overtuigen", naam: "Kandidaat overtuigen", cat: "Commercie", type: "vaardigheid", max: 4, aanspreekpunt: "Jouw VM, Ralph", training: "salestraining", fase: "3.0", c3: "Krijgt een twijfelende kandidaat enthousiast en op gesprek.", c4: "Krijgt ook de lastige kandidaten mee, en weet achteraf te benoemen wat de twijfel was.", welder: "https://somaworks.welder.cloud/v2/content/169779/view/169779" },
  { id: "presenteren", naam: "Kandidaat presenteren", cat: "Commercie", type: "vaardigheid", max: 4, aanspreekpunt: "Jouw VM, Ralph", training: "salestraining", fase: "3.0", c3: "Belt de klant en verkoopt zijn kandidaat. Het cv gaat er daarna pas achteraan.", c4: "Belt ook als de klant het druk heeft of de kandidaat lastig te verkopen is, en houdt vol tot hij zijn verhaal kwijt is.", welder: "https://somaworks.welder.cloud/v2/content/169780/view/169780" },
  { id: "voorbereiden", naam: "Kandidaat voorbereiden", cat: "Commercie", type: "vaardigheid", max: 4, aanspreekpunt: "Jouw VM, Ralph", training: "salestraining", fase: "3.0", c3: "Zijn kandidaat loopt naar binnen met zijn cv, kent het bedrijf en weet bij wie hij zich moet melden. Na het gesprek belt de kandidaat hem meteen.", c4: "Zijn kandidaten gaan structureel voorbereid naar binnen, en klanten benoemen dat uit zichzelf.", welder: "https://somaworks.welder.cloud/v2/content/172711/view/172711" },
  { id: "commercieel", naam: "Commercieel denken", cat: "Commercie", type: "vaardigheid", max: 4, aanspreekpunt: "Jouw VM, Ralph", training: "salestraining", fase: "3.0", welder: "https://somaworks.welder.cloud/v2/content/169781/view/169781", c3: "Haalt uit een gesprek meer dan de vraag die erin ging, en zet dat om in een actie.", c4: "Doet dat structureel, ook bij klanten waar op het eerste gezicht weinig te halen valt." },
    { id: "acquisitie", naam: "Acquisitie", cat: "Commercie", type: "vaardigheid", max: 4, aanspreekpunt: "Jouw VM, Ralph", training: "salestraining", fase: "3.0", c3: "Belt zelf bedrijven en haalt daar afspraken uit.", c4: "Maakt structureel tijd vrij voor acquisitie, ook als het druk is.", welder: "https://somaworks.welder.cloud/v2/content/169782/view/169782" },
  { id: "relatiebeheer", naam: "Relatiebeheer", cat: "Relatiebeheer", type: "vaardigheid", max: 4, aanspreekpunt: "Jouw VM", fase: "6.0", welder: "https://somaworks.welder.cloud/v2/content/169783/view/169783", c3: "Belt zijn klanten ook zonder aanleiding, en legt vast wat hij hoort.", c4: "Houdt zijn klanten structureel warm, ook als het even niets oplevert." },
  { id: "kandidaatbeheer", naam: "Kandidaatbeheer", cat: "Relatiebeheer", type: "vaardigheid", max: 4, aanspreekpunt: "Jouw VM", fase: "6.0", welder: "https://somaworks.welder.cloud/v2/content/169784/view/169784", c3: "Houdt contact met zijn kandidaten en volgt op wat hij afspreekt.", c4: "Haalt uit dat contact wat er op de werkvloer speelt, en doet daar iets mee." },
  { id: "nazorg", naam: "Nazorg", cat: "Relatiebeheer", type: "vaardigheid", max: 4, aanspreekpunt: "Yvo", fase: "5.0", welder: "https://somaworks.welder.cloud/v2/content/169785/view/169785", c3: "Belt voor de start, neemt de belangrijkste punten door en belt na de eerste werkdag na.", c4: "Doet dat bij elke plaatsing, ook als het druk is." },
];

// Wil je een eigen gif of foto in het feestscherm? Zet het adres hier neer.
// Bijvoorbeeld een filmpje van je eigen vestiging. Leeg laten = alleen confetti.
const FEEST_BEELD = "";

// Geluidje bij een plaatsing.
const FEEST_GELUID = "data:audio/mpeg;base64,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";

const FASEN = [
  { id: "Basis", label: "Basis", sub: "Vanaf dag 1: het verhaal en de systemen", kleur: "#6b7280" },
  { id: "1.0", label: "1.0 Instroom", sub: "Kandidaten vinden", kleur: "#3b73ad" },
  { id: "2.0", label: "2.0 Selectie", sub: "Begrijpen wie je voor je hebt", kleur: "#2c9c8f" },
  { id: "3.0", label: "3.0 & 4.0 Presentatie en acquisitie", sub: "Verkopen aan kandidaat en klant", kleur: "#f18825" },
  { id: "5.0", label: "5.0 Plaatsing", sub: "Van akkoord naar aan het werk", kleur: "#9b5bb5" },
  { id: "6.0", label: "6.0 Klant- en kandidaatbeheer", sub: "Vasthouden en uitbouwen", kleur: "#2c2f7b" },
];

// ─── Kerncompetenties en specialisten ──────────────────────────
const KERNCOMPETENTIES = [
  { id: "aanpassing", naam: "Aanpassingsvermogen", specialisten: ["Tom Meyer", "Enzio Brouner", "Ralph van Tilborg"] },
  { id: "commercialiteit", naam: "Commercialiteit", specialisten: ["Enzio Brouner", "Ralph van Tilborg", "Tom Meyer", "Liberto"] },
  { id: "creativiteit", naam: "Creativiteit", specialisten: ["Tom Meyer", "Enzio Brouner"] },
  { id: "empathie", naam: "Empathie", specialisten: ["Aim Gruisen", "Liberto"] },
  { id: "drive", naam: "Drive", specialisten: ["Tom Meyer", "Ralph Keulen", "Aim Gruisen", "Liberto"] },
  { id: "kwaliteit", naam: "Kwaliteitsgerichtheid", specialisten: ["Max Trebus"] },
  { id: "overtuiging", naam: "Overtuigingskracht", specialisten: ["Tom Meyer", "Ralph van Tilborg"] },
];

const INDICATOREN = {
  aanpassing: [
    "Pakt een spoedaanvraag op zonder eerst te mopperen dat zijn dag in de war ligt",
    "Is binnen tien minuten aan het bellen als een kandidaat afbelt",
    "Blijft rustig doorwerken als het druk is op de vestiging",
    "Duikt uit zichzelf in een nieuw systeem of een nieuwe werkwijze",
    "Zoekt uit wat er wél kan als een klant of kandidaat nee zegt",
  ],
  overtuiging: [
    "Vraagt bij een bezwaar door in plaats van het gesprek af te ronden",
    "Past zijn verhaal aan op wie hij aan de lijn heeft",
    "Legt uit waarom zijn kandidaat de juiste is zonder zijn verkooppraatje af te draaien",
    "Durft te vragen: zullen we het gewoon doen?",
    "Komt terug bij een klant die eerder nee zei",
  ],
  drive: [
    "Belt door na drie keer nee, ook op vrijdagmiddag",
    "Pakt zijn 1.0'ers meteen op in plaats van later op de dag",
    "Gaat pas naar huis als hij heeft gedaan wat hij zich had voorgenomen",
    "Weet zonder opzoeken hoeveel intakes en voorstellen hij deze week heeft gedaan",
    "Komt na een slechte week terug met meer belletjes in plaats van minder",
  ],
  creativiteit: [
    "Verandert zijn aanpak als de standaardzoekopdracht niets oplevert",
    "Kijkt naar wat een kandidaat feitelijk deed in plaats van naar zijn functietitel",
    "Zoekt kandidaten op plekken waar de rest niet kijkt",
    "Stelt de vraag die de anderen overslaan",
    "Weet na een geslaagde plaatsing te benoemen wat hij anders deed",
  ],
  commercialiteit: [
    "Zet een signaal van een kandidaat of klant dezelfde dag om in een actie",
    "Stelt een tweede kandidaat voor op een aanvraag van één",
    "Vraagt bij een aanvraag door of er meer werk aankomt",
    "Kan uitleggen waarom SOMA duurder is zonder zich te verontschuldigen",
    "Stuurt op zijn conversie: blijven voorstellen hangen, dan verandert hij zijn aanpak",
  ],
  kwaliteit: [
    "Stuurt geen voorstel weg waar hij zelf niet achter staat",
    "Leest zijn voorstel één keer over met de ogen van de klant",
    "Legt elke actie in Carerix vast, zodat zijn funnel klopt",
    "Belt een nieuwe plaatsing binnen drie dagen na om te checken hoe het gaat",
    "Pakt zijn eigen fout terug voordat een ander hem vindt",
  ],
  empathie: [
    "Luistert zonder alvast zijn antwoord klaar te hebben",
    "Vraagt bij twijfel door naar wat iemand tegenhoudt",
    "Past zijn toon aan op wie hij tegenover zich heeft",
    "Merkt op wanneer een flexkracht stiller wordt en belt dan",
    "Voert ook het gesprek na een afwijzing zo dat de kandidaat terugkomt",
  ],
};

const METING_SCORE = ["Nog niet beoordeeld", "Onder verwachting", "Op niveau", "Boven verwachting"];
const METING_STERREN = [0, 2, 4, 6];  // dag 30 gaat tot 6 van de 10. Dag 100 tot 8, expert is 10.

const GESPREK_STATUS = ["Nog niet gepland", "Ingepland", "Gevoerd"];
const TOTAAL_GESPREKKEN = KERNCOMPETENTIES.reduce((s, c) => s + c.specialisten.length, 0);

// ─── Voorbeelddata ─────────────────────────────────────────────
const START_ONBOARDERS = [
  {
    id: 1, naam: "Lisa Jansen", vestiging: "Weert", dag: 34, programma: 100,
    niveaus: { dna: 3, kostprijs: 2, adv: 2, cao: 2, inleners: 1, fasen: 2, subsidies: 1,
      werven: 3, intake: 2, overtuigen: 2, presenteren: 1, commercieel: 2, acquisitie: 1, relatiebeheer: 2, kandidaatbeheer: 3 },
  },
  {
    id: 2, naam: "Ruben Peters", vestiging: "Sittard", dag: 9, programma: 100,
    niveaus: { dna: 2, kostprijs: 1, adv: 1, cao: 0, inleners: 0, fasen: 1, subsidies: 0,
      werven: 2, intake: 1, overtuigen: 0, presenteren: 0, commercieel: 1, acquisitie: 0, relatiebeheer: 1, kandidaatbeheer: 1 },
  },
  {
    id: 3, naam: "Sanne de Boer", vestiging: "Venlo", dag: 88, programma: 100,
    niveaus: { dna: 4, kostprijs: 3, adv: 3, cao: 3, inleners: 3, fasen: 4, subsidies: 2,
      werven: 4, intake: 4, overtuigen: 3, presenteren: 3, commercieel: 3, acquisitie: 2, relatiebeheer: 3, kandidaatbeheer: 4 },
  },
];

const START_LOG = [
  { onboarderId: 1, onderwerp: "Intake voeren", door: "Mark (VM)", dag: 8, van: "Doorgenomen", naar: "Begrijpt" },
  { onboarderId: 1, onderwerp: "Kandidaten werven", door: "Yvo (mentor)", dag: 22, van: "Begrijpt", naar: "Kan toepassen" },
];

// ─── Hulpjes ───────────────────────────────────────────────────
const pct = (o, type) => {
  const items = ONDERWERPEN.filter((x) => x.type === type);
  const behaald = items.reduce((s, x) => s + (o.niveaus[x.id] || 0), 0);
  const maximaal = items.reduce((s, x) => s + x.max, 0);
  return Math.round((behaald / maximaal) * 100);
};

// ─── Bouwstenen ────────────────────────────────────────────────
function Tijdlijn({ dag, programma }) {
  const p = Math.min((dag / programma) * 100, 100);
  return (
    <div style={{ marginTop: 4 }}>
      <div style={{ position: "relative", background: C.line, borderRadius: 99, height: 8 }}>
        <div style={{ width: `${p}%`, background: C.accent, height: "100%", borderRadius: 99 }} />
        <div style={{ position: "absolute", left: "30%", top: -3, width: 2, height: 14, background: C.group }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: C.soft, marginTop: 4 }}>
        <span>Start</span>
        <span style={{ position: "relative", left: "-14%", fontWeight: 700, color: C.group }}>Proeftijd · 30</span>
        <span>Dag 100</span>
      </div>
    </div>
  );
}

function Balk({ waarde, kleur }) {
  return (
    <div style={{ background: C.line, borderRadius: 99, height: 6, overflow: "hidden" }}>
      <div style={{ width: `${waarde}%`, background: kleur, height: "100%", borderRadius: 99, transition: "width .3s" }} />
    </div>
  );
}

function Badge({ children, kleur, tint }) {
  return (
    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.4, textTransform: "uppercase", color: kleur, background: tint, padding: "3px 8px", borderRadius: 99 }}>
      {children}
    </span>
  );
}

// Handmatig overzetten: de bolletjes. bewerkTot bepaalt tot welke stap deze rol mag klikken.
function Bolletjes({ niveau, max, bewerkTot, onKies }) {
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      {Array.from({ length: max }, (_, i) => i + 1).map((n) => {
        const actief = n <= niveau;
        const voltooid = niveau === max;
        const klikbaar = n <= bewerkTot;
        return (
          <button
            key={n}
            onClick={() => klikbaar && onKies(n === niveau ? n - 1 : n)}
            title={NIVEAUS[n]}
            style={{
              width: 36, height: 36, borderRadius: "50%",
              border: actief ? "none" : `2px solid ${C.line}`,
              background: actief ? (voltooid ? C.green : C.works) : C.card,
              color: actief ? "#fff" : C.soft,
              fontSize: 13, fontWeight: 700,
              cursor: klikbaar ? "pointer" : "default",
              opacity: klikbaar || actief ? 1 : 0.55,
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all .15s",
            }}
          >
            {n}
          </button>
        );
      })}
    </div>
  );
}

// ─── Hoofdapp ──────────────────────────────────────────────────
export default function OnboardingDashboard() {
  const [rol, setRol] = useState("Yvo");
  const [onboarders, setOnboarders] = useState(START_ONBOARDERS);
  const [log, setLog] = useState(START_LOG);
  const [opmerkingen, setOpmerkingen] = useState([
    { onboarderId: 1, onderwerp: "Acquisitie", door: "Mark (VM)", dag: 28, tekst: "Vindt koud bellen nog spannend, samen belblok gepland." },
  ]);
  const [geselecteerd, setGeselecteerd] = useState(null);
  const [toast, setToast] = useState(null);
  const [opmerkingVoor, setOpmerkingVoor] = useState(null);
  const [opmerkingTekst, setOpmerkingTekst] = useState("");
  const [toonLog, setToonLog] = useState(false);
  const [medewerkerId, setMedewerkerId] = useState(1);
  const LEEG = { intakes: 0, voorstellen: 0, gesprekken: 0, plaatsingen: 0, gestopt: 0 };
  const programmaWeek = (o) => Math.max(1, Math.ceil(o.dag / 7));
  const isVrijdag = new Date().getDay() === 5;
  const weekVanJaar = () => {
    const d = new Date();
    const start = new Date(d.getFullYear(), 0, 1);
    return Math.ceil(((d - start) / 86400000 + start.getDay() + 1) / 7);
  };
  const [beweging, setBeweging] = useState({ 1: 3, 2: 16, 3: 8 });

  const [resultaten, setResultaten] = useState({
    1: { week: { intakes: 3, voorstellen: 5, gesprekken: 2, plaatsingen: 1, gestopt: 0 }, totaal: { intakes: 14, voorstellen: 22, gesprekken: 9, plaatsingen: 4, gestopt: 1 }, weken: 5, laatsteWeek: weekVanJaar() },
    2: { week: { intakes: 1, voorstellen: 1, gesprekken: 0, plaatsingen: 0, gestopt: 0 }, totaal: { intakes: 2, voorstellen: 1, gesprekken: 0, plaatsingen: 0, gestopt: 0 }, weken: 2, laatsteWeek: weekVanJaar() - 1 },
    3: { week: { intakes: 4, voorstellen: 7, gesprekken: 3, plaatsingen: 2, gestopt: 1 }, totaal: { intakes: 38, voorstellen: 61, gesprekken: 26, plaatsingen: 17, gestopt: 3 }, weken: 12, laatsteWeek: weekVanJaar() },
  });
  const [weekVak, setWeekVak] = useState(null);
  const [feest, setFeest] = useState(false);
  const [notities, setNotities] = useState({
    1: {
      5: "Eerste keer zelfstandig een intake gedaan, ging beter dan verwacht. Vergat te vragen naar reiskosten, dat oefenen we volgende week.",
      4: "Loopt goed. Twee klanten uit eigen acquisitie. Afgesproken dat hij deze week zijn eerste intake alleen doet.",
      3: "Belt netjes na, maar laat het soms hangen als iemand niet opneemt. Afspraak: altijd een tweede poging dezelfde dag.",
      2: "Carerix-cursus gehad. Legt zijn gesprekken nog niet consequent vast, daar zit zijn grootste winst.",
    },
    3: {
      10: "Sterke maand. Twee plaatsingen uit één aanvraag gehaald door door te vragen. Dat is precies wat we willen zien.",
      9: "Klant Verhoeven belde haar rechtstreeks voor een nieuwe vacature. Goed teken.",
      8: "Stille week door vakantie bij haar grootste klant. Opgepakt: meer tijd in acquisitie steken.",
    },
  });
  const [openFases, setOpenFases] = useState({});
  const [terug, setTerug] = useState(null);
  const [meting, setMeting] = useState({});
  const [metingOpen, setMetingOpen] = useState(false);
  const [metingConcept, setMetingConcept] = useState(null);
  const audioRef = useRef(null);
  const ctxRef = useRef(null);
  const bufferRef = useRef(null);

  const [gesprekken, setGesprekken] = useState({
    1: { "commercialiteit|Enzio Brouner": 1, "empathie|Aim Gruisen": 2, "creativiteit|Tom Meyer": 2 },
    3: { "commercialiteit|Tom Meyer": 2, "overtuiging|Ralph van Tilborg": 2, "kwaliteit|Max Trebus": 1 },
  });

  const kanBewerken = rol === "VM" || rol === "Mentor";
  const bewerkTot = kanBewerken ? 4 : 1; // medewerker vinkt alleen stap 1 zelf af; stap 2 tekent VM of mentor af, stap 3 en 4 test de VM
  const actorNaam = rol === "VM" ? "Mark (VM)" : rol === "Mentor" ? "Yvo (mentor)" : rol;

  const zichtbaar = rol === "Medewerker" ? onboarders.filter((o) => o.id === medewerkerId) : onboarders;
  const detail = geselecteerd ? onboarders.find((o) => o.id === geselecteerd) : rol === "Medewerker" ? zichtbaar[0] : null;

  const meldToast = (t) => { setToast(t); setTimeout(() => setToast(null), 5000); };

  const pctFase = (o, faseId) => {
    const items = ONDERWERPEN.filter((x) => x.fase === faseId);
    if (items.length === 0) return 0;
    const behaald = items.reduce((s, x) => s + (o.niveaus[x.id] || 0), 0);
    const maximaal = items.reduce((s, x) => s + x.max, 0);
    return Math.round((behaald / maximaal) * 100);
  };

  const aantalGevoerd = (o) => Object.values(gesprekken[o.id] || {}).filter((v) => v === 2).length;
  const pctGesprekken = (o) => Math.round((aantalGevoerd(o) / TOTAAL_GESPREKKEN) * 100);

  const [bevestig, setBevestig] = useState(null);

  const wijzigNiveau = (onboarder, ond, nieuw) => {
    const oud = onboarder.niveaus[ond.id] || 0;
    if (nieuw === oud) return;
    if (nieuw > bewerkTot || oud > bewerkTot) return; // stap 3 en 4 zijn de test van de VM
    if (ond.training && !kanBewerken) return; // Commercie: stap 1 zet Ralph na de salestraining
    setOnboarders((l) => l.map((o) => (o.id === onboarder.id ? { ...o, niveaus: { ...o.niveaus, [ond.id]: nieuw } } : o)));
    setLog((l) => [
      { onboarderId: onboarder.id, onderwerp: ond.naam, door: actorNaam, dag: onboarder.dag, van: NIVEAUS[oud], naar: NIVEAUS[nieuw] },
      ...l,
    ]);
    setBeweging((b) => ({ ...b, [onboarder.id]: 0 }));
    setTerug({
      tekst: `${ond.naam}: ${NIVEAUS[nieuw]}`,
      draaiTerug: () => {
        setOnboarders((l) => l.map((o) => (o.id === onboarder.id ? { ...o, niveaus: { ...o.niveaus, [ond.id]: oud } } : o)));
        setLog((l) => l.slice(1));
        setTerug(null);
        meldToast("Teruggedraaid");
      },
    });
    setTimeout(() => setTerug((h) => (h && h.tekst === `${ond.naam}: ${NIVEAUS[nieuw]}` ? null : h)), 6000);
    meldToast(nieuw === ond.max ? `Vamos! ${ond.naam} op ${NIVEAUS[nieuw].toLowerCase()}` : `${ond.naam}: ${NIVEAUS[nieuw]}`);
  };

  const speelGeluid = async () => {
    try {
      if (!ctxRef.current) {
        ctxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = ctxRef.current;
      if (ctx.state === "suspended") await ctx.resume();

      if (!bufferRef.current) {
        const b64 = FEEST_GELUID.split(",")[1];
        const bin = atob(b64);
        const bytes = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
        bufferRef.current = await ctx.decodeAudioData(bytes.buffer);
      }

      const bron = ctx.createBufferSource();
      bron.buffer = bufferRef.current;
      bron.connect(ctx.destination);
      bron.start(0);
    } catch (e) {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }
    }
  };

  const meldPlaatsing = (onboarder) => {
    setResultaten((r) => {
      const huidig = r[onboarder.id] || { week: { ...LEEG }, totaal: { ...LEEG }, weken: 1, laatsteWeek: weekVanJaar() };
      return {
        ...r,
        [onboarder.id]: {
          ...huidig,
          week: { ...huidig.week, plaatsingen: (huidig.week?.plaatsingen ?? 0) + 1 },
          totaal: { ...huidig.totaal, plaatsingen: (huidig.totaal?.plaatsingen ?? 0) + 1 },
        },
      };
    });
    setBeweging((b) => ({ ...b, [onboarder.id]: 0 }));
    setLog((l) => [
      { onboarderId: onboarder.id, onderwerp: "Plaatsing gemeld", door: onboarder.naam, dag: onboarder.dag, van: "door onboarder", naar: "plaatsing (5.1)" },
      ...l,
    ]);
    speelGeluid();
    setFeest(true);
    setTimeout(() => setFeest(false), 2900);
  };

  const bewaarWeek = (onboarder, waarden) => {
    setResultaten((r) => {
      const oudTotaal = r[onboarder.id]?.totaal || LEEG;
      const oudWeek = r[onboarder.id]?.week || LEEG;
      const totaal = {};
      Object.keys(LEEG).forEach((k) => { totaal[k] = (oudTotaal[k] || 0) - (oudWeek[k] || 0) + waarden[k]; });
      const nieuweWeek = (r[onboarder.id]?.laatsteWeek ?? 0) !== weekVanJaar();
      return { ...r, [onboarder.id]: {
        week: waarden, totaal,
        weken: (r[onboarder.id]?.weken ?? 0) + (nieuweWeek ? 1 : 0),
        laatsteWeek: weekVanJaar(),
      } };
    });
    setLog((l) => [
      { onboarderId: onboarder.id, onderwerp: "Weekcijfers bijgewerkt", door: actorNaam, dag: onboarder.dag,
        van: "week", naar: `${waarden.intakes} intakes · ${waarden.voorstellen} voorstelacties · ${waarden.gesprekken} gesprekken · ${waarden.plaatsingen} plaatsingen · ${waarden.gestopt} gestopt` },
      ...l,
    ]);
    meldToast(waarden.plaatsingen > 0 ? `Vamos! ${waarden.plaatsingen} plaatsing${waarden.plaatsingen > 1 ? "en" : ""} deze week` : "Weekcijfers bijgewerkt");
  };

  const wijzigGesprek = (onboarder, comp, specialist) => {
    const sleutel = `${comp.id}|${specialist}`;
    const huidig = gesprekken[onboarder.id]?.[sleutel] || 0;
    const nieuw = (huidig + 1) % 3;
    setGesprekken((g) => ({ ...g, [onboarder.id]: { ...(g[onboarder.id] || {}), [sleutel]: nieuw } }));
    setLog((l) => [
      { onboarderId: onboarder.id, onderwerp: `Gesprek ${comp.naam} met ${specialist}`, door: actorNaam, dag: onboarder.dag, van: GESPREK_STATUS[huidig], naar: GESPREK_STATUS[nieuw] },
      ...l,
    ]);
    meldToast(`${comp.naam} met ${specialist}: ${GESPREK_STATUS[nieuw]}`);
  };

  const bewaarOpmerking = (onboarder, ond) => {
    if (!opmerkingTekst.trim()) return;
    setOpmerkingen((l) => [
      { onboarderId: onboarder.id, onderwerp: ond.naam, door: actorNaam, dag: onboarder.dag, tekst: opmerkingTekst.trim() },
      ...l,
    ]);
    setOpmerkingTekst("");
    setOpmerkingVoor(null);
    meldToast("Opmerking bewaard");
  };

  return (
    <div style={{
      minHeight: "100vh", background: C.bg, color: "#22263a",
      fontFamily: "'Mozilla Text', 'Segoe UI', system-ui, -apple-system, sans-serif",
      fontWeight: 300,
      display: "flex", justifyContent: "center", padding: "0 0 60px",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Mozilla+Text:wght@300;400;700&display=swap');
        * { font-family: 'Mozilla Text', 'Segoe UI', system-ui, sans-serif; }
      `}</style>
      <div style={{ width: "100%", maxWidth: 560 }}>
        <audio ref={audioRef} src={FEEST_GELUID} preload="auto" />

        {/* Kop */}
        <div style={{ background: C.group, color: "#fff", padding: "20px 20px 16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <div>
              <div style={{ fontSize: 21, fontWeight: 700, lineHeight: 1, letterSpacing: 0.5, textTransform: "uppercase" }}>100 dagen onboarding</div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.4, textTransform: "uppercase", opacity: 0.8, marginTop: 4 }}>De weg naar succes</div>
            </div>
            <div style={{ fontSize: 11, opacity: 0.7 }}>prototype v2</div>
          </div>

          <div style={{ display: "flex", gap: 6, marginTop: 14 }}>
            {["Medewerker", "VM", "Mentor"].map((r) => (
              <button
                key={r}
                onClick={() => { setRol(r); setGeselecteerd(null); setToonLog(false); }}
                style={{
                  flex: 1, padding: "8px 0", borderRadius: 8, border: "none",
                  fontWeight: 700, fontSize: 13, cursor: "pointer",
                  background: rol === r ? "#fff" : "rgba(255,255,255,.14)",
                  color: rol === r ? C.group : "#fff",
                }}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Themabalk */}
        <div style={{ background: C.accent, color: "#fff", padding: "10px 20px 12px" }}>
          <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", lineHeight: 1.15 }}>
            Bellen. Scoren. Elke dag eentje meer.
          </div>
          <div style={{ fontSize: 12.5, fontWeight: 600, marginTop: 3, opacity: 0.95 }}>
            Alleen jij bepaalt of jij scoort.
          </div>
        </div>

        {/* Overzicht */}
        {!detail && (
          <div style={{ padding: 16 }}>
            <div style={{ fontSize: 13, color: C.soft, marginBottom: 12 }}>
              Klik op een naam voor de detailpagina.
            </div>
            {zichtbaar.map((o) => (
              <button
                key={o.id}
                onClick={() => setGeselecteerd(o.id)}
                style={{
                  width: "100%", textAlign: "left", background: C.card, border: `1px solid ${C.line}`,
                  borderRadius: 14, padding: "12px 14px", marginBottom: 10, cursor: "pointer",
                  boxShadow: "0 1px 2px rgba(34,38,58,.05)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: 16, fontWeight: 700 }}>{o.naam}</div>
                    <div style={{ fontSize: 11, color: C.soft, marginTop: 1 }}>{o.vestiging}</div>
                  </div>
                  <div style={{ textAlign: "right", lineHeight: 1 }}>
                    <span style={{ fontSize: 22, fontWeight: 700, color: C.accent }}>{o.dag}</span>
                    <span style={{ fontSize: 11, color: C.soft, marginLeft: 3 }}>/ {o.programma}</span>
                  </div>
                </div>

                <div style={{ position: "relative", background: C.line, borderRadius: 99, height: 5, marginTop: 8 }}>
                  <div style={{ width: `${Math.min((o.dag / o.programma) * 100, 100)}%`, background: C.accent, height: "100%", borderRadius: 99 }} />
                  <div style={{ position: "absolute", left: "30%", top: -2, width: 2, height: 9, background: C.group }} />
                </div>

                {(() => {
                  const d = beweging[o.id] ?? 0;
                  const stil = d >= 14;
                  return (
                    <div style={{
                      marginTop: 8, borderRadius: 8, padding: "4px 9px", fontSize: 11.5,
                      fontWeight: stil ? 700 : 500,
                      background: stil ? "#fdeedd" : C.bg,
                      color: stil ? "#9a5200" : C.soft,
                    }}>
                      {stil && "Staat stil · "}
                      Laatste beweging {d === 0 ? "vandaag" : `${d} dagen geleden`}
                    </div>
                  );
                })()}

                <div style={{ display: "flex", gap: 16, marginTop: 9, fontSize: 12, color: C.soft }}>
                  <span>Kennis <b style={{ color: C.group }}>{pct(o, "kennis")}%</b></span>
                  <span>Vaardigh. <b style={{ color: C.group }}>{pct(o, "vaardigheid")}%</b></span>
                  <span>Gesprekken <b style={{ color: C.group }}>{aantalGevoerd(o)}/{TOTAAL_GESPREKKEN}</b></span>
                  {(resultaten[o.id]?.laatsteWeek ?? 0) !== weekVanJaar() ? (
                    <span style={{ marginLeft: "auto", color: "#9a5200", background: "#fdeedd", borderRadius: 99, padding: "2px 8px", fontSize: 11, fontWeight: 700 }}>
                      week nog invullen
                    </span>
                  ) : (
                    <span style={{ marginLeft: "auto", color: C.accent, fontWeight: 700 }}>
                      {resultaten[o.id]?.week?.plaatsingen ?? 0} plaatsing{(resultaten[o.id]?.week?.plaatsingen ?? 0) === 1 ? "" : "en"} deze week
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Detail */}
        {detail && (
          <div style={{ padding: 16 }}>
            {rol === "Medewerker" && (
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
                <span style={{ fontSize: 11, color: C.soft, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>
                  Demo · ingelogd als
                </span>
                {onboarders.map((o) => (
                  <button
                    key={o.id}
                    onClick={() => setMedewerkerId(o.id)}
                    style={{
                      border: `1px solid ${medewerkerId === o.id ? C.works : C.line}`,
                      background: medewerkerId === o.id ? C.works : C.card,
                      color: medewerkerId === o.id ? "#fff" : C.soft,
                      borderRadius: 99, padding: "5px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer",
                    }}
                  >
                    {o.naam.split(" ")[0]}
                  </button>
                ))}
              </div>
            )}
            {rol !== "Medewerker" && (
              <button
                onClick={() => setGeselecteerd(null)}
                style={{ background: "none", border: "none", color: C.works, fontWeight: 700, fontSize: 14, cursor: "pointer", padding: 0, marginBottom: 12 }}
              >
                ← Terug naar overzicht
              </button>
            )}

            <div style={{ background: C.group, color: "#fff", borderRadius: 14, padding: "16px 18px 18px", marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <div style={{ fontSize: 19, fontWeight: 700, lineHeight: 1, letterSpacing: 0.4, textTransform: "uppercase" }}>{rol === "Medewerker" ? "Jouw scorebord" : detail.naam}</div>
                <div style={{ fontSize: 11, opacity: 0.7 }}>{detail.vestiging}</div>
              </div>

              <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 2 }}>
                <span style={{ fontSize: 26, fontWeight: 700, color: C.accent, lineHeight: 1 }}>{detail.dag}</span>
                <span style={{ fontSize: 12, opacity: 0.75 }}>van {detail.programma} dagen</span>
              </div>

              <div style={{ position: "relative", background: "rgba(255,255,255,.18)", borderRadius: 99, height: 6, marginTop: 10 }}>
                <div style={{ width: `${Math.min((detail.dag / detail.programma) * 100, 100)}%`, background: C.accent, height: "100%", borderRadius: 99 }} />
                <div style={{ position: "absolute", left: "30%", top: -3, width: 2, height: 12, background: "#fff", opacity: 0.8 }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9.5, opacity: 0.65, marginTop: 4 }}>
                <span>Start</span><span>Proeftijd · 30</span><span>Dag 100</span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginTop: 16 }}>
                {[
                  { waarde: `${pct(detail, "kennis")}%`, label: "Kennis" },
                  { waarde: `${pct(detail, "vaardigheid")}%`, label: "Vaardigheden" },
                  { waarde: `${aantalGevoerd(detail)}/${TOTAAL_GESPREKKEN}`, label: "Gesprekken" },
                ].map((v) => (
                  <div key={v.label} style={{ background: "rgba(255,255,255,.10)", borderRadius: 10, padding: "10px 8px", textAlign: "center" }}>
                    <div style={{ fontSize: 26, fontWeight: 700, lineHeight: 1, letterSpacing: -0.5 }}>{v.waarde}</div>
                    <div style={{ fontSize: 9.5, textTransform: "uppercase", letterSpacing: 0.8, opacity: 0.75, marginTop: 5 }}>{v.label}</div>
                  </div>
                ))}
              </div>

              {(() => {
                const tot = resultaten[detail.id]?.totaal || LEEG;
                const stappen = [
                  { k: "intakes", label: "Intakes", code: "" },
                  { k: "voorstellen", label: "Voorstellen", code: "3.1" },
                  { k: "gesprekken", label: "Gesprekken", code: "4.1" },
                  { k: "plaatsingen", label: "Plaatsingen", code: "5.1" },
                ];
                const max = Math.max(1, ...stappen.map((s) => tot[s.k] || 0));
                return (
                  <div style={{ marginTop: 18 }}>
                    <div style={{ fontSize: 9.5, textTransform: "uppercase", letterSpacing: 0.8, opacity: 0.75, fontWeight: 700, marginBottom: 8 }}>
                      Jouw funnel · alles sinds de start
                    </div>
                    {stappen.map((s, i) => {
                      const waarde = tot[s.k] || 0;
                      const vorige = i > 0 ? (tot[stappen[i - 1].k] || 0) : null;
                      const conversie = vorige ? Math.round((waarde / Math.max(1, vorige)) * 100) : null;
                      return (
                        <div key={s.k} style={{ marginBottom: 7 }}>
                          <div style={{ display: "flex", alignItems: "baseline", gap: 6, fontSize: 11, marginBottom: 3 }}>
                            <span style={{ opacity: 0.85 }}>{s.label}</span>
                            {s.code && <span style={{ opacity: 0.45, fontSize: 9.5 }}>{s.code}</span>}
                            <span style={{ flex: 1 }} />
                            {conversie !== null && (
                              <span style={{ fontSize: 10, opacity: 0.6 }}>{conversie}% van vorige stap</span>
                            )}
                            <span style={{ fontWeight: 700, fontSize: 13, minWidth: 24, textAlign: "right", color: s.k === "plaatsingen" ? C.accent : "#fff" }}>
                              {waarde}
                            </span>
                          </div>
                          <div style={{ background: "rgba(255,255,255,.12)", borderRadius: 99, height: 7 }}>
                            <div style={{
                              width: `${Math.max(3, (waarde / max) * 100)}%`, height: "100%", borderRadius: 99,
                              background: s.k === "plaatsingen" ? C.accent : "rgba(255,255,255,.65)",
                            }} />
                          </div>
                        </div>
                      );
                    })}
                    <div style={{ fontSize: 10, opacity: 0.6, marginTop: 6, lineHeight: 1.4 }}>
                      {(tot.intakes || 0) > 0
                        ? `Van elke 10 intakes lever je er ${((tot.plaatsingen || 0) / Math.max(1, tot.intakes) * 10).toFixed(1).replace(".", ",")} plaatsing op. Wil je meer plaatsen, dan begint dat bovenaan.`
                        : "Zodra je cijfers binnenkomen zie je hier je conversie."}
                    </div>
                  </div>
                );
              })()}

              {!kanBewerken && (
                <button
                  onClick={() => meldPlaatsing(detail)}
                  style={{
                    width: "100%", marginTop: 16, background: C.accent, color: "#fff", border: "none",
                    borderRadius: 12, padding: "14px 0", fontSize: 16, fontWeight: 700, cursor: "pointer",
                    letterSpacing: 0.3, boxShadow: "0 4px 12px rgba(241,136,37,.35)",
                  }}
                >
                  Ik heb er eentje!
                </button>
              )}
              {!kanBewerken && (
                <div style={{ fontSize: 10.5, textAlign: "center", marginTop: 6, opacity: 0.7 }}>
                  Zet je geluid even aan
                </div>
              )}

              <div style={{ fontSize: 10.5, marginTop: 12, opacity: 0.8 }}>
                {(beweging[detail.id] ?? 0) === 0
                  ? "Laatste beweging: vandaag"
                  : `Laatste beweging: ${beweging[detail.id]} dagen geleden`}
                {(beweging[detail.id] ?? 0) >= 14 && (
                  <span style={{ marginLeft: 8, background: C.accent, color: "#fff", borderRadius: 99, padding: "2px 8px", fontSize: 10, fontWeight: 700 }}>
                    staat stil
                  </span>
                )}
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16, marginBottom: 6 }}>
                <span style={{ fontSize: 9.5, textTransform: "uppercase", letterSpacing: 0.8, opacity: 0.75, fontWeight: 700 }}>
                  Resultaten deze week{resultaten[detail.id]?.weken ? ` · week ${resultaten[detail.id].weken}` : ""}
                </span>
                {kanBewerken && (
                  <button
                    onClick={() => setWeekVak({ ...LEEG, ...(resultaten[detail.id]?.week || {}) })}
                    style={{ background: C.accent, color: "#fff", border: "none", borderRadius: 99, padding: "5px 12px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}
                  >
                    {isVrijdag ? "Week afsluiten" : "Week bijwerken"}
                  </button>
                )}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6 }}>
                {[
                  { k: "intakes", label: "Intakes", sub: "" },
                  { k: "voorstellen", label: "Voorstel", sub: "3.1" },
                  { k: "gesprekken", label: "Gesprek", sub: "4.1" },
                  { k: "plaatsingen", label: "Plaatsing", sub: "5.1" },
                  { k: "gestopt", label: "Gestopt", sub: "" },
                ].map((v) => (
                  <div key={v.k} style={{ background: "rgba(255,255,255,.10)", borderRadius: 10, padding: "9px 4px", textAlign: "center" }}>
                    <div style={{ fontSize: 22, fontWeight: 700, lineHeight: 1, color: v.k === "plaatsingen" ? C.accent : v.k === "gestopt" ? "#f0a3a3" : "#fff" }}>
                      {resultaten[detail.id]?.week?.[v.k] ?? 0}
                    </div>
                    <div style={{ fontSize: 8.5, textTransform: "uppercase", letterSpacing: 0.4, opacity: 0.75, marginTop: 4 }}>{v.label}</div>
                    {v.sub && <div style={{ fontSize: 8, opacity: 0.5 }}>{v.sub}</div>}
                    <div style={{ fontSize: 8.5, opacity: 0.5, marginTop: 2 }}>
                      gem. {(((resultaten[detail.id]?.totaal?.[v.k] ?? 0) / Math.max(1, resultaten[detail.id]?.weken ?? 1))).toFixed(1).replace(".", ",")}
                    </div>
                    <div style={{ fontSize: 8, opacity: 0.4 }}>{resultaten[detail.id]?.totaal?.[v.k] ?? 0} totaal</div>
                  </div>
                ))}
              </div>

              {/* Weeknotitie */}
              {kanBewerken && (
                <div style={{ marginTop: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "0 2px 8px" }}>
                    <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: "#fff", opacity: 0.75 }}>
                      Notitie week {programmaWeek(detail)}
                    </span>
                    <span style={{ flex: 1 }} />
                    <span style={{ fontSize: 10, color: "#fff", opacity: 0.55 }}>Na het gesprek</span>
                  </div>
                  <textarea
                    value={notities[detail.id]?.[programmaWeek(detail)] || ""}
                    onChange={(e) =>
                      setNotities((n) => ({
                        ...n,
                        [detail.id]: { ...(n[detail.id] || {}), [programmaWeek(detail)]: e.target.value },
                      }))
                    }
                    placeholder="Wat viel op, wat spraken jullie af? Een paar regels is genoeg."
                    style={{
                      width: "100%", minHeight: 62, background: "rgba(255,255,255,.10)", border: "1px solid rgba(255,255,255,.18)",
                      borderRadius: 12, padding: "11px 13px", fontSize: 13, lineHeight: 1.45,
                      resize: "vertical", fontFamily: "inherit", color: "#fff",
                    }}
                  />

                  {(() => {
                    const eerder = Object.entries(notities[detail.id] || {})
                      .filter(([w]) => Number(w) !== programmaWeek(detail))
                      .sort((a, b) => Number(b[0]) - Number(a[0]));
                    if (eerder.length === 0) return null;
                    return (
                      <div style={{ marginTop: 8 }}>
                        {eerder.slice(0, 3).map(([w, tekst]) => (
                            <div key={w} style={{ background: "rgba(255,255,255,.07)", borderRadius: 10, padding: "8px 12px", marginBottom: 6 }}>
                              <div style={{ fontSize: 10.5, fontWeight: 700, color: "#fff", opacity: 0.6, textTransform: "uppercase", letterSpacing: 0.5 }}>Week {w}</div>
                              <div style={{ fontSize: 12.5, lineHeight: 1.45, marginTop: 2, color: "#fff", opacity: 0.9 }}>{tekst}</div>
                            </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              )}

            </div>

            {kanBewerken ? (
              <div style={{ fontSize: 12, color: C.soft, marginBottom: 12 }}>
                Tik op een bolletje om iemand handmatig een stap over te zetten. Stap 2 zet je na uitleg in eigen woorden, stap 3 en 4 na een test in de praktijk. Elke overzetting wordt automatisch gelogd.
              </div>
            ) : (
              <div style={{ fontSize: 12, color: C.soft, marginBottom: 12 }}>
                Stap 1 (doorgenomen) vink je zelf af. Vanaf stap 2 toon je het aan je VM of mentor: eerst uitleg in eigen woorden, daarna de praktijk.
              </div>
            )}

            {FASEN.map((fase) => {
              const items = ONDERWERPEN.filter((o) => o.fase === fase.id);
              const pctDezeFase = pctFase(detail, fase.id);
              const open = openFases[fase.id] ?? false;
              return (
              <div key={fase.id} style={{ marginBottom: open ? 22 : 8 }}>
                <div
                  onClick={() => setOpenFases((o) => ({ ...o, [fase.id]: !open }))}
                  style={{ display: "flex", alignItems: "center", gap: 8, margin: "0 2px 8px", cursor: "pointer" }}
                >
                  <span style={{ background: fase.kleur, color: "#fff", fontSize: 11, fontWeight: 700, lineHeight: 1, letterSpacing: 0.6, textTransform: "uppercase", borderRadius: 99, padding: "4px 10px 3px" }}>
                    {fase.label}
                  </span>
                  <span style={{ fontSize: 11, color: C.soft, flex: 1 }}>
                    {open ? fase.sub : `${items.length} onderwerpen`}
                  </span>
                  {pctDezeFase === 100 ? (
                    <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 0.4, color: "#fff", background: C.green, borderRadius: 99, padding: "3px 9px" }}>
                      Vamos! rond
                    </span>
                  ) : (
                    <span style={{ fontSize: 11, fontWeight: 700, color: fase.kleur }}>{pctDezeFase}%</span>
                  )}
                  <span style={{ fontSize: 11, color: C.soft, transform: open ? "rotate(180deg)" : "none" }}>▾</span>
                </div>
                {open && items.map((ond) => {
                  const niveau = detail.niveaus[ond.id] || 0;
                  const opm = opmerkingen.filter((x) => x.onboarderId === detail.id && x.onderwerp === ond.naam);
                  return (
                    <div key={ond.id} style={{ background: C.card, border: `1px solid ${C.line}`, borderLeft: `4px solid ${fase.kleur}`, borderRadius: 12, padding: "12px 14px", marginBottom: 8 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontWeight: 700, fontSize: 14 }}>{ond.naam}</div>
                          <div style={{ display: "flex", gap: 6, alignItems: "center", marginTop: 3, flexWrap: "wrap" }}>
                            <Badge kleur={ond.type === "kennis" ? C.group : C.works} tint={ond.type === "kennis" ? "#e9eaf5" : "#e6eef7"}>
                              {ond.type}
                            </Badge>
                            {ond.max === 2 && <Badge kleur="#9a5200" tint="#fdeedd">tot begrijpt</Badge>}
                            <span style={{ fontSize: 12, color: niveau === ond.max ? C.green : C.soft, fontWeight: niveau === ond.max ? 700 : 400 }}>
                              {NIVEAUS[niveau]}
                            </span>
                            {!kanBewerken && (ond.c3 || ond.c4) && (
                              <button
                                onClick={() => setBevestig({ ond, n: null, criterium: null, alleenLezen: true })}
                                style={{ background: "none", border: "none", padding: 0, fontSize: 11, color: C.works, fontWeight: 700, cursor: "pointer" }}
                              >
                                wat moet ik laten zien?
                              </button>
                            )}
                            {ond.training && (
                              <span style={{
                                fontSize: 10, fontWeight: 700, letterSpacing: 0.4, textTransform: "uppercase",
                                color: "#9a5200", background: "#fdeedd", padding: "3px 8px", borderRadius: 99,
                              }}>
                                via {ond.training}
                              </span>
                            )}
                          </div>

                          <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 5, flexWrap: "wrap" }}>
                            {ond.aanspreekpunt && (
                              <span style={{
                                fontSize: 11, fontWeight: 600, color: "#22263a",
                                background: C.bg, border: `1px solid ${C.line}`,
                                borderRadius: 99, padding: "2px 9px",
                              }}>
                                Aanspreekpunt · {ond.aanspreekpunt}
                              </span>
                            )}
                            {ond.welder && (
                              <a
                                href={ond.welder}
                                target="_blank"
                                rel="noreferrer"
                                style={{ fontSize: 12, color: C.works, fontWeight: 700, textDecoration: "none" }}
                              >
                                Bekijk in Welder ↗
                              </a>
                            )}
                          </div>
                        </div>
                        <Bolletjes niveau={niveau} max={ond.max} bewerkTot={ond.training && !kanBewerken ? 0 : bewerkTot} onKies={(n) => {
                          const criterium = n === 3 ? ond.c3 : n === 4 ? ond.c4 : null;
                          if (kanBewerken && n > niveau && criterium) setBevestig({ ond, n, criterium });
                          else wijzigNiveau(detail, ond, n);
                        }} />
                      </div>

                      {opm.map((x, i) => (
                        <div key={i} style={{ marginTop: 8, fontSize: 12, background: C.bg, borderRadius: 8, padding: "8px 10px" }}>
                          <b>{x.door}</b> <span style={{ color: C.soft }}>· dag {x.dag}</span><br />{x.tekst}
                        </div>
                      ))}

                      {opmerkingVoor === `${detail.id}-${ond.id}` ? (
                        <div style={{ marginTop: 8, display: "flex", gap: 6 }}>
                          <input
                            autoFocus
                            value={opmerkingTekst}
                            onChange={(e) => setOpmerkingTekst(e.target.value)}
                            placeholder="Opmerking…"
                            style={{ flex: 1, border: `1px solid ${C.line}`, borderRadius: 8, padding: "8px 10px", fontSize: 13 }}
                          />
                          <button
                            onClick={() => bewaarOpmerking(detail, ond)}
                            style={{ background: C.works, color: "#fff", border: "none", borderRadius: 8, padding: "0 14px", fontWeight: 700, cursor: "pointer" }}
                          >
                            Bewaar
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => { setOpmerkingVoor(`${detail.id}-${ond.id}`); setOpmerkingTekst(""); }}
                          style={{ marginTop: 6, background: "none", border: "none", color: C.works, fontSize: 12, fontWeight: 700, cursor: "pointer", padding: 0 }}
                        >
                          + Opmerking
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
              );
            })}

            {/* Nulmeting */}
            {(() => {
              const m = meting[detail.id];
              const scores = m ? KERNCOMPETENTIES.map((c) => m.scores?.[c.id] || 0) : [];
              const beoordeeld = scores.filter((s) => s > 0).length;
              const klaar = m?.afgerond;
              return (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "0 2px 8px" }}>
                    <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: C.group }}>
                      Nulmeting · dag 30
                    </span>
                    <span style={{ flex: 1 }} />
                    {klaar && (
                      <span style={{ fontSize: 10.5, fontWeight: 700, color: "#fff", background: m.investeren === "ja" ? C.green : m.investeren === "nee" ? "#c96a6a" : C.accent, borderRadius: 99, padding: "3px 9px" }}>
                        {m.investeren === "ja" ? "Gaan we voor" : m.investeren === "nee" ? "Geen match" : "Twijfel"}
                      </span>
                    )}
                  </div>

                  <div style={{ background: C.card, border: `1px solid ${klaar ? C.green : C.line}`, borderRadius: 12, padding: "12px 14px" }}>
                    {!klaar && kanBewerken && (
                      <div style={{ fontSize: 12, color: C.soft, marginBottom: 10 }}>
                        Aan het einde van de proeftijd beoordelen VM en mentor samen de zeven kerncompetenties op gedragsindicatoren. Geen prestatiemeting, maar een startpunt: is de basis er, en waar zit groei nodig?
                      </div>
                    )}

                    {klaar && (
                      <div style={{ marginBottom: 10 }}>
                        {KERNCOMPETENTIES.map((c) => {
                          const s = m.scores?.[c.id] || 0;
                          const sterren = METING_STERREN[s];
                          const kleur = [C.line, "#c96a6a", C.works, C.green][s];
                          return (
                            <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0" }}>
                              <span style={{ fontSize: 12.5, flex: 1 }}>{c.naam}</span>
                              {kanBewerken ? (
                                <>
                                  <span style={{ display: "flex", gap: 3 }}>
                                    {[1, 2, 3].map((n) => (
                                      <span key={n} style={{ width: 16, height: 5, borderRadius: 99, background: n <= s ? kleur : C.line }} />
                                    ))}
                                  </span>
                                  <span style={{ fontSize: 10.5, color: C.soft, minWidth: 92, textAlign: "right" }}>{METING_SCORE[s]}</span>
                                </>
                              ) : (
                                <>
                                  <span style={{ display: "flex", gap: 2 }}>
                                    {Array.from({ length: 10 }).map((_, i) => (
                                      <span key={i} style={{
                                        width: 8, height: 8, borderRadius: 2, transform: "rotate(45deg)",
                                        background: i < sterren ? kleur : C.line,
                                      }} />
                                    ))}
                                  </span>
                                  <span style={{ fontSize: 11, fontWeight: 700, color: kleur, minWidth: 30, textAlign: "right" }}>{sterren}/10</span>
                                </>
                              )}
                            </div>
                          );
                        })}
                        {!kanBewerken && (
                          <div style={{ fontSize: 10.5, color: C.soft, marginTop: 6, lineHeight: 1.4 }}>
                            Tien is expertniveau. Daar groei je naartoe, en dat kost meer dan honderd dagen. Dit is waar je nu staat.
                          </div>
                        )}
                      </div>
                    )}

                    {kanBewerken && (
                      <button
                        onClick={() => { setMetingConcept(m ? JSON.parse(JSON.stringify(m)) : { scores: {}, indicatoren: {}, notities: {}, investeren: "" }); setMetingOpen(true); }}
                        style={{
                          width: "100%", background: klaar ? C.bg : C.group, color: klaar ? C.group : "#fff",
                          border: klaar ? `1px solid ${C.line}` : "none", borderRadius: 10, padding: "11px 0",
                          fontSize: 13.5, fontWeight: 700, cursor: "pointer",
                        }}
                      >
                        {klaar ? "Nulmeting bekijken of aanpassen" : beoordeeld ? `Nulmeting afmaken (${beoordeeld}/7)` : "Nulmeting starten"}
                      </button>
                    )}
                    {!kanBewerken && !klaar && (
                      <div style={{ fontSize: 12, color: C.soft }}>Je VM en mentor doen deze meting samen met jou aan het einde van je proeftijd.</div>
                    )}

                    {!kanBewerken && klaar && (() => {
                      const sterk = KERNCOMPETENTIES.filter((c) => (m.scores?.[c.id] || 0) === 3);
                      const groei = KERNCOMPETENTIES.filter((c) => (m.scores?.[c.id] || 0) === 1);
                      return (
                        <div style={{ marginTop: 4 }}>
                          {sterk.length > 0 && (
                            <div style={{ background: "#e5f3ee", borderRadius: 10, padding: "10px 12px", marginBottom: 8 }}>
                              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.6, color: "#256b57" }}>
                                Hier ben je sterk in
                              </div>
                              <div style={{ fontSize: 12.5, marginTop: 4, lineHeight: 1.45 }}>
                                {sterk.map((c) => c.naam).join(", ")}. Hier verwachten we dan ook het meest van je: gebruik het om je collega's te helpen en om je andere punten te compenseren.
                              </div>
                              <div style={{ fontSize: 11.5, color: "#256b57", marginTop: 4 }}>
                                Zes van de tien is je startpunt, niet je eindpunt.
                              </div>
                            </div>
                          )}

                          {groei.length > 0 && (
                            <div style={{ background: "#fdeedd", borderRadius: 10, padding: "10px 12px", marginBottom: 8 }}>
                              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.6, color: "#9a5200" }}>
                                Hier ligt je werk
                              </div>
                              {groei.map((c) => (
                                <div key={c.id} style={{ marginTop: 6 }}>
                                  <div style={{ fontSize: 12.5, fontWeight: 700 }}>{c.naam}</div>
                                  {m.notities?.[c.id] && (
                                    <div style={{ fontSize: 12, color: C.soft, marginTop: 1, lineHeight: 1.4 }}>{m.notities[c.id]}</div>
                                  )}
                                  {(() => {
                                    const gevoerdMet = c.specialisten.filter((s) => (gesprekken[detail.id]?.[`${c.id}|${s}`] || 0) === 2);
                                    const geplandMet = c.specialisten.filter((s) => (gesprekken[detail.id]?.[`${c.id}|${s}`] || 0) === 1);
                                    if (gevoerdMet.length > 0) {
                                      return (
                                        <div style={{ fontSize: 11.5, color: "#256b57", marginTop: 3 }}>
                                          Je sprak {gevoerdMet.join(" en ")} hier al over. Wat doe je deze week met wat je daar hoorde?
                                        </div>
                                      );
                                    }
                                    if (geplandMet.length > 0) {
                                      return (
                                        <div style={{ fontSize: 11.5, color: "#9a5200", marginTop: 3 }}>
                                          Goed bezig: je gesprek met {geplandMet.join(" en ")} staat al gepland.
                                        </div>
                                      );
                                    }
                                    return (
                                      <div style={{ fontSize: 11.5, color: C.works, marginTop: 3 }}>
                                        Plan hier een gesprek over in met {c.specialisten.slice(0, 2).join(" of ")}
                                      </div>
                                    );
                                  })()}
                                </div>
                              ))}
                            </div>
                          )}

                          {groei.length === 0 && sterk.length === 0 && (
                            <div style={{ fontSize: 12.5, color: C.soft }}>
                              Je staat overal op niveau. Nu doorpakken richting dag 100.
                            </div>
                          )}

                          <div style={{ fontSize: 11.5, color: C.soft, marginTop: 4 }}>
                            Dit is je startpunt, geen eindoordeel. Op dag 100 kijken we wat er is veranderd.
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              );
            })()}

            {/* Specialistgesprekken */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "0 2px 8px" }}>
                <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: C.group }}>
                  Specialistgesprekken
                </span>
                <span style={{ flex: 1 }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: C.green }}>
                  {aantalGevoerd(detail)}/{TOTAAL_GESPREKKEN}
                </span>
              </div>
              <div style={{ fontSize: 11.5, color: C.soft, margin: "0 2px 10px" }}>
                Kerncompetenties uit de SOMA bibliotheek. Tik op een naam om de status te wisselen.
              </div>

              {KERNCOMPETENTIES.map((comp) => {
                const gevoerd = comp.specialisten.filter((s) => (gesprekken[detail.id]?.[`${comp.id}|${s}`] || 0) === 2).length;
                const compleet = gevoerd === comp.specialisten.length;
                return (
                  <div key={comp.id} style={{ background: C.card, border: `1px solid ${compleet ? C.green : C.line}`, borderRadius: 12, padding: "10px 12px", marginBottom: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      <span style={{ fontWeight: 700, fontSize: 13.5, flex: 1 }}>{comp.naam}</span>
                      <span style={{ display: "flex", gap: 3 }}>
                        {comp.specialisten.map((s) => {
                          const st = gesprekken[detail.id]?.[`${comp.id}|${s}`] || 0;
                          return (
                            <span key={s} style={{
                              width: 7, height: 7, borderRadius: "50%",
                              background: st === 2 ? C.green : st === 1 ? C.accent : C.line,
                            }} />
                          );
                        })}
                      </span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: compleet ? C.green : C.soft, minWidth: 26, textAlign: "right" }}>
                        {gevoerd}/{comp.specialisten.length}
                      </span>
                    </div>

                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {comp.specialisten.map((spec) => {
                        const status = gesprekken[detail.id]?.[`${comp.id}|${spec}`] || 0;
                        const stijl = [
                          { bg: C.bg, rand: C.line, tekst: C.soft, punt: "#ccd3dd" },
                          { bg: "#fdeedd", rand: "#f7d3ab", tekst: "#9a5200", punt: C.accent },
                          { bg: "#e5f3ee", rand: "#bfe3d6", tekst: "#256b57", punt: C.green },
                        ][status];
                        return (
                          <button
                            key={spec}
                            onClick={() => wijzigGesprek(detail, comp, spec)}
                            title={GESPREK_STATUS[status]}
                            style={{
                              display: "flex", alignItems: "center", gap: 7, textAlign: "left",
                              border: `1px solid ${stijl.rand}`, background: stijl.bg, color: stijl.tekst,
                              borderRadius: 10, padding: "6px 11px", cursor: "pointer",
                            }}
                          >
                            <span style={{ width: 7, height: 7, borderRadius: "50%", background: stijl.punt, flexShrink: 0 }} />
                            <span>
                              <span style={{ display: "block", fontSize: 12, fontWeight: 700, lineHeight: 1.2 }}>{spec}</span>
                              <span style={{ display: "block", fontSize: 9.5, opacity: 0.85, marginTop: 1 }}>
                                {GESPREK_STATUS[status].toLowerCase()}
                              </span>
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Logboek */}
            <button
              onClick={() => setToonLog(!toonLog)}
              style={{
                width: "100%", background: C.card, border: `1px solid ${C.line}`, borderRadius: 12,
                padding: "12px 14px", fontWeight: 700, fontSize: 14, cursor: "pointer", color: C.group, textAlign: "left",
              }}
            >
              Logboek {toonLog ? "▲" : "▼"}
            </button>
            {toonLog && (
              <div style={{ marginTop: 8 }}>
                {log.filter((l) => l.onboarderId === detail.id).length === 0 && (
                  <div style={{ fontSize: 13, color: C.soft, padding: "8px 2px" }}>Nog geen overzettingen vastgelegd.</div>
                )}
                {log.filter((l) => l.onboarderId === detail.id).map((l, i) => (
                  <div key={i} style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 10, padding: "10px 12px", marginBottom: 6, fontSize: 13 }}>
                    <b>{l.onderwerp}</b>: {l.van} → <b>{l.naar}</b>
                    <div style={{ fontSize: 12, color: C.soft, marginTop: 2 }}>door {l.door} · dag {l.dag}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Nulmeting invullen */}
        {metingOpen && detail && metingConcept && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(34,38,58,.5)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 15 }}>
            <div style={{ background: C.bg, borderRadius: "16px 16px 0 0", width: "100%", maxWidth: 560, maxHeight: "92vh", overflowY: "auto" }}>
              <div style={{ background: C.group, color: "#fff", padding: "16px 18px", position: "sticky", top: 0, zIndex: 2 }}>
                <div style={{ fontSize: 11, letterSpacing: 1, textTransform: "uppercase", opacity: 0.7, fontWeight: 700 }}>Nulmeting · dag 30</div>
                <div style={{ fontSize: 18, fontWeight: 700, lineHeight: 1, letterSpacing: 0.4, textTransform: "uppercase", marginTop: 4 }}>{detail.naam}</div>
                <div style={{ fontSize: 11.5, opacity: 0.8, marginTop: 4 }}>
                  Geen prestatiemeting. Waar staat hij nu, en is er genoeg basis om in te investeren?
                </div>
              </div>

              <div style={{ padding: 14 }}>
                {KERNCOMPETENTIES.map((c) => {
                  const score = metingConcept.scores?.[c.id] || 0;
                  const vinkjes = metingConcept.indicatoren?.[c.id] || [];
                  return (
                    <div key={c.id} style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 12, padding: "12px 14px", marginBottom: 10 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 8 }}>{c.naam}</div>

                      {(INDICATOREN[c.id] || []).map((ind, i) => {
                        const aan = vinkjes.includes(i);
                        return (
                          <button
                            key={i}
                            onClick={() => setMetingConcept((m) => {
                              const lijst = m.indicatoren?.[c.id] || [];
                              const nieuw = aan ? lijst.filter((x) => x !== i) : [...lijst, i];
                              return { ...m, indicatoren: { ...m.indicatoren, [c.id]: nieuw } };
                            })}
                            style={{
                              display: "flex", alignItems: "flex-start", gap: 8, width: "100%", textAlign: "left",
                              background: "none", border: "none", padding: "4px 0", cursor: "pointer",
                            }}
                          >
                            <span style={{
                              width: 16, height: 16, borderRadius: 4, flexShrink: 0, marginTop: 1,
                              border: aan ? "none" : `1.5px solid ${C.line}`, background: aan ? C.green : C.card,
                              color: "#fff", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center",
                            }}>{aan ? "✓" : ""}</span>
                            <span style={{ fontSize: 11.5, lineHeight: 1.35, color: aan ? "#22263a" : C.soft }}>{ind}</span>
                          </button>
                        );
                      })}

                      <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
                        {[1, 2, 3].map((n) => {
                          const aan = score === n;
                          const kleur = [null, "#c96a6a", C.works, C.green][n];
                          return (
                            <button
                              key={n}
                              onClick={() => setMetingConcept((m) => ({ ...m, scores: { ...m.scores, [c.id]: n } }))}
                              style={{
                                flex: 1, border: `1px solid ${aan ? kleur : C.line}`, background: aan ? kleur : C.card,
                                color: aan ? "#fff" : C.soft, borderRadius: 8, padding: "7px 4px",
                                fontSize: 11, fontWeight: 700, cursor: "pointer",
                              }}
                            >
                              {METING_SCORE[n]}
                            </button>
                          );
                        })}
                      </div>

                      <input
                        value={metingConcept.notities?.[c.id] || ""}
                        onChange={(e) => setMetingConcept((m) => ({ ...m, notities: { ...m.notities, [c.id]: e.target.value } }))}
                        placeholder="Wat zag je concreet?"
                        style={{ width: "100%", marginTop: 8, border: `1px solid ${C.line}`, borderRadius: 8, padding: "8px 10px", fontSize: 12.5 }}
                      />
                    </div>
                  );
                })}

                <div style={{ background: C.group, color: "#fff", borderRadius: 12, padding: "14px 16px", marginBottom: 12 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 700, lineHeight: 1, letterSpacing: 0.4, textTransform: "uppercase" }}>Gaan we in deze medewerker investeren?</div>
                  <div style={{ fontSize: 11.5, opacity: 0.8, marginTop: 3 }}>
                    De VM koppelt dit advies terug aan de directie.
                  </div>
                  <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
                    {[["ja", "Ja, gaan we voor"], ["twijfel", "Twijfel"], ["nee", "Geen match"]].map(([k, label]) => {
                      const aan = metingConcept.investeren === k;
                      const kleur = k === "ja" ? C.green : k === "nee" ? "#c96a6a" : C.accent;
                      return (
                        <button
                          key={k}
                          onClick={() => setMetingConcept((m) => ({ ...m, investeren: k }))}
                          style={{
                            flex: 1, border: "none", background: aan ? kleur : "rgba(255,255,255,.14)",
                            color: "#fff", borderRadius: 8, padding: "9px 4px", fontSize: 12, fontWeight: 700, cursor: "pointer",
                          }}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div style={{ display: "flex", gap: 8, paddingBottom: 8 }}>
                  <button
                    onClick={() => { setMetingOpen(false); setMetingConcept(null); }}
                    style={{ flex: 1, background: C.card, border: `1px solid ${C.line}`, borderRadius: 10, padding: "12px 0", fontWeight: 700, cursor: "pointer", color: C.soft }}
                  >
                    Sluiten
                  </button>
                  <button
                    onClick={() => {
                      const compleet = KERNCOMPETENTIES.every((c) => (metingConcept.scores?.[c.id] || 0) > 0) && metingConcept.investeren;
                      setMeting((m) => ({ ...m, [detail.id]: { ...metingConcept, afgerond: compleet } }));
                      setLog((l) => [
                        { onboarderId: detail.id, onderwerp: "Nulmeting", door: actorNaam, dag: detail.dag,
                          van: compleet ? "afgerond" : "concept",
                          naar: compleet ? (metingConcept.investeren === "ja" ? "gaan we voor" : metingConcept.investeren === "nee" ? "geen match" : "twijfel") : "tussentijds opgeslagen" },
                        ...l,
                      ]);
                      setBeweging((b) => ({ ...b, [detail.id]: 0 }));
                      setMetingOpen(false); setMetingConcept(null);
                      meldToast(compleet ? "Nulmeting afgerond" : "Nulmeting opgeslagen");
                    }}
                    style={{ flex: 2, background: C.works, color: "#fff", border: "none", borderRadius: 10, padding: "12px 0", fontWeight: 700, cursor: "pointer" }}
                  >
                    Opslaan
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Feest */}
        {feest && (
          <div
            onClick={() => setFeest(false)}
            style={{ position: "fixed", inset: 0, background: "rgba(241,136,37,.97)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 20, color: "#fff", textAlign: "center", padding: 24, overflow: "hidden" }}
          >
            <style>{`
              @keyframes valt { 0% { transform: translateY(-20vh) rotate(0deg); opacity: 1; } 100% { transform: translateY(110vh) rotate(720deg); opacity: 0.9; } }
              @keyframes knal { 0% { transform: scale(0.3); opacity: 0; } 60% { transform: scale(1.12); opacity: 1; } 100% { transform: scale(1); opacity: 1; } }
            `}</style>

            {Array.from({ length: 40 }).map((_, i) => (
              <div
                key={i}
                style={{
                  position: "absolute", top: 0,
                  left: `${(i * 2.5 + (i % 5) * 3) % 100}%`,
                  width: i % 3 === 0 ? 8 : 6,
                  height: i % 3 === 0 ? 14 : 10,
                  background: ["#fff", "#2c2f7b", "#6db9a0", "#3b73ad"][i % 4],
                  borderRadius: i % 2 ? 2 : "50%",
                  animation: `valt ${1.6 + (i % 7) * 0.22}s linear ${(i % 11) * 0.13}s infinite`,
                }}
              />
            ))}

            <div style={{ position: "relative", animation: "knal .45s ease-out" }}>
              {FEEST_BEELD ? (
                <img src={FEEST_BEELD} alt="" style={{ maxWidth: 260, borderRadius: 14, marginBottom: 18, boxShadow: "0 8px 24px rgba(0,0,0,.25)" }} />
              ) : (
                <svg width="150" height="150" viewBox="0 0 120 120" style={{ marginBottom: 6 }}>
                  <style>{`
                    @keyframes juich { 0%, 100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-7px) rotate(-2deg); } }
                    @keyframes armL { 0%, 100% { transform: rotate(0deg); } 50% { transform: rotate(-14deg); } }
                    @keyframes armR { 0%, 100% { transform: rotate(0deg); } 50% { transform: rotate(14deg); } }
                  `}</style>
                  <g style={{ animation: "juich .55s ease-in-out infinite" }}>
                    <circle cx="60" cy="26" r="15" fill="#fff" />
                    <path d="M52 24 q3 -4 7 -1" stroke="#f18825" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                    <path d="M62 23 q3 -4 7 -1" stroke="#f18825" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                    <path d="M53 31 q7 7 14 0" stroke="#f18825" strokeWidth="3" fill="none" strokeLinecap="round" />
                    <rect x="49" y="44" width="22" height="34" rx="9" fill="#fff" />
                    <g style={{ transformOrigin: "48px 50px", animation: "armL .55s ease-in-out infinite" }}>
                      <rect x="30" y="18" width="9" height="34" rx="4.5" fill="#fff" transform="rotate(28 34 35)" />
                      <circle cx="27" cy="19" r="7" fill="#fff" />
                    </g>
                    <g style={{ transformOrigin: "72px 50px", animation: "armR .55s ease-in-out infinite" }}>
                      <rect x="81" y="18" width="9" height="34" rx="4.5" fill="#fff" transform="rotate(-28 86 35)" />
                      <circle cx="93" cy="19" r="7" fill="#fff" />
                    </g>
                    <rect x="51" y="76" width="8" height="26" rx="4" fill="#fff" />
                    <rect x="61" y="76" width="8" height="26" rx="4" fill="#fff" />
                  </g>
                </svg>
              )}
              <div style={{ fontSize: 64, fontWeight: 700, letterSpacing: 2, lineHeight: 1, textShadow: "0 4px 16px rgba(0,0,0,.2)" }}>VAMOS!</div>
              <div style={{ fontSize: 20, fontWeight: 700, marginTop: 12 }}>Plaatsing erbij</div>
              <div style={{ fontSize: 14, marginTop: 6, opacity: 0.95 }}>
                Dat zijn er {resultaten[detail?.id]?.totaal?.plaatsingen ?? 1} in totaal. Op naar de volgende.
              </div>
            </div>
          </div>
        )}

        {/* Weekcijfers invullen */}
        {weekVak && detail && (
          <div onClick={() => setWeekVak(null)} style={{ position: "fixed", inset: 0, background: "rgba(34,38,58,.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, zIndex: 10 }}>
            <div onClick={(e) => e.stopPropagation()} style={{ background: C.card, borderRadius: 14, padding: 20, maxWidth: 380, width: "100%" }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: C.soft }}>
                {detail.naam}
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, lineHeight: 1, letterSpacing: 0.4, textTransform: "uppercase", margin: "8px 0 14px" }}>Wat heeft hij deze week gedaan?</div>

              {[
                { k: "intakes", label: "Intakes" },
                { k: "voorstellen", label: "Voorstelacties (3.1)" },
                { k: "gesprekken", label: "Gesprekken (4.1)" },
                { k: "plaatsingen", label: "Plaatsingen (5.1)" },
                { k: "gestopt", label: "Gestopten" },
              ].map((v) => (
                <div key={v.k} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${C.line}` }}>
                  <span style={{ fontSize: 14, fontWeight: 600 }}>{v.label}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <button
                      onClick={() => setWeekVak((w) => ({ ...w, [v.k]: Math.max(0, w[v.k] - 1) }))}
                      style={{ width: 32, height: 32, borderRadius: "50%", border: `1px solid ${C.line}`, background: C.card, fontSize: 18, fontWeight: 700, color: C.soft, cursor: "pointer" }}
                    >
                      −
                    </button>
                    <span style={{ fontSize: 20, fontWeight: 700, minWidth: 24, textAlign: "center" }}>{weekVak[v.k]}</span>
                    <button
                      onClick={() => setWeekVak((w) => ({ ...w, [v.k]: w[v.k] + 1 }))}
                      style={{ width: 32, height: 32, borderRadius: "50%", border: "none", background: C.works, color: "#fff", fontSize: 18, fontWeight: 700, cursor: "pointer" }}
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}

              <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                <button onClick={() => setWeekVak(null)} style={{ flex: 1, background: C.card, border: `1px solid ${C.line}`, borderRadius: 10, padding: "10px 0", fontWeight: 700, cursor: "pointer", color: C.soft }}>
                  Annuleren
                </button>
                <button onClick={() => { bewaarWeek(detail, weekVak); setWeekVak(null); }} style={{ flex: 1, background: C.works, color: "#fff", border: "none", borderRadius: 10, padding: "10px 0", fontWeight: 700, cursor: "pointer" }}>
                  Opslaan
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Criteriavenster */}
        {bevestig && (
          <div
            onClick={() => setBevestig(null)}
            style={{ position: "fixed", inset: 0, background: "rgba(34,38,58,.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, zIndex: 10 }}
          >
            <div onClick={(e) => e.stopPropagation()} style={{ background: C.card, borderRadius: 14, padding: 20, maxWidth: 420, width: "100%" }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: C.soft }}>
                {bevestig.ond.naam}
              </div>
              {bevestig.alleenLezen ? (
                <>
                  <div style={{ fontSize: 14, fontWeight: 700, lineHeight: 1, letterSpacing: 0.4, textTransform: "uppercase", margin: "8px 0 14px" }}>Wat moet je laten zien?</div>
                  {bevestig.ond.c3 && (
                    <div style={{ marginBottom: 10 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: C.works }}>3 · Kan toepassen</div>
                      <div style={{ fontSize: 13, lineHeight: 1.5 }}>{bevestig.ond.c3}</div>
                    </div>
                  )}
                  {bevestig.ond.c4 && (
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: C.green }}>4 · Beheerst</div>
                      <div style={{ fontSize: 13, lineHeight: 1.5 }}>{bevestig.ond.c4}</div>
                    </div>
                  )}
                  <button
                    onClick={() => setBevestig(null)}
                    style={{ marginTop: 16, width: "100%", background: C.bg, border: `1px solid ${C.line}`, borderRadius: 10, padding: "10px 0", fontWeight: 700, cursor: "pointer" }}
                  >
                    Sluiten
                  </button>
                </>
              ) : (
                <>
                  <div style={{ fontSize: 15, fontWeight: 700, margin: "6px 0 4px" }}>
                    Naar {NIVEAUS[bevestig.n].toLowerCase()}?
                  </div>
                  <div style={{ fontSize: 12, color: C.soft, marginBottom: 8 }}>Dit spraken jullie samen af als lat:</div>
                  <div style={{ fontSize: 13, lineHeight: 1.5, background: C.bg, borderRadius: 10, padding: "10px 12px" }}>
                    {bevestig.criterium}
                  </div>
                  <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                    <button
                      onClick={() => setBevestig(null)}
                      style={{ flex: 1, background: C.card, border: `1px solid ${C.line}`, borderRadius: 10, padding: "10px 0", fontWeight: 700, cursor: "pointer", color: C.soft }}
                    >
                      Nog niet
                    </button>
                    <button
                      onClick={() => { wijzigNiveau(detail, bevestig.ond, bevestig.n); setBevestig(null); }}
                      style={{ flex: 1, background: C.works, color: "#fff", border: "none", borderRadius: 10, padding: "10px 0", fontWeight: 700, cursor: "pointer" }}
                    >
                      Ja, dit klopt
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Toast */}
        {toast && (
          <div style={{
            position: "fixed", bottom: 20, left: "50%", transform: "translateX(-50%)",
            background: C.group, color: "#fff", borderRadius: 99, padding: "9px 10px 9px 18px",
            fontSize: 13, fontWeight: 700, boxShadow: "0 4px 14px rgba(34,38,58,.25)",
            display: "flex", alignItems: "center", gap: 12, maxWidth: "92vw",
          }}>
            <span>✓ {toast}</span>
            {terug && (
              <button
                onClick={terug.draaiTerug}
                style={{
                  background: "rgba(255,255,255,.18)", border: "none", color: "#fff",
                  borderRadius: 99, padding: "5px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap",
                }}
              >
                Toch niet
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
