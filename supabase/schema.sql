-- SOMA Onboarding Dashboard — Stap 1: Fundament
-- Voer dit script één keer uit in de Supabase SQL Editor van je (nieuwe) project.
-- Volgorde: extensies, tabellen, functies/triggers, RLS, seed-data.

-- ─────────────────────────────────────────────────────────────
-- 0. Extensies
-- ─────────────────────────────────────────────────────────────
create extension if not exists pgcrypto;

-- ─────────────────────────────────────────────────────────────
-- 1. Tabellen
-- ─────────────────────────────────────────────────────────────
create table vestigingen (
  id uuid primary key default gen_random_uuid(),
  naam text not null
);

create table gebruikers (
  id uuid primary key references auth.users(id),
  naam text not null,
  rol text not null check (rol in ('medewerker', 'vm', 'mentor')),
  vestiging_id uuid references vestigingen(id)
);

create table onboarders (
  id uuid primary key default gen_random_uuid(),
  gebruiker_id uuid references gebruikers(id),
  naam text not null,
  vestiging_id uuid not null references vestigingen(id),
  startdatum date not null,
  programma_dagen int not null default 100,
  actief boolean not null default true
);

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

create table niveau_labels (
  niveau int primary key check (niveau between 0 and 4),
  label text not null
);

create table niveau_stand (
  onboarder_id uuid not null references onboarders(id),
  onderwerp_id uuid not null references onderwerpen(id),
  niveau int not null default 0 check (niveau between 0 and 4),
  bijgewerkt_op timestamptz not null default now(),
  bijgewerkt_door uuid references gebruikers(id),
  primary key (onboarder_id, onderwerp_id)
);

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

create table opmerkingen (
  id uuid primary key default gen_random_uuid(),
  onboarder_id uuid not null references onboarders(id),
  onderwerp_id uuid not null references onderwerpen(id),
  door_gebruiker uuid not null references gebruikers(id),
  programmadag int not null,
  tekst text not null,
  tijdstip timestamptz not null default now()
);

create table kerncompetenties (
  id uuid primary key default gen_random_uuid(),
  naam text not null,
  volgorde int not null
);

create table specialisten (
  id uuid primary key default gen_random_uuid(),
  naam text not null
);

create table competentie_specialisten (
  competentie_id uuid not null references kerncompetenties(id),
  specialist_id uuid not null references specialisten(id),
  primary key (competentie_id, specialist_id)
);

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

create table mijlpalen (
  id uuid primary key default gen_random_uuid(),
  naam text not null,
  dag int not null
);

create table verwachtingsniveaus (
  mijlpaal_id uuid not null references mijlpalen(id),
  onderwerp_id uuid not null references onderwerpen(id),
  verwacht_niveau int not null check (verwacht_niveau between 0 and 4),
  primary key (mijlpaal_id, onderwerp_id)
);

-- ─────────────────────────────────────────────────────────────
-- 2. Hulpfuncties (rol/onboarder van de ingelogde gebruiker)
-- security definer: zo mag elke ingelogde gebruiker deze functie
-- gebruiken zonder zelf leesrechten op de gebruikers/onboarders-tabel nodig te hebben.
-- ─────────────────────────────────────────────────────────────
create or replace function auth_rol() returns text
language sql stable security definer set search_path = public as $$
  select rol from gebruikers where id = auth.uid()
$$;

create or replace function auth_onboarder_id() returns uuid
language sql stable security definer set search_path = public as $$
  select id from onboarders where gebruiker_id = auth.uid()
$$;

-- Werkdagen (ma–vr) tussen startdatum en vandaag, inclusief startdatum = dag 1.
create or replace function bereken_programmadag(p_startdatum date) returns int
language sql stable as $$
  select count(*)::int
  from generate_series(p_startdatum, current_date, interval '1 day') d
  where extract(isodow from d) < 6
$$;

