#!/usr/bin/env python3
"""Sync Supplyco Kerala public API data.
Usage: python scripts/sync_supplyco.py
"""

import os, sys, json, time
from datetime import datetime
from urllib.request import Request, urlopen
from urllib.error import HTTPError

BASE = "https://supplycokerala.com/api"
HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(os.path.dirname(HERE), "data")
DELAY = 0.3

def fetch(path, params=None):
    url = f"{BASE}{path}"
    if params:
        qs = "&".join(f"{k}={v}" for k, v in params.items() if v is not None)
        url += "?" + qs
    req = Request(url, headers={"User-Agent": "EnteOnam/1.0"})
    try:
        with urlopen(req, timeout=30) as r:
            return json.loads(r.read())
    except HTTPError as e:
        print(f"  HTTP {e.code} for {url}")
        return None

def save(name, data):
    os.makedirs(DATA, exist_ok=True)
    path = os.path.join(DATA, name)
    with open(path, "w") as f:
        json.dump(data, f, indent=2, default=str)
    print(f"  Saved {len(data)} records -> {path}")

def sync_outlets():
    print("[outlets]")
    items = []
    page = 1
    while True:
        print(f"  page {page}...", end=" ")
        resp = fetch("/outlets", {"limit": 1000, "page": page})
        if not resp or not resp.get("data"):
            break
        items.extend(resp["data"])
        total = resp["pagination"]["total"]
        print(f"got {len(resp['data'])} (total {total})")
        if len(items) >= total:
            break
        page += 1
        time.sleep(DELAY)
    save("outlets.json", items)
    return items

def sync_price_list_types():
    print("[price-list-types]")
    resp = fetch("/price-list-types", {"limit": 1000, "status": 1})
    items = (resp or {}).get("data", [])
    save("price_list_types.json", items)
    return items

def sync_price_lists(types):
    print("[price-lists]")
    now = datetime.now()
    year, month = now.year, now.month
    all_items = []
    for pt in types:
        pid = pt["id"]
        name = pt["name"][:40]
        print(f"  type_id={pid} ({name})...")
        page = 1
        while True:
            resp = fetch("/price-list", {
                "page": page, "limit": 100,
                "status": 1, "price_list_type_id": pid,
                "year": year, "month": month,
            })
            if not resp or not resp.get("data"):
                break
            for item in resp["data"]:
                item["price_list_type_id"] = pid
                item["year"] = year
                item["month"] = month
            all_items.extend(resp["data"])
            pp = resp["pagination"]
            print(f"    page {page}: got {len(resp['data'])} (total {pp['total']})")
            if page >= pp["totalPages"]:
                break
            page += 1
            time.sleep(DELAY)
        time.sleep(DELAY)
    save("price_lists.json", all_items)
    return all_items

def main():
    t1 = time.time()
    outlets = sync_outlets()
    types = sync_price_list_types()
    prices = sync_price_lists(types)
    elapsed = time.time() - t1
    print(f"\nDone in {elapsed:.1f}s: {len(outlets)} outlets, {len(types)} types, {len(prices)} prices")

if __name__ == "__main__":
    main()
