import { useState } from "react";
import "../../assets/styles/task_modal.css";

const TaskModal = ({ onClose, addTask, taskTypes, defaultCategory }) => {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [category, setCategory] = useState(defaultCategory || (taskTypes.length > 0 ? taskTypes[0] : ""));
  const [errorMessage, setErrorMessage] = useState("");

  const isPastDateTime = () => {
    if (!date || !time) return false;
    const selectedDateTime = new Date(`${date}T${time}`);
    return selectedDateTime < new Date();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !date || !time || !category || isPastDateTime()) {
      setErrorMessage("You cannot input a past date or time.");
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
          {isPastDateTime() && <p className="error-message">You cannot input a past date or time.</p>}
          <input
            type="text"
            placeholder="Task Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={isPastDateTime() ? "error-input" : ""}
          />
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className={isPastDateTime() ? "error-input" : ""}
          />
          <input
            type="text"
            value={category}
            disabled={!!defaultCategory} 
            onChange={(e) => setCategory(e.target.value)}
          />
          <div className="modal-buttons">
            <button type="submit" className="save-btn" disabled={isPastDateTime()}>Add</button>
            <button type="button" className="close-btn" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;
