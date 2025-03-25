import React, { useState, useEffect } from "react";


const TaskEditModal = ({ task, isOpen, onClose, onSave }) => {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (task) {
      setTitle(task.title || "");
      setDate(task.date || "");
      setTime(task.time || "");
      setError("");
    }
  }, [task]);

  const isPastDateTime = () => {
    if (!date || !time) return false;
    const selectedDateTime = new Date(`${date}T${time}`);
    return selectedDateTime < new Date();
  };

  const handleSave = () => {
    if (!title || !date || !time) {
      setError("All fields are required.");
      return;
    }

    if (isPastDateTime()) {
      setError("Cannot set a task for a past date/time.");
      return;
    }

    onSave({
      ...task,
      title,
      date,
      time,
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="edit-modal-overlay">
      <div className="edit-modal-content">
        <h2 className="edit-modal-title">Edit Task</h2>

        {error && <p className="edit-error-message">{error}</p>}

        <label className="edit-label">Title:</label>
        <input
          type="text"
          className="edit-input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <label className="edit-label">Date:</label>
        <input
          type="date"
          className={`edit-input ${isPastDateTime() ? "error-input" : ""}`}
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        <label className="edit-label">Time:</label>
        <input
          type="time"
          className={`edit-input ${isPastDateTime() ? "error-input" : ""}`}
          value={time}
          onChange={(e) => setTime(e.target.value)}
        />

        <div className="edit-modal-buttons">
          <button className="edit-btn save" onClick={handleSave}>
            Save
          </button>
          <button className="edit-btn cancel" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskEditModal;
