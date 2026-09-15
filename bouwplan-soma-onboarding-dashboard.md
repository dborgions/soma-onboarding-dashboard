# Bouwplan SOMA Onboarding Dashboard (versie 1)

Dit document is de volledige specificatie voor het bouwen van het SOMA S&D onboardingdashboard. Het is bedoeld om rechtstreeks aan Claude Code te geven als bouwopdracht.

## 1. Doel en context

SOMA Works werkt met een 100 dagen onboardingprogramma voor nieuwe medewerkers (consultants). Drie rollen werken samen in dit dashboard:

* **Medewerker (onboarder):** ziet zijn eigen voortgang en focuspunten.
* **Vestigingsmanager (VM):** de coach in de praktijk; tekent stap 2 af na uitleg in eigen woorden en test stap 3 en 4, op zijn telefoon, binnen 10 seconden. Het wekelijkse OB-gesprek is het vaste bijwerkmoment.
* **Mentor (Yvo):** verplicht wekelijks uur met de onboarder tijdens de proeftijd (dag 1 tot 30). Op dag 30 sluit hij aan bij het proeftijdgesprek om samen met de VM te bepalen of iemand doorgaat. Daarmee eindigt zijn mentorrol; na dag 30 neemt de VM het volledig over. Hij kan het dashboard blijven volgen, maar hoeft niet bij de eindevaluatie op dag 100 aan te sluiten.

De 100 dagen zijn de ruggengraat. De proeftijd (dag 30) is een mijlpaal binnen het programma, niet het eindpunt. Dag 100 is de eindevaluatie.

**Rode draad: mindset.** De onboarding draait niet om de theorie perfect in kaart brengen, maar om mindset: terug naar de basis, willen plaatsen, eager zijn om te scoren. Kennis is er om dat sterker te maken, niet als doel op zich. Dit is ook de tone of voice voor alle kennisdocumenten en sessies in Welder (zie de richtlijn in bijlage A). De inhoud moet daarbij wel gewoon kloppen: bij CAO, fasen-systeem en Wtta hangen er risico's aan, dus mindset zit in hoe je het brengt, niet in of het klopt.

**Kernprincipe:** alle inhoud (onderwerpen, categorieën, niveaunamen, mijlpalen) staat als data in de database, niet in de code. Vullen en aanpassen gebeurt later zonder herbouw.

## 2. Techniek

* **Frontend:** React met Vite, gedeployed op GitHub Pages (zelfde patroon als de bestaande projectupdate-S-D tool).
* **Backend:** Supabase, project in EU-regio (Frankfurt). Auth, database (Postgres), realtime subscriptions en row level security komen uit Supabase.
* **Login:** Supabase Auth met e-mail en wachtwoord. Gebruikers worden handmatig aangemaakt door de beheerder, er is geen open registratie.
* **Realtime:** wijzigingen in niveaus zijn direct zichtbaar bij alle ingelogde gebruikers (Supabase realtime op de tabel `niveau_stand`).
* **Mobiel eerst:** de interface wordt ontworpen voor telefoongebruik (maximale breedte circa 560px, gecentreerd op desktop).

## 3. Rollen en rechten

| Rol | Zien | Bewerken |
|---|---|---|
| medewerker | Alleen eigen voortgang, eigen logboek, eigen opmerkingen | Stap 1 (doorgenomen) op eigen onderwerpen zelf afvinken; statussen van eigen specialistgesprekken; opmerkingen plaatsen |
| vm | Alle onboarders | Alle niveaus: stap 2 na uitleg in eigen woorden, stap 3 en 4 als praktijktest |
| mentor | Alle onboarders | Alles, inclusief beheer van onderwerpen en onboarders |

De medewerker kan een niveau nooit boven stap 1 zetten en kan een door de VM of mentor gezet hoger niveau niet verlagen; dit wordt afgedwongen in de database (row level security), niet alleen in de schermen. In versie 1 zien VM en mentor alle onboarders; filtering per vestiging is een uitbreiding voor later (het veld `vestiging_id` zit al in het datamodel). De rol staat in de tabel `gebruikers`.

## 4. Niveausystematiek

Eén vaste schaal voor alle onderwerpen, met een nulstand:

**0 Nog niet gestart, 1 Doorgenomen, 2 Begrijpt, 3 Kan toepassen, 4 Beheerst**

"Doorgenomen" dekt bewust beide leerwegen: zelf doorgelezen in Welder, of samen doorgenomen met het aanspreekpunt. "Beheerst" is het basisniveau van een startende consultant ("ik doe het structureel zelfstandig en goed, niet één keer maar altijd"), niet meesterschap; dat komt na de 100 dagen. De VM's stellen per onderwerp gezamenlijk vast wat ze bij stap 3 en 4 willen terugzien, zodat elke vestiging hetzelfde toetst.

