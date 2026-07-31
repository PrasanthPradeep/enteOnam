// Check for outlets with invalid coordinates
// Kerala bounds: lat 8.2-12.8, lng 74.8-77.4

const KERALA_BOUNDS = {
  minLat: 8.2,
  maxLat: 12.8,
  minLng: 74.8,
  maxLng: 77.4
}

async function checkCoordinates() {
  try {
    const response = await fetch('https://supplycokerala.com/api/outlets?limit=9999')
    const data = await response.json()
    
    if (!data.data || !Array.isArray(data.data)) {
      console.error('Invalid response format')
      return
    }
    
    const outlets = data.data
    console.log(`\nChecking ${outlets.length} outlets...\n`)
    
    const invalid = outlets.filter(outlet => {
      if (!outlet.latitude || !outlet.longitude) return false
      
      const lat = parseFloat(outlet.latitude)
      const lng = parseFloat(outlet.longitude)
      
      return lat < KERALA_BOUNDS.minLat || 
             lat > KERALA_BOUNDS.maxLat || 
             lng < KERALA_BOUNDS.minLng || 
             lng > KERALA_BOUNDS.maxLng
    })
    
    if (invalid.length === 0) {
      console.log('✓ All outlets have valid Kerala coordinates')
      return
    }
    
    console.log(`Found ${invalid.length} outlets with invalid coordinates:\n`)
    
    invalid.forEach(outlet => {
      console.log(`Outlet ID: ${outlet.outlet_id}`)
      console.log(`Name: ${outlet.name}`)
      console.log(`District: ${outlet.district_name}`)
      console.log(`Coordinates: ${outlet.latitude}, ${outlet.longitude}`)
      console.log(`Address: ${outlet.address1}`)
      console.log('---')
    })
    
  } catch (error) {
    console.error('Error:', error.message)
  }
}

checkCoordinates()
