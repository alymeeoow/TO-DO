import { useState, useEffect } from "react";
import "../../assets/styles/edit_task_type_modal.css";

const EditTaskTypeModal = ({ taskType, taskTypes, onSave, onClose }) => {
    const [newTypeName, setNewTypeName] = useState(taskType);
    const [error, setError] = useState("");
  
    const handleSubmit = (e) => {
      e.preventDefault(); 
      
      if (!newTypeName.trim()) {
        setError("Task type name cannot be empty");
        return;
      }
      
      if (taskTypes.includes(newTypeName) && newTypeName !== taskType) {
        setError("Task type already exists");
        return;
      }
      
      onSave(newTypeName);
    };
  
    return (
      <div className="edit-task-type-overlay">
        <div className="edit-task-type-modal">
          <h2 className="edit-task-type-title">Edit Task Category</h2>
          
          {error && <div className="edit-task-type-error-message">{error}</div>}
          
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              className="edit-task-type-input"
              value={newTypeName}
              onChange={(e) => {
                setNewTypeName(e.target.value);
                setError("");
              }}
            />
            
            <div className="edit-task-type-buttons">
            
              <button 
                type="submit" 
                className="edit-task-type-save-btn"
              >
                Update
              </button>


              <button 
                type="button" 
                className="edit-task-type-close-btn"
                onClick={onClose}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };
export default EditTaskTypeModal;
