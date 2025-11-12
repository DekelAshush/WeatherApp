// src/components/CardHistory.jsx
import './CardHistory.css';
import React, { useState } from "react";
import { createPortal } from "react-dom";

export default function CardHistory({ record, onUpdate, onDelete, isPopupOpen, onOpenPopup, onClosePopup, temperatureUnit }) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedEndDate, setEditedEndDate] = useState(record.end_date);
  const [dateError, setDateError] = useState('');

  

  // Get temperature unit symbol
  const tempUnitSymbol = temperatureUnit === 'fahrenheit' ? '°F' : '°C';
  
  // Get converted temperature
  const displayTemperature = record.temperature

  const handleView = () => {
    setIsEditMode(false);
    setDateError('');
    onOpenPopup();
  };

  const handleEdit = () => {
    setIsEditMode(true);
    setEditedEndDate(record.end_date);
    setDateError('');
    onOpenPopup();
  };

  const closePopup = () => {
    setIsEditMode(false);
    setDateError('');
    onClosePopup();
  };

  // Calculate maximum end date (start date + 5 days)
  const getMaxEndDate = () => {
    if (!record.start_date) return '';
    const startDate = new Date(record.start_date);
    startDate.setDate(startDate.getDate() + 5);
    const year = startDate.getFullYear();
    const month = String(startDate.getMonth() + 1).padStart(2, '0');
    const day = String(startDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleEndDateChange = (e) => {
    const newEndDate = e.target.value;
    setEditedEndDate(newEndDate);
    
    // Clear error when user changes the date
    if (dateError) {
      setDateError('');
    }
    
    // Validate: end date cannot be less than start date
    if (newEndDate && record.start_date && newEndDate < record.start_date) {
      setDateError('End date cannot be earlier than start date');
      return;
    }
    
    // Validate: end date cannot be more than 5 days from start date
    const maxEndDate = getMaxEndDate();
    if (newEndDate && maxEndDate && newEndDate > maxEndDate) {
      setDateError('End date cannot be more than 5 days from start date');
      return;
    }
    
    setDateError('');
  };

  const handleSaveEdit = () => {
    // Validate: end date cannot be less than start date
    if (!editedEndDate) {
      setDateError('End date is required');
      return;
    }
    
    if (editedEndDate < record.start_date) {
      setDateError('End date cannot be earlier than start date');
      return;
    }
    
    // Validate: end date cannot be more than 5 days from start date
    const maxEndDate = getMaxEndDate();
    if (maxEndDate && editedEndDate > maxEndDate) {
      setDateError('End date cannot be more than 5 days from start date');
      return;
    }
    
    // Clear any errors
    setDateError('');
    
    // Send API call with updated end date and card ID
    // Only update if the date actually changed
    if (editedEndDate !== record.end_date) {
      console.log('Updating end date:', {
        id: record.id,
        oldEndDate: record.end_date,
        newEndDate: editedEndDate
      });
      onUpdate({ ...record, end_date: editedEndDate });
    } else {
      // Date hasn't changed, just close the popup
      console.log('End date unchanged, no API call needed');
    }
    
    closePopup();
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      onDelete(record.id);
    }
  };

  return (
    <div className="card-history">
      <button className="delete-x-btn" onClick={handleDelete} aria-label="Delete">
        ×
      </button>
      <h3>{record.location}</h3>

      <div className="card-actions">
        <button onClick={handleView}>View</button>
        <button onClick={handleEdit}>Edit</button>
      </div>

      {/* Popup modal - rendered via Portal outside DOM hierarchy */}
      {isPopupOpen && createPortal(
        <div className="popup-overlay" onClick={closePopup}>
          <div className="popup-card" onClick={(e) => e.stopPropagation()}>
            <button 
              className="popup-close-x" 
              onClick={closePopup}
              aria-label="Close popup"
            >
              ×
            </button>
            <h2>{record.location} — {isEditMode ? 'Edit Details' : 'History Details'}</h2>
            
            {isEditMode ? (
              <>
                <div className="popup-field">
                  <label>
                    <strong>Start Date:</strong>
                    <input 
                      type="date" 
                      value={record.start_date} 
                      disabled 
                      className="disabled-input"
                    />
                  </label>
                </div>
                <div className="popup-field">
                  <label>
                    <strong>End Date:</strong>
                    <input 
                      type="date" 
                      value={editedEndDate}
                      min={record.start_date}
                      max={getMaxEndDate()}
                      onChange={handleEndDateChange}
                    />
                    {dateError && (
                      <span className="error-message">
                        {dateError}
                      </span>
                    )}
                  </label>
                </div>
                <div className="popup-field">
                  <label>
                    <strong>Average Temp:</strong>
                    <input 
                      type="text" 
                      value={displayTemperature !== null ? `${displayTemperature}${tempUnitSymbol}` : 'N/A'} 
                      disabled 
                      className="disabled-input"
                    />
                  </label>
                </div>
                <div className="popup-field">
                  <label>
                    <strong>Humidity:</strong>
                    <input 
                      type="text" 
                      value={`${record.humidity}%`} 
                      disabled 
                      className="disabled-input"
                    />
                  </label>
                </div>
                <div className="popup-field">
                  <label>
                    <strong>Wind Speed:</strong>
                    <input 
                      type="text" 
                      value={`${record.wind_speed} m/s`} 
                      disabled 
                      className="disabled-input"
                    />
                  </label>
                </div>
                <div className="popup-field">
                  <label>
                    <strong>Description:</strong>
                    <input 
                      type="text" 
                      value={record.description || "No data"} 
                      disabled 
                      className="disabled-input"
                    />
                  </label>
                </div>
                <div className="popup-actions">
                  <button className="save-btn" onClick={handleSaveEdit}>
                    Save
                  </button>
                  <button className="close-btn" onClick={closePopup}>
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <p>
                  <strong>Date Range:</strong> {record.start_date} → {record.end_date}
                </p>
                <p>
                  <strong>Average Temp:</strong> {displayTemperature !== null ? `${displayTemperature}${tempUnitSymbol}` : 'N/A'}
                </p>
                <p>
                  <strong>Humidity:</strong> {record.humidity}%
                </p>
                <p>
                  <strong>Wind Speed:</strong> {record.wind_speed} m/s
                </p>
                <p>
                  <strong>Description:</strong> {record.description || "No data"}
                </p>
                <button className="close-btn" onClick={closePopup}>
                  Close
                </button>
              </>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
