const DATA_BASE = '/data'

export async function getAllOutlets() {
  const res = await fetch(DATA_BASE + '/outlets.json')
  if (!res.ok) throw new Error('Failed to load outlets')
  return res.json()
}

export async function getPriceListTypes() {
  const res = await fetch(DATA_BASE + '/price_list_types.json')
  if (!res.ok) throw new Error('Failed to load price list types')
  const data = await res.json()
  return { data }
}

export async function getAllPrices(typeId) {
  const res = await fetch(DATA_BASE + '/price_lists.json')
  if (!res.ok) throw new Error('Failed to load prices')
  const all = await res.json()
  const filtered = typeId ? all.filter(p => String(p.price_list_type_id) === String(typeId)) : all
  return { data: filtered }
}
