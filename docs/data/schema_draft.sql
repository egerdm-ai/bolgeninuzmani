-- VAULT initial schema draft. Finalize in Supabase migrations after audit.
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  username text unique,
  title text,
  company_id uuid,
  phone text,
  email text,
  avatar_url text,
  cover_url text,
  verification_status text default 'pending',
  membership_tier text default 'private_beta',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table regions (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  city text,
  district text,
  lat numeric,
  lng numeric,
  radius_km numeric,
  created_at timestamptz default now()
);

create table portfolios (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles(id),
  slug text unique,
  title text not null,
  short_description text,
  public_description text,
  private_description text,
  category text not null,
  subcategory text,
  transaction_type text,
  status text default 'draft',
  city text,
  district text,
  neighborhood text,
  region_id uuid references regions(id),
  approx_lat numeric,
  approx_lng numeric,
  exact_lat numeric,
  exact_lng numeric,
  location_privacy text default 'approximate_visible',
  price numeric,
  currency text default 'TRY',
  price_display_type text default 'exact',
  gross_m2 numeric,
  net_m2 numeric,
  land_m2 numeric,
  room_count text,
  bathroom_count int,
  parking_capacity int,
  features text[] default '{}',
  attributes jsonb default '{}'::jsonb,
  visibility_mode text default 'network',
  request_access_required boolean default true,
  data_completeness_score int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  published_at timestamptz
);

create table detail_requests (
  id uuid primary key default gen_random_uuid(),
  portfolio_id uuid not null references portfolios(id),
  requester_id uuid not null references profiles(id),
  owner_id uuid not null references profiles(id),
  message text,
  status text default 'new',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table portfolio_access_grants (
  id uuid primary key default gen_random_uuid(),
  portfolio_id uuid not null references portfolios(id),
  user_id uuid not null references profiles(id),
  granted_by uuid not null references profiles(id),
  request_id uuid references detail_requests(id),
  expires_at timestamptz,
  created_at timestamptz default now()
);

create table my_searches (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles(id),
  title text not null,
  customer_note text,
  raw_query text,
  filters jsonb default '{}'::jsonb,
  notification_frequency text default 'instant',
  status text default 'active',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table network_searches (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles(id),
  title text not null,
  public_summary text,
  filters jsonb default '{}'::jsonb,
  visibility text default 'network',
  status text default 'active',
  created_at timestamptz default now()
);

create table match_results (
  id uuid primary key default gen_random_uuid(),
  match_type text not null,
  portfolio_id uuid references portfolios(id),
  my_search_id uuid references my_searches(id),
  network_search_id uuid references network_searches(id),
  professional_id uuid references profiles(id),
  match_score int,
  matched_criteria jsonb default '[]'::jsonb,
  missing_criteria jsonb default '[]'::jsonb,
  explanation text,
  status text default 'new',
  created_at timestamptz default now()
);
