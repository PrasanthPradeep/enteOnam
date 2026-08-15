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

export async function insertLocation({ category, subCategory, name, description, lat, lng, photoUrl }) {
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
  return data
}

export async function insertFlowerDetails(locationId, prices) {
  if (!supabase) return
  const { error } = await supabase
    .from('flower_shop_details')
    .insert({
      location_id: locationId,
      prices: prices && Object.keys(prices).length > 0 ? prices : null,
    })
  if (error) console.error('Error saving flower details:', error)
}
