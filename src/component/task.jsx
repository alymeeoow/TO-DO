import React, { useState } from "react";
import {
  FiCheck,
  FiCircle,
  FiTrash2,
  FiEdit,
  FiSquare,
  FiCheckSquare
} from "react-icons/fi";
import "../assets/styles/task.css";


const TaskList = ({ 
  tasks = [],   
  onToggleComplete, 
  onDelete, 
  onEdit,
  selectedTasks = [],
  onToggleSelect = () => {},
}) => {
  const [sortOption, setSortOption] = useState("newest");

  const getSortedTasks = () => {
    return [...tasks].sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time}`);
      const dateB = new Date(`${b.date}T${b.time}`);
      if (sortOption === "newest") return dateB - dateA;
      if (sortOption === "oldest") return dateA - dateB;
      if (sortOption === "nearest") {
        const now = new Date();
        return Math.abs(dateA - now) - Math.abs(dateB - now);
      }
      return 0;
    });
  };

  return (
    <>
    <div className="task-sort-container">
  <label htmlFor="sort" className="sort-label">
    Sort by:
  </label>
  <select
    id="sort"
    value={sortOption}
    onChange={(e) => setSortOption(e.target.value)}
    className="sort-select"
  >
    <option value="newest">Newest</option>
    <option value="oldest">Oldest</option>
    <option value="nearest">Nearest</option>
  </select>
</div>


      {getSortedTasks().map((task) => (
        <Task
          key={task.id}
          task={task}
          onToggleComplete={onToggleComplete}
          onDelete={onDelete}
          onEdit={onEdit}
          isSelected={selectedTasks.includes(task.id)}
          onToggleSelect={() => onToggleSelect(task.id)}
          showCheckbox={true}
        />
      ))}
    </>
  );
};


const Task = ({
  task,
  onToggleComplete,
  onDelete,
  onEdit,
  isSelected = false,
  onToggleSelect = () => {},
  showCheckbox = true
}) => {
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date
      .toLocaleDateString("en-US", {
        month: "long",
        day: "2-digit",
        year: "numeric"
      })
      .replace(",", "-");
  };

  const formatTime = (timeStr) => {
    const [hours, minutes] = timeStr.split(":");
    const date = new Date();
    date.setHours(hours, minutes);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    });
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    onDelete(task.id);
  };

  const handleCheckboxClick = (e) => {
    e.stopPropagation();
    onToggleSelect(task.id);
  };

  const handleRemind = () => {
    const taskDateTime = new Date(`${task.date}T${task.time}`);
    const now = new Date();
    const isToday = taskDateTime.toDateString() === now.toDateString();
  
    const isLocalhost =
      window.location.hostname === "localhost" ||
      window.location.hostname.startsWith("192.168.") ||
      window.location.hostname === "127.0.0.1";
  
    if (isToday) {
      if ("Notification" in window) {
        if (Notification.permission === "granted") {
          new Notification("⏰ Task Reminder", {
            body: `${task.title} at ${formatTime(task.time)}`
          });
        } else if (Notification.permission === "default") {
          Notification.requestPermission().then((permission) => {
            if (permission === "granted") {
              new Notification("⏰ Task Reminder", {
                body: `${task.title} at ${formatTime(task.time)}`
              });
            }
          });
        }
      }
  
      if (isLocalhost) {
        console.log("🧪 Localhost detected - using fallback alert.");
      }
    } else {
      const start = new Date(`${task.date}T${task.time}`);
      const end = new Date(start.getTime() + 30 * 60000); // +30 minutes
  
      const formatForGoogle = (date) =>
        date.toISOString().replace(/-|:|\.\d\d\d/g, "");
  
      const googleCalendarUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
        task.title
      )}&dates=${formatForGoogle(start)}/${formatForGoogle(
        end
      )}&details=${encodeURIComponent(
        `Reminder for task: ${task.title}`
      )}&sf=true&output=xml`;
  
      window.open(googleCalendarUrl, "_blank");
    }
  };
  

  const generateICS = (task) => {
    const start = new Date(`${task.date}T${task.time}`);
    const end = new Date(start.getTime() + 30 * 60000); 
    const formatICS = (date) =>
      date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

    return `
BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
SUMMARY:${task.title}
DTSTART:${formatICS(start)}
DTEND:${formatICS(end)}
DESCRIPTION:Reminder for task "${task.title}"
END:VEVENT
END:VCALENDAR
    `.trim();
  };

  return (
    <div className={`task ${task.category} ${isSelected ? "selected" : ""}`}>
      {showCheckbox && (
        <div
          className="task-checkbox"
          onClick={handleCheckboxClick}
          aria-checked={isSelected}
          role="checkbox"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              handleCheckboxClick(e);
            }
          }}
        >
          {isSelected ? (
            <FiCheckSquare className="checkbox-icon checked" />
          ) : (
            <FiSquare className="checkbox-icon" />
          )}
        </div>
      )}

      <div className="task-content">
        {task.completed ? (
          <FiCheck
            className="task-status completed"
            onClick={() => onToggleComplete(task.id)}
            aria-label={
              task.completed ? "Mark as incomplete" : "Mark as complete"
            }
          />
        ) : (
          <FiCircle
            className="task-status"
            onClick={() => onToggleComplete(task.id)}
            aria-label={
              task.completed ? "Mark as incomplete" : "Mark as complete"
            }
          />
        )}
        <div className="task-details">
          <span className="task-title">{task.title}</span>
          <span className="task-datetime">
            <strong>{formatDate(task.date)}</strong> - {formatTime(task.time)}
          </span>

     
          <button className="remind-btn" onClick={handleRemind}>
            Remind Me
          </button>
        </div>
      </div>

      <div className="task-actions">
        <FiEdit
          className="edit-btn icon-style"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(task);
          }}
          aria-label="Edit task"
        />
        <FiTrash2
          className="delete-btn icon-style"
          onClick={handleDeleteClick}
          aria-label="Delete task"
        />
      </div>
    </div>
  );

};

export { TaskList };
export default Task;
