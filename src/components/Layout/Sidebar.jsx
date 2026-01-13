import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  FaIdCard, 
  FaCreditCard, 
  FaFileInvoiceDollar, 
  FaHome, 
  FaAddressCard, 
  FaShieldAlt,
  FaChevronUp,
  FaChevronDown
} from 'react-icons/fa';
import { useApp } from '../../context/AppContext';

const Sidebar = () => {
    const { dataStatus } = useApp();
    const [activeTooltip, setActiveTooltip] = useState(null);
    const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
    const [isScrollable, setIsScrollable] = useState(false);
    const [showScrollHint, setShowScrollHint] = useState(false);
    const scrollContainerRef = useRef(null);
    const location = useLocation();

    const menuItems = [
        { to: "/", icon: FaHome, title: "Home", hasDataKey: null, iconColor: "#94a3b8" },
        { to: "/form", icon: FaIdCard, title: "Form", hasDataKey: "form", iconColor: "#3b82f6" },
        { to: "/pan", icon: FaCreditCard, title: "PAN", hasDataKey: "pan", iconColor: "#10b981" },
        { to: "/gst", icon: FaFileInvoiceDollar, title: "GST", hasDataKey: "gst", iconColor: "#8b5cf6" },
        { to: "/aadhar", icon: FaAddressCard, title: "Aadhar", hasDataKey: "aadhar", iconColor: "#f59e0b" },
    ];

    const fixedBottomItem = {
        to: "/check", 
        icon: FaShieldAlt, 
        title: "Verification", 
        hasDataKey: null, 
        iconColor: "#ef4444"
    };

    // Check if content is scrollable
    useEffect(() => {
        const checkScrollable = () => {
            if (scrollContainerRef.current) {
                const { scrollHeight, clientHeight } = scrollContainerRef.current;
                setIsScrollable(scrollHeight > clientHeight);
                setShowScrollHint(scrollHeight > clientHeight);
            }
        };

        checkScrollable();
        window.addEventListener('resize', checkScrollable);
        
        // Hide scroll hint after 3 seconds
        const timer = setTimeout(() => {
            setShowScrollHint(false);
        }, 3000);

        return () => {
            window.removeEventListener('resize', checkScrollable);
            clearTimeout(timer);
        };
    }, []);

    const handleMouseEnter = (title, e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setTooltipPosition({
            x: rect.right + 10,
            y: rect.top + rect.height / 2
        });
        setActiveTooltip(title);
    };

    const handleMouseLeave = () => {
        setActiveTooltip(null);
    };

    // Handle scroll
    const handleScroll = () => {
        if (scrollContainerRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
            // Hide scroll hint when user starts scrolling
            if (scrollTop > 0 || scrollTop + clientHeight < scrollHeight) {
                setShowScrollHint(false);
            }
        }
    };

    // Scroll to top/bottom functions
    const scrollToTop = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
    };

    const scrollToBottom = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTo({
                top: scrollContainerRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    };

    // Styles
    const styles = {
        sidePanel: {
            position: 'fixed',
            left: 0,
            top: 0,
            height: '100vh',
            width: '70px',
            background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            zIndex: 1000,
            boxShadow: '4px 0 20px rgba(0, 0, 0, 0.2)',
            overflow: 'hidden',
        },
        fixedTopSection: {
            paddingTop: '20px',
            paddingBottom: '10px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            marginBottom: '10px',
            background: 'linear-gradient(to bottom, rgba(30, 41, 59, 0.9), transparent)',
            zIndex: 2,
        },
        scrollableSection: {
            flex: 1,
            width: '100%',
            position: 'relative',
            overflowY: 'auto',
            overflowX: 'hidden',
            padding: '10px 0',
            scrollbarWidth: 'none', // Firefox
            msOverflowStyle: 'none', // IE/Edge
            '&::-webkit-scrollbar': {
                display: 'none', // Chrome/Safari
            },
        },
        fixedBottomSection: {
            padding: '20px 0',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            marginTop: '10px',
            background: 'linear-gradient(to top, rgba(30, 41, 59, 0.9), transparent)',
            zIndex: 2,
        },
        panelIcon: {
            position: 'relative',
            width: '44px',
            height: '44px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '12px',
            margin: '6px auto',
            color: '#94a3b8',
            fontSize: '20px',
            textDecoration: 'none',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            opacity: 0,
            animation: 'slideIn 0.5s ease-out forwards',
        },
        icon: {
            transition: 'all 0.3s ease',
            transform: 'scale(1)',
        },
        statusIndicator: {
            position: 'absolute',
            top: '4px',
            right: '4px',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: '#10b981',
            opacity: 0,
            transform: 'scale(0)',
            transition: 'all 0.3s ease',
            boxShadow: '0 0 8px rgba(16, 185, 129, 0.5)',
        },
        dataPulse: {
            position: 'absolute',
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'transparent',
            border: '2px solid rgba(16, 185, 129, 0.3)',
            animation: 'pulse 2s infinite',
            opacity: 0,
        },
        tooltip: {
            position: 'fixed',
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            color: '#f8fafc',
            padding: '8px 12px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 500,
            whiteSpace: 'nowrap',
            zIndex: 2000,
            pointerEvents: 'none',
            backdropFilter: 'blur(4px)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
            opacity: 0,
            transform: 'translateX(-10px)',
            animation: 'tooltipFadeIn 0.2s ease-out forwards',
        },
        tooltipArrow: {
            position: 'absolute',
            left: '-6px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: 0,
            height: 0,
            borderTop: '6px solid transparent',
            borderBottom: '6px solid transparent',
            borderRight: '6px solid rgba(15, 23, 42, 0.95)',
        },
        scrollHintTop: {
            position: 'absolute',
            top: '5px',
            left: '50%',
            transform: 'translateX(-50%)',
            color: '#3b82f6',
            fontSize: '10px',
            opacity: showScrollHint ? 1 : 0,
            transition: 'opacity 0.3s ease',
            animation: 'bounceDown 2s infinite',
        },
        scrollHintBottom: {
            position: 'absolute',
            bottom: '5px',
            left: '50%',
            transform: 'translateX(-50%)',
            color: '#3b82f6',
            fontSize: '10px',
            opacity: showScrollHint ? 1 : 0,
            transition: 'opacity 0.3s ease',
            animation: 'bounceUp 2s infinite',
        },
        scrollControls: {
            position: 'absolute',
            right: '5px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            opacity: 0.6,
            transition: 'opacity 0.3s ease',
            '&:hover': {
                opacity: 1,
            },
        },
        scrollButton: {
            width: '16px',
            height: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '4px',
            color: '#94a3b8',
            fontSize: '8px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            '&:hover': {
                background: 'rgba(255, 255, 255, 0.2)',
                color: '#ffffff',
            },
        },
        // Animation keyframes
        keyframes: `
            @keyframes slideIn {
                from {
                    opacity: 0;
                    transform: translateX(-20px);
                }
                to {
                    opacity: 1;
                    transform: translateX(0);
                }
            }
            @keyframes pulse {
                0% {
                    transform: scale(1);
                    opacity: 0.5;
                }
                50% {
                    transform: scale(1.05);
                    opacity: 0.2;
                }
                100% {
                    transform: scale(1);
                    opacity: 0.5;
                }
            }
            @keyframes tooltipFadeIn {
                from {
                    opacity: 0;
                    transform: translateX(-10px);
                }
                to {
                    opacity: 1;
                    transform: translateX(0);
                }
            }
            @keyframes bounceDown {
                0%, 20%, 50%, 80%, 100% {
                    transform: translateX(-50%) translateY(0);
                }
                40% {
                    transform: translateX(-50%) translateY(5px);
                }
                60% {
                    transform: translateX(-50%) translateY(3px);
                }
            }
            @keyframes bounceUp {
                0%, 20%, 50%, 80%, 100% {
                    transform: translateX(-50%) translateY(0);
                }
                40% {
                    transform: translateX(-50%) translateY(-5px);
                }
                60% {
                    transform: translateX(-50%) translateY(-3px);
                }
            }
        `,
    };

    // Inline styles for each icon
    const getIconStyle = (index, item) => {
        const hasData = item.hasDataKey && dataStatus[item.hasDataKey];
        const isActive = location.pathname === item.to;
        
        return {
            ...styles.panelIcon,
            animationDelay: `${index * 0.05}s`,
            backgroundColor: isActive ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
            color: isActive ? '#ffffff' : hasData ? item.iconColor : '#94a3b8',
            borderLeft: isActive ? '3px solid #3b82f6' : '3px solid transparent',
            boxShadow: isActive ? '0 4px 12px rgba(59, 130, 246, 0.3)' : 'none',
            ':hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: '#ffffff',
                transform: 'translateX(5px)',
            },
        };
    };

    const getBottomIconStyle = () => {
        const isActive = location.pathname === fixedBottomItem.to;
        
        return {
            ...styles.panelIcon,
            animationDelay: '0.3s',
            backgroundColor: isActive ? 'rgba(239, 68, 68, 0.2)' : 'transparent',
            color: isActive ? '#ffffff' : fixedBottomItem.iconColor,
            borderLeft: isActive ? '3px solid #ef4444' : '3px solid transparent',
            boxShadow: isActive ? '0 4px 12px rgba(239, 68, 68, 0.3)' : 'none',
            ':hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: '#ffffff',
                transform: 'translateX(5px)',
            },
        };
    };

    return (
        <>
            {/* Inject keyframes */}
            <style>{styles.keyframes}</style>
            
            <div style={styles.sidePanel} >
                {/* Fixed Top - Home */}
                <div style={styles.fixedTopSection}>
                    <NavLink 
                        to="/"
                        style={(state) => getIconStyle(0, menuItems[0])}
                        onMouseEnter={(e) => handleMouseEnter("Home", e)}
                        onMouseLeave={handleMouseLeave}
                        title="Home"
                    >
                        <FaHome style={styles.icon} />
                    </NavLink>
                </div>

                {/* Scrollable Middle Section */}
                <div 
                    ref={scrollContainerRef}
                    style={styles.scrollableSection}
                    onScroll={handleScroll}
                >
                    {/* Scroll hint at top */}
                    {isScrollable && (
                        <div style={styles.scrollHintTop}>
                            <FaChevronUp />
                        </div>
                    )}

                    {/* Scroll controls */}
                    {isScrollable && (
                        <div style={styles.scrollControls}>
                            <div 
                                style={styles.scrollButton}
                                onClick={scrollToTop}
                                title="Scroll to top"
                            >
                                <FaChevronUp />
                            </div>
                            <div 
                                style={styles.scrollButton}
                                onClick={scrollToBottom}
                                title="Scroll to bottom"
                            >
                                <FaChevronDown />
                            </div>
                        </div>
                    )}

                    {/* Scrollable Menu Items */}
                    {menuItems.slice(1).map((item, index) => {
                        const hasData = item.hasDataKey && dataStatus[item.hasDataKey];
                        const originalIndex = index + 1;
                        
                        return (
                            <NavLink 
                                key={item.to}
                                to={item.to}
                                style={(state) => getIconStyle(originalIndex, item)}
                                onMouseEnter={(e) => handleMouseEnter(item.title, e)}
                                onMouseLeave={handleMouseLeave}
                                title={item.title}
                            >
                                <item.icon 
                                    style={{
                                        ...styles.icon,
                                        animation: hasData ? 'iconHover 2s infinite' : 'none',
                                    }} 
                                />
                                {item.hasDataKey && (
                                    <div 
                                        style={{
                                            ...styles.statusIndicator,
                                            opacity: hasData ? 1 : 0,
                                            transform: hasData ? 'scale(1)' : 'scale(0)',
                                            animation: hasData ? 'statusPop 0.4s ease-out' : 'none',
                                        }} 
                                    />
                                )}
                                {hasData && (
                                    <div 
                                        style={{
                                            ...styles.dataPulse,
                                            opacity: 1,
                                            borderColor: item.iconColor + '50',
                                        }} 
                                    />
                                )}
                            </NavLink>
                        );
                    })}

                    {/* Scroll hint at bottom */}
                    {isScrollable && (
                        <div style={styles.scrollHintBottom}>
                            <FaChevronDown />
                        </div>
                    )}
                </div>

                {/* Fixed Bottom - Verification */}
                <div style={styles.fixedBottomSection}>
                    <NavLink 
                        to="/check"
                        style={(state) => getBottomIconStyle()}
                        onMouseEnter={(e) => handleMouseEnter("Verification", e)}
                        onMouseLeave={handleMouseLeave}
                        title="Verification"
                    >
                        <FaShieldAlt style={styles.icon} />
                    </NavLink>
                </div>
            </div>

            {/* Tooltip */}
            {activeTooltip && (
                <div 
                    style={{
                        ...styles.tooltip,
                        left: `${tooltipPosition.x}px`,
                        top: `${tooltipPosition.y}px`,
                        transform: 'translateY(-50%)',
                    }}
                >
                    {activeTooltip}
                    <div style={styles.tooltipArrow}></div>
                </div>
            )}
        </>
    );
};

export default Sidebar;