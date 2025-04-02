import { useState, useEffect } from "react";
import { FiPlus, FiTrash2, FiClipboard, FiEdit } from "react-icons/fi";
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


  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);


  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

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
  const [selectedTaskType, setSelectedTaskType] = useState(
    taskTypes[0] || "Default"
  );
  const [editingTaskType, setEditingTaskType] = useState(null);
  const [newTaskTypeName, setNewTaskTypeName] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [confirmTitle, setConfirmTitle] = useState("");
  const [taskBeingEdited, setTaskBeingEdited] = useState(null);

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem("taskTypes", JSON.stringify(taskTypes));
  }, [taskTypes]);

  const addTask = (task) => {
    setTasks((prevTasks) => [
      ...prevTasks,
      { ...task, id: Date.now(), createdAt: new Date().toISOString() }, // Adding createdAt timestamp
    ]);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString(); // Format the date as you need
  };

  const updateTask = async (updatedTask) => {
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
    const updatedTaskTypes = taskTypes.filter((type) => type !== taskType);
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
  

  return (
    <div className="todo-wrapper">
      <div className="sidebar">
        <h2>Just Do-it</h2>
        <p className="username">JD x Journey</p>
        <ul>
          {taskTypes.map((type, index) => {
            const pendingTaskCount = tasks.filter(
              (task) => task.category === type && !task.completed
            ).length;
            return (
              <li
                key={index}
                className={`task-type ${selectedTaskType === type ? "active" : ""}`}
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
                        handleDeleteRequest("To-Do Type", type);
                      }}
                    />
                  )}
                </div>
              </li>
            );
          })}
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
            <button
              className="add-task-btn"
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
  formatDate={formatDate}
/>
        </div>
      </div>

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
          onSave={(updatedTask) => {
            setTasks((prev) =>
              prev.map((t) => (t.id === updatedTask.id ? updatedTask : t))
            );
            setShowModal(false);
          }}
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
