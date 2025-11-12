import React from 'react';
import WeatherCard from '../WeatherCard/WeatherCard';
import './WeatherCardList.css';

export default function WeatherCardList({ weatherData, temperatureUnit }) {
  if (!weatherData || !weatherData.daily || weatherData.daily.length === 0) {
    return (
      <div className="weather-card-list-empty">
        <p>No weather data available</p>
      </div>
    );
  }

  return (
    <div className="weather-card-list">
      {weatherData.placeName && (
        <div className="weather-location-header">
          <h2>
            {weatherData.placeName}
            {weatherData.state && `, ${weatherData.state}`}
            {weatherData.country && `, ${weatherData.country}`}
          </h2>
          <div className="header-content">
            {weatherData.currentTemp !== null && weatherData.currentTemp !== undefined && (
              <div className="current-temp">
                Current: {Math.round(weatherData.currentTemp)}{temperatureUnit === 'fahrenheit' ? '°F' : '°C'}
              </div>
            )}
            {weatherData.youtubeUrl && (
              <div className="youtube-container">
                <iframe
                  src={weatherData.youtubeUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title="Location Video"
                ></iframe>
              </div>
            )}
          </div>
        </div>
      )}
      <div className="weather-cards-container">
        {weatherData.daily.map((day, index) => (
          <WeatherCard 
            key={day.dt || index} 
            day={day} 
            temperatureUnit={temperatureUnit}
          />
        ))}
      </div>
    </div>
  );
}

