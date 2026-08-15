# EnteOnam — Full Build Specification

## 1. Overview

A crowdsourced + official-data web app for Kerala residents, built around the Onam 2026 season (Atham to Thiruvonam window). Ships as a responsive installable PWA.

### Core Features

1. Supplyco Store Locator (official API data)
2. Crowdsourced Stock & Price Reporting (per Supplyco outlet)
3. Onam Celebration Spot Finder (fully crowdsourced map)
4. Flower Shop Finder (crowdsourced, prices + flower types)
5. Sadya Planner (menu scaler + cost estimator using price data)
6. Countdown + Day-by-Day Ritual Guide (static content)
7. Optional v1.1 add-ons: weather alert banner, boat race calendar, competition finder

---

## 2. Tech Stack

| Layer         | Choice                                                              |
| ------------- | ------------------------------------------------------------------- |
| Frontend      | HTML/CSS/JS (or React) — PWA                                        |
| Backend/DB    | Supabase (PostgreSQL, Auth, RLS, Realtime)                          |
| Maps          | Leaflet.js + OpenStreetMap tiles + Leaflet.markercluster            |
| Hosting       | Vercel/Netlify (frontend), Supabase (backend)                       |
| Notifications | OneSignal free tier (Web Push)                                      |
| Data Sync     | Python (requests) scheduled sync script for Supplyco APIs           |
| Geocoding     | OpenStreetMap Nominatim (only for crowdsourced pins without coords) |

---

## 3. UI Theme — Minimal Onam Palette

Keep the UI flat, clean, and content-first — no gradients, no more than 3-4 colors total, generous white space. Theme draws from traditional Onam visual cues (banana leaf, pookalam flowers, gold/white attire) but stays restrained.

### 3.1 Color Palette

| Role                    | Color             | Hex       | Usage                                            |
| ----------------------- | ----------------- | --------- | ------------------------------------------------ |
| Primary (Base)          | Banana Leaf Green | `#2F5D3A` | Header, nav bar, primary buttons, active states  |
| Secondary               | Kasavu Gold       | `#C9A24B` | Accents, icons, highlights, active tab underline |
| Background              | Off-White (Mundu) | `#FAF7F0` | Page background, cards                           |
| Text                    | Charcoal          | `#2B2B2B` | Body text, headings                              |
| Alert/Error (sparingly) | Muted Terracotta  | `#B5533C` | Errors, out-of-stock tags, spam flags only       |

No gradients anywhere — flat fills only. Avoid decorative flower/pookalam imagery as backgrounds; keep it to small iconography if needed (e.g. a single flower icon marking Onam-spot pins on the map).

### 3.2 Typography

- One primary font family (system font stack or a single clean sans-serif like Inter/Poppins) — avoid mixing decorative "festival" fonts with body text.
- Headings: Charcoal `#2B2B2B`, semi-bold, no color variation between heading levels — use size/weight only.
- Body text: Charcoal `#2B2B2B` at reduced opacity (e.g. 85%) on off-white background for comfortable contrast without pure black.

### 3.3 Component Guidelines

- **Buttons**: Solid fill only (primary green or gold), white text, no shadows or gradients, subtle border-radius (4-6px).
- **Cards**: Off-white background, 1px light border (`#E5E0D5`), no drop shadows beyond a very subtle 1-2px elevation if needed for map popups.
- **Map pins**: Use the 3-color system to differentiate categories — green pin for outlets, gold pin for Onam spots, terracotta only for flagged/inactive pins.
- **Tabs/Filters** (e.g. price list types, map layers): Flat underline or pill style using gold as the active indicator, no background gradients.
- **Status badges**: In-stock = green, low-stock = gold, out-of-stock = terracotta — flat fill badges, no gradients, small text label inside.

### 3.4 Layout Principles

- Generous whitespace over decorative elements — let content (maps, lists, prices) be the visual focus, not the theme.
- Consistent 8px spacing grid across cards, buttons, and sections.
- Avoid festival clutter (no confetti, no flower-pattern borders) — the palette alone should signal "Onam" without needing decorative graphics.
- Dark mode (optional, v1.1): swap background to a deep charcoal `#1E1E1E`, keep the same green/gold accents at slightly brightened values for contrast.

---

