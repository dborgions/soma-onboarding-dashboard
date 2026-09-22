-- SOMA Onboarding Dashboard — volledig schema, veilig om herhaaldelijk te draaien,
-- ook op een database die al een oudere/onvolledige versie van dit schema bevat.
-- Voert uit: maakt ontbrekende tabellen aan, voegt ontbrekende kolommen toe aan
-- bestaande tabellen, herstelt functies/triggers/rechten, en zaait data per rij
-- (alleen rijen die er nog niet zijn — bestaande data wordt nooit overschreven).

-- ─────────────────────────────────────────────────────────────
-- 0. Extensies
-- ─────────────────────────────────────────────────────────────
create extension if not exists pgcrypto;

-- ─────────────────────────────────────────────────────────────
-- 1. Tabellen (aanmaken als ze nog niet bestaan)
-- ─────────────────────────────────────────────────────────────
create table if not exists vestigingen (id uuid primary key default gen_random_uuid());
create table if not exists gebruikers (id uuid primary key references auth.users(id));
create table if not exists onboarders (id uuid primary key default gen_random_uuid());
create table if not exists onderwerpen (id uuid primary key default gen_random_uuid());
create table if not exists niveau_labels (niveau int primary key);
create table if not exists niveau_stand (onboarder_id uuid, onderwerp_id uuid, primary key (onboarder_id, onderwerp_id));
create table if not exists logboek (id uuid primary key default gen_random_uuid());
create table if not exists opmerkingen (id uuid primary key default gen_random_uuid());
create table if not exists kerncompetenties (id uuid primary key default gen_random_uuid());
create table if not exists specialisten (id uuid primary key default gen_random_uuid());
create table if not exists competentie_specialisten (competentie_id uuid, specialist_id uuid, primary key (competentie_id, specialist_id));
create table if not exists specialist_gesprekken (onboarder_id uuid, competentie_id uuid, specialist_id uuid, primary key (onboarder_id, competentie_id, specialist_id));
create table if not exists mijlpalen (id uuid primary key default gen_random_uuid());
create table if not exists verwachtingsniveaus (mijlpaal_id uuid, onderwerp_id uuid, primary key (mijlpaal_id, onderwerp_id));

-- Fasen van het wervingsproces (Basis, 1.0 Instroom, ...) — gebruikt om de
-- onderwerpenblokken op de detailpagina te groeperen, zoals in het ontwerp.
create table if not exists fasen (id text primary key);

-- Weekcijfers en de weeknotitie (bouwplan hoofdstuk 12 en 12b).
create table if not exists weekcijfers (onboarder_id uuid, weeknummer int, jaar int, primary key (onboarder_id, weeknummer, jaar));
create table if not exists weeknotities (onboarder_id uuid, weeknummer int, jaar int, primary key (onboarder_id, weeknummer, jaar));

-- Nulmeting dag 30 (bouwplan hoofdstuk 13). De gedragsindicatoren per competentie
-- zijn zelf ook inhoud (kernprincipe: inhoud is data), vandaar de aparte tabel.
create table if not exists indicatoren (competentie_id uuid, nr int, primary key (competentie_id, nr));
create table if not exists nulmeting (onboarder_id uuid, competentie_id uuid, primary key (onboarder_id, competentie_id));
create table if not exists nulmeting_indicatoren (onboarder_id uuid, competentie_id uuid, indicator_nr int, primary key (onboarder_id, competentie_id, indicator_nr));

-- De 100-dagenanalyse (bouwplan hoofdstuk 16). Alle cijfers erop komen uit de
-- tabellen hierboven; opgeslagen wordt alleen wat de VM tijdens het gesprek invult.
create table if not exists analyses (onboarder_id uuid primary key);

-- ─────────────────────────────────────────────────────────────
-- 1b. Kolommen (toevoegen als ze nog ontbreken — dit repareert een
-- tabel die al bestond in een oudere/onvolledige vorm).
-- ─────────────────────────────────────────────────────────────
alter table vestigingen add column if not exists naam text not null default '';

alter table gebruikers add column if not exists naam text not null default '';
alter table gebruikers add column if not exists rol text not null default 'medewerker';
alter table gebruikers add column if not exists vestiging_id uuid references vestigingen(id);

alter table onboarders add column if not exists gebruiker_id uuid references gebruikers(id);
alter table onboarders add column if not exists naam text not null default '';
alter table onboarders add column if not exists vestiging_id uuid references vestigingen(id);
alter table onboarders add column if not exists startdatum date not null default current_date;
alter table onboarders add column if not exists programma_dagen int not null default 100;
alter table onboarders add column if not exists actief boolean not null default true;
-- Na dag 100 (of bij afvallen): het dossier verhuist naar het kopje "Afgerond"
-- en telt niet meer mee in het actieve scorebord (bouwplan hoofdstuk 17).
alter table onboarders add column if not exists status text not null default 'actief';
alter table onboarders add column if not exists afgerond_op date;
alter table onboarders add column if not exists reden text;

alter table onderwerpen add column if not exists naam text not null default '';
alter table onderwerpen add column if not exists categorie text not null default '';
alter table onderwerpen add column if not exists type text not null default 'kennis';
alter table onderwerpen add column if not exists max_niveau int not null default 4;
alter table onderwerpen add column if not exists welder_link text;
alter table onderwerpen add column if not exists aanspreekpunt text;
alter table onderwerpen add column if not exists criterium_3 text;
alter table onderwerpen add column if not exists criterium_4 text;
alter table onderwerpen add column if not exists training_verplicht boolean not null default false;
alter table onderwerpen add column if not exists volgorde int not null default 0;
alter table onderwerpen add column if not exists actief boolean not null default true;
alter table onderwerpen add column if not exists fase_id text references fasen(id);

alter table fasen add column if not exists label text not null default '';
alter table fasen add column if not exists sub text not null default '';
alter table fasen add column if not exists kleur text not null default '#6b7280';
alter table fasen add column if not exists volgorde int not null default 0;

alter table weekcijfers add column if not exists intakes int not null default 0;
alter table weekcijfers add column if not exists voorstelacties int not null default 0;
alter table weekcijfers add column if not exists gesprekken int not null default 0;
alter table weekcijfers add column if not exists plaatsingen int not null default 0;
alter table weekcijfers add column if not exists gestopten int not null default 0;
alter table weekcijfers add column if not exists ingevuld_door uuid references gebruikers(id);
alter table weekcijfers add column if not exists tijdstip timestamptz not null default now();

