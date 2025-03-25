import { useState } from "react";
import "../../assets/styles/task_type_modal.css";

const TaskTypeModal = ({ onClose, addTaskType }) => {
  const [taskType, setTaskType] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (taskType.trim() === "") return;

    addTaskType(taskType);


    const storedTaskTypes = JSON.parse(localStorage.getItem("taskTypes")) || [];
    localStorage.setItem("taskTypes", JSON.stringify([...storedTaskTypes, taskType]));

    setTaskType("");
    onClose();
  };

  return (
    <div className="task-type-modal-overlay">
      <div className="task-type-modal">
        <h2>Add Task Type</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Enter task type"
            value={taskType}
            onChange={(e) => setTaskType(e.target.value)}
            className="task-type-input"
          />
          <div className="task-type-modal-buttons">
            <button type="submit" className="add-btn">Add</button>
            <button type="button" onClick={onClose} className="cancel-btn">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskTypeModal;
