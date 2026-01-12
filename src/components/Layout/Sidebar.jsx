import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaIdCard, FaCreditCard, FaFileInvoiceDollar, FaHome, FaAddressCard, FaShieldAlt } from 'react-icons/fa';
import { useApp } from '../../context/AppContext';

const Sidebar = () => {
    const { dataStatus } = useApp();

    return (
        <div className="side-panel">
            <NavLink to="/" className={({ isActive }) => `panel-icon ${isActive ? 'active' : ''}`} title="Home">
                <FaHome />
            </NavLink>
            <div style={{ height: '20px' }}></div>
            <NavLink to="/form" className={({ isActive }) => `panel-icon ${isActive ? 'active' : ''} ${dataStatus.form ? 'has-data' : ''}`} title="Form">
                <FaIdCard />
                <div className="status-indicator"></div>
            </NavLink>
            <NavLink to="/pan" className={({ isActive }) => `panel-icon ${isActive ? 'active' : ''} ${dataStatus.pan ? 'has-data' : ''}`} title="PAN">
                <FaCreditCard />
                <div className="status-indicator"></div>
            </NavLink>
            <NavLink to="/gst" className={({ isActive }) => `panel-icon ${isActive ? 'active' : ''} ${dataStatus.gst ? 'has-data' : ''}`} title="GST">
                <FaFileInvoiceDollar />
                <div className="status-indicator"></div>
            </NavLink>
            <NavLink to="/aadhar" className={({ isActive }) => `panel-icon ${isActive ? 'active' : ''} ${dataStatus.aadhar ? 'has-data' : ''}`} title="Aadhar">
                <FaAddressCard />
                <div className="status-indicator"></div>
            </NavLink>

            <div style={{ flex: 1 }}></div>

            <NavLink to="/check" className={({ isActive }) => `panel-icon ${isActive ? 'active' : ''}`} title="Verification">
                <FaShieldAlt />
            </NavLink>
        </div>
    );
};

export default Sidebar;
