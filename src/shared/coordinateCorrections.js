// Coordinate corrections for outlets with invalid data in the external API
// These overrides fix incorrect or missing coordinates from supplycokerala.com

export const COORDINATE_CORRECTIONS = {
  // PALERI TOWN MAVELI STORE - Kozhikode
  // Issue: Longitude value duplicated in latitude field (75.72086300, 75.76133200)
  // Correct: Paleri is in Kozhikode district
  1632: {
    latitude: 11.8364,
    longitude: 75.7608,
    source: 'Corrected - Paleri, Kozhikode'
  },
  
  // POOVATHOOR MAVELI STORE - Thiruvananthapuram  
  // Issue: Wrong longitude (8.61325300, 72.96833900) - should be ~76-77°E
  // Correct: Poovattoor is in Kollam district (near Thiruvananthapuram border)
  118: {
    latitude: 9.0560,
    longitude: 76.7524,
    source: 'Corrected - Poovattoor, Kollam'
  },
  
  // VANCHIYOOR MAVELI STORE - Thiruvananthapuram
  // Issue: Missing coordinates (0.00000000, 0.00000000)
  // Correct: Vanchiyoor is in central Thiruvananthapuram city
  169: {
    latitude: 8.5074,
    longitude: 76.9487,
    source: 'Corrected - Vanchiyoor, Thiruvananthapuram'
  },
  
  // KOLLAM CONTONMENT PETROL BUNK
  // Issue: Missing coordinates (0.00000000, 0.00000000)
  // Correct: Cantonment Junction is near Kollam Railway Station
  2241: {
    latitude: 8.8812,
    longitude: 76.5991,
    source: 'Corrected - Cantonment, Kollam'
  }
}

/**
 * Apply coordinate corrections to outlets data
 * @param {Array} outlets - Array of outlet objects from API
 * @returns {Array} - Outlets with corrected coordinates
 */
export function applyCoordinateCorrections(outlets) {
  if (!Array.isArray(outlets)) return outlets
  
  return outlets.map(outlet => {
    const correction = COORDINATE_CORRECTIONS[outlet.outlet_id]
    
    if (correction) {
      return {
        ...outlet,
        latitude: correction.latitude,
        longitude: correction.longitude,
        _corrected: true,
        _correctionSource: correction.source
      }
    }
    
    return outlet
  })
}