-- ─────────────────────────────────────────────────────────────
-- 3. Triggers
-- ─────────────────────────────────────────────────────────────

-- Bij het aanmaken van een onboarder: voor elk actief onderwerp een startregel op niveau 0.
create or replace function populate_niveau_stand() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into niveau_stand (onboarder_id, onderwerp_id, niveau)
  select new.id, o.id, 0 from onderwerpen o where o.actief = true
  on conflict do nothing;
  return new;
end;
$$;

create trigger trg_populate_niveau_stand
  after insert on onboarders
  for each row execute function populate_niveau_stand();

-- Bij elke niveauwijziging: automatisch een logregel wegschrijven.
create or replace function log_niveau_wijziging() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  v_startdatum date;
begin
  if new.niveau is distinct from old.niveau then
    select startdatum into v_startdatum from onboarders where id = new.onboarder_id;
    insert into logboek (onboarder_id, onderwerp_id, van_niveau, naar_niveau, door_gebruiker, programmadag)
    values (new.onboarder_id, new.onderwerp_id, old.niveau, new.niveau, new.bijgewerkt_door, bereken_programmadag(v_startdatum));
  end if;
  return new;
end;
$$;

create trigger trg_log_niveau_wijziging
  after update on niveau_stand
  for each row execute function log_niveau_wijziging();

-- ─────────────────────────────────────────────────────────────
-- 4. Row level security
-- ─────────────────────────────────────────────────────────────
alter table vestigingen enable row level security;
alter table gebruikers enable row level security;
alter table onboarders enable row level security;
alter table onderwerpen enable row level security;
alter table niveau_labels enable row level security;
alter table niveau_stand enable row level security;
alter table logboek enable row level security;
alter table opmerkingen enable row level security;
alter table kerncompetenties enable row level security;
alter table specialisten enable row level security;
alter table competentie_specialisten enable row level security;
alter table specialist_gesprekken enable row level security;
alter table mijlpalen enable row level security;
alter table verwachtingsniveaus enable row level security;

-- Mentor: volledige rechten op alle tabellen.
create policy mentor_all_vestigingen on vestigingen for all using (auth_rol() = 'mentor') with check (auth_rol() = 'mentor');
create policy mentor_all_gebruikers on gebruikers for all using (auth_rol() = 'mentor') with check (auth_rol() = 'mentor');
create policy mentor_all_onboarders on onboarders for all using (auth_rol() = 'mentor') with check (auth_rol() = 'mentor');
create policy mentor_all_onderwerpen on onderwerpen for all using (auth_rol() = 'mentor') with check (auth_rol() = 'mentor');
create policy mentor_all_niveau_labels on niveau_labels for all using (auth_rol() = 'mentor') with check (auth_rol() = 'mentor');
create policy mentor_all_niveau_stand on niveau_stand for all using (auth_rol() = 'mentor') with check (auth_rol() = 'mentor');
create policy mentor_all_logboek on logboek for all using (auth_rol() = 'mentor') with check (auth_rol() = 'mentor');
create policy mentor_all_opmerkingen on opmerkingen for all using (auth_rol() = 'mentor') with check (auth_rol() = 'mentor');
create policy mentor_all_kerncompetenties on kerncompetenties for all using (auth_rol() = 'mentor') with check (auth_rol() = 'mentor');
create policy mentor_all_specialisten on specialisten for all using (auth_rol() = 'mentor') with check (auth_rol() = 'mentor');
create policy mentor_all_competentie_specialisten on competentie_specialisten for all using (auth_rol() = 'mentor') with check (auth_rol() = 'mentor');
create policy mentor_all_specialist_gesprekken on specialist_gesprekken for all using (auth_rol() = 'mentor') with check (auth_rol() = 'mentor');
create policy mentor_all_mijlpalen on mijlpalen for all using (auth_rol() = 'mentor') with check (auth_rol() = 'mentor');
create policy mentor_all_verwachtingsniveaus on verwachtingsniveaus for all using (auth_rol() = 'mentor') with check (auth_rol() = 'mentor');

