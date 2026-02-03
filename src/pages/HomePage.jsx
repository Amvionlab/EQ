import React from 'react';
import OCRCard from '../components/OCRCard';

const HomePage = () => {
    return (
        <div className="dashboard-grid">
            <OCRCard type="form" title="Form Document" />
            <OCRCard type="pan" title="PAN Card" />
            <OCRCard type="gst" title="GST Certificate" />
            <OCRCard type="aadhar" title="Aadhar Card" />
            <OCRCard type="cheque" title="Cheque" />
        </div>
    );
};

export default HomePage;
