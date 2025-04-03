import React, { useState, useEffect, useRef } from "react";
import { FiPlus, FiTrash2, FiClipboard, FiEdit, FiHelpCircle } from "react-icons/fi";
import TaskModal from "./modal/task_modal";
import TaskEditModal from "./modal/edit_task_modal";
import TaskTypeModal from "./modal/task_type_modal";
import EditTaskTypeModal from "./modal/edit_task_type_modal";
import ConfirmModal from "./modal/confirm_modal";
import { TaskList } from "./task";
import "../assets/styles/todo_list.css";

const TodoList = () => {
  const [tasks, setTasks] = useState(() => {
    try {
      const savedTasks = localStorage.getItem("tasks");
      return savedTasks ? JSON.parse(savedTasks) : [];
    } catch (error) {
      return [];
    }
  });

  const [taskTypes, setTaskTypes] = useState(() => {
    try {
      const savedTaskTypes = localStorage.getItem("taskTypes");
      return savedTaskTypes ? JSON.parse(savedTaskTypes) : ["Default"];
    } catch (error) {
      return ["Default"];
    }
  });

  const [selectedTasks, setSelectedTasks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showTaskTypeModal, setShowTaskTypeModal] = useState(false);
  const [showEditTaskTypeModal, setShowEditTaskTypeModal] = useState(false);
  const [selectedTaskType, setSelectedTaskType] = useState(taskTypes[0] || "Default");
  const [editingTaskType, setEditingTaskType] = useState(null);
  const [newTaskTypeName, setNewTaskTypeName] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [confirmTitle, setConfirmTitle] = useState("");
  const [taskBeingEdited, setTaskBeingEdited] = useState(null);
  const [tutorialMode, setTutorialMode] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const tutorialPopupRef = useRef(null);
  const [popupPosition, setPopupPosition] = useState({
    top: 0,
    left: 0,
    width: 400,
    arrowLeft: "50%",
    positionClass: "below"
  });

  const tutorialSteps = [
    {
      element: ".task-type.active",
      title: "Task Categories",
      description: "These are your task categories. Click to switch between them."
    },
    {
      element: ".add-filter",
      title: "Add Category",
      description: "Click here to add a new task category."
    },
    {
      element: ".add-task-btn",
      title: "Add Task",
      description: "Click this button to create a new task."
    },
    {
      element: ".delete-all-btn:not(.hidden-placeholder)",
      title: "Delete Tasks",
      description: "Select tasks and click here to delete multiple at once."
    },
    {
      element: ".task",
      title: "Task Management",
      description: "Click the icons to edit, complete, or delete individual tasks."
    }
  ];

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem("taskTypes", JSON.stringify(taskTypes));
  }, [taskTypes]);

  useEffect(() => {
    if (tutorialMode) {
      const currentElement = document.querySelector(tutorialSteps[currentStep].element);
      if (currentElement) {
        const elementRect = currentElement.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;
        
        // Calculate popup position
        let topPosition = elementRect.bottom + window.scrollY + 15;
        let leftPosition = elementRect.left + window.scrollX;
        let width = Math.min(400, viewportWidth - 40);
        let arrowLeft = "50%";
        let positionClass = "below";

        // Adjust if popup would go off screen
        if (topPosition + 200 > viewportHeight + window.scrollY) {
          topPosition = elementRect.top + window.scrollY - 200 - 15;
          positionClass = "above";
        }

        // Adjust for edge cases
        if (leftPosition + width > viewportWidth + window.scrollX) {
          leftPosition = viewportWidth + window.scrollX - width - 20;
          arrowLeft = `${elementRect.right - leftPosition - 12}px`;
        }

        setPopupPosition({
          top: topPosition,
          left: leftPosition,
          width,
          arrowLeft,
          positionClass
        });

        // Scroll to element
        currentElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'nearest'
        });
      }
    }
  }, [tutorialMode, currentStep]);

  const addTask = (task) => {
    setTasks((prevTasks) => [
      ...prevTasks,
      { ...task, id: Date.now(), createdAt: new Date().toISOString() },
    ]);
  };

  const updateTask = (updatedTask) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) => (task.id === updatedTask.id ? updatedTask : task))
    );
    setTaskBeingEdited(null);
    setShowModal(false);
  };

  const addTaskType = (taskType) => {
    if (!taskType.trim() || taskTypes.includes(taskType)) return;
    setTaskTypes((prevTypes) => [...prevTypes, taskType]);
  };

  const deleteTaskType = (taskType) => {
    if (taskTypes.length === 1) return;
    const updatedTaskTypes = taskTypes.filter((category) => category !== taskType);
    setTaskTypes(updatedTaskTypes);
    setTasks((prevTasks) =>
      prevTasks.filter((task) => task.category !== taskType)
    );
    if (selectedTaskType === taskType) {
      setSelectedTaskType(updatedTaskTypes[0] || "Default");
    }
  };

  const deleteTask = (taskId) => {
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
  };

  const toggleTaskSelection = (taskId) => {
    setSelectedTasks((prevSelected) =>
      prevSelected.includes(taskId)
        ? prevSelected.filter((id) => id !== taskId)
        : [...prevSelected, taskId]
    );
  };

  const deleteSelectedTasks = () => {
    setTasks((prevTasks) =>
      prevTasks.filter((task) => !selectedTasks.includes(task.id))
    );
    setSelectedTasks([]);
  };

  const handleDeleteRequest = (type, item) => {
    if (type === "Bulk Tasks") {
      setConfirmTitle("Delete Selected Tasks?");
      setConfirmMessage(
        `Are you sure you want to delete ${selectedTasks.length} selected task(s)? This action cannot be undone.`
      );
      setConfirmAction(() => () => {
        deleteSelectedTasks();
      });
    } else {
      setConfirmTitle(`Delete ${type}?`);
      setConfirmMessage(
        type === "To-Do Category" // Changed from "To-Do Type"
          ? `Are you sure you want to delete the "${item}" To-Do Category? All associated tasks will be permanently removed.`
          : `Are you sure you want to delete this task?`
      );
  
      if (type === "To-Do Category") { // Changed from "To-Do Type"
        setConfirmAction(() => () => deleteTaskType(item));
      } else if (type === "Task") {
        setConfirmAction(() => () => deleteTask(item));
      }
    }
  
    setShowConfirmModal(true);
  };

  const updateTaskType = (newType) => {
    if (!newType.trim() || taskTypes.includes(newType)) return;
    const updatedTaskTypes = taskTypes.map((type) =>
      type === editingTaskType ? newType : type
    );
    setTaskTypes(updatedTaskTypes);
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.category === editingTaskType
          ? { ...task, category: newType }
          : task
      )
    );
    setSelectedTaskType(newType);
    setShowEditTaskTypeModal(false);
  };

  const onToggleSelect = (taskId) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId
          ? { ...task, completed: !task.completed, checkedAt: !task.completed ? new Date().toISOString() : null }
          : task
      )
    );
  };

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

  return (
    <div className="todo-wrapper">
      {/* Tutorial Help Button */}
      <button 
        className="tutorial-btn"
        onClick={startTutorial}
        aria-label="Start tutorial"
      >
        <FiHelpCircle className="tutorial-icon" />
        Help
      </button>

      <div className="sidebar">
        <h2>Just Do-it</h2>
        <p className="username">JD x Journey</p>
        <ul>
  <li className="categories-label">
    <span className="categories-span">My Categories</span>
  </li>
  {taskTypes.map((type, index) => {
    const pendingTaskCount = tasks.filter(
      (task) => task.category === type && !task.completed
    ).length;
    return (
      <li
        key={index}
        className={`task-type ${selectedTaskType === type ? "active" : ""} ${
          tutorialMode && currentStep === 0 ? "tutorial-highlight" : ""
        }`}
        onClick={() => setSelectedTaskType(type)}
      >
        <span className="task-type-label">
          <span className="clipboard-icon-wrapper">
            <FiClipboard className="icon clipboard-badge" />
            {pendingTaskCount > 0 && (
              <span className="clipboard-inner-count">{pendingTaskCount}</span>
            )}
          </span>
          {type}
        </span>
        <div className="task-type-actions">
          <FiEdit
            className="edit-type-icon"
            onClick={(e) => {
              e.stopPropagation();
              setEditingTaskType(type);
              setNewTaskTypeName(type);
              setShowEditTaskTypeModal(true);
            }}
          />
          {type !== "Default" && (
            <FiTrash2
              className="delete-icon"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteRequest("To-Do Category", type);
              }}
            />
          )}
        </div>
      </li>
    );
  })}
  <li 
    className={`add-filter ${tutorialMode && currentStep === 1 ? "tutorial-highlight" : ""}`} 
    onClick={() => setShowTaskTypeModal(true)}
  >
    <FiPlus className="icon" /> Add To-Do Category
  </li>
