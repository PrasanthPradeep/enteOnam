const API_BASE = "/api";

async function fetchJSON(path, params = {}) {
  const qs = new URLSearchParams(
    Object.entries(params).filter(([_, v]) => v != null)
  ).toString();
  const url = API_BASE + path + (qs ? "?" + qs : "");
  const res = await fetch(url);
  if (!res.ok) throw new Error("API " + res.status + ": " + url);
  return res.json();
}

export async function getOutlets(page = 1, limit = 1000) {
  return fetchJSON("/outlets", { page, limit });
}

export async function getAllOutlets() {
  let page = 1, all = [];
  while (true) {
    const resp = await getOutlets(page);
    all.push(...(resp.data || []));
    if (all.length >= (resp.pagination?.total || 0)) break;
    page++;
  }
  return all;
}

export async function getPriceListTypes() {
  return fetchJSON("/price-list-types", { limit: 1000, status: 1 });
}

export async function getPriceLists(typeId, year, month, page = 1, limit = 100) {
  return fetchJSON("/price-list", {
    page, limit, status: 1,
    price_list_type_id: typeId,
    year, month,
  });
}

export async function getAllPrices(typeId, year, month) {
  let page = 1, all = [];
  while (true) {
    const resp = await getPriceLists(typeId, year, month, page);
    all.push(...(resp.data || []));
    if (page >= (resp.pagination?.totalPages || 0)) break;
    page++;
  }
  return all;
}
