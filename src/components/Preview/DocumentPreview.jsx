import React, { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { FaImage, FaExpand, FaExclamationTriangle } from 'react-icons/fa';

// Worker configuration for Vite
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

const DocumentPreview = ({ file, onExpand, showControls = true, customExpandIcon }) => {
    const canvasRef = useRef(null);
    const [previewSrc, setPreviewSrc] = useState(null);
    const [isPdf, setIsPdf] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!file) {
            setPreviewSrc(null);
            setIsPdf(false);
            setLoading(false);
            setError(null);
            return;
        }

        const fileType = file.type;
        setLoading(true);
        setError(null);

        if (fileType.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setPreviewSrc(e.target.result);
                setIsPdf(false);
                setLoading(false);
            };
            reader.onerror = () => {
                setError('Error reading image');
                setLoading(false);
            };
            reader.readAsDataURL(file);
        } else if (fileType === 'application/pdf') {
            setIsPdf(true);
            renderPdfThumbnail(file);
        } else {
            setError('Unsupported file type');
            setLoading(false);
        }
    }, [file]);

    const renderPdfThumbnail = async (file) => {
        try {
            const url = URL.createObjectURL(file);
            const loadingTask = pdfjsLib.getDocument(url);
            const pdf = await loadingTask.promise;
            const page = await pdf.getPage(1);

            const viewport = page.getViewport({ scale: 0.8 }); // Increased scale for better quality
            const canvas = canvasRef.current;

            if (canvas) {
                const context = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                await page.render({ canvasContext: context, viewport: viewport }).promise;
            }

            URL.revokeObjectURL(url);
            setLoading(false);
        } catch (err) {
            console.error('Error rendering PDF thumbnail:', err);
            setError('Error loading PDF preview');
            setLoading(false);
        }
    };

    if (!file) {
        return (
            <div className="preview-placeholder">
                <FaImage />
                <p>No preview</p>
            </div>
        );
    }

    return (
        <div className="preview-container">
            {loading && <div className="preview-loading">Loading...</div>}

            {error && (
                <div className="preview-error">
                    <FaExclamationTriangle />
                    <span>{error}</span>
                </div>
            )}

            {!loading && !error && !isPdf && previewSrc && (
                <img src={previewSrc} className="grid-preview" alt="Preview" />
            )}

            {!loading && !error && isPdf && (
                <canvas ref={canvasRef} className="grid-preview" />
            )}

            {showControls && !loading && !error && (
                <div className="preview-controls">
                    <button className="preview-btn" onClick={onExpand} title="Full View">
                        {customExpandIcon || <FaExpand />}
                    </button>
                </div>
            )}
        </div>
    );
};

export default DocumentPreview;