De VM's stellen per onderwerp samen vast wat ze bij stap 3 en 4 willen terugzien. Die criteria staan als `criterium_3` en `criterium_4` bij het onderwerp in de database. Ze komen niet standaard in beeld, maar precies op het moment dat ze nodig zijn (zie 7.3).

De lat: **op dag 100 staat elk onderwerp op zijn maximum** (niveau 4, of niveau 2 bij de tot-2-onderwerpen). Daartussen volgt de verwachting de tijdlijnblokken: aan het einde van het blok waarin een onderwerp aan bod komt, staat het minimaal op begrijpt. Op dag 30 gelden dus alleen de onderwerpen uit de blokken tot en met week 4; wat later wordt aangeboden, telt op dag 30 niet mee.

Niveaus veranderen nooit automatisch. De medewerker vinkt alleen stap 1 (doorgenomen) zelf af. Stap 2 (begrijpt) tekent de VM of de mentor af nadat de onboarder het in eigen woorden heeft uitgelegd, zonder de stof erbij. Stap 3 en 4 (kan toepassen, beheerst) zijn de praktijktest van de VM. Elke overzetting wordt gelogd (wie, wanneer, van welk niveau, naar welk niveau). Het onderscheid kennis of vaardigheid blijft bestaan als eigenschap van het onderwerp (badge en percentages), maar de schaal is voor beide gelijk. De labels staan in de tabel `niveau_labels` zodat ze later aangepast kunnen worden.

Elk onderwerp heeft daarnaast een optioneel veld `aanspreekpunt`: de collega bij wie de onboarder terechtkan voor dit onderwerp (bijvoorbeeld Marlin voor de uitzendkennis). De naam wordt op het onderwerpkaartje getoond, naast de eventuele Welder-link. Samen vormen die de leerwegen van SOMA: zelf doornemen in Welder, of aankloppen bij het aanspreekpunt. Niemand is verplicht een bepaalde route te volgen; welke weg de onboarder ook kiest, de test op stap 3 en 4 bepaalt of het geland is.

Voor de vier Commercie-onderwerpen en voor alle Systeemvaardigheden geldt een uitzondering: daar is geen vrije leerweg. Stap 1 (doorgenomen) kan alleen behaald worden via de verplichte eendaagse interne salestraining, gegeven door Ralph (voorloper in commercie, draait nu al groepjes), met daarna aanhaken bij die bestaande groepjes als vervolg. Ralph zet stap 1 op de vier Commercie-onderwerpen na afloop van de trainingsdag. De systemen (Carerix, CARV, Easyflex, Buddee, Welder) leer je ook niet zelfstandig: die gaan via een sessie of cursus, en het aanspreekpunt zet daar stap 1 na afloop. De medewerker vinkt deze onderwerpen dus niet zelf af. Stap 2 tekent de VM of de mentor af, stap 3 en 4 blijven de praktijktest van de VM. Voor de bouw betekent dit alleen dat de medewerker geen stap 1 kan zetten op onderwerpen met `training_verplicht = true`; verder hoeft er niets voor gebouwd te worden.

Niet elk onderwerp loopt tot niveau 4. Sommige kennisonderwerpen (zoals subsidies en ziekte) hoeven alleen doorgenomen en begrepen te worden. Daarom heeft elk onderwerp een `max_niveau` (2 of 4). De interface toont alleen bolletjes tot het maximum en de percentages rekenen met het maximum per onderwerp, zodat een onderwerp met maximum 2 op niveau 2 als volledig afgerond telt.

## 5. Datamodel

