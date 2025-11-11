import express from 'express';
import { db } from '../config/database.js';
import dotenv from 'dotenv';
import { parseUTCDate, filterDailyForecastsByDateRange, calculateAverageTemperature, formatDateValue } from '../utils/weatherUtils.js';

dotenv.config();

const router = express.Router();

// Helper function to fetch weather data and calculate avg_temp using stored lat/lon from database
const fetchWeatherAndCalculateAvgTemp = async (startDate, endDate, storedLat, storedLon) => {
  const apiKey = process.env.WEATHER_API_KEY;
  
  if (!apiKey) {
    throw new Error('Weather API key is not configured');
  }

  // Validate that coordinates are available
  if (storedLat === null || storedLon === null || isNaN(storedLat) || isNaN(storedLon)) {
    throw new Error('Latitude and longitude are required. Coordinates not found in database.');
  }

  const lat = parseFloat(storedLat);
  const lon = parseFloat(storedLon);

  const startDateObj = parseUTCDate(startDate);
  const endDateObj = parseUTCDate(endDate);

  console.log(`   Using stored coordinates: lat=${lat}, lon=${lon}`);

  // Fetch weather data using stored coordinates
  const weatherUrl = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&units=metric&exclude=minutely,hourly,alerts&appid=${apiKey}`;
  const weatherResponse = await fetch(weatherUrl);

  if (!weatherResponse.ok) {
    const errorText = await weatherResponse.text();
    throw new Error(`Weather API error: ${weatherResponse.status} - ${errorText}`);
  }

  const weatherData = await weatherResponse.json();

  // Filter weather data based on date range using utility function
  const filteredDaily = filterDailyForecastsByDateRange(
    weatherData.daily,
    startDateObj,
    endDateObj
  );

  // Calculate average temperature using utility function
  const avgTemp = calculateAverageTemperature(
    filteredDaily,
    weatherData.current?.temp || null
  );

  return avgTemp;
};

// GET /weather/history - Get all history records
router.get('/', async (req, res) => {
  try {
    const records = await db('weather_history')
      .select('*')
      .orderBy('created_at', 'desc');

    // Format dates to ensure YYYY-MM-DD format
    const formattedRecords = records.map(record => ({
      ...record,
      start_date: formatDateValue(record.start_date),
      end_date: formatDateValue(record.end_date)
    }));

    res.status(200).json({
      success: true,
      data: formattedRecords
    });
  } catch (error) {
    console.error('Error fetching weather history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch weather history records',
      error: error.message
    });
  }
});

// PUT /weather/history/:id - Update a specific record
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { location_name, start_date, end_date, avg_temp, humidity, wind_speed, description } = req.body;

    // Check if record exists
    const existingRecord = await db('weather_history')
      .where({ id })
      .first();

    if (!existingRecord) {
      return res.status(404).json({
        success: false,
        message: 'Weather history record not found'
      });
    }

    // Build update object with only provided fields
    const updateData = {};
    if (location_name !== undefined) updateData.location_name = location_name;
    if (start_date !== undefined) updateData.start_date = start_date;
    if (end_date !== undefined) updateData.end_date = end_date;
    if (humidity !== undefined) updateData.humidity = humidity;
    if (wind_speed !== undefined) updateData.wind_speed = wind_speed;
    if (description !== undefined) updateData.description = description;

    // If end_date is being updated, fetch new weather data and calculate avg_temp
    if (end_date !== undefined && end_date !== existingRecord.end_date) {
      try {
        // Format dates to strings (YYYY-MM-DD) before using them
        const startDateToUse = formatDateValue(
          start_date !== undefined ? start_date : existingRecord.start_date
        );
        const endDateToUse = formatDateValue(end_date);
        
        if (!startDateToUse || !endDateToUse) {
          throw new Error('Invalid date format');
        }
        
        console.log(`🔄 Updating avg_temp for record ${id}:`);
        console.log(`   Date range: ${startDateToUse} to ${endDateToUse}`);

        const newAvgTemp = await fetchWeatherAndCalculateAvgTemp(
          startDateToUse,
          endDateToUse,
          existingRecord.lat,
          existingRecord.lon
        );

        if (newAvgTemp !== null) {
          updateData.avg_temp = newAvgTemp;
          console.log(`   ✅ New avg_temp calculated: ${newAvgTemp}°C`);
        } else {
          console.log(`   ⚠️ Could not calculate new avg_temp, keeping existing value`);
        }
      } catch (weatherError) {
        console.error(`   ❌ Error fetching weather data: ${weatherError.message}`);
        // Continue with update even if weather fetch fails, but don't update avg_temp
      }
    } else if (avg_temp !== undefined) {
      // If avg_temp is explicitly provided, use it
      updateData.avg_temp = avg_temp;
    }

    const [updatedRecord] = await db('weather_history')
      .where({ id })
      .update(updateData)
      .returning('*');

    // Format dates to ensure YYYY-MM-DD format
    const formattedRecord = {
      ...updatedRecord,
      start_date: formatDateValue(updatedRecord.start_date),
      end_date: formatDateValue(updatedRecord.end_date)
    };

    res.status(200).json({
      success: true,
      data: formattedRecord
    });
  } catch (error) {
    console.error('Error updating weather history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update weather history record',
      error: error.message
    });
  }
});

// DELETE /weather/history/:id - Delete a specific record
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if record exists
    const existingRecord = await db('weather_history')
      .where({ id })
      .first();

    if (!existingRecord) {
      return res.status(404).json({
        success: false,
        message: 'Weather history record not found'
      });
    }

    await db('weather_history')
      .where({ id })
      .del();

    res.status(200).json({
      success: true,
      message: 'Weather history record deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting weather history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete weather history record',
      error: error.message
    });
  }
});

export default router;