## 4. Supplyco Kerala Public API Reference (Verified)

Real public JSON APIs confirmed on supplycokerala.com — use these as primary source of truth instead of scraping PDFs.

### 4.1 Confirmed Endpoints

| Endpoint                                                                             | Purpose                                       | Key Params                                                                 |
| ------------------------------------------------------------------------------------ | --------------------------------------------- | -------------------------------------------------------------------------- |
| `GET /api/outlets?limit=9999`                                                        | Statewide outlet master list (~1,651 outlets) | `limit`                                                                    |
| `GET /api/price-list-types?limit=1000&status=1`                                      | 5 official catalog types                      | `limit`, `status`                                                          |
| `GET /api/price-list?page=&limit=&search=&status=1&price_list_type_id=&year=&month=` | Monthly product pricing per catalog type      | `page`, `limit`, `search`, `status`, `price_list_type_id`, `year`, `month` |

### 4.2 Outlet Fields (from `/api/outlets`)

`outletid`, `name`, `outlettype`, `status`, `address1`, `address2`, `address3`, `pincode`, `phone`, `email`, `latitude`, `longitude`, `issundayopen`, `depot`, `taluk`, `districtname`. Response wrapped in `message` / `data` / `pagination` (`total`, `page`, `limit`, `totalPages`).

### 4.3 Price List Types

| id  | Name                                   | Notes                                                                |
| --- | -------------------------------------- | -------------------------------------------------------------------- |
| 1   | Subsidy Price List                     | 17 items — core subsidy basket                                       |
| 2   | Free sale Subsidy Rate of Maveli items | 63 items — broader free-sale list                                    |
| 3   | Bulk Rate of Maveli items              | 181 items, 2 pages — general/bulk catalog                            |
| 4   | K Store Rate of Maveli items           | 47 items — Sabari-branded retail                                     |
| 5   | Maveli Price List                      | 264 items, 3 pages — broadest combined catalog (recommended default) |

Product fields returned: `product_id`, `product_name`, `department`, `status`, `rate`. Watch for near-zero rates (e.g. `0.01`) representing offers/kit entries — handle as special cases, not real prices.

### 4.4 Confirmed Gap: No Live Stock API

No endpoint exposes outlet-wise live stock/availability. This means the crowdsourced stock-reporting feature is the **only** source of real-time "is this item in stock at this outlet" data — it is not redundant with the price API and must be built as originally planned.

### 4.5 Sync Script Approach (Python)

- Scheduled script (cron / GitHub Actions) that:
  1. Calls `/api/outlets?limit=9999`, upserts into `outlets` table
  2. Calls `/api/price-list-types?limit=1000&status=1`, upserts into `price_list_types`
  3. Loops `price_list_type_id` 1-5, calls `/api/price-list` for current `year`/`month`, paginates via `totalPages`, upserts into `monthly_price_entries`
- No auth observed as required; add reasonable request throttling regardless
- Store raw JSON snapshots in Supabase Storage alongside normalized rows, for auditability if fields change

---

## 5. Database Schema (Supabase / PostgreSQL)

```sql
-- User profiles (extends Supabase Auth)
create table profiles (
  id uuid primary key references auth.users(id),
  display_name text,
  created_at timestamptz default now()
);

-- Official outlet master list (synced from /api/outlets)
create table outlets (
  outletid int primary key,
  name text,
  outlettype text,
  status text,
  address1 text,
  address2 text,
  address3 text,
  pincode text,
  phone text,
  email text,
  latitude double precision,
  longitude double precision,
  issundayopen boolean,
  depot text,
  taluk text,
  districtname text,
  synced_at timestamptz default now()
);

-- Official price list types (synced from /api/price-list-types)
create table price_list_types (
  id int primary key,
  price_type_id int,
  name text,
  slug text,
  itemtag text,
  status boolean
);

-- Official monthly product prices (synced from /api/price-list)
create table monthly_price_entries (
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

-- Crowdsourced stock reports per outlet/item
create table stock_reports (
  id serial primary key,
  outletid int references outlets(outletid),
  item_name text not null,
  status text check (status in ('in_stock','low_stock','out_of_stock')),
  reported_by uuid references profiles(id),
  reported_at timestamptz default now()
);

-- Generic crowdsourced locations (Onam spots, flower shops, events share this table)
create table locations (
  id serial primary key,
  category text check (category in ('onam_spot','flower_shop','event')),
  name text not null,
  description text,
  lat double precision,
  lng double precision,
  photo_url text,
  event_date timestamptz,
  submitted_by uuid references profiles(id),
  status text default 'active' check (status in ('active','hidden','pending')),
  created_at timestamptz default now()
);

-- Flower-specific extra data (1:1 with locations where category='flower_shop')
create table flower_shop_details (
  location_id int references locations(id) primary key,
  flower_types text[],
  last_price_update timestamptz default now()
);

-- Upvotes / spam reports for moderation
create table location_flags (
  id serial primary key,
  location_id int references locations(id),
  flagged_by uuid references profiles(id),
  flag_type text check (flag_type in ('upvote','spam')),
  created_at timestamptz default now()
);

-- Sadya menu static reference
create table sadya_dishes (
  id serial primary key,
  dish_name text not null,
  category text,
  qty_per_person numeric,
  unit text
);
```