```sql
-- Vestigingen
create table vestigingen (
  id uuid primary key default gen_random_uuid(),
  naam text not null
);

-- Gebruikers (gekoppeld aan Supabase auth.users)
create table gebruikers (
  id uuid primary key references auth.users(id),
  naam text not null,
  rol text not null check (rol in ('medewerker', 'vm', 'mentor')),
  vestiging_id uuid references vestigingen(id)
);

-- Onboarders (een medewerker in het 100 dagen programma)
create table onboarders (
  id uuid primary key default gen_random_uuid(),
  gebruiker_id uuid references gebruikers(id),
  naam text not null,
  vestiging_id uuid not null references vestigingen(id),
  startdatum date not null,
  programma_dagen int not null default 100,
  actief boolean not null default true
);

-- Onderwerpen (de inhoud, volledig als data)
create table onderwerpen (
  id uuid primary key default gen_random_uuid(),
  naam text not null,
  categorie text not null,
  type text not null check (type in ('kennis', 'vaardigheid')),
  max_niveau int not null default 4 check (max_niveau in (2, 4)),
  welder_link text,
  aanspreekpunt text,
  criterium_3 text,
  criterium_4 text,
  training_verplicht boolean not null default false,
  volgorde int not null,
  actief boolean not null default true
);

-- Niveaulabels (één schaal voor alle onderwerpen)
create table niveau_labels (
  niveau int primary key check (niveau between 0 and 4),
  label text not null
);

-- Huidige stand per onboarder per onderwerp
create table niveau_stand (
  onboarder_id uuid not null references onboarders(id),
  onderwerp_id uuid not null references onderwerpen(id),
  niveau int not null default 0 check (niveau between 0 and 4),
  bijgewerkt_op timestamptz not null default now(),
  bijgewerkt_door uuid references gebruikers(id),
  primary key (onboarder_id, onderwerp_id)
);

-- Logboek: elke niveauwijziging automatisch vastgelegd
create table logboek (
  id uuid primary key default gen_random_uuid(),
  onboarder_id uuid not null references onboarders(id),
  onderwerp_id uuid not null references onderwerpen(id),
  van_niveau int not null,
  naar_niveau int not null,
  door_gebruiker uuid not null references gebruikers(id),
  programmadag int not null,
  tijdstip timestamptz not null default now()
);

-- Opmerkingen per onderwerp
create table opmerkingen (
  id uuid primary key default gen_random_uuid(),
  onboarder_id uuid not null references onboarders(id),
  onderwerp_id uuid not null references onderwerpen(id),
  door_gebruiker uuid not null references gebruikers(id),
  programmadag int not null,
  tekst text not null,
  tijdstip timestamptz not null default now()
);

-- Kerncompetenties uit de SOMA bibliotheek
create table kerncompetenties (
  id uuid primary key default gen_random_uuid(),
  naam text not null,
  volgorde int not null
);

-- Interne specialisten en hun koppeling aan competenties
create table specialisten (
  id uuid primary key default gen_random_uuid(),
  naam text not null
);

create table competentie_specialisten (
  competentie_id uuid not null references kerncompetenties(id),
  specialist_id uuid not null references specialisten(id),
  primary key (competentie_id, specialist_id)
);

-- Specialistgesprekken per onboarder, per competentie, per specialist
create table specialist_gesprekken (
  onboarder_id uuid not null references onboarders(id),
  competentie_id uuid not null references kerncompetenties(id),
  specialist_id uuid not null references specialisten(id),
  status text not null check (status in ('ingepland', 'gevoerd')),
  bijgewerkt_door uuid not null references gebruikers(id),
  programmadag int not null,
  tijdstip timestamptz not null default now(),
  primary key (onboarder_id, competentie_id, specialist_id)
);

-- Mijlpalen binnen de 100 dagen
create table mijlpalen (
  id uuid primary key default gen_random_uuid(),
  naam text not null,
  dag int not null
);

-- Verwachtingsniveaus per mijlpaal (tabel nu aanmaken, UI komt later)
create table verwachtingsniveaus (
  mijlpaal_id uuid not null references mijlpalen(id),
  onderwerp_id uuid not null references onderwerpen(id),
  verwacht_niveau int not null check (verwacht_niveau between 0 and 4),
  primary key (mijlpaal_id, onderwerp_id)
);
```

Het logboek wordt gevuld via een Postgres trigger op `niveau_stand`: bij elke update wordt automatisch een logregel weggeschreven met oud niveau, nieuw niveau, gebruiker en programmadag. Zo kan loggen nooit vergeten worden, ook niet als er later andere schermen bijkomen. De programmadag wordt berekend als het aantal werkdagen tussen `startdatum` en vandaag.

## 6. Row level security

RLS staat aan op alle tabellen. Kernpolicies:

* **medewerker:** select op eigen onboarderregel en gekoppelde stand, logboek en opmerkingen; update op `niveau_stand` van de eigen onboarder, uitsluitend als het nieuwe niveau maximaal 1 is, het huidige niveau maximaal 1 is én het onderwerp geen `training_verplicht` heeft (with check); insert op `opmerkingen` en beheer van eigen `specialist_gesprekken`.
* **vm:** select op alle onboarders; update op `niveau_stand` en insert op `opmerkingen`.
* **mentor:** volledige rechten op alle tabellen.
* `onderwerpen`, `niveau_labels` en `mijlpalen`: select voor iedereen die ingelogd is, schrijven alleen door de mentor.

## 7. Schermen

### 7.1 Login
E-mail en wachtwoord, SOMA-huisstijl. Na inloggen bepaalt de rol welk startscherm iemand ziet.

### 7.2 Overzicht (VM en mentor)
Per onboarder een kaart met naam, vestiging, dag X van 100 met voortgangsbalk waarop de proeftijdmijlpaal (dag 30) als markering zichtbaar is, en drie voortgangsbalken: kennis, vaardigheden en gesprekken specialisten.

Berekening kennis en vaardigheden: elk onderwerp telt mee naar rato van zijn niveau ten opzichte van zijn maximum (bij maximum 4 is besproken 25%, begrijpt 50%, kan toepassen 75%, beheerst 100%; bij maximum 2 is besproken 50% en begrijpt 100%). Het percentage is de som van de behaalde niveaus gedeeld door de som van de maximumniveaus van de onderwerpen van dat type.