alter table weeknotities add column if not exists tekst text not null default '';
alter table weeknotities add column if not exists door uuid references gebruikers(id);
alter table weeknotities add column if not exists bijgewerkt_op timestamptz not null default now();

alter table indicatoren add column if not exists tekst text not null default '';

alter table nulmeting add column if not exists score int;
alter table nulmeting add column if not exists notitie text not null default '';
alter table nulmeting add column if not exists investeringsadvies text;
alter table nulmeting add column if not exists afgerond boolean not null default false;
alter table nulmeting add column if not exists door uuid references gebruikers(id);
alter table nulmeting add column if not exists tijdstip timestamptz not null default now();

-- De drie velden die de VM tijdens het eindgesprek invult, plus wie en wanneer.
alter table analyses add column if not exists sterk text not null default '';
alter table analyses add column if not exists werk_komend_halfjaar text not null default '';
alter table analyses add column if not exists afspraak text not null default '';
alter table analyses add column if not exists gegenereerd_op timestamptz not null default now();
alter table analyses add column if not exists door uuid references gebruikers(id);
alter table analyses add column if not exists bijgewerkt_op timestamptz not null default now();

-- Het logboek dekt zowel niveauwijzigingen als statuswijzigingen van specialistgesprekken
-- (bouwplan 7.5 en 7.6) — daarom mogen onderwerp_id/van_niveau/naar_niveau leeg zijn
-- en zijn er losse kolommen voor de gesprekskant.
alter table logboek alter column onderwerp_id drop not null;
alter table logboek alter column van_niveau drop not null;
alter table logboek alter column naar_niveau drop not null;
alter table logboek add column if not exists competentie_id uuid references kerncompetenties(id);
alter table logboek add column if not exists specialist_id uuid references specialisten(id);
alter table logboek add column if not exists van_status text;
alter table logboek add column if not exists naar_status text;

alter table niveau_labels add column if not exists label text not null default '';

alter table niveau_stand add column if not exists niveau int not null default 0;
alter table niveau_stand add column if not exists bijgewerkt_op timestamptz not null default now();
alter table niveau_stand add column if not exists bijgewerkt_door uuid references gebruikers(id);

alter table logboek add column if not exists onboarder_id uuid references onboarders(id);
alter table logboek add column if not exists onderwerp_id uuid references onderwerpen(id);
alter table logboek add column if not exists van_niveau int not null default 0;
alter table logboek add column if not exists naar_niveau int not null default 0;
alter table logboek add column if not exists door_gebruiker uuid references gebruikers(id);
alter table logboek add column if not exists programmadag int not null default 0;
alter table logboek add column if not exists tijdstip timestamptz not null default now();

alter table opmerkingen add column if not exists onboarder_id uuid references onboarders(id);
alter table opmerkingen add column if not exists onderwerp_id uuid references onderwerpen(id);
alter table opmerkingen add column if not exists door_gebruiker uuid references gebruikers(id);
alter table opmerkingen add column if not exists programmadag int not null default 0;
alter table opmerkingen add column if not exists tekst text not null default '';
alter table opmerkingen add column if not exists tijdstip timestamptz not null default now();

alter table kerncompetenties add column if not exists naam text not null default '';
alter table kerncompetenties add column if not exists volgorde int not null default 0;

alter table specialisten add column if not exists naam text not null default '';

alter table specialist_gesprekken add column if not exists status text not null default 'ingepland';
alter table specialist_gesprekken add column if not exists bijgewerkt_door uuid references gebruikers(id);
alter table specialist_gesprekken add column if not exists programmadag int not null default 0;
alter table specialist_gesprekken add column if not exists tijdstip timestamptz not null default now();

alter table mijlpalen add column if not exists naam text not null default '';
alter table mijlpalen add column if not exists dag int not null default 0;

alter table verwachtingsniveaus add column if not exists verwacht_niveau int not null default 0;

