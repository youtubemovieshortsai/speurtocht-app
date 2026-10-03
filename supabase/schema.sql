-- =========================================================
-- SPEURTOCHT APP - DATABASE STRUCTUUR
-- Tijdelijke speldata, ontworpen voor €0 gebruik
-- =========================================================

create table if not exists games (
  id uuid primary key default gen_random_uuid(),
  game_code text unique not null,
  name text not null,
  status text not null default 'waiting',
  start_time timestamptz not null,
  end_time timestamptz not null,
  current_seeker_id uuid,
  created_at timestamptz not null default now()
);

create table if not exists players (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references games(id) on delete cascade,
  user_id uuid,
  display_name text not null,
  role text not null default 'player',
  location_sharing boolean not null default false,
  is_found boolean not null default false,
  joined_at timestamptz not null default now()
);

create table if not exists missions (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references games(id) on delete cascade,
  title text not null,
  description text,
  start_time timestamptz,
  order_number integer not null default 1,
  active boolean not null default false
);

create table if not exists locations (
  player_id uuid primary key references players(id) on delete cascade,
  latitude double precision not null,
  longitude double precision not null,
  accuracy double precision,
  updated_at timestamptz not null default now()
);

create table if not exists game_events (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references games(id) on delete cascade,
  type text not null,
  actor_player_id uuid,
  target_player_id uuid,
  metadata jsonb,
  created_at timestamptz not null default now()
);

-- Indexen voor snelle live-game queries
create index if not exists players_game_id_idx
  on players(game_id);

create index if not exists missions_game_id_idx
  on missions(game_id);

create index if not exists locations_updated_at_idx
  on locations(updated_at);

create index if not exists game_events_game_id_idx
  on game_events(game_id);

-- Locaties worden automatisch verwijderd zodra een speler
-- of een volledig spel wordt verwijderd.
--
-- De locaties-tabel bewaart per speler slechts één actuele
-- locatie. Er ontstaat dus geen historische GPS-route.

-- Speldata ouder dan 24 uur kan later automatisch worden
-- opgeschoond via een scheduled databasefunctie.