Berekening gesprekken specialisten: het aantal gesprekken met status gevoerd gedeeld door het totaal aantal specialistkoppelingen. Ingepland telt niet mee, alleen gevoerd.

### 7.3 Detail per onboarder
Bovenaan naam, programmadag, 100 dagen tijdlijn met mijlpaalmarkeringen en de twee percentages. Daaronder de onderwerpen gegroepeerd per categorie, in de volgorde uit de database. Per onderwerp:

* naam, badge kennis of vaardigheid, het huidige niveaulabel als tekst (groen bij afgerond), en het aanspreekpunt als apart, visueel duidelijk te onderscheiden chipje in badge-stijl met label en naam ("Aanspreekpunt · Marlin"); als het onderwerp een `welder_link` heeft, een klein linkje "Bekijk in Welder" dat de kennisbankpagina in een nieuw tabblad opent (Welder regelt zelf de login);
* tikbare bolletjes tot het maximumniveau van het onderwerp (twee of vier); tik op bolletje n zet het niveau op n, nogmaals tikken op het huidige niveau zet een stap terug;
* opmerkingen zichtbaar in chronologische volgorde, plus knop om een opmerking toe te voegen;
* wijziging geeft korte bevestiging (toast) en is direct zichtbaar bij andere ingelogde gebruikers.

Tikt de VM of de mentor op bolletje 3 of 4, dan verschijnt eerst een klein bevestigingsvenster met de criteria voor dat niveau en de vraag of dit klopt. Pas na bevestigen wordt het niveau overgezet. Zo staat de lat op het beoordelingsmoment in beeld zonder dat het scherm volloopt. Heeft een onderwerp nog geen criteria, dan verschijnt het venster niet en wordt het niveau direct gezet.

Voor de medewerker staat bij elk onderwerp een klein linkje "wat moet ik hiervoor laten zien", dat dezelfde criteria toont. Zo weet hij waar hij naartoe werkt.

De medewerker kan alleen het bolletje voor stap 1 zelf aantikken; stap 2 zet de VM of de mentor na uitleg in eigen woorden, stap 3 en 4 alleen de VM als praktijktest. Bij de bolletjes staat voor de medewerker een korte hint: "Stap 1 vink je zelf af. Vanaf stap 2 toon je het aan je VM of mentor."

### 7.4 Eigen voortgang (medewerker)
Zelfde detailscherm. De medewerker vinkt stap 1 op zijn eigen onderwerpen af, beheert de status van zijn specialistgesprekken en kan opmerkingen plaatsen. Stap 2 tot en met 4 zijn voor hem zichtbaar maar niet aanklikbaar.

### 7.5 Logboek
Per onboarder uitklapbaar onderaan het detailscherm: onderwerp, van niveau naar niveau, door wie, op welke programmadag. Ook statuswijzigingen van specialistgesprekken verschijnen in het logboek.

### 7.6 Specialistgesprekken
Op de detailpagina, onder de onderwerpen, staat een blok met de kerncompetenties uit de SOMA bibliotheek. Per competentie staan de gekoppelde interne specialisten elk op een eigen regel, elk met een eigen status met drie standen: nog niet gepland, ingepland, gevoerd. Zo is zichtbaar dat een onboarder over creativiteit wel met Tom heeft gesproken maar nog niet met Enzio. Geen bolletjes en geen niveaus, alleen deze registratie. Tikken op de status zet hem een stand verder. De medewerker mag deze status ook zelf aanpassen (een gesprek inplannen is juist iets dat de onboarder zelf doet), de wijziging wordt net als bij niveaus gelogd met wie en op welke programmadag. Geen agendakoppeling: de afspraak zelf wordt gewoon in Outlook gemaakt, het dashboard registreert alleen de status.

## 8. Startdata (seed)