-- ─────────────────────────────────────────────────────────────
-- 1c. Controles (check-constraints) — alleen toevoegen als ze nog niet bestaan.
-- ─────────────────────────────────────────────────────────────
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'gebruikers_rol_check') then
    alter table gebruikers add constraint gebruikers_rol_check check (rol in ('medewerker', 'vm', 'mentor'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'onderwerpen_type_check') then
    alter table onderwerpen add constraint onderwerpen_type_check check (type in ('kennis', 'vaardigheid'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'onderwerpen_max_niveau_check') then
    alter table onderwerpen add constraint onderwerpen_max_niveau_check check (max_niveau in (2, 4));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'niveau_labels_niveau_check') then
    alter table niveau_labels add constraint niveau_labels_niveau_check check (niveau between 0 and 4);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'niveau_stand_niveau_check') then
    alter table niveau_stand add constraint niveau_stand_niveau_check check (niveau between 0 and 4);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'specialist_gesprekken_status_check') then
    alter table specialist_gesprekken add constraint specialist_gesprekken_status_check check (status in ('ingepland', 'gevoerd'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'verwachtingsniveaus_niveau_check') then
    alter table verwachtingsniveaus add constraint verwachtingsniveaus_niveau_check check (verwacht_niveau between 0 and 4);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'indicatoren_nr_check') then
    alter table indicatoren add constraint indicatoren_nr_check check (nr between 1 and 5);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'nulmeting_score_check') then
    alter table nulmeting add constraint nulmeting_score_check check (score is null or score between 1 and 3);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'nulmeting_advies_check') then
    alter table nulmeting add constraint nulmeting_advies_check check (investeringsadvies is null or investeringsadvies in ('ja', 'twijfel', 'geen match'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'onboarders_status_check') then
    alter table onboarders add constraint onboarders_status_check check (status in ('actief', 'afgerond', 'gestopt'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'nulmeting_indicatoren_nr_check') then
    alter table nulmeting_indicatoren add constraint nulmeting_indicatoren_nr_check check (indicator_nr between 1 and 5);
  end if;
end $$;

-- ─────────────────────────────────────────────────────────────
-- 1d. Foreign keys op de koppeltabellen (de sleutelkolommen staan al in de
-- primary key sinds de eerste create table, maar zonder verwijzing — die
-- voegen we hier apart toe zodat Supabase de relaties ook herkent).
-- ─────────────────────────────────────────────────────────────
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'niveau_stand_onboarder_fk') then
    alter table niveau_stand add constraint niveau_stand_onboarder_fk foreign key (onboarder_id) references onboarders(id);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'niveau_stand_onderwerp_fk') then
    alter table niveau_stand add constraint niveau_stand_onderwerp_fk foreign key (onderwerp_id) references onderwerpen(id);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'analyses_onboarder_fk') then
    alter table analyses add constraint analyses_onboarder_fk foreign key (onboarder_id) references onboarders(id);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'competentie_specialisten_competentie_fk') then
    alter table competentie_specialisten add constraint competentie_specialisten_competentie_fk foreign key (competentie_id) references kerncompetenties(id);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'competentie_specialisten_specialist_fk') then
    alter table competentie_specialisten add constraint competentie_specialisten_specialist_fk foreign key (specialist_id) references specialisten(id);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'specialist_gesprekken_onboarder_fk') then
    alter table specialist_gesprekken add constraint specialist_gesprekken_onboarder_fk foreign key (onboarder_id) references onboarders(id);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'specialist_gesprekken_competentie_fk') then
    alter table specialist_gesprekken add constraint specialist_gesprekken_competentie_fk foreign key (competentie_id) references kerncompetenties(id);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'specialist_gesprekken_specialist_fk') then
    alter table specialist_gesprekken add constraint specialist_gesprekken_specialist_fk foreign key (specialist_id) references specialisten(id);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'verwachtingsniveaus_mijlpaal_fk') then
    alter table verwachtingsniveaus add constraint verwachtingsniveaus_mijlpaal_fk foreign key (mijlpaal_id) references mijlpalen(id);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'verwachtingsniveaus_onderwerp_fk') then
    alter table verwachtingsniveaus add constraint verwachtingsniveaus_onderwerp_fk foreign key (onderwerp_id) references onderwerpen(id);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'weekcijfers_onboarder_fk') then
    alter table weekcijfers add constraint weekcijfers_onboarder_fk foreign key (onboarder_id) references onboarders(id);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'weeknotities_onboarder_fk') then
    alter table weeknotities add constraint weeknotities_onboarder_fk foreign key (onboarder_id) references onboarders(id);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'indicatoren_competentie_fk') then
    alter table indicatoren add constraint indicatoren_competentie_fk foreign key (competentie_id) references kerncompetenties(id);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'nulmeting_onboarder_fk') then
    alter table nulmeting add constraint nulmeting_onboarder_fk foreign key (onboarder_id) references onboarders(id);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'nulmeting_competentie_fk') then
    alter table nulmeting add constraint nulmeting_competentie_fk foreign key (competentie_id) references kerncompetenties(id);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'nulmeting_indicatoren_onboarder_fk') then
    alter table nulmeting_indicatoren add constraint nulmeting_indicatoren_onboarder_fk foreign key (onboarder_id) references onboarders(id);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'nulmeting_indicatoren_competentie_fk') then
    alter table nulmeting_indicatoren add constraint nulmeting_indicatoren_competentie_fk foreign key (competentie_id) references kerncompetenties(id);
  end if;
end $$;

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

drop trigger if exists trg_populate_niveau_stand on onboarders;
create trigger trg_populate_niveau_stand
  after insert on onboarders
  for each row execute function populate_niveau_stand();

-- Bij elke niveauwijziging: automatisch een logregel wegschrijven.
-- (behalve als app.suppress_log aan staat — dat gebruikt undo_niveau_wijziging
-- om een "toch niet" binnen de eerste seconden echt te laten verdwijnen.)
create or replace function log_niveau_wijziging() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  v_startdatum date;
begin
  if current_setting('app.suppress_log', true) = 'true' then
    return new;
  end if;
  if new.niveau is distinct from old.niveau then
    select startdatum into v_startdatum from onboarders where id = new.onboarder_id;
    insert into logboek (onboarder_id, onderwerp_id, van_niveau, naar_niveau, door_gebruiker, programmadag)
    values (new.onboarder_id, new.onderwerp_id, old.niveau, new.niveau, new.bijgewerkt_door, bereken_programmadag(v_startdatum));
  end if;
  return new;
end;
$$;

-- Ruim een gelijknamige trigger uit een eerdere/oudere versie op, zodat een
-- niveauwijziging niet twee keer gelogd wordt.
drop trigger if exists trg_log_niveau on niveau_stand;

drop trigger if exists trg_log_niveau_wijziging on niveau_stand;
create trigger trg_log_niveau_wijziging
  after update on niveau_stand
  for each row execute function log_niveau_wijziging();

-- "Toch niet": binnen 30 seconden na een wijziging kan de logregel weer
-- verdwijnen, alsof de wijziging niet gebeurd is (bouwplan hoofdstuk 14).
-- Herhaalt dezelfde rechtencontrole als de RLS-policies hierboven, want deze
-- functie draait met verhoogde rechten (security definer) om de logregel
-- te mogen verwijderen.
create or replace function undo_niveau_wijziging(p_onboarder_id uuid, p_onderwerp_id uuid, p_terug_naar int)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_rol text := auth_rol();
  v_eigen_onboarder uuid := auth_onboarder_id();
begin
  if v_rol = 'medewerker' then
    if p_onboarder_id is distinct from v_eigen_onboarder or p_terug_naar > 1 then
      raise exception 'Niet toegestaan';
    end if;
  elsif v_rol not in ('vm', 'mentor') then
    raise exception 'Niet toegestaan';
  end if;

  delete from logboek
  where onboarder_id = p_onboarder_id
    and onderwerp_id = p_onderwerp_id
    and door_gebruiker = auth.uid()
    and tijdstip > now() - interval '30 seconds';

  perform set_config('app.suppress_log', 'true', true);
  update niveau_stand
  set niveau = p_terug_naar, bijgewerkt_op = now(), bijgewerkt_door = auth.uid()
  where onboarder_id = p_onboarder_id and onderwerp_id = p_onderwerp_id;
  perform set_config('app.suppress_log', 'false', true);
end;
$$;

grant execute on function undo_niveau_wijziging(uuid, uuid, int) to authenticated;

