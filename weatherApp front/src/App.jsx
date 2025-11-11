import React, { useState, useEffect } from "react";
import LocationForm from "./Components/LocationForm/LocationForm.jsx";
import HistoryForm from "./Components/HistoryForm/HistoryForm.jsx";
import WeatherCardList from "./Components/WeatherCardList/WeatherCardList.jsx";
import "./App.css";

function App() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [weatherData, setWeatherData] = useState(null);
    const [temperatureUnit, setTemperatureUnit] = useState('celsius');
    const [historyRecords, setHistoryRecords] = useState([]);

    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

    // Fetch all history records from database on component mount
    useEffect(() => {
        const fetchHistoryRecords = async () => {
            try {
                const response = await fetch(`${API_URL}/weather/history`);
                
                if (response.ok) {
                    const result = await response.json();
                    if (result.success && result.data) {
                        // Transform database records to match frontend format
                        const transformedRecords = result.data.map(record => ({
                            id: record.id,
                            location: record.location_name,
                            start_date: record.start_date,
                            end_date: record.end_date,
                            temperature: record.avg_temp,
                            humidity: record.humidity,
                            wind_speed: record.wind_speed,
                            description: record.description
                        }));
                        setHistoryRecords(transformedRecords);
                    }
                } else {
                    console.error('Failed to fetch history records:', response.status);
                }
            } catch (error) {
                console.error('Error fetching history records:', error);
            }
        };

        fetchHistoryRecords();
    }, [API_URL]);

    // Add a new history record
    const addHistoryRecord = (weatherResult, requestData) => {
        // Only add if we have a database ID
        if (weatherResult.historyId) {
            const newRecord = {
                id: weatherResult.historyId, // Use database ID
                location: weatherResult.placeName || requestData.location,
                start_date: requestData.startDate,
                end_date: weatherResult.endDate || requestData.startDate,
                temperature: weatherResult.avgTemp || null,
                humidity: weatherResult.currentHumidity || null,
                wind_speed: weatherResult.currentWindSpeed || null,
                description: weatherResult.daily && weatherResult.daily[0]?.weather?.[0]?.description || null
            };
            setHistoryRecords(prev => [...prev, newRecord]);
        }
    };

    const handleLocationSubmit = async (data) => {
        setIsLoading(true);
        setError(null);
        setSuccess(null);
        setWeatherData(null); // Clear previous weather data

        // Prepare request data with location type
        const requestData = {
            location: data.location,
            locationType: data.locationType || 'UNKNOWN',
            startDate: data.startDate,
            daysAhead: data.daysAhead || 1,
            temperatureUnit: data.temperatureUnit || 'celsius'
        };

        // Store temperature unit for display
        setTemperatureUnit(data.temperatureUnit || 'celsius');
  
        // Console log the data before sending to backend
        console.log('Sending data to backend:', requestData);
        
        
        
        try {
            const response = await fetch(`${API_URL}/api/getWeather/send`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Failed to fetch weather data' }));
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            
            if (result.success) {
                setSuccess('Weather data retrieved successfully!');
                setWeatherData(result); // Store weather data for display
                console.log("Weather data:", result);
                
                // Add a new history record
                addHistoryRecord(result, requestData);
                
                // Clear success message after 3 seconds
                setTimeout(() => setSuccess(null), 3000);
            } else {
                throw new Error(result.message || 'Failed to retrieve weather data');
            }
        } catch (err) {
            setError(err.message || 'Failed to fetch weather data. Please try again.');
            console.error("Error fetching weather:", err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="app-container">
            <main className="main-content">
                <div className="top-section">
                    
                        <HistoryForm 
                            records={historyRecords}
                            setRecords={setHistoryRecords}
                            temperatureUnit={temperatureUnit}
                        />
                    
                    <div className="middle-section">
                        <div className="messages-container">
                            {error && (
                                <div className="error-message">
                                    {error}
                                </div>
                            )}
                            {success && (
                                <div className="success-message">
                                    {success}
                                </div>
                            )}
                        </div>
                        <LocationForm onSubmit={handleLocationSubmit} />
                        {isLoading && (
                            <div className="loading-message">
                                Loading weather data...
                            </div>
                        )}
                    </div>
                    <div className="right-section">
                        {weatherData && weatherData.mapUrl && (
                            <div className="map-container">
                                <iframe
                                    src={weatherData.mapUrl}
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0 }}
                                    allowFullScreen=""
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                    title="Location Map"
                                ></iframe>
                            </div>
                        )}
                    </div>
                </div>
                {weatherData && weatherData.success && (
                    <div className="bottom-section">
                        <WeatherCardList 
                            weatherData={weatherData} 
                            temperatureUnit={temperatureUnit}
                        />
                    </div>
                )}
            </main>
        </div>
    );
}

export default App;