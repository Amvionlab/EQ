import React, { useState, useEffect, useRef } from 'react';
import { FaSearchPlus, FaSearchMinus, FaSyncAlt, FaEdit, FaSave, FaTimes, FaFile, FaExclamationTriangle } from 'react-icons/fa';
import * as pdfjsLib from 'pdfjs-dist/build/pdf';
import { getKeysForType, loadFileFromStorage } from '../services/storage';
import { usePopup } from '../context/PopupContext';

// Ensure worker is set
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url
).toString();

const OCRDetailView = ({ type, title }) => {
    const { data: dataKey, file: fileKey } = getKeysForType(type);
    const { showToast } = usePopup();

    const [file, setFile] = useState(null);
    const [data, setData] = useState(null);
    const [zoomLevel, setZoomLevel] = useState(1);
    const [editMode, setEditMode] = useState(false);
    const [originalData, setOriginalData] = useState(null);
    const [editedData, setEditedData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, [type]);

    const loadData = () => {
        setLoading(true);
        // Load Data
        const savedData = localStorage.getItem(dataKey);
        if (savedData) {
            try {
                const parsed = JSON.parse(savedData);
                setData(parsed);
                setEditedData(parsed);
            } catch (e) {
                console.error('Error parsing data', e);
            }
        } else {
            setData(null);
            setEditedData(null);
        }

        // Load File
        const savedFile = loadFileFromStorage(fileKey);
        setFile(savedFile);
        setLoading(false);
    };

    const handleZoomIn = () => setZoomLevel(prev => prev + 0.2);
    const handleZoomOut = () => setZoomLevel(prev => Math.max(0.5, prev - 0.2));
    const handleResetZoom = () => setZoomLevel(1);

    const toggleEditMode = () => {
        if (!editMode) {
            setOriginalData(JSON.parse(JSON.stringify(data))); // Deep copy
            setEditMode(true);
        } else {
            cancelEdit();
        }
    };

    const cancelEdit = () => {
        setEditedData(originalData);
        setEditMode(false);
    };

    const saveEdit = () => {
        localStorage.setItem(dataKey, JSON.stringify(editedData));
        setData(editedData); // Update main display data
        setEditMode(false);
        showToast('Changes saved successfully!', 'success');
    };

    const handleInputChange = (pageKey, fieldKey, value) => {
        setEditedData(prev => ({
            ...prev,
            [pageKey]: {
                ...prev[pageKey],
                [fieldKey]: value
            }
        }));
    };

    // Render Logic for Preview
    const renderPreview = () => {
        if (!file) {
            return (
                <div style={{ color: 'white', textAlign: 'center', marginTop: '50px' }}>
                    <FaFile style={{ fontSize: '48px', marginBottom: '20px' }} />
                    <p>No document available</p>
                </div>
            );
        }

        if (file.type.startsWith('image/')) {
            return (
                <div style={{ padding: '15px', display: 'flex', justifyContent: 'center', minHeight: '100%' }}>
                    <img
                        src={URL.createObjectURL(file)}
                        alt="Preview"
                        style={{
                            maxWidth: '100%',
                            transform: `scale(${zoomLevel})`,
                            transition: 'transform 0.3s',
                            transformOrigin: 'top center'
                        }}
                    />
                </div>
            );
        }

        if (file.type === 'application/pdf') {
            return <PDFPreview file={file} zoom={zoomLevel} />;
        }

        return null;
    };

    // Render Logic for Data
    const renderData = () => {
        if (!editedData || Object.keys(editedData).length === 0) {
            return (
                <div className="no-data">
                    <p>No extracted data found. Please upload and scan a document from the Dashboard.</p>
                </div>
            );
        }

        return Object.entries(editedData).map(([pageKey, pageData]) => (
            <div key={pageKey} className="data-section">
                <h4>{pageKey.toUpperCase()}</h4>
                {Object.entries(pageData).map(([fieldKey, fieldValue]) => (
                    <div key={fieldKey} className="data-row" style={editMode ? { flexDirection: 'column', padding: '15px', background: '#f9f9f9', marginBottom: '10px', borderRadius: '8px' } : {}}>
                        <div className="data-key" style={editMode ? { marginBottom: '5px' } : {}}>
                            {fieldKey.replace(/_/g, ' ').toUpperCase()}
                        </div>
                        <div className="data-value">
                            {editMode ? (
                                <input
                                    type="text"
                                    value={fieldValue || ''}
                                    onChange={(e) => handleInputChange(pageKey, fieldKey, e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '8px',
                                        border: '1px solid #ccc',
                                        borderRadius: '4px'
                                    }}
                                />
                            ) : (
                                fieldValue || 'N/A'
                            )}
                        </div>
                    </div>
                ))}
            </div>
        ));
    };

    if (loading) {
        return <div style={{ color: 'white', textAlign: 'center', padding: '50px' }}>Loading...</div>;
    }

    if (!file && !data) {
        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                color: '#666'
            }}>
                <FaExclamationTriangle style={{ fontSize: '64px', marginBottom: '20px', color: '#ffb74d' }} />
                <h2>No Data Available</h2>
                <p>Please go to the Home Dashboard to upload and scan a {title}.</p>
            </div>
        );
    }

    return (
        <div className="detail-view-container" style={{ display: 'flex', height: '100%', width: '100%', overflow: 'hidden' }}>
            {/* Left Main: Preview (50%) */}
            <div className="detail-preview-section" style={{ flex: '1', display: 'flex', flexDirection: 'column', background: '#1e1e1e', overflow: 'hidden', borderRight: '1px solid #333' }}>
                <div className="preview-toolbar" style={{ padding: '10px 20px', background: '#252526', borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#ccc' }}>
                    <div style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <FaFile /> {title} Preview
                    </div>
                    <div className="preview-actions" style={{ display: 'flex', gap: '8px' }}>
                        <button className="preview-action-btn" onClick={handleZoomIn} style={actionButtonStyle}><FaSearchPlus /> In</button>
                        <button className="preview-action-btn" onClick={handleZoomOut} style={actionButtonStyle}><FaSearchMinus /> Out</button>
                        <button className="preview-action-btn" onClick={handleResetZoom} style={actionButtonStyle}><FaSyncAlt /> Reset</button>
                    </div>
                </div>
                <div className="preview-viewport" style={{ flex: '1', overflow: 'auto', display: 'flex', justifyContent: 'center', padding: '20px', background: '#1e1e1e' }}>
                    {renderPreview()}
                </div>
            </div>

            {/* Right Panel: Data (50%) */}
            <div className="detail-data-section" style={{ flex: '1', display: 'flex', flexDirection: 'column', background: '#f8fafc', minWidth: '350px', borderLeft: '1px solid #e2e8f0' }}>
                <div className="data-toolbar" style={{ padding: '15px 20px', background: 'white', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontWeight: '700', color: '#1e293b' }}>Extracted Data</div>
                    <button className="data-action-btn" onClick={toggleEditMode} style={{ ...actionButtonStyle, background: editMode ? '#ef4444' : '#2563eb', color: 'white', border: 'none' }}>
                        {editMode ? <><FaTimes /> Cancel</> : <><FaEdit /> Edit</>}
                    </button>
                </div>

                <div className="data-content" style={{ flex: '1', overflowY: 'auto', padding: '20px' }}>
                    {renderData()}
                </div>

                {editMode && (
                    <div className="modal-actions" style={{ padding: '15px 20px', background: 'white', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                        <button className="modal-btn modal-cancel" onClick={cancelEdit} style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #cbd5e1', background: 'white', cursor: 'pointer' }}>Cancel</button>
                        <button className="modal-btn modal-save" onClick={saveEdit} style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: '#10b981', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}><FaSave /> Save Changes</button>
                    </div>
                )}
            </div>
        </div>
    );
};

const actionButtonStyle = {
    padding: '6px 12px',
    borderRadius: '4px',
    border: '1px solid #555',
    background: 'rgba(255,255,255,0.1)',
    color: '#eee',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '0.85rem'
};

// Internal PDF Preview Component
const PDFPreview = ({ file, zoom }) => {
    const [pages, setPages] = useState([]);
    const canvasRefs = useRef([]);

    useEffect(() => {
        const loadPdf = async () => {
            const url = URL.createObjectURL(file);
            const pdf = await pdfjsLib.getDocument(url).promise;

            const pageData = [];
            for (let i = 1; i <= pdf.numPages; i++) {
                pageData.push(await pdf.getPage(i));
            }
            setPages(pageData);
        };
        loadPdf();
    }, [file]);

    useEffect(() => {
        pages.forEach(async (page, index) => {
            const canvas = canvasRefs.current[index];
            if (canvas) {
                const viewport = page.getViewport({ scale: 1.5 }); // High quality base
                canvas.height = viewport.height;
                canvas.width = viewport.width;
                const context = canvas.getContext('2d');
                await page.render({ canvasContext: context, viewport: viewport }).promise;
            }
        });
    }, [pages]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center', width: '100%' }}>
            {pages.map((_, index) => (
                <canvas
                    key={index}
                    ref={el => canvasRefs.current[index] = el}
                    style={{
                        maxWidth: '95%',
                        boxShadow: '0 4px 10px rgba(0,0,0,0.5)',
                        transform: `scale(${zoom})`,
                        transformOrigin: 'top center',
                        transition: 'transform 0.3s'
                    }}
                />
            ))}
        </div>
    );
};

export default OCRDetailView;
