import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import LoadingOverlay from '../LoadingOverlay';
import PopupManager from '../PopupManager';
import { AppProvider, useApp } from '../../context/AppContext';
import { PopupProvider } from '../../context/PopupContext';

// Inner component to access context
const LayoutContent = () => {
    const { loadingState } = useApp();

    return (
        <div id="root">
            <Sidebar />
            <div className="main-content">
                <LoadingOverlay
                    isVisible={loadingState.isLoading}
                    title={loadingState.title}
                    subtitle={loadingState.subtitle}
                />
                <PopupManager />
                <Outlet />
            </div>
        </div>
    );
};

const MainLayout = () => {
    return (
        <AppProvider>
            <PopupProvider>
                <LayoutContent />
            </PopupProvider>
        </AppProvider>
    );
};

export default MainLayout;