```
Vestigingen: Sittard, Weert, Zuid

Niveaulabels: 0 Nog niet gestart, 1 Doorgenomen, 2 Begrijpt, 3 Kan toepassen, 4 Beheerst

Mijlpalen: Proeftijd (dag 30), Eindevaluatie (dag 100)

Onderwerpen (kolommen: categorie, naam, type, max niveau, aanspreekpunt):
SOMA DNA            | Missie, visie en kernwaarden      | kennis      | 4 | Yvo   (welder_link: https://somaworks.welder.cloud/v2/content/97827/view/97827)
SOMA DNA            | SOMA Group | alle labels          | kennis      | 4 | Denis
SOMA DNA            | Terug naar de basis               | kennis      | 4 | Dave
Uitzendkennis       | Kostprijsberekening               | kennis      | 4 | Marlin
Uitzendkennis       | CAO kennis en ADV                 | kennis      | 4 | Marlin
Uitzendkennis       | Gelijkwaardige arbeidsvoorwaarden | kennis      | 4 | Marlin
Uitzendkennis       | Fasen-systeem                     | kennis      | 4 | Marlin
Uitzendkennis       | Wtta en toelating                 | kennis      | 2 | Veronique
Uitzendkennis       | Subsidies                         | kennis      | 2 | Marlin
Uitzendkennis       | Ziekte                            | kennis      | 2 | Marlin
Uitzendkennis       | VCU                               | kennis      | 2 | Marlin
Systeemvaardigheden | Carerix cursus                    | vaardigheid | 4 | Yvo
Systeemvaardigheden | CARV cursus                       | vaardigheid | 4 | Enzio
Systeemvaardigheden | Buddee                            | vaardigheid | 2 | Yvo
Systeemvaardigheden | Welder                            | vaardigheid | 2 | Yvo
Systeemvaardigheden | Easyflex                          | vaardigheid | 4 | Patrick
Recruitment         | Kandidaten werven                 | vaardigheid | 4 | Enzio
Recruitment         | Intake voeren                     | vaardigheid | 4 | VM
Commercie           | Kandidaat overtuigen              | vaardigheid | 4 | VM, Ralph   (werknaam)
Commercie           | Kandidaat presenteren             | vaardigheid | 4 | VM, Ralph
Commercie           | Kandidaat voorbereiden            | vaardigheid | 4 | VM en Ralph
Commercie           | Commercieel denken                | vaardigheid | 4 | VM, Ralph
Commercie           | Acquisitie                        | vaardigheid | 4 | VM, Ralph
Relatiebeheer       | Relatiebeheer                     | vaardigheid | 4 | VM
Relatiebeheer       | Kandidaatbeheer                   | vaardigheid | 4 | VM
Relatiebeheer       | Nazorg                            | vaardigheid | 4 | Yvo
```

Nog in te delen vanuit het overzicht 1.0 tot 6.0: lastechnieken en lasposities en de overige onderwerpen. De definitieve vulling gebeurt volledig in de database. Let op bij de Welder-content: fasen-systeem vernieuwen naar de termijnen uit de Wet meer zekerheid flexwerkers (fase A 52 weken, fase B zes contracten in twee jaar per 2028), gelijkwaardige arbeidsvoorwaarden geldt per 31 december 2026, Wtta gaat in per 1 januari 2027 (handhaving 2028), en de subsidiecontent nakijken op geschrapte regelingen.

Kerncompetenties (uit de SOMA bibliotheek, met gekoppelde specialisten):
Aanpassingsvermogen   | Tom Meyer, Enzio Brouner, Ralph van Tilborg
Commercialiteit       | Enzio Brouner, Ralph van Tilborg, Tom Meyer, Liberto
Creativiteit          | Tom Meyer, Enzio Brouner
Empathie              | Aim Gruisen, Liberto
Drive                 | Tom Meyer, Ralph Keulen, Aim Gruisen, Liberto
Kwaliteitsgerichtheid | Max Trebus
Overtuigingskracht    | Tom Meyer, Ralph van Tilborg

## 9. Huisstijl

* Primair blauw #3b73ad (SOMA Works), donkerblauw #2c2f7b (SOMA Group) voor koppen en accenten, oranje #f18825 voor de voortgangsbalk van het programma, groen #6db9a0 voor niveau 4 (beheerst).
* Achtergrond #f4f6f9, witte kaarten met zachte schaduw, afgeronde hoeken.
* Alle teksten in het Nederlands.
* Grote tikdoelen (bolletjes minimaal 34px) voor telefoongebruik.

## 10. Buiten scope versie 1

Geen BILA-systeem, geen AI-coach, geen Welder-koppeling, geen rapportages of grafieken, geen focuspunten of aandachtssignalering, geen proeftijdwaarschuwingen, geen notificaties, geen vestigingsfiltering, geen verwachtingsniveaus in de interface (alleen de tabel). Versie 1 is bewust bijna belachelijk simpel: één login, één medewerkersoverzicht, één pagina per onboarder, alle kennis en vaardigheden, vier niveaus, opmerking kunnen plaatsen, wie en wanneer automatisch vastleggen. Meer niet. Eerst moet een VM op zijn telefoon binnen 10 seconden een niveau kunnen aanpassen. Pas als dat werkt, wordt uitgebreid.

## 11. Bouwvolgorde

Alles hieronder wordt gebouwd. De volgorde is er om na elke stap iets werkends te hebben, niet om onderdelen te laten vallen.

**Stap 1 · Fundament**
Supabase project (EU), schema en trigger, RLS-policies, seed data. Inloggen met e-mail en wachtwoord, ingelogd blijven per apparaat. Drie testaccounts: medewerker, vm, mentor.

**Stap 2 · Het scorebord**
Overzicht met de onboarderkaarten (naam, dag, percentages, laatste beweging, signaal bij stilstand). Detailpagina met het donkere scorebord, de 100 dagen tijdlijn en de fases als inklapbare blokken met kleuraccent.

