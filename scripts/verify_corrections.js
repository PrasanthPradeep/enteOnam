// Verify coordinate corrections are working properly
import { COORDINATE_CORRECTIONS, applyCoordinateCorrections } from '../src/shared/coordinateCorrections.js'

const KERALA_BOUNDS = {
  minLat: 8.2,
  maxLat: 12.8,
  minLng: 74.8,
  maxLng: 77.4
}

function isValidKeralaCoodinates(lat, lng) {
  return lat >= KERALA_BOUNDS.minLat && 
         lat <= KERALA_BOUNDS.maxLat && 
         lng >= KERALA_BOUNDS.minLng && 
         lng <= KERALA_BOUNDS.maxLng
}

async function verifyCorrections() {
  try {
    console.log('Fetching outlets from API...\n')
    const response = await fetch('https://supplycokerala.com/api/outlets?limit=9999')
    const data = await response.json()
    
    if (!data.data || !Array.isArray(data.data)) {
      console.error('Invalid response format')
      return
    }
    
    const outlets = data.data
    console.log(`Total outlets: ${outlets.length}\n`)
    
    // Apply corrections
    const corrected = applyCoordinateCorrections(outlets)
    const correctedOutlets = corrected.filter(o => o._corrected)
    
    console.log(`✓ Applied ${correctedOutlets.length} corrections\n`)
    console.log('Corrected outlets:\n')
    
    correctedOutlets.forEach(outlet => {
      const original = outlets.find(o => o.outlet_id === outlet.outlet_id)
      const isValid = isValidKeralaCoodinates(outlet.latitude, outlet.longitude)
      
      console.log(`Outlet ID: ${outlet.outlet_id}`)
      console.log(`Name: ${outlet.name}`)
      console.log(`District: ${outlet.district_name}`)
      console.log(`Original: ${original.latitude}, ${original.longitude}`)
      console.log(`Corrected: ${outlet.latitude}, ${outlet.longitude}`)
      console.log(`Valid: ${isValid ? '✓ YES' : '✗ NO'}`)
      console.log(`Source: ${outlet._correctionSource}`)
      console.log('---')
    })
    
    // Check for remaining invalid coordinates
    const stillInvalid = corrected.filter(outlet => {
      if (!outlet.latitude || !outlet.longitude) return false
      return !isValidKeralaCoodinates(outlet.latitude, outlet.longitude)
    })
    
    if (stillInvalid.length > 0) {
      console.log(`\n⚠ Warning: ${stillInvalid.length} outlets still have invalid coordinates`)
    } else {
      console.log('\n✓ All outlets with coordinates now have valid Kerala coordinates')
    }
    
  } catch (error) {
    console.error('Error:', error.message)
  }
}

verifyCorrections()
