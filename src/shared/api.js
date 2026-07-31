const API_BASE = '/api'

async function fetchReal(path, params = {}) {
  const url = new URL(API_BASE + path, window.location.origin)
  Object.entries(params).forEach(([k, v]) => {
    if (v != null && v !== '') url.searchParams.set(k, v)
  })
  
  console.log('[API] Fetching:', url.toString())
  const res = await fetch(url)
  
  if (!res.ok) {
    console.error('[API] Error:', res.status, res.statusText)
    throw new Error(`Supplyco API error: ${res.status}`)
  }
  
  const json = await res.json()
  console.log('[API] Response:', json)
  
  if (json && Array.isArray(json.data) && json.data.length > 0) {
    console.log('[API] Success:', json.data.length, 'items')
    return json.data
  }
  
  throw new Error('Supplyco API returned no data')
}

export async function getAllOutlets() {
  return fetchReal('/outlets', { limit: 9999 })
}

export async function getPriceListTypes() {
  const data = await fetchReal('/price-list-types', { limit: 1000, status: 1 })
  return { data }
}

export async function getAllPrices(typeId, year, month) {
  const now = new Date()
  const queryYear = year || now.getFullYear()
  const queryMonth = month || now.getMonth() + 1
  
  return fetchReal('/price-list', {
    page: 1,
    limit: 1000,
    status: 1,
    price_list_type_id: typeId,
    year: queryYear,
    month: queryMonth,
  })
}