</ul>
      </div>

      <div className="main-content">
        <div className="header">
          <h1>{selectedTaskType ? `${selectedTaskType} To-Do` : "Select a Task Type"}</h1>
          <div className="task-actions">
            {selectedTasks.length > 0 ? (
              <button
                className={`delete-all-btn ${
                  tutorialMode && currentStep === 3 ? "tutorial-highlight" : ""
                }`}
                onClick={() => handleDeleteRequest("Bulk Tasks")}
              >
                Delete Selected ({selectedTasks.length})
              </button>
            ) : (
              <button className="delete-all-btn hidden-placeholder" disabled>
                Delete Placeholder
              </button>
            )}
            <button
              className={`add-task-btn ${
                tutorialMode && currentStep === 2 ? "tutorial-highlight" : ""
              }`}
              onClick={() => {
                setTaskBeingEdited(null);
                setShowModal(true);
              }}
            >
              <FiPlus /> Add To-Do
            </button>
          </div>
        </div>

        <div className="tasks">
          <TaskList
            tasks={tasks.filter((task) => task.category === selectedTaskType)}
            onToggleComplete={(id) => {
              setTasks((prev) =>
                prev.map((task) =>
                  task.id === id
                    ? {
                        ...task,
                        completed: !task.completed,
                        checkedAt: !task.completed ? new Date().toISOString() : null,
                      }
                    : task
                )
              );
            }}
            onDelete={(id) => handleDeleteRequest("Task", id)}
            onEdit={(task) => {
              setTaskBeingEdited(task);
              setShowModal(true);
            }}
            selectedTasks={selectedTasks}
            onToggleSelect={toggleTaskSelection}
            tutorialMode={tutorialMode}
          />
        </div>
      </div>

      {/* Tutorial Popup */}
      {tutorialMode && (
        <div 
          className="tutorial-popup-container" 
          ref={tutorialPopupRef}
          style={{
            top: `${popupPosition.top}px`,
            left: `${popupPosition.left}px`,
            width: `${popupPosition.width}px`
          }}
        >
          <div className="tutorial-popup">
            <h3>{tutorialSteps[currentStep].title}</h3>
            <p>{tutorialSteps[currentStep].description}</p>
            <div className="tutorial-navigation">
              {currentStep > 0 && (
                <button onClick={prevStep} className="tutorial-nav-btn">
                  Previous
                </button>
              )}
              <button onClick={nextStep} className="tutorial-nav-btn">
                {currentStep === tutorialSteps.length - 1 ? "Finish" : "Next"}
              </button>
            </div>
          </div>
          <div 
            className={`tutorial-arrow ${
              popupPosition.positionClass === "above" ? "arrow-bottom" : "arrow-top"
            }`}
            style={{ left: popupPosition.arrowLeft }}
          ></div>
        </div>
      )}

      {/* Tutorial Overlay */}
      {tutorialMode && <div className="tutorial-overlay"></div>}

      {/* Existing modals */}
      {showModal && !taskBeingEdited && (
        <TaskModal
          onClose={() => setShowModal(false)}
          addTask={addTask}
          taskTypes={taskTypes}
          defaultCategory={selectedTaskType}
        />
      )}

      {showModal && taskBeingEdited && (
        <TaskEditModal
          isOpen={showModal}
          task={taskBeingEdited}
          onClose={() => {
            setTaskBeingEdited(null);
            setShowModal(false);
          }}
          onSave={updateTask}
        />
      )}

      {showEditTaskTypeModal && (
        <EditTaskTypeModal
          taskType={editingTaskType}
          taskTypes={taskTypes}
          onSave={updateTaskType}
          onClose={() => setShowEditTaskTypeModal(false)}
        />
      )}

      {showTaskTypeModal && (
        <TaskTypeModal
          isOpen={showTaskTypeModal}
          onClose={() => setShowTaskTypeModal(false)}
          addTaskType={addTaskType}
        />
      )}

      {showConfirmModal && (
        <ConfirmModal
          isOpen={showConfirmModal}
          title={confirmTitle}
          message={confirmMessage}
          onClose={() => setShowConfirmModal(false)}
          onConfirm={() => {
            if (confirmAction) confirmAction();
            setShowConfirmModal(false);
          }}
        />
      )}
    </div>
  );
};

export default TodoList;