**Stap 3 · Niveaus en logboek**
Bolletjes met de rechten per rol, het bevestigingsvenster met de toetscriteria bij stap 3 en 4, de terugdraai-optie in de melding, opmerkingen per onderwerp en het logboek. Dit is het hart: hierna kan een VM zijn OB-gesprek al voeren.

**Stap 4 · Weekcijfers en funnel**
Intakes, voorstelacties (3.1), gesprekken (4.1), plaatsingen (5.1) en gestopten. Week bijwerken met tellers, weekgemiddelde, signaal als de week nog niet is ingevuld, en de funnel met conversie per stap.

**Stap 5 · Specialistgesprekken en het feestmoment**
Status per competentie per specialist, en de knop "Ik heb er eentje!" voor de onboarder met het feestscherm en geluid.

**Stap 6 · Nulmeting dag 30**
De zeven kerncompetenties met de gedragsindicatoren, de driepuntsschaal, de notities per competentie en het investeringsadvies. Voor de onboarder de weergave op tienpuntsschaal met zijn sterke punten en groeipunten, gekoppeld aan de status van zijn specialistgesprekken.

**Stap 7 · Afronden**
Welder-links vullen, toetscriteria vullen, testen op telefoon, deploy op GitHub Pages.

**Uitrol naar de vestigingen.** Introduceer bij de VM's eerst het weekritme met de bolletjes en de weekcijfers. De nulmeting bespreek je pas wanneer de eerste onboarder richting dag 30 gaat. De tool is dan compleet, maar ze krijgen hem in porties.


## Bijlage A. Tone of voice voor Welder

Voor iedereen die een kennispagina of sessie uitwerkt.

1. **Open met de mindsetkop.** Elke pagina begint groot met een scène of een prikkel uit de praktijk, nooit met een definitie. Voorbeeld bij kandidaat presenteren: "Je hebt een goede lasser aan de lijn. Alles uit je handen laten vallen. Bellen, bellen, bellen tot hij ergens op gesprek zit. Niet morgen, niet na de lunch. Nu." Bij acquisitie: "Nee is geen eindpunt, dat is de eerste ronde." Bij kostprijs: "Elke euro die je te laag inschat, geef je gratis weg." De mindsetkop schrijft degene die het onderwerp geeft, in zijn eigen woorden.
2. **Begin daarna bij de opbrengst, niet bij de regel.** Wat levert dit op voor de kandidaat, de klant of de plaatsing. De regel komt daarna.
3. **Schrijf naar de praktijk toe.** Elk onderdeel heeft minstens één voorbeeld uit het echte werk: een gesprek, een situatie, een fout die vaak gemaakt wordt.
4. **Sluit af met wat je er morgen mee doet.** Elke pagina eindigt met een concrete actie, niet met een samenvatting.
5. **Kort en spreektaal.** Korte alinea's, veel witruimte, geen ambtelijke zinnen. Schrijf zoals je het aan een nieuwe collega zou uitleggen.
6. **Geen volledigheid om de volledigheid.** Alleen wat je nodig hebt om je werk goed te doen. Uitzonderingen en randgevallen horen bij het aanspreekpunt, niet op de pagina.
7. **Kloppen gaat voor.** Mindset zit in de toon en de invalshoek, niet in de feiten. Bij CAO, fasen-systeem, gelijkwaardige arbeidsvoorwaarden en Wtta is correctheid leidend, en die pagina's worden gecheckt door het aanspreekpunt.
8. **Spreek de lezer aan met je.** Je schrijft voor de consultant zelf, niet over hem.

**Vaste opbouw van een Welder-pagina:** mindsetkop, wat het je oplevert, de inhoud, wat je er morgen mee doet.

## 12. Weekcijfers en funnel

Per onboarder worden vijf getallen bijgehouden, gekoppeld aan de matchstatussen in Carerix: intakes, voorstelacties (3.1), gesprekken (4.1), plaatsingen (5.1) en gestopten.

De VM of mentor vult ze in via "Week bijwerken", met plus- en minknoppen. Op vrijdag heet die knop "Week afsluiten", want dan zijn de OB-gesprekken. Elke invulling wordt gelogd.

In het scorebord staan de vijf getallen van deze week groot, met daaronder het weekgemiddelde en het totaal. Daaronder de funnel: de vier stappen als balken met de conversie ten opzichte van de vorige stap.

Op het overzicht staat per onboarder een chip "week nog invullen" zolang de huidige week niet is bijgewerkt.

De cijfers rekenen niet door in een score of percentage. Ze staan naast kennis en vaardigheden, niet erin.

Tabellen: `weekcijfers` (onboarder_id, weeknummer, jaar, de vijf getallen, ingevuld_door, tijdstip). Het totaal en het gemiddelde worden berekend, niet opgeslagen.

## 12b. De weeknotitie

