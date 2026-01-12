import React, { useEffect, useState, useRef } from 'react';
import { FaTimes, FaSearchPlus, FaSearchMinus, FaSyncAlt, FaEdit, FaSave } from 'react-icons/fa';
import * as pdfjsLib from 'pdfjs-dist';

// Ensure worker is set
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

const FullscreenModal = ({ isOpen, onClose, file, data, title, onSaveData }) => {
    const [zoomLevel, setZoomLevel] = useState(1);
    const [editMode, setEditMode] = useState(false);
    const [editedData, setEditedData] = useState(null);
    const [pdfPages, setPdfPages] = useState([]);
    const viewportRef = useRef(null);
    const pdfDocRef = useRef(null);

    useEffect(() => {
        if (data) {
            setEditedData(JSON.parse(JSON.stringify(data)));
        } else {
            setEditedData({});
        }
    }, [data, isOpen]);

    useEffect(() => {
        if (!isOpen) {
            setZoomLevel(1);
            setEditMode(false);
            setPdfPages([]);
            pdfDocRef.current = null;
            return;
        }

        if (file && file.type === 'application/pdf') {
            loadPdf(file);
        }
    }, [isOpen, file]);

    const loadPdf = async (file) => {
        try {
            const url = URL.createObjectURL(file);
            const pdf = await pdfjsLib.getDocument(url).promise;
            pdfDocRef.current = pdf;

            setPdfPages(Array.from({ length: pdf.numPages }, (_, i) => i + 1));
        } catch (error) {
            console.error('Error loading PDF:', error);
        }
    };

    const handleZoom = (delta) => {
        setZoomLevel(prev => Math.max(0.5, prev + delta));
    };

    const handleSave = () => {
        onSaveData(editedData);
        setEditMode(false);
    };

    const handleInputChange = (page, key, value) => {
        setEditedData(prev => ({
            ...prev,
            [page]: {
                ...prev[page],
                [key]: value
            }
        }));
    };

    if (!isOpen) return null;

    return (
        <div className="fullscreen-modal" style={{ display: 'flex' }}>
            <div className="modal-header">
                <h3>{title}</h3>
                <button className="modal-close" onClick={onClose}><FaTimes /></button>
            </div>
            <div className="modal-content">
                <div className="modal-preview-half">
                    <div className="preview-toolbar">
                        <div>Document Preview</div>
                        <div className="preview-actions">
                            <button className="preview-action-btn" onClick={() => handleZoom(0.2)}>
                                <FaSearchPlus /> Zoom In
                            </button>
                            <button className="preview-action-btn" onClick={() => handleZoom(-0.2)}>
                                <FaSearchMinus /> Zoom Out
                            </button>
                            <button className="preview-action-btn" onClick={() => setZoomLevel(1)}>
                                <FaSyncAlt /> Reset
                            </button>
                        </div>
                    </div>
                    <div className="preview-viewport" ref={viewportRef}>
                        {file && file.type.startsWith('image/') && (
                            <img
                                src={URL.createObjectURL(file)}
                                alt="Full Preview"
                                style={{
                                    transform: `scale(${zoomLevel})`,
                                    transition: 'transform 0.3s',
                                    maxWidth: '100%',
                                    transformOrigin: 'top left',
                                    margin: 'auto'
                                }}
                            />
                        )}
                        {file && file.type === 'application/pdf' && (
                            <div className="pdf-pages-container" style={{
                                transform: `scale(${zoomLevel})`,
                                transformOrigin: 'top center',
                                transition: 'transform 0.3s',
                                width: '100%'
                            }}>
                                {pdfPages.map(pageNum => (
                                    <PdfPage
                                        key={pageNum}
                                        pageNum={pageNum}
                                        pdfDoc={pdfDocRef.current}
                                    />
                                ))}
                            </div>
                        )}
                        {!file && (
                            <div style={{ color: 'white', alignSelf: 'center' }}>No File</div>
                        )}
                    </div>
                </div>
                <div className={`modal-data-half ${editMode ? 'edit-mode' : ''}`}>
                    <div className="data-toolbar">
                        <div>Extracted Data</div>
                        <div className="data-actions">
                            {!editMode ? (
                                <button className="data-action-btn" onClick={() => setEditMode(true)}>
                                    <FaEdit /> Edit Data
                                </button>
                            ) : (
                                <button className="preview-action-btn" onClick={() => setEditMode(false)} style={{ background: '#999' }}>
                                    Cancel
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="data-content">
                        {editedData && Object.keys(editedData).length > 0 ? Object.entries(editedData).map(([pageKey, pageData]) => (
                            <div className="data-section" key={pageKey}>
                                <h4>{pageKey.toUpperCase()}</h4>
                                {Object.entries(pageData).map(([key, value]) => (
                                    editMode ? (
                                        <div className="edit-field" key={key}>
                                            <label>{key.replace(/_/g, ' ').toUpperCase()}</label>
                                            <input
                                                value={value || ''}
                                                onChange={(e) => handleInputChange(pageKey, key, e.target.value)}
                                            />
                                        </div>
                                    ) : (
                                        <div className="data-row" key={key}>
                                            <div className="data-key">{key.replace(/_/g, ' ').toUpperCase()}</div>
                                            <div className="data-value">{value || 'N/A'}</div>
                                        </div>
                                    )
                                ))}
                            </div>
                        )) : (
                            <div style={{ padding: 20, textAlign: 'center', color: '#666' }}>
                                {file ? "No data extracted yet." : "No file."}
                            </div>
                        )}
                    </div>
                    {editMode && (
                        <div className="modal-actions">
                            <button className="modal-btn modal-cancel" onClick={() => setEditMode(false)}>Cancel</button>
                            <button className="modal-btn modal-save" onClick={handleSave}><FaSave /> Save Changes</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const PdfPage = ({ pageNum, pdfDoc }) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        if (!pdfDoc) return;
        const renderPage = async () => {
            const page = await pdfDoc.getPage(pageNum);
            const viewport = page.getViewport({ scale: 1.5 }); // Good underlying quality
            const canvas = canvasRef.current;
            if (canvas) {
                canvas.height = viewport.height;
                canvas.width = viewport.width;
                const context = canvas.getContext('2d');
                await page.render({ canvasContext: context, viewport }).promise;
            }
        };
        renderPage();
    }, [pdfDoc, pageNum]);

    return (
        <canvas
            ref={canvasRef}
            className="pdf-page-canvas"
            style={{ marginBottom: 15, maxWidth: '100%' }}
        />
    );
};

export default FullscreenModal;