-- Statuswijziging van een specialistgesprek loggen (bouwplan 7.5/7.6).
create or replace function log_gesprek_wijziging() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into logboek (onboarder_id, competentie_id, specialist_id, van_status, naar_status, door_gebruiker, programmadag)
  values (
    new.onboarder_id, new.competentie_id, new.specialist_id,
    case when tg_op = 'INSERT' then 'Nog niet gepland' else old.status end,
    new.status, new.bijgewerkt_door, new.programmadag
  );
  return new;
end;
$$;

drop trigger if exists trg_log_gesprek on specialist_gesprekken;
create trigger trg_log_gesprek
  after insert or update on specialist_gesprekken
  for each row execute function log_gesprek_wijziging();

-- Terugzetten naar "nog niet gepland" (rij weg) ook loggen.
create or replace function log_gesprek_verwijderd() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  v_startdatum date;
begin
  select startdatum into v_startdatum from onboarders where id = old.onboarder_id;
  -- auth.uid() is leeg als dit via de SQL Editor/beheer draait (geen ingelogde
  -- gebruiker); val dan terug op wie de rij het laatst bijwerkte.
  insert into logboek (onboarder_id, competentie_id, specialist_id, van_status, naar_status, door_gebruiker, programmadag)
  values (old.onboarder_id, old.competentie_id, old.specialist_id, old.status, 'Nog niet gepland', coalesce(auth.uid(), old.bijgewerkt_door), bereken_programmadag(v_startdatum));
  return old;
end;
$$;

drop trigger if exists trg_log_gesprek_verwijderd on specialist_gesprekken;
create trigger trg_log_gesprek_verwijderd
  before delete on specialist_gesprekken
  for each row execute function log_gesprek_verwijderd();

-- "Ik heb er eentje!" — de onboarder telt zelf een plaatsing bij deze week op,
-- ook al mag hij de weekcijfers zelf niet rechtstreeks bewerken (bouwplan hoofdstuk 17).
create or replace function meld_plaatsing(p_onboarder_id uuid) returns void
language plpgsql security definer set search_path = public as $$
declare
  v_jaar int;
  v_week int;
begin
  if auth_rol() = 'medewerker' and p_onboarder_id is distinct from auth_onboarder_id() then
    raise exception 'Niet toegestaan';
  elsif auth_rol() not in ('medewerker', 'vm', 'mentor') then
    raise exception 'Niet toegestaan';
  end if;

  select extract(isoyear from current_date)::int, extract(week from current_date)::int into v_jaar, v_week;

  insert into weekcijfers (onboarder_id, jaar, weeknummer, plaatsingen, ingevuld_door, tijdstip)
  values (p_onboarder_id, v_jaar, v_week, 1, auth.uid(), now())
  on conflict (onboarder_id, jaar, weeknummer)
  do update set plaatsingen = weekcijfers.plaatsingen + 1, ingevuld_door = auth.uid(), tijdstip = now();
end;
$$;

grant execute on function meld_plaatsing(uuid) to authenticated;

-- Dossier afronden of stopzetten (bouwplan hoofdstuk 17 "Na dag 100").
-- Loopt via een functie en niet via een update-policy, zodat een VM wel de status
-- van een dossier mag zetten maar verder niets aan de onboarderrij kan wijzigen.
create or replace function zet_onboarder_status(p_onboarder_id uuid, p_status text, p_reden text default null) returns void
language plpgsql security definer set search_path = public as $$
begin
  if auth_rol() not in ('vm', 'mentor') then
    raise exception 'Niet toegestaan';
  end if;
  if p_status not in ('actief', 'afgerond', 'gestopt') then
    raise exception 'Onbekende status %', p_status;
  end if;

  update onboarders set
    status = p_status,
    afgerond_op = case when p_status = 'actief' then null else current_date end,
    reden = case when p_status = 'actief' then null else nullif(btrim(coalesce(p_reden, '')), '') end
  where id = p_onboarder_id;
end;
$$;

grant execute on function zet_onboarder_status(uuid, text, text) to authenticated;

-- Beheershulpje: een onboarder en al zijn gegevens in één keer verwijderen
-- (bijv. om testdata op te ruimen). Gebruik: select verwijder_onboarder('Naam');
create or replace function verwijder_onboarder(p_naam text) returns void
language plpgsql security definer set search_path = public as $$
declare
  v_id uuid;
begin
  select id into v_id from onboarders where naam = p_naam;
  if v_id is null then
    raise exception 'Geen onboarder gevonden met naam %', p_naam;
  end if;

  delete from analyses where onboarder_id = v_id;
  delete from nulmeting_indicatoren where onboarder_id = v_id;
  delete from nulmeting where onboarder_id = v_id;
  delete from opmerkingen where onboarder_id = v_id;
  delete from specialist_gesprekken where onboarder_id = v_id;
  delete from weeknotities where onboarder_id = v_id;
  delete from weekcijfers where onboarder_id = v_id;
  delete from niveau_stand where onboarder_id = v_id;
  delete from logboek where onboarder_id = v_id;
  delete from onboarders where id = v_id;
end;
$$;

-- Bewaartermijn (bouwplan hoofdstuk 17): afgeronde en gestopte dossiers worden
-- één jaar na hun einddatum verwijderd, inclusief de 100-dagenanalyse.
-- Draai dit één keer per jaar: select verwijder_verlopen_dossiers();
-- (of plan het in als cron-job in Supabase). Geeft terug hoeveel dossiers weg zijn.
create or replace function verwijder_verlopen_dossiers() returns int
language plpgsql security definer set search_path = public as $$
declare
  v_naam text;
  v_aantal int := 0;
begin
  for v_naam in
    select naam from onboarders
    where status in ('afgerond', 'gestopt')
      and afgerond_op is not null
      and afgerond_op < current_date - interval '1 year'
  loop
    perform verwijder_onboarder(v_naam);
    v_aantal := v_aantal + 1;
  end loop;
  return v_aantal;
end;
$$;

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
alter table fasen enable row level security;
alter table weekcijfers enable row level security;
alter table weeknotities enable row level security;
alter table indicatoren enable row level security;
alter table nulmeting enable row level security;
alter table nulmeting_indicatoren enable row level security;
alter table analyses enable row level security;

