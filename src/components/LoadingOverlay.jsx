import React, { useEffect, useState } from 'react';
import { FaFile, FaClock, FaMicrochip, FaShieldAlt } from 'react-icons/fa';

const LoadingOverlay = ({ isVisible, title, subtitle }) => {
    const [elapsedTime, setElapsedTime] = useState(0);

    useEffect(() => {
        let interval;
        if (isVisible) {
            const startTime = Date.now();
            interval = setInterval(() => {
                setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
            }, 1000);
        } else {
            setElapsedTime(0);
        }
        return () => clearInterval(interval);
    }, [isVisible]);

    const formatTime = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        if (h > 0) return `${h}h ${m}m ${s}s`;
        if (m > 0) return `${m}m ${s}s`;
        return `${s}s`;
    };

    if (!isVisible) return null;

    return (
        <div className="loading-overlay">
            <div className="loading-content">
                <div className="loading-logo">
                    <FaFile />
                </div>
                <div className="loading-text">{title}</div>
                <div className="loading-subtext">{subtitle}</div>
                <div className="loading-progress">
                    <div className="loading-progress-bar" style={{ width: '100%', animation: 'progress 3s infinite' }}></div>
                </div>
                <div className="loading-stats">
                    <div className="loading-stat">
                        <FaClock />
                        <span>Time Elapsed: {formatTime(elapsedTime)}</span>
                    </div>
                    <div className="loading-stat">
                        <FaMicrochip />
                        <span>OCR Processing</span>
                    </div>
                    <div className="loading-stat">
                        <FaShieldAlt />
                        <span>Secure Connection</span>
                    </div>
                </div>
                <style>{`
                    @keyframes progress {
                        0% { width: 0%; }
                        50% { width: 70%; }
                        100% { width: 100%; }
                    }
                `}</style>
            </div>
            <div className="loading-time">
                Timeout set to 5 hours | You can leave this page and come back
            </div>
        </div>
    );
};

export default LoadingOverlay;
