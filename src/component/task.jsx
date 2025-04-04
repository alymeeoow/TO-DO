import React, { useState, useEffect } from "react";
import {
  FiCheck,
  FiCircle,
  FiTrash2,
  FiEdit,
  FiSquare,
  FiCheckSquare,
  FiSearch,
  FiHelpCircle,
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
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [tutorialMode, setTutorialMode] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const tutorialSteps = [
    {
      element: ".sort-select",
      title: "Sort Tasks",
      description: "Use this dropdown to sort your tasks by different criteria.",
    },
    {
      element: ".search-icon",
      title: "Search Tasks",
      description: "Click this icon to search for specific tasks by their title.",
    },
    {
      element: ".task-checkbox",
      title: "Select Tasks",
      description: "Check this box to select multiple tasks for bulk actions.",
    },
    {
      element: ".task-status",
      title: "Toggle Completion",
      description: "Click here to mark a task as complete or you can also unmark it again.",
    },
    {
      element: ".edit-btn-btn",
      title: "Edit Task",
      description: "Click this button to edit the task details.",
    },
    {
      element: ".delete-btn",
      title: "Delete Task",
      description: "Click this button to permanently delete the task.",
    },
  ];


  const sampleTasks = [
    {
      id: 'sample-1',
      title: 'Complete project presentation',
      date: new Date(Date.now() + 86400000).toISOString().split('T')[0], 
      time: '14:00',
      completed: false,
      category: 'work'
    },
    {
      id: 'sample-2',
      title: 'Buy groceries',
      date: new Date().toISOString().split('T')[0], 
      time: '18:30',
      completed: true,
      checkedAt: new Date().toISOString(),
      category: 'personal'
    }
  ];


  const displayTasks = tutorialMode && tasks.length === 0 ? sampleTasks : tasks;

  const startTutorial = () => {
    setTutorialMode(true);
    setCurrentStep(0);
  };

  const nextStep = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setTutorialMode(false);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getSortedTasks = () => {
    let filteredTasks = [...displayTasks];
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
          (task) => task.date && new Date(task.date).toLocaleDateString("en-CA") === today
        );
        break;
      default:
        break;
    }

    filteredTasks = filteredTasks.sort((a, b) => {
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }

      const dateA = a.date ? new Date(`${a.date}T${a.time || "00:00"}`) : null;
      const dateB = b.date ? new Date(`${b.date}T${b.time || "00:00"}`) : null;

      switch (sortOption) {
        case "soonest_due":
          return dateA && dateB ? dateA - dateB : 0;
        case "farthest_due":
          return dateA && dateB ? dateB - dateA : 0;
        default:
          return 0;
      }
    });

    return filteredTasks;
  };

  const filteredTasks = getSortedTasks().filter((task) =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    if (tutorialMode) {
      const currentElement = document.querySelector(tutorialSteps[currentStep].element);
      if (currentElement) {
        currentElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [tutorialMode, currentStep]);

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
          className={`sort-select ${tutorialMode && currentStep === 0 ? "tutorial-highlight" : ""}`}
        >
          <option value="all">All Tasks</option>
   
          <option value="done">Completed</option>
          <option value="pending">Pending</option>
        </select>

        {!isSearchVisible && (
          <FiSearch
            className={`search-icon ${tutorialMode && currentStep === 1 ? "tutorial-highlight" : ""}`}
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

        <button 
          className="tutorial-btn"
          onClick={startTutorial}
          aria-label="Start tutorial"
        >
          <FiHelpCircle className="tutorial-icon" />
          Help
        </button>
      </div>

      {tutorialMode && (
        <div className="tutorial-overlay">
          <div className="tutorial-popup">
            <h3>{tutorialSteps[currentStep].title}</h3>
            <p>{tutorialSteps[currentStep].description}</p>
            <div className="tutorial-navigation">
              {currentStep > 0 && (
                <button onClick={prevStep} className="tutorial-nav-btn-prev">
                  Previous
                </button>
              )}
              <button onClick={nextStep} className="tutorial-nav-btn">
                {currentStep === tutorialSteps.length - 1 ? "Finish" : "Next"}
              </button>
            </div>
          </div>
        </div>
      )}

      {filteredTasks.length === 0 && !tutorialMode ? (
        <div className="no-tasks-message">
          <p>No tasks found. Create your first task to get started!</p>
        </div>
      ) : (
        filteredTasks.map((task) => (
          <Task
            key={task.id}
            task={task}
            onToggleComplete={onToggleComplete}
            onDelete={onDelete}
            onEdit={() => onEdit(task)}
            isSelected={selectedTasks.includes(task.id)}
            onToggleSelect={() => onToggleSelect(task.id)}
            showCheckbox={true}
            tutorialMode={tutorialMode}
            currentTutorialStep={currentStep}
            isSample={tutorialMode && tasks.length === 0}
          />
        ))
      )}
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
  tutorialMode = false,
  currentTutorialStep = 0,
  isSample = false,
}) => {
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "2-digit",
      year: "numeric",
    });
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return "";
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
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const month = date.toLocaleString("en-US", { month: "long" });
    const day = String(date.getDate()).padStart(2, "0");
    const year = date.getFullYear();

    let hours = date.getHours();
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${month}-${day}-${year} ${hours}:${minutes} ${ampm}`;
  };

  const handleDeleteClick = (e) => {
    if (isSample) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    e.stopPropagation();
    onDelete(task.id);
  };

  const handleCheckboxClick = (e) => {
    if (isSample) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    e.stopPropagation();
    onToggleSelect(task.id);
  };

  const handleToggleComplete = (e) => {
    if (isSample) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    e.stopPropagation();
    onToggleComplete(task.id);
  };

  const handleEditClick = (e) => {
    if (isSample) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    e.stopPropagation();
    onEdit(task);
  };

  return (
    <div className={`task ${task.category} ${isSelected ? "selected" : ""} ${task.completed ? "completed" : ""} ${isSample ? "sample-task" : ""}`}>
      {showCheckbox && (
        <div
          className={`task-checkbox ${tutorialMode && currentTutorialStep === 2 ? "tutorial-highlight" : ""}`}
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
          {isSelected ? <FiCheckSquare className="checkbox-icon checked" /> : <FiSquare className="checkbox-icon" />}
        </div>
      )}

      <div className="task-content">
        <div className="task-details">
          <span className="task-title">{task.title}</span>
          {(task.date || task.time) && (
            <span className="task-datetime">
              <strong>{formatDate(task.date)}</strong>
              {task.date && task.time ? " - " : ""}
              {formatTime(task.time)}
            </span>
          )}
          {task.completed && task.checkedAt && (
            <div className="task-checked-at">
              <strong>Completed At:</strong> {formatCompletedAt(task.checkedAt)}
            </div>
          )}
        </div>
      </div>

      <div className="task-actions">
        {task.completed ? (
          <FiCheck
            className={`task-status completed ${tutorialMode && currentTutorialStep === 3 ? "tutorial-highlight" : ""}`}
            onClick={handleToggleComplete}
            aria-label="Mark as incomplete"
          />
        ) : (
          <div
            className={`task-status-container ${tutorialMode && currentTutorialStep === 3 ? "tutorial-highlight" : ""}`}
            onClick={handleToggleComplete}
            aria-label="Mark as complete"
          >
            <FiCircle className="task-status" />
            <FiCheck className="task-checkmark" />
          </div>
        )}

<FiEdit
  className={`edit-btn-btn icon-style ${tutorialMode && currentTutorialStep === 4 ? "tutorial-highlight" : ""} ${task.completed ? "disabled" : ""}`}
  onClick={task.completed ? undefined : handleEditClick}
  aria-label="Edit task"
/>

        
        <FiTrash2
          className={`delete-btn icon-style ${tutorialMode && currentTutorialStep === 5 ? "tutorial-highlight" : ""}`}
          onClick={handleDeleteClick}
          aria-label="Delete task"
        />
      </div>
    </div>
  );
};

export { TaskList };
export default Task;