Naast de cijfers legt de VM vast wat er in het OB-gesprek is besproken. Eén vrij tekstveld per week: wat viel op, wat spraken jullie af. Geen kopjes, geen verplichte velden, leeg laten mag.

**Belangrijk voor de volgorde.** In de praktijk vult de VM eerst de cijfers in en klikt op opslaan, en pas daarna voert hij het gesprek. Zet het notitieveld daarom NIET in het venster van de weekcijfers, maar los op de detailpagina, altijd zichtbaar en automatisch opslaand bij verlaten van het veld. Anders wordt het nooit ingevuld.

De notitie hangt aan het weeknummer, niet aan de datum waarop hij wordt getypt. Vult de VM hem pas maandag in, dan landt hij nog steeds bij de week van het gesprek.

Onder het invoerveld staan de laatste drie notities, zodat de VM ziet wat hij vorige week schreef.

Tabel: `weeknotities` (onboarder_id, weeknummer, jaar, tekst, door, bijgewerkt_op).

Op dag 30 en dag 100 vormen deze notities samen het verhaal achter de cijfers. Ze staan niet op de 100-dagenanalyse zelf, maar zijn wel terug te lezen in het dossier.

## 13. Nulmeting op dag 30

Aan het einde van de proeftijd beoordelen VM en mentor samen de zeven kerncompetenties. Geen prestatiemeting, maar een inventarisatie van het startpunt en het groeipotentieel.

Per competentie staan vijf gedragsindicatoren die aangevinkt worden (waargenomen ja of nee), gevolgd door een score: onder verwachting, op niveau of boven verwachting. Per competentie is er een veld voor wat er concreet is gezien.

Afsluitend het advies: gaan we in deze medewerker investeren? Ja, twijfel of geen match. De VM koppelt dit terug aan de directie.

De meting kan tussentijds worden opgeslagen en geldt als afgerond zodra alle zeven een score hebben en het advies is gekozen. Alles wordt gelogd.

**Weergave voor de onboarder.** Hij ziet de afgeronde meting in zijn eigen dashboard, maar op een tienpuntsschaal: onder verwachting is 2, op niveau 4, boven verwachting 6. Tien is expertniveau, daar groeit hij naartoe. Daarnaast twee blokken: waar hij sterk in is (met de boodschap dat daar juist het meest van hem wordt verwacht) en waar zijn werk ligt (met de notitie van de VM en een doorverwijzing naar de specialisten van die competentie). Die doorverwijzing past zich aan op de status van zijn specialistgesprekken: nog plannen, staat gepland, of al gevoerd en dus toepassen.

Tabellen: `nulmeting` (onboarder_id, competentie_id, score, notitie, investeringsadvies, afgerond, door, tijdstip) en `nulmeting_indicatoren` (onboarder_id, competentie_id, indicator_nr).

## 14. Correctie en terugdraaien

Na een niveauwijziging blijft de melding vijf seconden staan met de optie "toch niet". Daarmee gaat het niveau terug en verdwijnt de logregel, alsof het niet is gebeurd.

Wordt een fout later ontdekt, dan corrigeer je via de bolletjes. Dat komt wel in het logboek, en dat is terecht.

## 15. Een onboarder aanmelden

Zo start iemand in het systeem. De beheerder (Dave, en desgewenst de mentor) doet dit in Supabase.

**1. Account aanmaken.** Voeg de gebruiker toe met zijn zakelijke mailadres. Zet zijn rol op `medewerker` en koppel hem aan zijn vestiging in de tabel `gebruikers`.

**2. Onboarder aanmaken.** Maak een regel in `onboarders` met zijn naam, vestiging, startdatum en `programma_dagen = 100`. De programmadag wordt hieruit berekend, dus de startdatum moet kloppen.

**3. VM koppelen.** Leg vast wie zijn vestigingsmanager is, zodat het OB-gesprek en de nulmeting bij de juiste persoon terechtkomen.

**4. Uitnodiging versturen.** Supabase stuurt een uitnodigingsmail met een link waarmee hij zelf een wachtwoord kiest. Jij verzint dus geen wachtwoorden en geeft ze niet door.

**5. Eerste keer inloggen.** Hij logt in op zijn telefoon en blijft ingelogd. Vertel hem dat in zijn eerste week, samen met de link naar de startpagina in Welder.

**Bij uitdiensttreding of afvallen in de proeftijd:** zet `actief` op false. Zijn dossier blijft bewaard voor de afgesproken bewaartermijn en verdwijnt daarna. Zie ook de afspraak over bewaartermijnen.

**Bij de livegang.** Er zitten vijf mensen in de onboarding: Pieke (net gestart) en Juliette, Kim, Pascal en Paul die al langer bezig zijn. Ze krijgen allemaal dezelfde startdatum, namelijk die van Pieke. Elke onboarder loopt daarna samen met zijn VM de onderwerpen door en vult in wat hij al kan, zodat het dossier klopt en meteen duidelijk is wat er nog nodig is.

