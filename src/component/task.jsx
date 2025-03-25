import React, { useState, useEffect } from "react";
import {
  FiCheck,
  FiCircle,
  FiTrash2,
  FiEdit,
  FiSquare,
  FiCheckSquare,
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
  const [editingTask, setEditingTask] = useState(null);

  const getSortedTasks = () => {
    let filteredTasks = [...tasks];

    if (sortOption === "done") {
      filteredTasks = filteredTasks.filter((task) => task.completed);
    } else if (sortOption === "pending") {
      filteredTasks = filteredTasks.filter((task) => !task.completed);
    }

    return filteredTasks.sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time}`);
      const dateB = new Date(`${b.date}T${b.time}`);

      switch (sortOption) {
        case "newest":
          return dateB - dateA;
        case "oldest":
          return dateA - dateB;
        case "nearest":
          const now = new Date();
          return Math.abs(dateA - now) - Math.abs(dateB - now);
        default:
          return 0;
      }
    });
  };

  const handleSaveEdit = (updatedTask) => {
    onEdit(updatedTask);
    setEditingTask(null);
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
          <option value="newest">Recently Added</option>
          <option value="oldest">First Added</option>
          <option value="nearest">Upcoming Due</option>
          <option value="done">Completed Tasks</option>
          <option value="pending">Pending Tasks</option>
        </select>
      </div>

      {getSortedTasks().map((task) => (
        <Task
          key={task.id}
          task={task}
          onToggleComplete={onToggleComplete}
          onDelete={onDelete}
          onEdit={() => setEditingTask(task)}
          isSelected={selectedTasks.includes(task.id)}
          onToggleSelect={() => onToggleSelect(task.id)}
          showCheckbox={true}
        />
      ))}

      <TaskEditModal
        task={editingTask}
        isOpen={!!editingTask}
        onClose={() => setEditingTask(null)}
        onSave={handleSaveEdit}
      />
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
  showCheckbox = true,
}) => {
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date
      .toLocaleDateString("en-US", {
        month: "long",
        day: "2-digit",
        year: "numeric",
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
      hour12: true,
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
            aria-label="Mark as incomplete"
          />
        ) : (
          <FiCircle
            className="task-status"
            onClick={() => onToggleComplete(task.id)}
            aria-label="Mark as complete"
          />
        )}
        <div className="task-details">
          <span className="task-title">{task.title}</span>
          <span className="task-datetime">
            <strong>{formatDate(task.date)}</strong> - {formatTime(task.time)}
          </span>
        </div>
      </div>
      <div className="task-actions">
        <FiEdit
          className="edit-btn-btn icon-style"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(); // triggers modal opening
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

const TaskEditModal = ({ task, isOpen, onClose, onSave }) => {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDate(task.date);
      setTime(task.time);
    }
  }, [task]);

  const handleSave = () => {
    onSave({
      ...task,
      title,
      date,
      time,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="edit-modal-overlay">
      <div className="edit-modal-content">
        <h2 className="edit-modal-title">Edit Task</h2>

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
          className="edit-input"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        <label className="edit-label">Time:</label>
        <input
          type="time"
          className="edit-input"
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

export { TaskList };
export default Task;
