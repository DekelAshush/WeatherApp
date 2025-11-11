// src/components/CardHistoryList.jsx
import React, { useState, useEffect } from "react";
import CardHistory from "./CardHistory";

export default function CardHistoryList({ records, onUpdate, onDelete, temperatureUnit }) {
  const [openPopupId, setOpenPopupId] = useState(null);

  // Prevent body scroll when any popup is open
  useEffect(() => {
    if (openPopupId !== null) {
      document.body.style.overflow = 'hidden';
      // Handle ESC key to close popup
      const handleEscape = (e) => {
        if (e.key === 'Escape') {
          setOpenPopupId(null);
        }
      };
      document.addEventListener('keydown', handleEscape);
      return () => {
        document.body.style.overflow = 'unset';
        document.removeEventListener('keydown', handleEscape);
      };
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [openPopupId]);

  const handleOpenPopup = (id) => {
    setOpenPopupId(id);
  };

  const handleClosePopup = () => {
    setOpenPopupId(null);
  };

  if (!records || records.length === 0) {
    return <p>No history records yet.</p>;
  }

  return (
    <div className="card-history-list">
      {records.map((record) => (
        <CardHistory
          key={record.id}
          record={record}
          onUpdate={onUpdate}
          onDelete={onDelete}
          isPopupOpen={openPopupId === record.id}
          onOpenPopup={() => handleOpenPopup(record.id)}
          onClosePopup={handleClosePopup}
          temperatureUnit={temperatureUnit}
        />
      ))}
    </div>
  );
}