-- Mentor: volledige rechten op alle tabellen.
drop policy if exists mentor_all_vestigingen on vestigingen;
create policy mentor_all_vestigingen on vestigingen for all using (auth_rol() = 'mentor') with check (auth_rol() = 'mentor');
drop policy if exists mentor_all_gebruikers on gebruikers;
create policy mentor_all_gebruikers on gebruikers for all using (auth_rol() = 'mentor') with check (auth_rol() = 'mentor');
drop policy if exists mentor_all_onboarders on onboarders;
create policy mentor_all_onboarders on onboarders for all using (auth_rol() = 'mentor') with check (auth_rol() = 'mentor');
drop policy if exists mentor_all_onderwerpen on onderwerpen;
create policy mentor_all_onderwerpen on onderwerpen for all using (auth_rol() = 'mentor') with check (auth_rol() = 'mentor');
drop policy if exists mentor_all_niveau_labels on niveau_labels;
create policy mentor_all_niveau_labels on niveau_labels for all using (auth_rol() = 'mentor') with check (auth_rol() = 'mentor');
drop policy if exists mentor_all_niveau_stand on niveau_stand;
create policy mentor_all_niveau_stand on niveau_stand for all using (auth_rol() = 'mentor') with check (auth_rol() = 'mentor');
drop policy if exists mentor_all_logboek on logboek;
create policy mentor_all_logboek on logboek for all using (auth_rol() = 'mentor') with check (auth_rol() = 'mentor');
drop policy if exists mentor_all_opmerkingen on opmerkingen;
create policy mentor_all_opmerkingen on opmerkingen for all using (auth_rol() = 'mentor') with check (auth_rol() = 'mentor');
drop policy if exists mentor_all_kerncompetenties on kerncompetenties;
create policy mentor_all_kerncompetenties on kerncompetenties for all using (auth_rol() = 'mentor') with check (auth_rol() = 'mentor');
drop policy if exists mentor_all_specialisten on specialisten;
create policy mentor_all_specialisten on specialisten for all using (auth_rol() = 'mentor') with check (auth_rol() = 'mentor');
drop policy if exists mentor_all_competentie_specialisten on competentie_specialisten;
create policy mentor_all_competentie_specialisten on competentie_specialisten for all using (auth_rol() = 'mentor') with check (auth_rol() = 'mentor');
drop policy if exists mentor_all_specialist_gesprekken on specialist_gesprekken;
create policy mentor_all_specialist_gesprekken on specialist_gesprekken for all using (auth_rol() = 'mentor') with check (auth_rol() = 'mentor');
drop policy if exists mentor_all_mijlpalen on mijlpalen;
create policy mentor_all_mijlpalen on mijlpalen for all using (auth_rol() = 'mentor') with check (auth_rol() = 'mentor');
drop policy if exists mentor_all_verwachtingsniveaus on verwachtingsniveaus;
create policy mentor_all_verwachtingsniveaus on verwachtingsniveaus for all using (auth_rol() = 'mentor') with check (auth_rol() = 'mentor');
drop policy if exists mentor_all_fasen on fasen;
create policy mentor_all_fasen on fasen for all using (auth_rol() = 'mentor') with check (auth_rol() = 'mentor');
drop policy if exists mentor_all_weekcijfers on weekcijfers;
create policy mentor_all_weekcijfers on weekcijfers for all using (auth_rol() = 'mentor') with check (auth_rol() = 'mentor');
drop policy if exists mentor_all_weeknotities on weeknotities;
create policy mentor_all_weeknotities on weeknotities for all using (auth_rol() = 'mentor') with check (auth_rol() = 'mentor');
drop policy if exists mentor_all_indicatoren on indicatoren;
create policy mentor_all_indicatoren on indicatoren for all using (auth_rol() = 'mentor') with check (auth_rol() = 'mentor');
drop policy if exists mentor_all_nulmeting on nulmeting;
create policy mentor_all_nulmeting on nulmeting for all using (auth_rol() = 'mentor') with check (auth_rol() = 'mentor');
drop policy if exists mentor_all_nulmeting_indicatoren on nulmeting_indicatoren;
create policy mentor_all_nulmeting_indicatoren on nulmeting_indicatoren for all using (auth_rol() = 'mentor') with check (auth_rol() = 'mentor');
drop policy if exists mentor_all_analyses on analyses;
create policy mentor_all_analyses on analyses for all using (auth_rol() = 'mentor') with check (auth_rol() = 'mentor');

-- Referentiedata: iedereen die ingelogd is mag lezen.
drop policy if exists select_vestigingen on vestigingen;
create policy select_vestigingen on vestigingen for select using (auth.uid() is not null);
drop policy if exists select_onderwerpen on onderwerpen;
create policy select_onderwerpen on onderwerpen for select using (auth.uid() is not null);
drop policy if exists select_niveau_labels on niveau_labels;
create policy select_niveau_labels on niveau_labels for select using (auth.uid() is not null);
drop policy if exists select_mijlpalen on mijlpalen;
create policy select_mijlpalen on mijlpalen for select using (auth.uid() is not null);
drop policy if exists select_kerncompetenties on kerncompetenties;
create policy select_kerncompetenties on kerncompetenties for select using (auth.uid() is not null);
drop policy if exists select_specialisten on specialisten;
create policy select_specialisten on specialisten for select using (auth.uid() is not null);
drop policy if exists select_competentie_specialisten on competentie_specialisten;
create policy select_competentie_specialisten on competentie_specialisten for select using (auth.uid() is not null);
drop policy if exists select_verwachtingsniveaus on verwachtingsniveaus;
create policy select_verwachtingsniveaus on verwachtingsniveaus for select using (auth.uid() is not null);
drop policy if exists select_fasen on fasen;
create policy select_fasen on fasen for select using (auth.uid() is not null);
drop policy if exists select_indicatoren on indicatoren;
create policy select_indicatoren on indicatoren for select using (auth.uid() is not null);

-- gebruikers: naam/rol van collega's is niet gevoelig binnen SOMA, dus elke
-- ingelogde gebruiker mag de lijst lezen (nodig om "door wie" te kunnen tonen
-- in het logboek en bij opmerkingen).
drop policy if exists select_gebruikers on gebruikers;
create policy select_gebruikers on gebruikers for select
  using (auth.uid() is not null);

-- onboarders: medewerker ziet alleen zichzelf, vm/mentor zien iedereen (mentor_all dekt mentor al).
drop policy if exists select_onboarders_zelf on onboarders;
create policy select_onboarders_zelf on onboarders for select
  using (gebruiker_id = auth.uid());
