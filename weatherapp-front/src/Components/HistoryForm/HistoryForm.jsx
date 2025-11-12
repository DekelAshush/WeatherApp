// src/components/HistoryForm.jsx
import React from "react";
import CardHistoryList from "./CardHistoryList";

export default function HistoryForm({ records, setRecords, temperatureUnit }) {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

  // Update handler - sends API call with new end_date (ID is in URL path)
  const handleUpdate = async (record) => {
    try {
      console.log('Sending API call to update end date and avgTemp:', {
        id: record.id,
        end_date: record.end_date,
        url: `${API_URL}/weather/history/${record.id}`
      });

      // ID is in URL path, only end_date is sent in request body
      const res = await fetch(`${API_URL}/weather/history/${record.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          end_date: record.end_date 
        }),
      });

      if (res.ok) {
        const result = await res.json();
        console.log('✅ End date updated successfully:', result.data);
        // Update local state with the updated record from backend (includes new avg_temp)
        setRecords((prev) =>
          prev.map((r) =>
            r.id === record.id ? { 
              ...r, 
              end_date: result.data.end_date,
              temperature: result.data.avg_temp // Update avg_temp from backend
            } : r
          )
        );
      } else {
        const errorData = await res.json().catch(() => ({ message: 'Failed to update record' }));
        console.error('❌ Failed to update record:', errorData.message);
        alert(`Failed to update record: ${errorData.message}`);
      }
    } catch (error) {
      console.error('❌ Error updating record:', error);
      alert(`Error updating record: ${error.message}`);
    }
  };

  // Delete handler
  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API_URL}/weather/history/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (res.ok) {
        // Update local state only after successful deletion
        setRecords((prev) => prev.filter((r) => r.id !== id));
      } else {
        const errorData = await res.json().catch(() => ({ message: 'Failed to delete record' }));
        console.error('Failed to delete record:', errorData.message);
        alert(`Failed to delete record: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error deleting record:', error);
      alert(`Error deleting record: ${error.message}`);
    }
  };

  return (
    <div className="history-form">
      <h2>Weather History</h2>
      <CardHistoryList
        records={records}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
        temperatureUnit={temperatureUnit}
      />
    </div>
  );
}
