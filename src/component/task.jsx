import React, { useState, useEffect } from "react";
import {
  FiCheck,
  FiCircle,
  FiTrash2,
  FiEdit,
  FiSquare,
  FiCheckSquare,
  FiSearch,
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
  const [sortOption, setSortOption] = useState("all");
  const [searchQuery, setSearchQuery] = useState(""); // Add search query state
  const [isSearchVisible, setIsSearchVisible] = useState(false); 

  const getSortedTasks = () => {
    let filteredTasks = [...tasks];
    const today = new Date().toLocaleDateString("en-CA");

    
    switch (sortOption) {
      case "done":
        filteredTasks = filteredTasks.filter((task) => task.completed);
        break;
      case "pending":
        filteredTasks = filteredTasks.filter((task) => !task.completed);
        break;
      case "nearest":
        filteredTasks = filteredTasks.filter(
          (task) => new Date(task.date).toLocaleDateString("en-CA") === today
        );
        break;
      default:
        break;
    }


    filteredTasks = filteredTasks.sort((a, b) => {
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }

      const dateA = new Date(`${a.date}T${a.time || "00:00"}`);
      const dateB = new Date(`${b.date}T${b.time || "00:00"}`);

      switch (sortOption) {
        case "soonest_due":
          return dateA - dateB; 
        case "farthest_due":
          return dateB - dateA;
        default:
          return 0;
      }
    });

    return filteredTasks;
  };


  
  

  // Apply search filter
  const filteredTasks = getSortedTasks().filter((task) =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <option value="all">All Tasks</option>
          <option value="soonest_due">Soonest Due</option>
          <option value="farthest_due">Farthest Due</option>
          <option value="nearest">Due Today</option>
          <option value="done">Completed</option>
          <option value="pending">Pending</option>
        </select>

        {!isSearchVisible && (
          <FiSearch
            className="search-icon"
            onClick={() => setIsSearchVisible(true)}
            aria-label="Search tasks"
          />
        )}

        {isSearchVisible && (
          <div className={`search-bar-container ${isSearchVisible ? "visible" : ""}`}>
            <input
              type="text"
              className="task-search-input"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              className="close-search-btn"
              onClick={() => setIsSearchVisible(false)}
              aria-label="Close search"
            >
              ×
            </button>
          </div>
        )}
      </div>

      {filteredTasks.map((task) => (
        <Task
          key={task.id}
          task={task}
          onToggleComplete={onToggleComplete}
          onDelete={onDelete}
          onEdit={() => onEdit(task)}
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

  const formatCompletedAt = (dateStr) => {
    const date = new Date(dateStr);
    const month = date.toLocaleString("en-US", { month: "long" });
    const day = String(date.getDate()).padStart(2, "0");
    const year = date.getFullYear();
    
    let hours = date.getHours();
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours || 12; 
    const minutes = String(date.getMinutes()).padStart(2, "0");
    
    return `${month}-${day}-${year} ${hours}:${minutes} ${ampm}`;
  }

  const handleDeleteClick = (e) => {
    e.stopPropagation();  
    onDelete(task.id);
  };

  const handleCheckboxClick = (e) => {
    e.stopPropagation();  
    onToggleSelect(task.id); 
  };

  
  

  return (
    <div className={`task ${task.category} ${isSelected ? "selected" : ""} ${task.completed ? "completed" : ""}`}>
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
          onClick={(e) => {
            e.stopPropagation();
            onToggleComplete(task.id);
          }}
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
          {task.completed && task.checkedAt && (
            <div className="task-checked-at">
                  <strong>Completed At:</strong> {formatCompletedAt(task.checkedAt)}
     
            </div>
          )}
        </div>
      </div>

      <div className="task-actions">
        <FiEdit
          className="edit-btn-btn icon-style"
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
