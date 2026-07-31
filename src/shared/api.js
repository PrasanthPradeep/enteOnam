const API_BASE = '/api'
const DATA_BASE = '/data'

async function fetchReal(path, params = {}) {
  const url = new URL(API_BASE + path)
  Object.entries(params).forEach(([k, v]) => {
    if (v != null && v !== '') url.searchParams.set(k, v)
  })
  const res = await fetch(url)
  if (!res.ok) throw new Error('Supplyco API error: ' + res.status)
  const json = await res.json()
  if (json && Array.isArray(json.data) && json.data.length > 0) return json.data
  throw new Error('Supplyco API returned no data')
}

async function fetchFallback(path) {
  const res = await fetch(DATA_BASE + path)
  if (!res.ok) throw new Error('Failed to load fallback ' + path)
  return res.json()
}

export async function getAllOutlets() {
  try {
    return await fetchReal('/outlets', { limit: 9999 })
  } catch {
    return fetchFallback('/outlets.json')
  }
}

export async function getPriceListTypes() {
  try {
    const data = await fetchReal('/price-list-types', { limit: 1000, status: 1 })
    return { data }
  } catch {
    const data = await fetchFallback('/price_list_types.json')
    return { data }
  }
}

export async function getAllPrices(typeId, year, month) {
  const now = new Date()
  const queryYear = year || now.getFullYear()
  const queryMonth = month || now.getMonth() + 1
  try {
    return await fetchReal('/price-list', {
      page: 1,
      limit: 1000,
      status: 1,
      price_list_type_id: typeId,
      year: queryYear,
      month: queryMonth,
    })
  } catch {
    const all = await fetchFallback('/price_lists.json')
    return typeId ? all.filter(p => String(p.price_list_type_id) === String(typeId)) : all
  }
}
