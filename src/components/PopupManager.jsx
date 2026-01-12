import React, { useEffect } from 'react';
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimes } from 'react-icons/fa';
import { usePopup } from '../context/PopupContext';

const PopupManager = () => {
    const { toasts, modal, handleConfirm, handleCancel } = usePopup();

    return (
        <>
            {/* Toast Container */}
            <div className="toast-container">
                {toasts.map(toast => (
                    <div key={toast.id} className={`toast toast-${toast.type}`}>
                        <div className="toast-icon">
                            {toast.type === 'success' && <FaCheckCircle />}
                            {toast.type === 'error' && <FaExclamationCircle />}
                            {toast.type === 'info' && <FaInfoCircle />}
                        </div>
                        <div className="toast-message">{toast.message}</div>
                    </div>
                ))}
            </div>

            {/* Modal Overlay */}
            {modal.isOpen && (
                <div className="custom-modal-overlay">
                    <div className="custom-modal">
                        <div className="custom-modal-header">
                            <h3>{modal.title}</h3>
                            <button className="close-btn" onClick={handleCancel}><FaTimes /></button>
                        </div>
                        <div className="custom-modal-body">
                            <p>{modal.message}</p>
                        </div>
                        <div className="custom-modal-footer">
                            {modal.type === 'confirm' ? (
                                <>
                                    <button className="modal-btn btn-secondary" onClick={handleCancel}>
                                        {modal.cancelText}
                                    </button>
                                    <button className="modal-btn btn-primary" onClick={handleConfirm}>
                                        {modal.confirmText}
                                    </button>
                                </>
                            ) : (
                                <button className="modal-btn btn-primary" onClick={handleConfirm}>
                                    OK
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default PopupManager;
