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
export const filterDailyForecastsByDateRange = (daily, startDateObj, endDateObj, verbose = false) => {
  const startUTC = Date.UTC(
    startDateObj.getUTCFullYear(),
    startDateObj.getUTCMonth(),
    startDateObj.getUTCDate()
  );

  const endUTC = Date.UTC(
    endDateObj.getUTCFullYear(),
    endDateObj.getUTCMonth(),
    endDateObj.getUTCDate()
  );

  return daily.filter(day => {
    const dayUTC = Date.UTC(
      new Date(day.dt * 1000).getUTCFullYear(),
      new Date(day.dt * 1000).getUTCMonth(),
      new Date(day.dt * 1000).getUTCDate()
    );

    const ok = dayUTC >= startUTC && dayUTC <= endUTC;

    if (verbose) {
      console.log(
        ok
          ? `✓ Including: ${new Date(dayUTC).toISOString().slice(0, 10)}`
          : `✗ Excluding: ${new Date(dayUTC).toISOString().slice(0, 10)}`
      );
    }

    return ok;
  });
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

/**
 * Returns the difference in full days between the given date and today.
 * 
 * - Normalizes both dates to local midnight
 * - Prevents timezone issues
 * - Prevents fractional values (always integer)
 * - Ensures consistent behavior for categorizing API usage
 */
export function getDaysFromToday(dateInput, todayInput = new Date()) {
  const date = new Date(dateInput);
  const today = new Date(todayInput);

  // Normalize both dates to local midnight
  date.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  // Return number of days (float)
  return (date - today) / 86400000;
}



