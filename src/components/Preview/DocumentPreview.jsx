import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import { FaImage, FaExpand, FaExclamationTriangle } from "react-icons/fa";

// Worker configuration for Vite
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

const DocumentPreview = ({
  file,
  onExpand,
  showControls = true,
  customExpandIcon,
}) => {
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
    setError(null);

    if (fileType.startsWith("image/")) {
      setLoading(true);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewSrc(e.target.result);
        setIsPdf(false);
        setLoading(false);
      };
      reader.onerror = () => {
        setError("Error reading image");
        setLoading(false);
      };
      reader.readAsDataURL(file);
    } else if (fileType === "application/pdf") {
      setPreviewSrc(null);
      setIsPdf(true);
      setLoading(true);
    } else {
      setError("Unsupported file type");
    }
  }, [file]);

  useLayoutEffect(() => {
    if (!isPdf || !file) return;

    const renderPdf = async () => {
      try {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const container = canvas.parentElement;
        if (!container || container.clientWidth === 0) return;

        const data = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data }).promise;
        const page = await pdf.getPage(1);

        const viewport = page.getViewport({ scale: 1 });
        const scale = container.clientWidth / viewport.width;
        const scaledViewport = page.getViewport({ scale });

        const context = canvas.getContext("2d");

        canvas.width = scaledViewport.width;
        canvas.height = scaledViewport.height;
        canvas.style.width = "100%";
        canvas.style.height = "100%";

        await page.render({
          canvasContext: context,
          viewport: scaledViewport,
        }).promise;

        setLoading(false);
      } catch (err) {
        console.error("PDF preview error:", err);
        setError("Error loading PDF preview");
        setLoading(false);
      }
    };

    renderPdf();
  }, [isPdf, file]);

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

      {isPdf && (
        <canvas
          ref={canvasRef}
          className="grid-preview"
          style={{ visibility: loading ? "hidden" : "visible" }}
        />
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