Benoem daarbij wel dat de nulmeting voor de vier die al langer werken geen proeftijdbeslissing is, maar hun startpunt in het nieuwe systeem.

**Nieuwe VM of mentor:** zelfde route, alleen met rol `vm` of `mentor`. Zij hebben geen regel in `onboarders` nodig.

## 16. De 100-dagenanalyse

Op dag 100 genereert het dashboard één document dat het eindgesprek draagt en daarna de basis is voor zijn ontwikkelgesprekken.

Alles erop komt uit het systeem zelf, dus niemand hoeft iets over te typen:

- **Voortgang per fase.** Het percentage per funnelfase en welke onderwerpen op beheerst staan. Wat niet af is, staat er ook op.
- **Groei sinds dag 30.** De nulmeting naast de stand van nu, per kerncompetentie. Zo zie je de beweging, niet alleen het eindpunt.
- **Zijn cijfers.** Intakes, voorstelacties (3.1), gesprekken (4.1), plaatsingen (5.1) en gestopten over de hele periode, met het weekgemiddelde en de conversie per stap.
- **Specialistgesprekken.** Met wie hij heeft gesproken en over welke competentie.
- **Uit het logboek.** Wanneer hij welke stap zette, zodat de leercurve zichtbaar is.

Daaronder drie velden die de VM invult tijdens het gesprek: waar is hij sterk in, waar ligt zijn werk voor het komende halfjaar, en welke afspraak maken we. Plus een handtekeningregel voor de onboarder en de VM.

**Bewaak dat het geen beoordelingsformulier wordt.** Het is een foto van honderd dagen plus een afspraak. Geen cijfers, geen scores, geen ranglijst tussen collega's.

De analyse is te openen vanaf dag 90, zodat de VM zich kan voorbereiden, en blijft daarna bewaard bij de onboarder.

## 17. Het praktische beheer

### Wie kan wat

Rechten worden afgedwongen in de database zelf, niet met een knop in het scherm. De rolwisselaar in het prototype is alleen een testhulpmiddel en zit niet in de gebouwde app.

| | Medewerker | VM | Mentor |
|---|---|---|---|
| Ziet | alleen zijn eigen dossier | de onboarders van zijn vestiging | alle onboarders, alle vestigingen |
| Stap 1 (doorgenomen) | ja | ja | ja |
| Stap 2 tot en met 4 | nee | ja | ja |
| Weekcijfers invullen | nee | ja | ja |
| Plaatsing melden | ja | ja | ja |
| Specialistgesprekken | eigen status wijzigen | inzien | inzien |
| Nulmeting dag 30 | alleen de uitkomst zien | invullen | invullen |
| 100-dagenanalyse | inzien | genereren en invullen | inzien |

### Iemand toevoegen

1. Gebruiker aanmaken in Supabase met zijn zakelijke mailadres, rol (`medewerker`, `vm` of `mentor`) en vestiging.
2. Voor een onboarder: een regel in `onboarders` met naam, vestiging, startdatum, programmadagen (100) en zijn VM. De programmadag wordt hieruit berekend, dus de startdatum moet kloppen.
3. Supabase stuurt de uitnodigingsmail. Hij kiest zelf zijn wachtwoord via de link.
4. Hij logt in op zijn telefoon en blijft ingelogd.

Een VM of mentor heeft geen regel in `onboarders` nodig.

### Na dag 100

Op dag 100 genereert de VM de analyse en zet hij het dossier op `afgerond`. De onboarder verdwijnt daarmee uit het actieve overzicht en verhuist naar een apart kopje "Afgerond". Zo blijft het scorebord schoon, terwijl je kunt terugkijken.

**Valt iemand af op dag 30, dan gaat het precies zo.** Ook dan genereer je de analyse, met de stand tot dat moment en de weeknotities die er zijn. Het dossier krijgt status `gestopt`, met de reden en de datum. De analyse is dan de onderbouwing van het besluit.

Velden op `onboarders`: `status` (actief, afgerond, gestopt), `afgerond_op`, `reden`.

### Bewaartermijn

**Afgeronde en gestopte dossiers worden één jaar bewaard, geteld vanaf de einddatum.** Daarna worden ze verwijderd. Bouw daarvoor een periodieke opschoning in, of zet het als jaarlijkse taak in het beheer.

De gegenereerde 100-dagenanalyse valt onder diezelfde termijn. Wil je hem langer bewaren, bijvoorbeeld voor het personeelsdossier, sla hem dan buiten dit systeem op.

### Beheer en continuïteit

Onderwerpen, criteria en Welder-links pas je aan in de tabelweergave van Supabase. Er is geen apart beheerscherm, en dat is een bewuste keuze.

**Dave is de enige beheerder.** Accounts aanmaken, onderwerpen aanpassen en criteria wijzigen loopt via hem. Leg wel vast waar het draait en hoe je inlogt, zodat die kennis niet alleen in zijn hoofd zit.