drop policy if exists select_onboarders_vm on onboarders;
create policy select_onboarders_vm on onboarders for select
  using (auth_rol() = 'vm');

-- niveau_stand
drop policy if exists select_niveau_stand_zelf on niveau_stand;
create policy select_niveau_stand_zelf on niveau_stand for select
  using (onboarder_id = auth_onboarder_id());
drop policy if exists select_niveau_stand_vm on niveau_stand;
create policy select_niveau_stand_vm on niveau_stand for select
  using (auth_rol() = 'vm');

drop policy if exists medewerker_update_niveau_stand on niveau_stand;
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

drop policy if exists vm_update_niveau_stand on niveau_stand;
create policy vm_update_niveau_stand on niveau_stand for update
  using (auth_rol() = 'vm')
  with check (auth_rol() = 'vm' and bijgewerkt_door = auth.uid());

-- logboek: alleen lezen (schrijven gaat via de trigger, die security definer draait).
drop policy if exists select_logboek_zelf on logboek;
create policy select_logboek_zelf on logboek for select
  using (onboarder_id = auth_onboarder_id());
drop policy if exists select_logboek_vm on logboek;
create policy select_logboek_vm on logboek for select
  using (auth_rol() = 'vm');

-- opmerkingen
drop policy if exists select_opmerkingen_zelf on opmerkingen;
create policy select_opmerkingen_zelf on opmerkingen for select
  using (onboarder_id = auth_onboarder_id());
drop policy if exists select_opmerkingen_vm on opmerkingen;
create policy select_opmerkingen_vm on opmerkingen for select
  using (auth_rol() = 'vm');

drop policy if exists insert_opmerkingen_zelf on opmerkingen;
create policy insert_opmerkingen_zelf on opmerkingen for insert
  with check (onboarder_id = auth_onboarder_id() and door_gebruiker = auth.uid());
drop policy if exists insert_opmerkingen_vm on opmerkingen;
create policy insert_opmerkingen_vm on opmerkingen for insert
  with check (auth_rol() = 'vm' and door_gebruiker = auth.uid());

-- specialist_gesprekken: medewerker beheert die van zichzelf, vm leest/wijzigt alles.
drop policy if exists select_gesprekken_zelf on specialist_gesprekken;
create policy select_gesprekken_zelf on specialist_gesprekken for select
  using (onboarder_id = auth_onboarder_id());
drop policy if exists select_gesprekken_vm on specialist_gesprekken;
create policy select_gesprekken_vm on specialist_gesprekken for select
  using (auth_rol() = 'vm');

drop policy if exists insert_gesprekken_zelf on specialist_gesprekken;
create policy insert_gesprekken_zelf on specialist_gesprekken for insert
  with check (onboarder_id = auth_onboarder_id() and bijgewerkt_door = auth.uid());
drop policy if exists update_gesprekken_zelf on specialist_gesprekken;
create policy update_gesprekken_zelf on specialist_gesprekken for update
  using (onboarder_id = auth_onboarder_id())
  with check (onboarder_id = auth_onboarder_id() and bijgewerkt_door = auth.uid());

drop policy if exists insert_gesprekken_vm on specialist_gesprekken;
create policy insert_gesprekken_vm on specialist_gesprekken for insert
  with check (auth_rol() = 'vm' and bijgewerkt_door = auth.uid());
drop policy if exists update_gesprekken_vm on specialist_gesprekken;
create policy update_gesprekken_vm on specialist_gesprekken for update
  using (auth_rol() = 'vm')
  with check (auth_rol() = 'vm' and bijgewerkt_door = auth.uid());

-- Terugzetten naar "nog niet gepland" (rij verwijderen), zelfde rechten als bewerken.
drop policy if exists delete_gesprekken_zelf on specialist_gesprekken;
create policy delete_gesprekken_zelf on specialist_gesprekken for delete
  using (onboarder_id = auth_onboarder_id());
drop policy if exists delete_gesprekken_vm on specialist_gesprekken;
create policy delete_gesprekken_vm on specialist_gesprekken for delete
  using (auth_rol() = 'vm');

-- weekcijfers en weeknotities: medewerker leest alleen zijn eigen dossier,
-- alleen vm/mentor mogen invullen (bouwplan hoofdstuk 17: "Weekcijfers invullen: medewerker nee").
drop policy if exists select_weekcijfers_zelf on weekcijfers;
create policy select_weekcijfers_zelf on weekcijfers for select
  using (onboarder_id = auth_onboarder_id());
drop policy if exists select_weekcijfers_vm on weekcijfers;
create policy select_weekcijfers_vm on weekcijfers for select
  using (auth_rol() = 'vm');
drop policy if exists schrijf_weekcijfers_vm on weekcijfers;
create policy schrijf_weekcijfers_vm on weekcijfers for insert
  with check (auth_rol() = 'vm' and ingevuld_door = auth.uid());
drop policy if exists update_weekcijfers_vm on weekcijfers;
create policy update_weekcijfers_vm on weekcijfers for update
  using (auth_rol() = 'vm')
  with check (auth_rol() = 'vm' and ingevuld_door = auth.uid());

drop policy if exists select_weeknotities_zelf on weeknotities;
create policy select_weeknotities_zelf on weeknotities for select
  using (onboarder_id = auth_onboarder_id());
drop policy if exists select_weeknotities_vm on weeknotities;
create policy select_weeknotities_vm on weeknotities for select
  using (auth_rol() = 'vm');
drop policy if exists insert_weeknotities_vm on weeknotities;
create policy insert_weeknotities_vm on weeknotities for insert
  with check (auth_rol() = 'vm' and door = auth.uid());
drop policy if exists update_weeknotities_vm on weeknotities;
create policy update_weeknotities_vm on weeknotities for update
  using (auth_rol() = 'vm')
  with check (auth_rol() = 'vm' and door = auth.uid());

-- nulmeting: medewerker ziet zijn eigen meting pas als hij afgerond is (bouwplan 13),
-- vm/mentor mogen altijd lezen en invullen.
drop policy if exists select_nulmeting_zelf on nulmeting;
create policy select_nulmeting_zelf on nulmeting for select
  using (onboarder_id = auth_onboarder_id() and afgerond);
