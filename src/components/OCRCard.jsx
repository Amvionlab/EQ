import React, { useState, useEffect } from 'react';
import { FaCloudUploadAlt, FaSearch, FaSave, FaTrash, FaTable, FaIdCard, FaCreditCard, FaFileInvoiceDollar, FaExpand, FaTimes, FaExternalLinkAlt, FaAddressCard } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import DocumentPreview from './Preview/DocumentPreview';
import ResultsTable from '../components/ResultsTable';
import { callOCRSpaceAPI, getMockDataForGrid } from '../services/api';
import { getKeysForType, saveFileToStorage, loadFileFromStorage, clearGridStorage } from '../services/storage';
import { useApp } from '../context/AppContext';
import { usePopup } from '../context/PopupContext';

const OCRCard = ({ type, title }) => {
    const navigate = useNavigate();
    const { updateStatus, showLoader, hideLoader } = useApp();
    const { showToast, showModal } = usePopup();

    const [file, setFile] = useState(null);
    const [data, setData] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [showPreviewModal, setShowPreviewModal] = useState(false);

    const { data: dataKey, file: fileKey } = getKeysForType(type);

    useEffect(() => {
        loadSavedData();
    }, [type]);

    const loadSavedData = () => {
        const savedData = localStorage.getItem(dataKey);
        if (savedData) {
            try {
                setData(JSON.parse(savedData));
            } catch (e) {
                console.error('Error parsing saved data', e);
            }
        } else {
            setData(null);
        }

        const savedFile = loadFileFromStorage(fileKey);
        if (savedFile) {
            setFile(savedFile);
        } else {
            setFile(null);
        }
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;

        if (!selectedFile.type.startsWith('image/') && selectedFile.type !== 'application/pdf') {
            showToast('Please upload an image (JPG, PNG) or PDF file.', 'error');
            return;
        }

        if (selectedFile.size > 10 * 1024 * 1024) {
            showToast('File size exceeds 10MB limit.', 'error');
            return;
        }

        clearGridStorage(type);
        updateStatus(type, false);

        setFile(selectedFile);
        setData(null);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileChange({ target: { files: files } });
        }
    };

    const handleScan = async () => {
        if (!file) return;

        setIsProcessing(true);
        showLoader(`Processing ${title}...`, `Scanning and extracting data from your ${title}.`);

        try {
            const result = await callOCRSpaceAPI(file, type);
            setData(result);
        } catch (error) {
            console.error('Scan error:', error);
            showModal({
                title: 'Scan Failed',
                message: `${error.message}. Would you like to use mock data for demonstration?`,
                type: 'confirm',
                confirmText: 'Use Mock Data',
                onConfirm: () => {
                    const gridIndex = type === 'form' ? 0 : type === 'pan' ? 1 : type === 'gst' ? 2 : 3;
                    const mockData = getMockDataForGrid(gridIndex);
                    setData(mockData);
                }
            });
        } finally {
            setIsProcessing(false);
            hideLoader();
        }
    };

    const handleSave = async (silent = false) => {
        if (!data || !file) return;

        try {
            localStorage.setItem(dataKey, JSON.stringify(data));
            await saveFileToStorage(file, fileKey);

            updateStatus(type, true);
            if (!silent) {
                showToast('Data saved successfully!', 'success');
            }
            return true;
        } catch (error) {
            console.error('Save error:', error);
            if (!silent) showToast('Failed to save data.', 'error');
            return false;
        }
    };

    const handleClear = () => {
        showModal({
            title: 'Clear Data',
            message: 'Are you sure you want to clear all data and file for this section?',
            type: 'confirm',
            confirmText: 'Yes, Clear',
            cancelText: 'Cancel',
            type: 'confirm',
            onConfirm: () => {
                clearGridStorage(type);
                setFile(null);
                setData(null);
                updateStatus(type, false);
                showToast('Data cleared.', 'info');
            }
        });
    };

    const renderIcon = () => {
        switch (type) {
            case 'form': return <FaIdCard />;
            case 'pan': return <FaCreditCard />;
            case 'gst': return <FaFileInvoiceDollar />;
            case 'aadhar': return <FaAddressCard />;
            case 'cheque': return <FaAddressCard />;
            default: return <FaIdCard />;
        }
    };

    const handleLocalPreview = () => {
        setShowPreviewModal(true);
    };

    const handleClosePreview = () => {
        setShowPreviewModal(false);
    };

    const handleNavigate = async () => {
        if (data && file) {
            await handleSave(true);
        }
        navigate(`/${type}`);
    };

    const triggerFileInput = () => {
        const fileInput = document.getElementById(`file-upload-${type}`);
        if (fileInput) fileInput.click();
    };

    return (
        <div className="grid-card">
            <div className="grid-header">
                <h3>{renderIcon()} {title}</h3>
                <button
                    onClick={handleNavigate}
                    className="detail-link-btn"
                    title="Go to Detail Page"
                    style={{ marginLeft: 'auto', background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}
                >
                    <FaExternalLinkAlt />
                </button>
            </div>

            <div className="upload-preview-section">
                <div className="upload-section">
                    <div
                        className="file-input-wrapper"
                        onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.backgroundColor = '#eff6ff'; }}
                        onDragLeave={(e) => { e.preventDefault(); e.currentTarget.style.backgroundColor = '#f8fafc'; }}
                        onDrop={handleDrop}
                        onClick={triggerFileInput}
                    >
                        <FaCloudUploadAlt />
                        <p>Upload</p>
                        <p style={{ fontSize: '0.75rem' }}>JPG/PNG/PDF</p>
                        <input
                            type="file"
                            id={`file-upload-${type}`}
                            accept="image/*, application/pdf"
                            onChange={handleFileChange}
                        />
                    </div>
                </div>
                <div className="preview-section">
                    <DocumentPreview
                        file={file}
                        onExpand={handleLocalPreview}
                        showControls={!!file}
                        customExpandIcon={<FaExpand />}
                    />
                </div>
            </div>

            <div className="action-section">
                <button className="action-btn scan-btn" onClick={handleScan} disabled={!file || isProcessing}>
                    <FaSearch /> SCAN
                </button>
                <button className="action-btn save-btn" onClick={() => handleSave(false)} disabled={!data || !file}>
                    <FaSave /> SAVE
                </button>
                <button className="action-btn clear-btn" onClick={handleClear}>
                    <FaTrash /> CLEAR
                </button>
            </div>

            <div className="results-section">
                <h4><FaTable /> Extracted Data</h4>
                <ResultsTable data={data} />
            </div>

            {showPreviewModal && (
                <div className="preview-modal-overlay" style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 10000,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
                }}>
                    <button
                        onClick={handleClosePreview}
                        style={{
                            position: 'absolute', top: '20px', right: '20px',
                            background: 'white', border: 'none', borderRadius: '50%',
                            width: '40px', height: '40px', cursor: 'pointer', fontSize: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}
                    >
                        <FaTimes />
                    </button>
                    <div className="preview-modal-content" style={{ width: '90%', height: '90%', background: '#333', borderRadius: '8px', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <DocumentPreview
                            file={file}
                            showControls={false}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default OCRCard;
