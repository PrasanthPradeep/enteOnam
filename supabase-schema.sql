-- EnteOnam DB Schema (field names match supplycokerala.com API)

create table if not exists profiles (
  id uuid primary key references auth.users(id),
  display_name text,
  created_at timestamptz default now()
);

-- Outlets (synced from /api/outlets)
create table if not exists outlets (
  outlet_id int primary key,
  name text,
  outlet_type text,
  status boolean,
  address1 text,
  address2 text,
  address3 text,
  pin_code text,
  phone text,
  email text,
  latitude double precision,
  longitude double precision,
  is_sunday_open boolean,
  depot text,
  taluk text,
  district_name text,
  synced_at timestamptz default now()
);

-- Price list types (synced from /api/price-list-types)
create table if not exists price_list_types (
  id int primary key,
  price_type_id int,
  name text,
  slug text,
  itemtag text,
  status boolean,
  created_at timestamptz,
  updated_at timestamptz
);

-- Monthly product prices (synced from /api/price-list)
create table if not exists monthly_price_entries (
  id serial primary key,
  product_id int,
  product_name text,
  department text,
  rate numeric,
  status boolean,
  price_list_type_id int references price_list_types(id),
  year int,
  month int,
  synced_at timestamptz default now(),
  unique (product_id, price_list_type_id, year, month)
);

-- Crowdsourced stock reports
create table if not exists stock_reports (
  id serial primary key,
  outlet_id int references outlets(outlet_id),
  item_name text not null,
  status text check (status in ('in_stock','low_stock','out_of_stock')),
  reported_by uuid references profiles(id),
  reported_at timestamptz default now()
);

-- Crowdsourced locations (Onam spots, flower shops, events)
create table if not exists locations (
  id serial primary key,
  category text check (category in ('onam_spot','flower_shop','event')),
  sub_category text,
  name text not null,
  description text,
  lat double precision,
  lng double precision,
  photo_url text,
  event_date timestamptz,
  event_end_date timestamptz,
  submitted_by uuid references profiles(id),
  status text default 'active' check (status in ('active','hidden','pending')),
  created_at timestamptz default now()
);

-- Flower-specific extra data (prices optional; JSON map of flower-type -> price)
create table if not exists flower_shop_details (
  location_id int references locations(id) primary key,
  flower_types text[],
  prices jsonb,
  last_price_update timestamptz default now()
);

-- Upvotes / spam reports
create table if not exists location_flags (
  id serial primary key,
  location_id int references locations(id),
  flagged_by uuid references profiles(id),
  flag_type text check (flag_type in ('upvote','spam')),
  created_at timestamptz default now()
);

-- User reports for data quality issues
create table if not exists reports (
  id serial primary key,
  type text check (type in ('outlet','price','general','spot')) not null,
  issue_type text check (issue_type in ('coordinates','price','stock','closed','contact','wrong_info','event_over','spam','other')) not null,
  description text not null,
  contact_email text,
  outlet_id int references outlets(outlet_id),
  outlet_name text,
  location_id int references locations(id),
  location_name text,
  price_id int,
  product_name text,
  user_agent text,
  status text default 'pending' check (status in ('pending','reviewed','resolved','dismissed')),
  created_at timestamptz default now()
);

-- Migrations for databases where `reports` already exists
alter table reports add column if not exists location_id int references locations(id);
alter table reports add column if not exists location_name text;
alter table reports drop constraint if exists reports_type_check;
alter table reports add constraint reports_type_check
  check (type in ('outlet','price','general','spot'));
alter table reports drop constraint if exists reports_issue_type_check;
alter table reports add constraint reports_issue_type_check
  check (issue_type in ('coordinates','price','stock','closed','contact','wrong_info','event_over','spam','other'));

-- Sadya menu reference
create table if not exists sadya_dishes (
  id serial primary key,
  dish_name text not null,
  category text,
  qty_per_person numeric,
  unit text
);

-- Performance indexes for the query paths actually used by the app
create index if not exists idx_stock_reports_outlet_reported
  on stock_reports (outlet_id, reported_at desc);
create index if not exists idx_reports_created_at
  on reports (created_at desc);
create index if not exists idx_outlets_district
  on outlets (district_name);
create index if not exists idx_outlets_depot
  on outlets (depot);

-- RLS
alter table stock_reports enable row level security;
create policy "anyone_can_read_stock_reports" on stock_reports for select using (true);
-- Anonymous app (no auth): dedupe floods of identical reports per outlet+item within an hour.
-- Without auth we can't scope per-user, so this throttles identical repeated reports globally.
create policy "one_report_per_hour" on stock_reports for insert
with check (not exists (
  select 1 from stock_reports sr
  where sr.outlet_id = stock_reports.outlet_id
    and sr.item_name = stock_reports.item_name
    and sr.status = stock_reports.status
    and sr.reported_at > now() - interval '1 hour'
));

alter table locations enable row level security;
create policy "anyone_can_read_active_locations" on locations for select
using (status = 'active');
create policy "anyone_can_insert_locations" on locations for insert
with check (category in ('onam_spot','flower_shop','event'));

alter table flower_shop_details enable row level security;
create policy "anyone_can_read_flower_details" on flower_shop_details for select using (true);
create policy "anyone_can_insert_flower_details" on flower_shop_details for insert
with check (true);
create policy "anyone_can_update_flower_details" on flower_shop_details for update
using (true) with check (true);

alter table location_flags enable row level security;
create policy "authenticated_can_flag" on location_flags for insert
with check (auth.role() = 'authenticated');

alter table reports enable row level security;
create policy "anyone_can_submit_reports" on reports for insert
with check (true);
create policy "only_admins_can_read_reports" on reports for select
using (false); -- Admin access only via service role