/**
 * Validates location input to ensure it's in a valid format
 * Supports: ZIP Code/Postal Code, GPS Coordinates, City/Town names, Landmarks
 * 
 * @param {string} location - The location string to validate
 * @returns {Object} - { isValid: boolean, error: string, normalizedLocation: string, locationType: string }
 */
export function validateLocation(location) {
  if (!location || typeof location !== 'string') {
    return {
      isValid: false,
      error: 'Location is required',
      normalizedLocation: null,
      locationType: null
    };
  }

  const trimmedLocation = location.trim();

  if (trimmedLocation.length === 0) {
    return {
      isValid: false,
      error: 'Location cannot be empty',
      normalizedLocation: null,
      locationType: null
    };
  }

  // Check for GPS coordinates format (lat,lon or lat, lon)
  // Examples: "40.7128,-74.0060" or "40.7128, -74.0060" or "40.7128°N, 74.0060°W"
  const gpsPattern = /^-?\d+\.?\d*\s*,\s*-?\d+\.?\d*/;
  if (gpsPattern.test(trimmedLocation)) {
    // Extract and normalize coordinates
    const coords = trimmedLocation.split(',').map(coord => coord.trim().replace(/[°NSWE]/g, ''));
    if (coords.length === 2) {
      const lat = parseFloat(coords[0]);
      const lon = parseFloat(coords[1]);
      
      if (lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
        return {
          isValid: true,
          error: null,
          normalizedLocation: `${lat},${lon}`,
          locationType: 'GPS_COORDINATES'
        };
      } else {
        return {
          isValid: false,
          error: 'Invalid GPS coordinates. Latitude must be between -90 and 90, longitude between -180 and 180',
          normalizedLocation: null,
          locationType: null
        };
      }
    }
  }

  // Check for city/town/landmark names FIRST (letters, spaces, hyphens, apostrophes, commas)
  // Examples: "New York", "Los Angeles", "St. Louis", "São Paulo", "Eiffel Tower", "London"
  // This check comes before postal codes to avoid misclassifying city names
  const namePattern = /^[A-Za-zÀ-ÿ\s'.,-]{2,100}$/;
  if (namePattern.test(trimmedLocation) && !/\d/.test(trimmedLocation)) {
    // If it's all letters (no numbers), it's definitely a city/landmark, not a postal code
    const landmarkKeywords = ['tower', 'bridge', 'monument', 'statue', 'palace', 'cathedral', 'museum', 'park', 'plaza', 'square'];
    const lowerLocation = trimmedLocation.toLowerCase();
    const isLandmark = landmarkKeywords.some(keyword => lowerLocation.includes(keyword));
    
    return {
      isValid: true,
      error: null,
      normalizedLocation: trimmedLocation.replace(/\s+/g, ' ').trim(),
      locationType: isLandmark ? 'LANDMARK' : 'CITY'
    };
  }

  // Check for ZIP/Postal Code (numeric, 4-10 digits, may include spaces or hyphens)
  // Examples: "10001", "90210-1234"
  const zipPattern = /^[A-Z0-9\s-]{4,10}$/i;
  if (zipPattern.test(trimmedLocation) && /^\d+/.test(trimmedLocation)) {
    // Check if it's mostly numeric (ZIP code)
    const numericCount = (trimmedLocation.match(/\d/g) || []).length;
    if (numericCount >= 4) {
      return {
        isValid: true,
        error: null,
        normalizedLocation: trimmedLocation.replace(/\s+/g, ' ').trim(),
        locationType: 'ZIP_CODE'
      };
    }
  }

  // Check for alphanumeric postal codes (e.g., UK, Canadian postal codes)
  // Examples: "SW1A 1AA", "K1A 0B1"
  // Must have BOTH letters AND numbers in postal code format
  const postalCodePattern = /^[A-Z0-9\s-]{5,10}$/i;
  if (postalCodePattern.test(trimmedLocation) && /[A-Z]/i.test(trimmedLocation) && /\d/.test(trimmedLocation)) {
    // Additional check: postal codes typically have numbers and letters mixed
    // Not just letters (which would be a city name)
    const hasNumbers = /\d/.test(trimmedLocation);
    const hasLetters = /[A-Za-z]/.test(trimmedLocation);
    
    if (hasNumbers && hasLetters) {
      return {
        isValid: true,
        error: null,
        normalizedLocation: trimmedLocation.replace(/\s+/g, ' ').trim().toUpperCase(),
        locationType: 'POSTAL_CODE'
      };
    }
  }

  // Check for city/town/landmark names (if it has numbers but didn't match postal code patterns)
  // Examples: "New York", "Los Angeles", "St. Louis", "São Paulo", "Eiffel Tower"
  if (namePattern.test(trimmedLocation)) {
    const landmarkKeywords = ['tower', 'bridge', 'monument', 'statue', 'palace', 'cathedral', 'museum', 'park', 'plaza', 'square'];
    const lowerLocation = trimmedLocation.toLowerCase();
    const isLandmark = landmarkKeywords.some(keyword => lowerLocation.includes(keyword));
    
    return {
      isValid: true,
      error: null,
      normalizedLocation: trimmedLocation.replace(/\s+/g, ' ').trim(),
      locationType: isLandmark ? 'LANDMARK' : 'CITY'
    };
  }

  // If none of the patterns match, it might still be valid (let backend handle it)
  // But provide a warning
  if (trimmedLocation.length > 100) {
    return {
      isValid: false,
      error: 'Location is too long (maximum 100 characters)',
      normalizedLocation: null,
      locationType: null
    };
  }

  // Allow other formats but normalize (could be country, address, etc.)
  return {
    isValid: true,
    error: null,
    normalizedLocation: trimmedLocation.replace(/\s+/g, ' ').trim(),
    locationType: 'OTHER'
  };
}

