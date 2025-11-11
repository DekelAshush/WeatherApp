/**
 * Utility functions for weather data processing
 */

/**
 * Parse a date string (YYYY-MM-DD) into a UTC Date object
 * @param {string} dateString - Date string in YYYY-MM-DD format
 * @returns {Date} UTC Date object
 */
export const parseUTCDate = (dateString) => {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
};

/**
 * Filter daily weather forecasts by date range
 * @param {Array} dailyForecasts - Array of daily forecast objects from weather API
 * @param {Date} startDateObj - UTC Date object for start date
 * @param {Date} endDateObj - UTC Date object for end date
 * @param {boolean} verbose - Whether to log filtering details (default: false)
 * @returns {Array} Filtered array of daily forecasts
 */
export const filterDailyForecastsByDateRange = (dailyForecasts, startDateObj, endDateObj, verbose = false) => {
  if (!dailyForecasts || !Array.isArray(dailyForecasts)) {
    return [];
  }

  const filteredDaily = dailyForecasts.filter(day => {
    // Convert UTC timestamp to UTC date
    const dayDate = new Date(day.dt * 1000);
    
    // Get UTC date components for comparison
    const dayYear = dayDate.getUTCFullYear();
    const dayMonth = dayDate.getUTCMonth();
    const dayDay = dayDate.getUTCDate();
    
    const startYear = startDateObj.getUTCFullYear();
    const startMonth = startDateObj.getUTCMonth();
    const startDay = startDateObj.getUTCDate();
    
    const endYear = endDateObj.getUTCFullYear();
    const endMonth = endDateObj.getUTCMonth();
    const endDay = endDateObj.getUTCDate();
    
    // Check if day is within range (inclusive of both start and end)
    // Day must be >= start date AND <= end date
    const isOnOrAfterStart = (dayYear > startYear) || 
                            (dayYear === startYear && dayMonth > startMonth) ||
                            (dayYear === startYear && dayMonth === startMonth && dayDay >= startDay);
    
    const isOnOrBeforeEnd = (dayYear < endYear) ||
                           (dayYear === endYear && dayMonth < endMonth) ||
                           (dayYear === endYear && dayMonth === endMonth && dayDay <= endDay);
    
    const included = isOnOrAfterStart && isOnOrBeforeEnd;
    
    if (verbose && included) {
      console.log(`  ✓ Including: ${dayYear}-${String(dayMonth + 1).padStart(2, '0')}-${String(dayDay).padStart(2, '0')} UTC (timestamp: ${day.dt}, local: ${dayDate.toLocaleString()})`);
    } else if (verbose) {
      console.log(`  ✗ Excluding: ${dayYear}-${String(dayMonth + 1).padStart(2, '0')}-${String(dayDay).padStart(2, '0')} UTC (afterStart: ${isOnOrAfterStart}, beforeEnd: ${isOnOrBeforeEnd})`);
    }
    
    return included;
  });

  return filteredDaily;
};

/**
 * Calculate average temperature from daily forecasts
 * @param {Array} dailyForecasts - Array of daily forecast objects
 * @param {number|null} fallbackTemp - Fallback temperature if no daily data (e.g., current temp)
 * @returns {number|null} Average temperature or null if cannot be calculated
 */
export const calculateAverageTemperature = (dailyForecasts, fallbackTemp = null) => {
  if (!dailyForecasts || dailyForecasts.length === 0) {
    // Fallback to provided temperature if no daily data
    return fallbackTemp !== null ? parseFloat(fallbackTemp.toFixed(2)) : null;
  }

  const temperatures = dailyForecasts
    .map(day => day.temp?.day)
    .filter(temp => temp !== null && temp !== undefined);
  
  if (temperatures.length > 0) {
    const sum = temperatures.reduce((acc, temp) => acc + temp, 0);
    return parseFloat((sum / temperatures.length).toFixed(2));
  }
  
  // Fallback to provided temperature if no valid daily temps
  return fallbackTemp !== null ? parseFloat(fallbackTemp.toFixed(2)) : null;
};

/**
 * Format date object to YYYY-MM-DD string
 * @param {Date} dateObj - Date object to format
 * @returns {string} Formatted date string (YYYY-MM-DD)
 */
export const formatDateToString = (dateObj) => {
  const year = dateObj.getUTCFullYear();
  const month = String(dateObj.getUTCMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Format a date value (Date object, ISO string, or YYYY-MM-DD string) to YYYY-MM-DD string
 * @param {Date|string} dateValue - Date value to format
 * @returns {string|null} Formatted date string (YYYY-MM-DD) or null if invalid
 */
export const formatDateValue = (dateValue) => {
  if (!dateValue) return null;
  
  // If it's already a YYYY-MM-DD string, return it
  if (typeof dateValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
    return dateValue;
  }
  
  // If it's a Date object or ISO string, format it
  const date = dateValue instanceof Date ? dateValue : new Date(dateValue);
  
  if (isNaN(date.getTime())) {
    return null;
  }
  
  return formatDateToString(date);
};