-- Referentiedata: iedereen die ingelogd is mag lezen.
create policy select_vestigingen on vestigingen for select using (auth.uid() is not null);
create policy select_onderwerpen on onderwerpen for select using (auth.uid() is not null);
create policy select_niveau_labels on niveau_labels for select using (auth.uid() is not null);
create policy select_mijlpalen on mijlpalen for select using (auth.uid() is not null);
create policy select_kerncompetenties on kerncompetenties for select using (auth.uid() is not null);
create policy select_specialisten on specialisten for select using (auth.uid() is not null);
create policy select_competentie_specialisten on competentie_specialisten for select using (auth.uid() is not null);
create policy select_verwachtingsniveaus on verwachtingsniveaus for select using (auth.uid() is not null);

-- gebruikers: eigen rij, of alles zien als vm/mentor.
create policy select_gebruikers on gebruikers for select
  using (id = auth.uid() or auth_rol() in ('vm', 'mentor'));

-- onboarders: medewerker ziet alleen zichzelf, vm/mentor zien iedereen (select_ policy voor vm; mentor_all dekt mentor al).
create policy select_onboarders_zelf on onboarders for select
  using (gebruiker_id = auth.uid());
create policy select_onboarders_vm on onboarders for select
  using (auth_rol() = 'vm');

-- niveau_stand
create policy select_niveau_stand_zelf on niveau_stand for select
  using (onboarder_id = auth_onboarder_id());
create policy select_niveau_stand_vm on niveau_stand for select
  using (auth_rol() = 'vm');

create policy medewerker_update_niveau_stand on niveau_stand for update
  using (
    auth_rol() = 'medewerker'
    and onboarder_id = auth_onboarder_id()
    and niveau <= 1
  )
  with check (
    auth_rol() = 'medewerker'
    and onboarder_id = auth_onboarder_id()
    and niveau <= 1
    and bijgewerkt_door = auth.uid()
    and not exists (
      select 1 from onderwerpen ond where ond.id = onderwerp_id and ond.training_verplicht
    )
  );

create policy vm_update_niveau_stand on niveau_stand for update
  using (auth_rol() = 'vm')
  with check (auth_rol() = 'vm' and bijgewerkt_door = auth.uid());

-- logboek: alleen lezen (schrijven gaat via de trigger, die security definer draait).
create policy select_logboek_zelf on logboek for select
  using (onboarder_id = auth_onboarder_id());
create policy select_logboek_vm on logboek for select
  using (auth_rol() = 'vm');

-- opmerkingen
create policy select_opmerkingen_zelf on opmerkingen for select
  using (onboarder_id = auth_onboarder_id());
create policy select_opmerkingen_vm on opmerkingen for select
  using (auth_rol() = 'vm');

create policy insert_opmerkingen_zelf on opmerkingen for insert
  with check (onboarder_id = auth_onboarder_id() and door_gebruiker = auth.uid());
create policy insert_opmerkingen_vm on opmerkingen for insert
  with check (auth_rol() = 'vm' and door_gebruiker = auth.uid());

-- specialist_gesprekken: medewerker beheert die van zichzelf, vm leest/wijzigt alles.
create policy select_gesprekken_zelf on specialist_gesprekken for select
  using (onboarder_id = auth_onboarder_id());
create policy select_gesprekken_vm on specialist_gesprekken for select
  using (auth_rol() = 'vm');

create policy insert_gesprekken_zelf on specialist_gesprekken for insert
  with check (onboarder_id = auth_onboarder_id() and bijgewerkt_door = auth.uid());
create policy update_gesprekken_zelf on specialist_gesprekken for update
  using (onboarder_id = auth_onboarder_id())
  with check (onboarder_id = auth_onboarder_id() and bijgewerkt_door = auth.uid());

