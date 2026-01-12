import React, { createContext, useContext, useState, useCallback } from 'react';

const PopupContext = createContext();

export const PopupProvider = ({ children }) => {
    // Toast State
    const [toasts, setToasts] = useState([]);

    // Modal State
    const [modal, setModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        type: 'info', // info, confirm, error
        onConfirm: null,
        onCancel: null,
        confirmText: 'OK',
        cancelText: 'Cancel'
    });

    // Toast Methods
    const showToast = useCallback((message, type = 'info', duration = 3000) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, duration);
    }, []);

    // Modal Methods
    const showModal = useCallback(({ title, message, type = 'info', onConfirm, onCancel, confirmText = 'OK', cancelText = 'Cancel' }) => {
        setModal({
            isOpen: true,
            title,
            message,
            type,
            onConfirm,
            onCancel,
            confirmText,
            cancelText
        });
    }, []);

    const closeModal = useCallback(() => {
        setModal(prev => ({ ...prev, isOpen: false }));
    }, []);

    const handleConfirm = useCallback(() => {
        if (modal.onConfirm) modal.onConfirm();
        closeModal();
    }, [modal, closeModal]);

    const handleCancel = useCallback(() => {
        if (modal.onCancel) modal.onCancel();
        closeModal();
    }, [modal, closeModal]);

    return (
        <PopupContext.Provider value={{ showToast, showModal, closeModal, toasts, modal, handleConfirm, handleCancel }}>
            {children}
        </PopupContext.Provider>
    );
};

export const usePopup = () => useContext(PopupContext);