drop policy if exists select_nulmeting_vm on nulmeting;
create policy select_nulmeting_vm on nulmeting for select
  using (auth_rol() = 'vm');
drop policy if exists schrijf_nulmeting_vm on nulmeting;
create policy schrijf_nulmeting_vm on nulmeting for insert
  with check (auth_rol() = 'vm' and door = auth.uid());
drop policy if exists update_nulmeting_vm on nulmeting;
create policy update_nulmeting_vm on nulmeting for update
  using (auth_rol() = 'vm')
  with check (auth_rol() = 'vm' and door = auth.uid());

drop policy if exists select_nulmeting_indicatoren_zelf on nulmeting_indicatoren;
create policy select_nulmeting_indicatoren_zelf on nulmeting_indicatoren for select
  using (
    onboarder_id = auth_onboarder_id()
    and exists (
      select 1 from nulmeting n
      where n.onboarder_id = nulmeting_indicatoren.onboarder_id
        and n.competentie_id = nulmeting_indicatoren.competentie_id
        and n.afgerond
    )
  );
drop policy if exists select_nulmeting_indicatoren_vm on nulmeting_indicatoren;
create policy select_nulmeting_indicatoren_vm on nulmeting_indicatoren for select
  using (auth_rol() = 'vm');
drop policy if exists schrijf_nulmeting_indicatoren_vm on nulmeting_indicatoren;
create policy schrijf_nulmeting_indicatoren_vm on nulmeting_indicatoren for insert
  with check (auth_rol() = 'vm');
drop policy if exists verwijder_nulmeting_indicatoren_vm on nulmeting_indicatoren;
create policy verwijder_nulmeting_indicatoren_vm on nulmeting_indicatoren for delete
  using (auth_rol() = 'vm');

-- analyses: de onboarder mag zijn eigen analyse inzien, de VM genereert en vult in
-- (bouwplan hoofdstuk 17, tabel "Wie kan wat").
drop policy if exists select_analyses_zelf on analyses;
create policy select_analyses_zelf on analyses for select
  using (onboarder_id = auth_onboarder_id());
drop policy if exists select_analyses_vm on analyses;
create policy select_analyses_vm on analyses for select
  using (auth_rol() = 'vm');
drop policy if exists insert_analyses_vm on analyses;
create policy insert_analyses_vm on analyses for insert
  with check (auth_rol() = 'vm' and door = auth.uid());
drop policy if exists update_analyses_vm on analyses;
create policy update_analyses_vm on analyses for update
  using (auth_rol() = 'vm')
  with check (auth_rol() = 'vm' and door = auth.uid());

-- ─────────────────────────────────────────────────────────────
-- 5. Seed-data — per rij toegevoegd, alleen als die rij (op naam) nog niet bestaat.
-- Werkt dus ook als de tabel al (verkeerde) data van eerder bevat.
-- ─────────────────────────────────────────────────────────────

insert into vestigingen (naam)
select v.naam from (values ('Sittard'), ('Weert'), ('Zuid')) as v(naam)
where not exists (select 1 from vestigingen x where x.naam = v.naam);

insert into niveau_labels (niveau, label)
select v.niveau, v.label from (values
  (0, 'Nog niet gestart'), (1, 'Doorgenomen'), (2, 'Begrijpt'), (3, 'Kan toepassen'), (4, 'Beheerst')
) as v(niveau, label)
where not exists (select 1 from niveau_labels x where x.niveau = v.niveau);

insert into mijlpalen (naam, dag)
select v.naam, v.dag from (values ('Proeftijd', 30), ('Eindevaluatie', 100)) as v(naam, dag)
where not exists (select 1 from mijlpalen x where x.naam = v.naam);

insert into onderwerpen (naam, categorie, type, max_niveau, aanspreekpunt, welder_link, criterium_3, criterium_4, training_verplicht, volgorde)
select v.naam, v.categorie, v.type, v.max_niveau, v.aanspreekpunt, v.welder_link, v.criterium_3, v.criterium_4, v.training_verplicht, v.volgorde
from (values
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
  ('Nazorg', 'Relatiebeheer', 'vaardigheid', 4, 'Yvo', 'https://somaworks.welder.cloud/v2/content/169785/view/169785', 'Belt voor de start, neemt de belangrijkste punten door en belt na de eerste werkdag na.', 'Doet dat bij elke plaatsing, ook als het druk is.', false, 260)
) as v(naam, categorie, type, max_niveau, aanspreekpunt, welder_link, criterium_3, criterium_4, training_verplicht, volgorde)
where not exists (select 1 from onderwerpen x where x.naam = v.naam);

insert into fasen (id, label, sub, kleur, volgorde)
select v.id, v.label, v.sub, v.kleur, v.volgorde from (values
  ('Basis', 'Basis', 'Vanaf dag 1: het verhaal en de systemen', '#6b7280', 10),
  ('1.0', '1.0 Instroom', 'Kandidaten vinden', '#3b73ad', 20),
  ('2.0', '2.0 Selectie', 'Begrijpen wie je voor je hebt', '#2c9c8f', 30),
  ('3.0', '3.0 & 4.0 Presentatie en acquisitie', 'Verkopen aan kandidaat en klant', '#f18825', 40),
  ('5.0', '5.0 Plaatsing', 'Van akkoord naar aan het werk', '#9b5bb5', 50),
  ('6.0', '6.0 Klant- en kandidaatbeheer', 'Vasthouden en uitbouwen', '#2c2f7b', 60)
) as v(id, label, sub, kleur, volgorde)
where not exists (select 1 from fasen x where x.id = v.id);

