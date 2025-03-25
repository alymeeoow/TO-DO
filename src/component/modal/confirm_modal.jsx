import React, { useEffect } from "react";
import "../../assets/styles/confirm_modal.css";

const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmButtonClass = "confirm-modal-confirm-btn",
  cancelButtonClass = "confirm-modal-cancel-btn",
  modalId = "default-modal" 
}) => {
  useEffect(() => {
    console.log(`Modal ${modalId} mounted/updated`); 
    return () => console.log(`Modal ${modalId} unmounted`);
  }, [modalId]);

  if (!isOpen) return null;

  return (
    <div className="confirm-modal-overlay" data-modal-id={modalId}>
      <div className="confirm-modal-content">
        <h3>{title}</h3>
        <p>{message}</p>
        <div className="confirm-modal-actions">
          <button className={confirmButtonClass} onClick={onConfirm}>
            {confirmText}
          </button>
          <button className={cancelButtonClass} onClick={onClose}>
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;