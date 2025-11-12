import React, { useState } from 'react';
import { validateLocation } from '../../utils/locationValidation';

const getLocalToday = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function LocationForm({ onSubmit }) {
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState('');
  const [daysAhead, setDaysAhead] = useState(1);
  const [locationError, setLocationError] = useState('');
  const [dateError, setDateError] = useState('');
  const [temperatureUnit, setTemperatureUnit] = useState('celsius'); // Default to Celsius

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocationError('');
    setDateError('');

    // Validate location
    const locationValidation = validateLocation(location);
    if (!locationValidation.isValid) {
      setLocationError(locationValidation.error);
      return;
    }

    if (!startDate) {
      setDateError('Please select a start date');
      return;
    }

    // Validate that date is not in the past (allow today's date)
    const todayStr = getLocalToday();
    
    // Compare date strings directly to avoid timezone issues
    if (startDate < todayStr) {
      setDateError('Date can only be today or in the future');
      return;
    }

    // Validate daysAhead (should be between 1 and 5)
    const days = parseInt(daysAhead, 10);
    if (isNaN(days) || days < 1 || days > 5) {
      alert('Days ahead must be between 1 and 5');
      return;
    }

    // Send validated data to parent with normalized location and type
    onSubmit({ 
      location: locationValidation.normalizedLocation,
      locationType: locationValidation.locationType,
      startDate, 
      daysAhead: days,
      temperatureUnit
    });

    // reset
    setLocation('');
    setStartDate('');
    setDaysAhead(1);
    setLocationError('');
    setDateError('');
    // Keep temperature unit selected (don't reset it)
  };

  return (
    <form onSubmit={handleSubmit} className="location-form">
      <h2>Check the Weather</h2>

      <label>
        Location:
        <input
          type="text"
          value={location}
          onChange={(e) => {
            setLocation(e.target.value);
            setLocationError(''); // Clear error when user types
          }}
          placeholder="Enter city, ZIP, GPS coordinates, or landmark"
          required
        />
        {locationError && (
          <span style={{ color: '#e74c3c', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
            {locationError}
          </span>
        )}
      </label>

      <label>
        Start Date:
        <input
          type="date"
          value={startDate}
          min={getLocalToday()}
          onChange={(e) => {
            const selectedDate = e.target.value;
            setStartDate(selectedDate);
            setDateError(''); // Clear error when user changes date
            
            // Validate that date is not in the past (allow today's date)
            if (selectedDate) {
              const todayStr = getLocalToday();
              
              // Compare date strings directly to avoid timezone issues
              if (selectedDate < todayStr) {
                setDateError('Date can only be today or in the future');
              }
            }
          }}
          required
        />
        {dateError && (
          <span style={{ color: '#e74c3c', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
            {dateError}
          </span>
        )}
      </label>

      <label>
        Days Ahead (1-5 days):
        <input
          type="number"
          value={daysAhead}
          onChange={(e) => {
            const value = parseInt(e.target.value, 10);
            if (!isNaN(value) && value >= 1 && value <= 5) {
              setDaysAhead(value);
            }
          }}
          min="1"
          max="5"
          required
        />
        <span style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.7)', marginTop: '0.25rem', display: 'block' }}>
          Number of days to retrieve forecast (including start date). Max 5 days.
        </span>
      </label>

      <label>
        Temperature Unit:
        <div className="temperature-unit-selector">
          <label className="radio-label">
            <input
              type="radio"
              name="temperatureUnit"
              value="celsius"
              checked={temperatureUnit === 'celsius'}
              onChange={(e) => setTemperatureUnit(e.target.value)}
            />
            <span>Celsius (°C)</span>
          </label>
          <label className="radio-label">
            <input
              type="radio"
              name="temperatureUnit"
              value="fahrenheit"
              checked={temperatureUnit === 'fahrenheit'}
              onChange={(e) => setTemperatureUnit(e.target.value)}
            />
            <span>Fahrenheit (°F)</span>
          </label>
        </div>
      </label>

      <button type="submit">Get Weather</button>
    </form>
  );
}