create policy insert_gesprekken_vm on specialist_gesprekken for insert
  with check (auth_rol() = 'vm' and bijgewerkt_door = auth.uid());
create policy update_gesprekken_vm on specialist_gesprekken for update
  using (auth_rol() = 'vm')
  with check (auth_rol() = 'vm' and bijgewerkt_door = auth.uid());

-- ─────────────────────────────────────────────────────────────
-- 5. Seed-data
-- ─────────────────────────────────────────────────────────────

insert into vestigingen (naam) values ('Sittard'), ('Weert'), ('Zuid');

insert into niveau_labels (niveau, label) values
  (0, 'Nog niet gestart'),
  (1, 'Doorgenomen'),
  (2, 'Begrijpt'),
  (3, 'Kan toepassen'),
  (4, 'Beheerst');

insert into mijlpalen (naam, dag) values
  ('Proeftijd', 30),
  ('Eindevaluatie', 100);

insert into onderwerpen (naam, categorie, type, max_niveau, aanspreekpunt, welder_link, criterium_3, criterium_4, training_verplicht, volgorde) values
  ('Missie, visie en kernwaarden', 'SOMA DNA', 'kennis', 4, 'Yvo', 'https://somaworks.welder.cloud/v2/content/169778/view/169778', 'Laat de kernwaarden zien in zijn gesprekken met kandidaten, klanten en collega''s.', 'Ademt onze manier van werken, ook onder druk.', false, 10),
  ('SOMA Group | alle labels', 'SOMA DNA', 'kennis', 4, 'Denis', 'https://somaworks.welder.cloud/v2/content/169777/view/169777', 'Verwijst kandidaten en klanten door naar het juiste label, en legt uit waarom.', 'Herkent wanneer iets bij een ander label hoort en zet het daar neer, zonder dat iemand hem eraan herinnert.', false, 20),
  ('Terug naar de basis', 'SOMA DNA', 'kennis', 4, 'Dave', 'https://somaworks.welder.cloud/v2/content/170812/view/170812', 'Pakt op wat binnenkomt en handelt het zo snel mogelijk af.', 'Kiest zelf waar de meeste kans zit en legt alles opzij om die plaatsing te pakken.', false, 30),

  ('Kostprijsberekening', 'Uitzendkennis', 'kennis', 4, 'Marlin', 'https://somaworks.welder.cloud/v2/content/169762/view/169762', 'Maakt zelfstandig een kostprijs met loon, toeslagen en reserveringen, en die klopt als je hem nareekt.', 'Zijn kostprijzen kloppen zonder controle.', false, 40),
  ('CAO kennis en ADV', 'Uitzendkennis', 'kennis', 4, 'Marlin', 'https://somaworks.welder.cloud/v2/content/169763/view/169763', 'Kan de juiste CAO en ADV-regeling herkennen en correct toepassen bij een plaatsing.', 'Doet dit bij elke plaatsing zonder navraag, en merkt het op als een cao is gewijzigd.', false, 50),
  ('Gelijkwaardige arbeidsvoorwaarden', 'Uitzendkennis', 'kennis', 4, 'Marlin', 'https://somaworks.welder.cloud/v2/content/169764/view/169764', 'Stelt de gelijkwaardige arbeidsvoorwaarden vast en past ze toe bij een plaatsing.', 'Haalt de gegevens bij elke nieuwe klant zelf op, zonder dat de backoffice erom moet vragen.', false, 60),
  ('Fasen-systeem', 'Uitzendkennis', 'kennis', 4, 'Marlin', 'https://somaworks.welder.cloud/v2/content/169765/view/169765', 'Bepaalt zelf de juiste fase en past de regels goed toe.', 'Ziet een fasewissel aankomen en bespreekt dat met zijn klant voordat de backoffice hem erop wijst.', false, 70),
  ('Wtta en toelating', 'Uitzendkennis', 'kennis', 2, 'Veronique', 'https://somaworks.welder.cloud/v2/content/169766/view/169766', null, null, false, 80),
  ('Subsidies', 'Uitzendkennis', 'kennis', 2, 'Marlin', 'https://somaworks.welder.cloud/v2/content/169768/view/169768', null, null, false, 90),
  ('Ziekte', 'Uitzendkennis', 'kennis', 2, 'Marlin', 'https://somaworks.welder.cloud/v2/content/169769/view/169769', null, null, false, 100),
  ('VCU', 'Uitzendkennis', 'kennis', 2, 'Marlin', 'https://somaworks.welder.cloud/v2/content/169767/view/169767', null, null, false, 110),

  ('Carerix cursus', 'Systeemvaardigheden', 'vaardigheid', 4, 'Yvo', 'https://somaworks.welder.cloud/v2/content/169770/view/169770', 'Werkt zelfstandig in Carerix en legt zijn gesprekken en afspraken vast.', 'Houdt zijn dossiers structureel bij, zodat een collega zijn kandidaat kan oppakken zonder hem te bellen.', true, 120),
  ('CARV cursus', 'Systeemvaardigheden', 'vaardigheid', 4, 'Enzio', 'https://somaworks.welder.cloud/v2/content/169771/view/169771', 'Kan met CARV werken.', 'Haalt er echt zijn voordeel uit en wint er tijd mee.', true, 130),
  ('Buddee', 'Systeemvaardigheden', 'vaardigheid', 2, 'Yvo', 'https://somaworks.welder.cloud/v2/content/169772/view/169772', null, null, true, 140),
  ('Welder', 'Systeemvaardigheden', 'vaardigheid', 2, 'Yvo', 'https://somaworks.welder.cloud/v2/content/169773/view/169773', null, null, true, 150),
  ('Easyflex', 'Systeemvaardigheden', 'vaardigheid', 4, 'Patrick', 'https://somaworks.welder.cloud/v2/content/169774/view/169774', 'Maakt zelfstandig een plaatsing aan en zoekt zelf op wat hij nodig heeft.', 'Doet dat structureel foutloos, en zoekt het zelf op in plaats van de backoffice te bellen.', true, 160),

  ('Kandidaten werven', 'Recruitment', 'vaardigheid', 4, 'Enzio', 'https://somaworks.welder.cloud/v2/content/169775/view/169775', 'Zet meerdere middelen in en vindt daarmee kandidaten.', 'Verandert zijn aanpak als een vacature niet loopt, in plaats van hetzelfde nog een keer te proberen.', false, 170),
  ('Intake voeren', 'Recruitment', 'vaardigheid', 4, 'VM', 'https://somaworks.welder.cloud/v2/content/169776/view/169776', 'Voert zelfstandig een volledige intake. Het verslag is compleet en hij weet waarom deze kandidaat wil wisselen.', 'Vraagt overal op door: wat hij deed, waarmee hij werkte, wat hij leerde en waarom hij wegging.', false, 180),

  ('Kandidaat overtuigen', 'Commercie', 'vaardigheid', 4, 'VM, Ralph', 'https://somaworks.welder.cloud/v2/content/169779/view/169779', 'Krijgt een twijfelende kandidaat enthousiast en op gesprek.', 'Krijgt ook de lastige kandidaten mee, en weet achteraf te benoemen wat de twijfel was.', true, 190),
  ('Kandidaat presenteren', 'Commercie', 'vaardigheid', 4, 'VM, Ralph', 'https://somaworks.welder.cloud/v2/content/169780/view/169780', 'Belt de klant en verkoopt zijn kandidaat. Het cv gaat er daarna pas achteraan.', 'Belt ook als de klant het druk heeft of de kandidaat lastig te verkopen is, en houdt vol tot hij zijn verhaal kwijt is.', true, 200),
  ('Kandidaat voorbereiden', 'Commercie', 'vaardigheid', 4, 'VM en Ralph', 'https://somaworks.welder.cloud/v2/content/172711/view/172711', 'Zijn kandidaat loopt naar binnen met zijn cv, kent het bedrijf en weet bij wie hij zich moet melden. Na het gesprek belt de kandidaat hem meteen.', 'Zijn kandidaten gaan structureel voorbereid naar binnen, en klanten benoemen dat uit zichzelf.', true, 210),
  ('Commercieel denken', 'Commercie', 'vaardigheid', 4, 'VM, Ralph', 'https://somaworks.welder.cloud/v2/content/169781/view/169781', 'Haalt uit een gesprek meer dan de vraag die erin ging, en zet dat om in een actie.', 'Doet dat structureel, ook bij klanten waar op het eerste gezicht weinig te halen valt.', true, 220),
  ('Acquisitie', 'Commercie', 'vaardigheid', 4, 'VM, Ralph', 'https://somaworks.welder.cloud/v2/content/169782/view/169782', 'Belt zelf bedrijven en haalt daar afspraken uit.', 'Maakt structureel tijd vrij voor acquisitie, ook als het druk is.', true, 230),

  ('Relatiebeheer', 'Relatiebeheer', 'vaardigheid', 4, 'VM', 'https://somaworks.welder.cloud/v2/content/169783/view/169783', 'Belt zijn klanten ook zonder aanleiding, en legt vast wat hij hoort.', 'Houdt zijn klanten structureel warm, ook als het even niets oplevert.', false, 240),
  ('Kandidaatbeheer', 'Relatiebeheer', 'vaardigheid', 4, 'VM', 'https://somaworks.welder.cloud/v2/content/169784/view/169784', 'Houdt contact met zijn kandidaten en volgt op wat hij afspreekt.', 'Haalt uit dat contact wat er op de werkvloer speelt, en doet daar iets mee.', false, 250),
  ('Nazorg', 'Relatiebeheer', 'vaardigheid', 4, 'Yvo', 'https://somaworks.welder.cloud/v2/content/169785/view/169785', 'Belt voor de start, neemt de belangrijkste punten door en belt na de eerste werkdag na.', 'Doet dat bij elke plaatsing, ook als het druk is.', false, 260);