-- Onderwerpen aan hun fase koppelen (update i.p.v. insert, want de onderwerpen
-- zelf staan er al — dit repareert ook een database die al gezaaid was voordat
-- fasen bestonden).
update onderwerpen set fase_id = v.fase_id
from (values
  ('Missie, visie en kernwaarden', 'Basis'),
  ('SOMA Group | alle labels', 'Basis'),
  ('Terug naar de basis', 'Basis'),
  ('Kostprijsberekening', '2.0'),
  ('CAO kennis en ADV', '5.0'),
  ('Gelijkwaardige arbeidsvoorwaarden', '5.0'),
  ('Fasen-systeem', 'Basis'),
  ('Wtta en toelating', '3.0'),
  ('Subsidies', '2.0'),
  ('Ziekte', '5.0'),
  ('VCU', '5.0'),
  ('Carerix cursus', 'Basis'),
  ('CARV cursus', 'Basis'),
  ('Buddee', 'Basis'),
  ('Welder', 'Basis'),
  ('Easyflex', 'Basis'),
  ('Kandidaten werven', '1.0'),
  ('Intake voeren', '2.0'),
  ('Kandidaat overtuigen', '3.0'),
  ('Kandidaat presenteren', '3.0'),
  ('Kandidaat voorbereiden', '3.0'),
  ('Commercieel denken', '3.0'),
  ('Acquisitie', '3.0'),
  ('Relatiebeheer', '6.0'),
  ('Kandidaatbeheer', '6.0'),
  ('Nazorg', '5.0')
) as v(naam, fase_id)
where onderwerpen.naam = v.naam
  and onderwerpen.fase_id is distinct from v.fase_id;

insert into kerncompetenties (naam, volgorde)
select v.naam, v.volgorde from (values
  ('Aanpassingsvermogen', 10), ('Commercialiteit', 20), ('Creativiteit', 30), ('Empathie', 40),
  ('Drive', 50), ('Kwaliteitsgerichtheid', 60), ('Overtuigingskracht', 70)
) as v(naam, volgorde)
where not exists (select 1 from kerncompetenties x where x.naam = v.naam);

insert into indicatoren (competentie_id, nr, tekst)
select k.id, v.nr, v.tekst
from (values
  ('Aanpassingsvermogen', 1, 'Pakt een spoedaanvraag op zonder eerst te mopperen dat zijn dag in de war ligt'),
  ('Aanpassingsvermogen', 2, 'Is binnen tien minuten aan het bellen als een kandidaat afbelt'),
  ('Aanpassingsvermogen', 3, 'Blijft rustig doorwerken als het druk is op de vestiging'),
  ('Aanpassingsvermogen', 4, 'Duikt uit zichzelf in een nieuw systeem of een nieuwe werkwijze'),
  ('Aanpassingsvermogen', 5, 'Zoekt uit wat er wél kan als een klant of kandidaat nee zegt'),

  ('Overtuigingskracht', 1, 'Vraagt bij een bezwaar door in plaats van het gesprek af te ronden'),
  ('Overtuigingskracht', 2, 'Past zijn verhaal aan op wie hij aan de lijn heeft'),
  ('Overtuigingskracht', 3, 'Legt uit waarom zijn kandidaat de juiste is zonder zijn verkooppraatje af te draaien'),
  ('Overtuigingskracht', 4, 'Durft te vragen: zullen we het gewoon doen?'),
  ('Overtuigingskracht', 5, 'Komt terug bij een klant die eerder nee zei'),

  ('Drive', 1, 'Belt door na drie keer nee, ook op vrijdagmiddag'),
  ('Drive', 2, 'Pakt zijn 1.0''ers meteen op in plaats van later op de dag'),
  ('Drive', 3, 'Gaat pas naar huis als hij heeft gedaan wat hij zich had voorgenomen'),
  ('Drive', 4, 'Weet zonder opzoeken hoeveel intakes en voorstellen hij deze week heeft gedaan'),
  ('Drive', 5, 'Komt na een slechte week terug met meer belletjes in plaats van minder'),

  ('Creativiteit', 1, 'Verandert zijn aanpak als de standaardzoekopdracht niets oplevert'),
  ('Creativiteit', 2, 'Kijkt naar wat een kandidaat feitelijk deed in plaats van naar zijn functietitel'),
  ('Creativiteit', 3, 'Zoekt kandidaten op plekken waar de rest niet kijkt'),
  ('Creativiteit', 4, 'Stelt de vraag die de anderen overslaan'),
  ('Creativiteit', 5, 'Weet na een geslaagde plaatsing te benoemen wat hij anders deed'),

  ('Commercialiteit', 1, 'Zet een signaal van een kandidaat of klant dezelfde dag om in een actie'),
  ('Commercialiteit', 2, 'Stelt een tweede kandidaat voor op een aanvraag van één'),
  ('Commercialiteit', 3, 'Vraagt bij een aanvraag door of er meer werk aankomt'),
  ('Commercialiteit', 4, 'Kan uitleggen waarom SOMA duurder is zonder zich te verontschuldigen'),
  ('Commercialiteit', 5, 'Stuurt op zijn conversie: blijven voorstellen hangen, dan verandert hij zijn aanpak'),

  ('Kwaliteitsgerichtheid', 1, 'Stuurt geen voorstel weg waar hij zelf niet achter staat'),
  ('Kwaliteitsgerichtheid', 2, 'Leest zijn voorstel één keer over met de ogen van de klant'),
  ('Kwaliteitsgerichtheid', 3, 'Legt elke actie in Carerix vast, zodat zijn funnel klopt'),
  ('Kwaliteitsgerichtheid', 4, 'Belt een nieuwe plaatsing binnen drie dagen na om te checken hoe het gaat'),
  ('Kwaliteitsgerichtheid', 5, 'Pakt zijn eigen fout terug voordat een ander hem vindt'),

  ('Empathie', 1, 'Luistert zonder alvast zijn antwoord klaar te hebben'),
  ('Empathie', 2, 'Vraagt bij twijfel door naar wat iemand tegenhoudt'),
  ('Empathie', 3, 'Past zijn toon aan op wie hij tegenover zich heeft'),
  ('Empathie', 4, 'Merkt op wanneer een flexkracht stiller wordt en belt dan'),
  ('Empathie', 5, 'Voert ook het gesprek na een afwijzing zo dat de kandidaat terugkomt')
) as v(competentie_naam, nr, tekst)
join kerncompetenties k on k.naam = v.competentie_naam
where not exists (select 1 from indicatoren x where x.competentie_id = k.id and x.nr = v.nr);

insert into specialisten (naam)
select v.naam from (values
  ('Tom Meyer'), ('Enzio Brouner'), ('Ralph van Tilborg'), ('Liberto'),
  ('Aim Gruisen'), ('Ralph Keulen'), ('Max Trebus')
) as v(naam)
where not exists (select 1 from specialisten x where x.naam = v.naam);

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
)
and not exists (
  select 1 from competentie_specialisten x where x.competentie_id = k.id and x.specialist_id = s.id
);
