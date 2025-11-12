import React from 'react';
import './WeatherCard.css';

export default function WeatherCard({ day, temperatureUnit }) {
  // Convert timestamp to readable date
  const date = new Date(day.dt * 1000);
  const dateString = date.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  // Get temperature unit symbol
  const tempUnit = temperatureUnit === 'fahrenheit' ? '°F' : '°C';
  
  // Get weather icon URL
  const weatherIcon = day.weather && day.weather[0]?.icon 
    ? `https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`
    : null;

  return (
    <div className="weather-card">
      <div className="weather-card-header">
        <h3>{dateString}</h3>
        {day.summary && <p className="weather-summary">{day.summary}</p>}
      </div>
      
      <div className="weather-card-content">
        {weatherIcon && (
          <div className="weather-icon">
            <img src={weatherIcon} alt={day.weather[0]?.description || 'Weather'} />
          </div>
        )}
        
        <div className="weather-temps">
          {day.temp?.day !== null && day.temp?.day !== undefined && (
            <div className="temp-day">
              <span className="temp-label">Day:</span>
              <span className="temp-value">{Math.round(day.temp.day)}{tempUnit}</span>
            </div>
          )}
          {day.temp?.min !== null && day.temp?.min !== undefined && (
            <div className="temp-min">
              <span className="temp-label">Min:</span>
              <span className="temp-value">{Math.round(day.temp.min)}{tempUnit}</span>
            </div>
          )}
          {day.temp?.max !== null && day.temp?.max !== undefined && (
            <div className="temp-max">
              <span className="temp-label">Max:</span>
              <span className="temp-value">{Math.round(day.temp.max)}{tempUnit}</span>
            </div>
          )}
        </div>
      </div>

      {day.weather && day.weather.length > 0 && (
        <div className="weather-details">
          {day.weather[0].main && (
            <div className="weather-main">
              <strong>Condition:</strong> {day.weather[0].main}
            </div>
          )}
          {day.weather[0].description && (
            <div className="weather-description">
              {day.weather[0].description}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

