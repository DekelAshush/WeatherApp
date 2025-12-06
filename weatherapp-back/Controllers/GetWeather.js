import { db } from '../config/database.js';
import { parseUTCDate, filterDailyForecastsByDateRange, calculateAverageTemperature, formatDateToString } from '../utils/weatherUtils.js';

/**
 * Controller for handling weather data requests
 * Receives location, locationType, startDate, and daysAhead (number of days to retrieve)
 */
export const getWeather = async (req, res) => {
  try {
    const { location, locationType, startDate, daysAhead, temperatureUnit } = req.body;

    // Validate required fields
    if (!location || !startDate) {
      return res.status(400).json({
        success: false,
        message: 'Location and start date are required'
      });
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(startDate)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid start date format. Expected YYYY-MM-DD'
      });
    }

    // Validate daysAhead (must be between 1 and 5)
    const days = parseInt(daysAhead, 10);
    if (isNaN(days) || days < 1 || days > 5) {
      return res.status(400).json({
        success: false,
        message: 'daysAhead must be a number between 1 and 5'
      });
    }

    // Calculate end date based on startDate + (daysAhead - 1) days
    // If daysAhead is 5, that means: startDate + 4 days = 5 total days (startDate + 4 days ahead)
    const startDateObj = parseUTCDate(startDate);
    const endDateObj = new Date(startDateObj);
    endDateObj.setUTCDate(endDateObj.getUTCDate() + (days - 1)); // daysAhead - 1 to get the last day
    
    // Format end date as YYYY-MM-DD using utility function
    const endDate = formatDateToString(endDateObj);

    // Log the location type and details
    console.log('='.repeat(50));
    console.log('Weather request received:');
    console.log('  Location:', location);
    console.log('  Location Type:', locationType || 'UNKNOWN');
    console.log('  Start Date:', startDate);
    console.log('  Days Ahead:', days);
    console.log('  Calculated End Date:', endDate);
    console.log('  Temperature Unit:', temperatureUnit || 'celsius');
    console.log('='.repeat(50));

    // Log location type specific information
    const locationTypeMap = {
      'GPS_COORDINATES': 'GPS Coordinates (lat,lon)',
      'ZIP_CODE': 'ZIP Code (US numeric postal code)',
      'POSTAL_CODE': 'Postal Code (International alphanumeric)',
      'CITY': 'City/Town name',
      'LANDMARK': 'Landmark or Point of Interest',
      'OTHER': 'Other format (country, address, etc.)',
      'UNKNOWN': 'Unknown format'
    };

    const typeDescription = locationTypeMap[locationType] || `Unknown type: ${locationType}`;
    console.log(`  Input Type: ${typeDescription}`);

    // Get API keys from environment variables
    const apiKey = process.env.WEATHER_API_KEY;
    const googleMapsApiKey = process.env.GOOGLE_API_KEY;
    
    // Log API key status 
    if (apiKey && apiKey.trim().length > 0) {
      console.log('  Weather API Key: Configured');
    } else {
      console.log('  Weather API Key: NOT CONFIGURED - Please add WEATHER_API_KEY to .env file');
      return res.status(400).json({
        success: false,
        message: 'Weather API key is not configured. Please add WEATHER_API_KEY to .env file'
      });
    }

    if (googleMapsApiKey && googleMapsApiKey.trim().length > 0) {
      console.log('  Google Maps API Key: Configured');
    } else {
      console.log('  Google Maps API Key: NOT CONFIGURED - Please add GOOGLE_API_KEY to .env file');
      return res.status(400).json({
        success: false,
        message: 'Google Maps API key is not configured. Please add GOOGLE_API_KEY to .env file'
      });
    }

    // Validate temperature unit
    const validUnits = ['celsius', 'fahrenheit'];
    const unit = validUnits.includes(temperatureUnit) ? temperatureUnit : 'celsius';
    const unitsParam = unit === 'fahrenheit' ? 'imperial' : 'metric';

    // Declare variables outside try block
    let lat, lon, placeName, country, state;

    // Get coordinates based on location type
    try {
      //check if locationType is GPS_COORDINATES

      if (locationType === 'GPS_COORDINATES') {
        // GPS coordinates already have lat,lon - extract directly
        const coords = location.split(',');
        lat = parseFloat(coords[0].trim());
        lon = parseFloat(coords[1].trim());
        
        console.log(`  Using GPS coordinates: lat=${lat}, lon=${lon}`);
      //check if locationType is ZIP_CODE or POSTAL_CODE
      
      } else if (locationType === 'ZIP_CODE' || locationType === 'POSTAL_CODE') {
        // Use ZIP code geocoding API
        console.log(`  Geocoding ZIP/Postal code: ${location}`);
        const geoUrl = `http://api.openweathermap.org/geo/1.0/zip?zip=${encodeURIComponent(location)}&appid=${apiKey}`;
        console.log(`  Geocoding API URL: ${geoUrl}`);
        const geoResponse = await fetch(geoUrl);
        
        if (!geoResponse.ok) {
          throw new Error(`Geocoding API error: ${geoResponse.status}`);
        }
        
        const geoData = await geoResponse.json();
        if (geoData.lat && geoData.lon) {
          lat = geoData.lat;
          lon = geoData.lon;
          placeName = geoData.name || null;
          country = geoData.country || null;
          console.log(`  Geocoded to: lat=${lat}, lon=${lon}, name=${placeName || 'N/A'}, country=${country || 'N/A'}`);
        } else {
          throw new Error('Could not get coordinates from ZIP code');
        }
      } else if (locationType === 'LANDMARK') {
        // Use Google Maps Geocoding API for LANDMARKS only
        console.log(`  Geocoding landmark with Google Maps: ${location}`);
        const geoUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(location)}&key=${googleMapsApiKey}`;
        
        const geoResponse = await fetch(geoUrl);
        
        if (!geoResponse.ok) {
          throw new Error(`Google Maps Geocoding API error: ${geoResponse.status}`);
        }
        
        const geoData = await geoResponse.json();
        if (geoData.status === 'OK' && geoData.results && geoData.results.length > 0) {
          const result = geoData.results[0];
          lat = result.geometry.location.lat;
          lon = result.geometry.location.lng;
          
          // Set placeName to the location input
          placeName = location;
          
          // Extract country from address_components
          if (result.address_components && Array.isArray(result.address_components)) {
            const countryComponent = result.address_components.find(component => 
              component.types && component.types.includes('country')
            );
            if (countryComponent) {
              country = countryComponent.short_name || countryComponent.long_name || null;
            }
          }
          
          console.log(`  Geocoded to: lat=${lat}, lon=${lon}, name=${placeName || 'N/A'}, country=${country || 'N/A'}`);
        } else {
          throw new Error(`Location not found: ${geoData.status} - ${geoData.error_message || 'Unknown error'}`);
        }
      } else {
        // Use OpenWeatherMap direct geocoding API for CITY, OTHER, UNKNOWN
        console.log(`  Geocoding location: ${location}`);
        const geoUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(location)}&limit=1&appid=${apiKey}`;
        console.log(`  Geocoding API URL: ${geoUrl}`);
        const geoResponse = await fetch(geoUrl);
        
        if (!geoResponse.ok) {
          throw new Error(`Geocoding API error: ${geoResponse.status}`);
        }
        
        const geoDataArray = await geoResponse.json();
        if (Array.isArray(geoDataArray) && geoDataArray.length > 0) {
          const geoData = geoDataArray[0];
          if (geoData.lat && geoData.lon) {
            lat = geoData.lat;
            lon = geoData.lon;
            placeName = geoData.name || null;
            country = geoData.country || null;
            state = geoData.state || null;
            console.log(`  Geocoded to: lat=${lat}, lon=${lon}, name=${placeName || 'N/A'}, country=${country || 'N/A'}`);
          } else {
            throw new Error('Could not get coordinates from location');
          }
        } else {
          throw new Error('Location not found');
        }
      }

      // After getting lat/lon, use OpenWeatherMap reverse geocoding to get placeName and country
      // Only call reverse geocoding for GPS_COORDINATES
      if (lat && lon && locationType === 'GPS_COORDINATES') {
        console.log(`  Getting place name and country from coordinates: lat=${lat}, lon=${lon}`);
        const reverseGeoUrl = `http://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=5&appid=${apiKey}`;
        console.log(`  Reverse Geocoding API URL: ${reverseGeoUrl.replace(apiKey, 'API_KEY_HIDDEN')}`);
        const reverseGeoResponse = await fetch(reverseGeoUrl);
        
        if (reverseGeoResponse.ok) {
          const reverseGeoDataArray = await reverseGeoResponse.json();
          if (Array.isArray(reverseGeoDataArray) && reverseGeoDataArray.length > 0) {
            const reverseGeoData = reverseGeoDataArray[0];
            placeName = reverseGeoData.name || null;
            country = reverseGeoData.country || null;
            state = reverseGeoData.state || null;
            console.log(`  Reverse geocoded: name=${placeName || 'N/A'}, country=${country || 'N/A'}, state=${state || 'N/A'}`);
          } else {
            console.log(`  No reverse geocoding data found, keeping placeName and country as null`);
          }
        } else {
          console.log(`  Reverse geocoding failed, keeping placeName and country as null`);
        }
      }

      // Collect all dates in the range
      const allDates = [];
      const currentDate = new Date(startDateObj);
      while (currentDate <= endDateObj) {
        allDates.push(new Date(currentDate));
        currentDate.setUTCDate(currentDate.getUTCDate() + 1);
      }
      
      // Determine today's date (midnight UTC)
      const now = new Date();
      const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
      
      // Split dates into two groups:
      // 1. Past dates or dates 8+ days ahead (use day_summary API)
      // 2. Dates within 0-7 days (use onecall API)
      const daySummaryDates = [];
      const onecallDates = [];
      
      allDates.forEach(date => {
        const daysFromToday = Math.floor((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        const dateString = formatDateToString(date);
        if (daysFromToday < 0 || daysFromToday >= 8) {
          daySummaryDates.push(date);
          console.log(`    ${dateString}: ${daysFromToday} days from today → day_summary API`);
        } else {
          onecallDates.push(date);
          console.log(`    ${dateString}: ${daysFromToday} days from today → onecall API`);
        }
      });
      
      console.log(`  Date range analysis:`);
      console.log(`    Total dates requested: ${allDates.length}`);
      console.log(`    Dates for day_summary API: ${daySummaryDates.length} (past or 8+ days ahead)`);
      if (daySummaryDates.length > 0) {
        const daySummaryDateStrings = daySummaryDates.map(d => formatDateToString(d));
        console.log(`      Day summary dates: ${daySummaryDateStrings.join(', ')}`);
      }
      console.log(`    Dates for onecall API: ${onecallDates.length} (within 0-7 days)`);
      if (onecallDates.length > 0) {
        const onecallDateStrings = onecallDates.map(d => formatDateToString(d));
        console.log(`      Onecall dates: ${onecallDateStrings.join(', ')}`);
      }
      
      let weatherData = { current: null, daily: [], timezone: null };
      let daySummaryResults = [];
      let onecallResults = [];
      
      // Fetch from day_summary API if needed
      if (daySummaryDates.length > 0) {
        console.log(`  Fetching ${daySummaryDates.length} days using day_summary API`);
        const dailyPromises = daySummaryDates.map(async (date) => {
          // Convert date to YYYY-MM-DD format for API call
          const dateString = formatDateToString(date);
          // Also keep timestamp for dt field in response
          const timestamp = Math.floor(date.getTime() / 1000);
          const daySummaryUrl = `https://api.openweathermap.org/data/3.0/onecall/day_summary?lat=${lat}&lon=${lon}&date=${dateString}&units=${unitsParam}&appid=${apiKey}`;
          
          try {
            const dayResponse = await fetch(daySummaryUrl);
            if (!dayResponse.ok) {
              const errorText = await dayResponse.text();
              throw new Error(`Day summary API error for ${dateString}: ${dayResponse.status} - ${errorText}`);
            }
            const dayData = await dayResponse.json();
            
            // Transform day_summary response to match onecall daily format
            return {
              dt: timestamp,
              date: dateString, // Keep date string for sorting
              summary: dayData.summary || null,
              temp: {
                min: dayData.temperature?.min || null,
                max: dayData.temperature?.max || null,
                day: dayData.temperature?.day || dayData.temperature?.min || null,
              },
              weather: dayData.weather || [],
              humidity: dayData.humidity || null,
              wind_speed: dayData.wind?.speed || null,
            };
          } catch (error) {
            console.error(`  Error fetching day summary for ${dateString}:`, error.message);
            throw error;
          }
        });
        
        daySummaryResults = await Promise.all(dailyPromises);
        console.log(`  Retrieved ${daySummaryResults.length} days using day_summary API`);
        const daySummaryDatesRetrieved = daySummaryResults.map(day => formatDateToString(new Date(day.dt * 1000)));
        console.log(`  Day summary dates retrieved: ${daySummaryDatesRetrieved.join(', ')}`);
      }
      
      // Fetch from onecall API if needed
      if (onecallDates.length > 0) {
        console.log(`  Fetching weather data using onecall API for dates within 0-7 days`);
        const weatherUrl = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&units=${unitsParam}&exclude=minutely,hourly,alerts&appid=${apiKey}`;
        console.log(`  Weather API URL: ${weatherUrl.replace(apiKey, 'API_KEY_HIDDEN')}`);
        const weatherResponse = await fetch(weatherUrl);

        if (!weatherResponse.ok) {
          const errorText = await weatherResponse.text();
          throw new Error(`Weather API error: ${weatherResponse.status} - ${errorText}`);
        }

        weatherData = await weatherResponse.json();
        console.log('  Weather data retrieved successfully from onecall API');
        
        // Determine the date range for onecall filtering
        const onecallStartDate = onecallDates[0];
        const onecallEndDate = onecallDates[onecallDates.length - 1];
        
        // Filter weather data based on date range using utility function
        console.log(`  Filtering onecall dates: start=${formatDateToString(onecallStartDate)}, end=${formatDateToString(onecallEndDate)}`);
        
        if (weatherData.daily && Array.isArray(weatherData.daily)) {
          console.log(`  Total daily forecasts available from onecall: ${weatherData.daily.length}`);
        }
        
        onecallResults = filterDailyForecastsByDateRange(
          weatherData.daily,
          onecallStartDate,
          onecallEndDate,
          true // verbose logging
        );
        
        console.log(`  Filtered to ${onecallResults.length} days from onecall API (expected: ${onecallDates.length} days)`);
        const onecallDatesRetrieved = onecallResults.map(day => formatDateToString(new Date(day.dt * 1000)));
        console.log(`  Onecall dates retrieved: ${onecallDatesRetrieved.join(', ')}`);
      }
      
      // Merge results and deduplicate by date (in case same date appears in both APIs)
      const dateMap = new Map();
      
      // Add day_summary results first
      daySummaryResults.forEach(day => {
        const dateKey = formatDateToString(new Date(day.dt * 1000));
        if (!dateMap.has(dateKey)) {
          dateMap.set(dateKey, day);
        } else {
          console.log(`  Warning: Duplicate date ${dateKey} found in day_summary results, keeping first occurrence`);
        }
      });
      
      // Add onecall results (will overwrite if duplicate exists, preferring onecall for dates within 0-7 days)
      onecallResults.forEach(day => {
        const dateKey = formatDateToString(new Date(day.dt * 1000));
        if (dateMap.has(dateKey)) {
          console.log(`  Warning: Date ${dateKey} found in both APIs, preferring onecall result`);
        }
        dateMap.set(dateKey, day);
      });
      
      // Convert map values to array and sort by timestamp
      const allResults = Array.from(dateMap.values());
      allResults.sort((a, b) => a.dt - b.dt);
      
      // Remove the temporary 'date' property if it exists
      const filteredDaily = allResults.map(({ date, ...rest }) => rest);
      
      console.log(`  Final merged results: ${filteredDaily.length} days total`);
      const finalDates = filteredDaily.map(day => formatDateToString(new Date(day.dt * 1000)));
      console.log(`  Final dates: ${finalDates.join(', ')}`);

      // Prepare detailed weather data for response
      // Check if the first day is in the past - if so, don't show current weather
      const startDateDaysFromToday = Math.floor((startDateObj.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      const isFirstDayInPast = startDateDaysFromToday < 0;
      
      let currentTemp = null;
      let currentHumidity = null;
      let currentWindSpeed = null;
      
      // Only show current weather if the first day is today or in the future
      if (!isFirstDayInPast) {
        // Use current weather from onecall if available
        currentTemp = weatherData.current?.temp || null;
        currentHumidity = weatherData.current?.humidity || null;
        currentWindSpeed = weatherData.current?.wind_speed || null;
      } else {
        console.log(`  First day is in the past (${startDateDaysFromToday} days ago), skipping current weather`);
      }
      
      // Format daily data with max/min temp and weather details
      const formattedDaily = filteredDaily.map(day => ({
        dt: day.dt,
        summary: day.summary || null,
        temp: {
          min: day.temp?.min || null,
          max: day.temp?.max || null,
          day: day.temp?.day || null,
        },
        weather: day.weather || [],
        humidity: day.humidity || null,
        wind_speed: day.wind_speed || null,
      }));

      // Calculate average temperature using utility function
      const avgTemp = calculateAverageTemperature(formattedDaily, currentTemp);

      // Save weather data to database
      let savedRecordId = null;
      try {
        const [savedRecord] = await db('weather_history')
          .insert({
            location_name: placeName || location,
            location_type: locationType || 'UNKNOWN',
            lat: lat || null,
            lon: lon || null,
            start_date: startDate,
            end_date: endDate,
            avg_temp: avgTemp,
            humidity: currentHumidity,
            wind_speed: currentWindSpeed,
            description: formattedDaily[0]?.weather?.[0]?.description || null,
          })
          .returning('*');
        
        savedRecordId = savedRecord.id;
        console.log('  Weather data saved to database with ID:', savedRecordId);
        
      } catch (dbError) {
        // Log error but don't fail the request
        console.error('  Error saving weather data to database:', dbError.message);
      }

      // Generate Google Maps embed URL
      let mapUrl = null;
      if (googleMapsApiKey && lat && lon) {
        // Google Maps Embed API URL format
        mapUrl = `https://www.google.com/maps/embed/v1/place?key=${googleMapsApiKey}&q=${lat},${lon}&zoom=12`;
      }

      // Fetch YouTube video URL for the location
      let youtubeUrl = null;
      try {
        const youtubeApiKey = process.env.GOOGLE_API_KEY; //Same as google key
        const searchQuery = placeName || location;
        
        if (youtubeApiKey && searchQuery) {
          console.log(`  Searching YouTube for: ${searchQuery}`);
          const youtubeSearchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(searchQuery)}&key=${youtubeApiKey}&maxResults=1&type=video`;
          console.log(`  YouTube API URL: ${youtubeSearchUrl.replace(youtubeApiKey, 'API_KEY_HIDDEN')}`);
          
          const youtubeResponse = await fetch(youtubeSearchUrl);
          
          if (youtubeResponse.ok) {
            const youtubeData = await youtubeResponse.json();
            if (youtubeData.items && youtubeData.items.length > 0) {
              const videoId = youtubeData.items[0].id.videoId;
              youtubeUrl = `https://www.youtube.com/embed/${videoId}`;
              console.log(`  YouTube video found: ${youtubeUrl}`);
            } else {
              console.log(`  No YouTube videos found for: ${searchQuery}`);
            }
          } else {
            console.log(`  YouTube API error: ${youtubeResponse.status}`);
          }
        } else {
          console.log(`  YouTube API key not configured or no search query`);
        }
      } catch (youtubeError) {
        console.error('  Error fetching YouTube video:', youtubeError.message);
        // Don't fail the request if YouTube fails
      }

      // Send response with weather data directly
      res.status(200).json({
        success: true,
        message: 'API call successful',
        currentTemp: currentTemp,
        currentHumidity: currentHumidity,
        currentWindSpeed: currentWindSpeed,
        avgTemp: avgTemp,
        daily: formattedDaily,
        timezone: weatherData.timezone || null,
        placeName: placeName || null,
        country: country || null,
        state: state || null,
        location: location,
        startDate: startDate,
        endDate: endDate,
        daysAhead: days,
        historyId: savedRecordId,
        mapUrl: mapUrl,
        youtubeUrl: youtubeUrl,
        lat: lat,
        lon: lon
      });

    } catch (geoError) {
      console.error('Error fetching weather data:', geoError.message);
      return res.status(400).json({
        success: false,
        message: `Failed to get weather data: ${geoError.message}`,
        error: geoError.message
      });
    }

  } catch (error) {
    console.error('Error in getWeather controller:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

