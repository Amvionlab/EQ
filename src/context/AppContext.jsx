import React, { createContext, useContext, useState, useEffect } from 'react';
import { STORAGE_KEYS } from '../services/storage';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const [dataStatus, setDataStatus] = useState({
        form: false,
        pan: false,
        gst: false,
        aadhar: false
    });

    const [loadingState, setLoadingState] = useState({
        isLoading: false,
        title: '',
        subtitle: ''
    });

    const checkDataStatus = () => {
        setDataStatus({
            form: !!localStorage.getItem(STORAGE_KEYS.FORM_DATA),
            pan: !!localStorage.getItem(STORAGE_KEYS.PAN_DATA),
            gst: !!localStorage.getItem(STORAGE_KEYS.GST_DATA),
            aadhar: !!localStorage.getItem(STORAGE_KEYS.AADHAR_DATA)
        });
    };

    useEffect(() => {
        checkDataStatus();
        window.addEventListener('storage', checkDataStatus);
        return () => window.removeEventListener('storage', checkDataStatus);
    }, []);

    const updateStatus = (type, hasData) => {
        setDataStatus(prev => ({
            ...prev,
            [type]: hasData
        }));
    };

    const showLoader = (title, subtitle) => {
        setLoadingState({ isLoading: true, title, subtitle });
    };

    const hideLoader = () => {
        setLoadingState({ isLoading: false, title: '', subtitle: '' });
    };

    return (
        <AppContext.Provider value={{ dataStatus, updateStatus, checkDataStatus, loadingState, showLoader, hideLoader }}>
            {children}
        </AppContext.Provider>
    );
};

export const useApp = () => useContext(AppContext);
