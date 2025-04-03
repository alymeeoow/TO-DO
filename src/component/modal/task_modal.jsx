import { useState } from "react";
import "../../assets/styles/task_modal.css";

const TaskModal = ({ onClose, addTask, taskTypes, defaultCategory }) => {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [category, setCategory] = useState(defaultCategory || (taskTypes.length > 0 ? taskTypes[0] : ""));
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !category) {
      return;
    }

    const newTask = { id: Date.now(), title, date, time, category };

    addTask(newTask);

    const storedTasks = JSON.parse(localStorage.getItem("tasks")) || [];
    localStorage.setItem("tasks", JSON.stringify([...storedTasks, newTask]));

    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Add Task</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Task Description"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
          <input className="type"
            type="text"
            value={category}
            disabled={!!defaultCategory} 
            onChange={(e) => setCategory(e.target.value)}
            required
          />
          <div className="modal-buttons">
            <button type="submit" className="save-btn">Add</button>
            <button type="button" className="close-btn" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;
