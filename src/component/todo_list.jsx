import { useState, useEffect } from "react";
import { FiPlus, FiTrash, FiClipboard } from "react-icons/fi";
import TaskModal from "./modal/task_modal";
import TaskTypeModal from "./modal/task_type_modal";
import {TaskList} from "./task";
import ConfirmModal from "./modal/confirm_modal";
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
  const [selectedTaskType, setSelectedTaskType] = useState(taskTypes[0] || "Default");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [confirmTitle, setConfirmTitle] = useState("");

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem("taskTypes", JSON.stringify(taskTypes));
  }, [taskTypes]);

  const addTask = (task) => {
    setTasks((prevTasks) => [...prevTasks, { ...task, id: Date.now() }]);
  };

  const addTaskType = (taskType) => {
    if (!taskType.trim() || taskTypes.includes(taskType)) return;
    setTaskTypes((prevTypes) => [...prevTypes, taskType]);
  };

  const deleteTaskType = (taskType) => {
    if (taskTypes.length === 1) return;
    const updatedTaskTypes = taskTypes.filter((type) => type !== taskType);
    setTaskTypes(updatedTaskTypes);
    setTasks((prevTasks) => prevTasks.filter((task) => task.category !== taskType));
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
    setTasks((prevTasks) => prevTasks.filter((task) => !selectedTasks.includes(task.id)));
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
        type === "To-Do Type"
          ? `Are you sure you want to delete the "${item}" To-Do Type? All associated tasks will be permanently removed.`
          : `Are you sure you want to delete this task?`
      );

      if (type === "To-Do Type") {
        setConfirmAction(() => () => deleteTaskType(item));
      } else if (type === "Task") {
        setConfirmAction(() => () => deleteTask(item));
      }
    }

    setShowConfirmModal(true);
  };

  return (
    <div className="todo-wrapper">
      <div className="sidebar">
        <h2>Just Do-it</h2>
        <p className="username">JD x Journey</p>
        <ul>
          {taskTypes.map((type, index) => (
            <li
              key={index}
              className={`task-type ${selectedTaskType === type ? "active" : ""}`}
              onClick={() => setSelectedTaskType(type)}
            >
              <span>
                <FiClipboard className="icon" /> {type}
              </span>
              {type !== "Default" && (
                <FiTrash
                  className="delete-icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteRequest("To-Do Type", type);
                  }}
                />
              )}
            </li>
          ))}
          <li className="add-filter" onClick={() => setShowTaskTypeModal(true)}>
            <FiPlus className="icon" /> Add To-Do Type
          </li>
        </ul>
      </div>

      <div className="main-content">
        <div className="header">
          <h1>{selectedTaskType ? `${selectedTaskType} To-Do` : "Select a Task Type"}</h1>
          <div className="task-actions">
            {selectedTasks.length > 0 ? (
              <button
                className="delete-all-btn"
                onClick={() => handleDeleteRequest("Bulk Tasks")}
              >
                Delete Selected ({selectedTasks.length})
              </button>
            ) : (
              <button className="delete-all-btn hidden-placeholder" disabled>
                Delete Placeholder
              </button>
            )}
            <button className="add-task-btn" onClick={() => setShowModal(true)}>
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
          task.id === id ? { ...task, completed: !task.completed } : task
        )
      );
    }}
    onDelete={(id) => handleDeleteRequest("Task", id)}
    onEdit={(task) => {
      setShowModal(true);

    }}
    selectedTasks={selectedTasks}
    onToggleSelect={toggleTaskSelection}
  />
</div>

      </div>

      {showModal && (
        <TaskModal
          onClose={() => setShowModal(false)}
          addTask={addTask}
          taskTypes={taskTypes}
          defaultCategory={selectedTaskType}
        />
      )}
      {showTaskTypeModal && (
        <TaskTypeModal
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