insert into kerncompetenties (naam, volgorde) values
  ('Aanpassingsvermogen', 10),
  ('Commercialiteit', 20),
  ('Creativiteit', 30),
  ('Empathie', 40),
  ('Drive', 50),
  ('Kwaliteitsgerichtheid', 60),
  ('Overtuigingskracht', 70);

insert into specialisten (naam) values
  ('Tom Meyer'), ('Enzio Brouner'), ('Ralph van Tilborg'), ('Liberto'),
  ('Aim Gruisen'), ('Ralph Keulen'), ('Max Trebus');

insert into competentie_specialisten (competentie_id, specialist_id)
select k.id, s.id from kerncompetenties k, specialisten s
where (k.naam, s.naam) in (
  ('Aanpassingsvermogen', 'Tom Meyer'), ('Aanpassingsvermogen', 'Enzio Brouner'), ('Aanpassingsvermogen', 'Ralph van Tilborg'),
  ('Commercialiteit', 'Enzio Brouner'), ('Commercialiteit', 'Ralph van Tilborg'), ('Commercialiteit', 'Tom Meyer'), ('Commercialiteit', 'Liberto'),
  ('Creativiteit', 'Tom Meyer'), ('Creativiteit', 'Enzio Brouner'),
  ('Empathie', 'Aim Gruisen'), ('Empathie', 'Liberto'),
  ('Drive', 'Tom Meyer'), ('Drive', 'Ralph Keulen'), ('Drive', 'Aim Gruisen'), ('Drive', 'Liberto'),
  ('Kwaliteitsgerichtheid', 'Max Trebus'),
  ('Overtuigingskracht', 'Tom Meyer'), ('Overtuigingskracht', 'Ralph van Tilborg')
);
