import React from 'react';
import OCRDetailView from '../components/OCRDetailView';

const OCRPage = ({ type, title }) => {
    return (
        <div style={{ height: '100%', width: '100%', overflow: 'hidden' }}>
            <OCRDetailView type={type} title={title} />
        </div>
    );
};

export default OCRPage;