### Row Level Security (RLS) Examples

```sql
alter table stock_reports enable row level security;

create policy "one_report_per_hour"
on stock_reports for insert
with check (
  not exists (
    select 1 from stock_reports sr
    where sr.outletid = stock_reports.outletid
      and sr.item_name = stock_reports.item_name
      and sr.reported_by = auth.uid()
      and sr.reported_at > now() - interval '1 hour'
  )
);

alter table locations enable row level security;
create policy "auto_hide_after_flags"
on locations for select
using (
  status = 'active'
  or submitted_by = auth.uid()
);
```

---

## 6. Frontend Modules

- `map/` — Leaflet base map, layer control (outlets / spots / flower shops), marker clustering, geolocation "nearest to me"
- `stores/` — Outlet list + detail view, stock report form, price browser (tabs for Subsidy / Free Sale / Bulk / K Store / Maveli)
- `spots/` — Onam spot submission form, event calendar view, photo upload (Supabase Storage)
- `flower/` — Flower shop list/map layer, price report form
- `sadya/` — Guest count input, dish list with scaled quantities, estimated total cost using `monthly_price_entries`
- `countdown/` — Static 10-entry ritual data (Atham → Thiruvonam), live countdown component, push notification trigger
- `auth/` — Supabase Auth (email OTP or anonymous session) for rate-limiting submissions
- `shared/` — API client (Supabase JS SDK), moderation utils, distance calculation (Haversine)

---

## 7. Data Sourcing Checklist

- [ ] Sync `/api/outlets?limit=9999` into `outlets` table (direct API call)
- [ ] Sync `/api/price-list-types` into `price_list_types` table
- [ ] Sync `/api/price-list` per `price_list_type_id` (1-5) into `monthly_price_entries`, keep historical snapshots by year/month
- [ ] Default UI view: Type 5 (Maveli Price List) with tabs for the other four types
- [ ] Compile 10-day Atham-to-Thiruvonam ritual text (static, cross-check multiple festival guides)
- [ ] Compile standard 26-dish Sadya menu with typical per-person quantities
- [ ] (Optional) IMD/OpenWeather API key for rain alert banner
- [ ] (Optional) Boat race fixed dates (Nehru Trophy, Aranmula) as static calendar entries

---

## 8. Moderation & Anti-Spam Design

- Rate-limit crowdsourced submissions (stock reports, spot pins, flower price updates) to one per user per target per hour via RLS
- Auto-hide `locations` rows after N spam flags (configurable threshold, e.g. 3)
- Require Supabase Auth (even anonymous/device-based) before any write operation
- Show "last updated" timestamps on all crowdsourced data so users can judge freshness

---

## 9. Launch Checklist

- [ ] Seed database with initial outlets + official prices before opening crowdsourcing features
- [ ] Moderation thresholds tested (auto-hide at 3 spam flags)
- [ ] Rate-limiting tested (RLS policies working as expected)
- [ ] PWA installable on Android + iOS (manifest.json, service worker for offline map shell)
- [ ] Push notifications tested end-to-end (OneSignal)
- [ ] Analytics added to track which module gets most engagement post-launch
- [ ] Deployed and shared with initial user group for feedback before wider release
