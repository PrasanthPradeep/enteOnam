import { supabase } from './supabase.js'

// Shared data access for crowdsourced locations (spots + flower shops).
// Data lives in Supabase so everyone sees the same contributions.

const MAP_TO_DB = {
  onam_spot: 'onam_spot',
  flower_shop: 'flower_shop',
}

export async function fetchLocations(category) {
  if (!supabase) return []

  let query = supabase
    .from('locations')
    .select('*')
    .eq('category', MAP_TO_DB[category])
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  // Include flower prices for flower shops
  if (category === 'flower_shop') {
    query = supabase
      .from('locations')
      .select('*, flower_shop_details(prices)')
      .eq('category', 'flower_shop')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
  }

  const { data, error } = await query
  if (error) {
    console.error(`Error fetching ${category}:`, error)
    return []
  }
  return data || []
}

export async function insertLocation({ category, subCategory, name, description, lat, lng, photoUrl, prices }) {
  if (!supabase) throw new Error('Database not configured')
  const { data, error } = await supabase
    .from('locations')
    .insert({
      category: MAP_TO_DB[category],
      sub_category: subCategory || null,
      name,
      description: description || null,
      lat,
      lng,
      photo_url: photoUrl || null,
      status: 'active',
    })
    .select()
    .single()

  if (error) throw error
  // If prices were provided, attempt to save flower details.
  // If saving details fails, remove the just-created location to avoid orphan rows.
  if (prices && Object.keys(prices).length > 0) {
    const res = await insertFlowerDetails(data.id, prices)
    if (res && res.error) {
      try {
        await supabase.from('locations').delete().eq('id', data.id)
      } catch (delErr) {
        console.error('Failed to rollback location after flower details error:', delErr)
      }
      throw res.error
    }
  }
  return data
}

export async function insertFlowerDetails(locationId, prices) {
  if (!supabase) return { data: null, error: new Error('Database not configured') }
  const payload = {
    location_id: locationId,
    // Save the raw prices JSON and also populate the `flower_types` array
    // from the keys of the prices object so the `flower_types` column
    // is not left NULL when the client provided prices.
    prices: prices && Object.keys(prices).length > 0 ? prices : null,
    flower_types: prices && Object.keys(prices).length > 0 ? Object.keys(prices) : null,
  }
  const { data, error } = await supabase
    .from('flower_shop_details')
    .insert(payload)
    .select()
    .single()
  if (error) console.error('Error saving flower details:', error)
  return { data, error }
}
