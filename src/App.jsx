import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './components/Layout/MainLayout';
import OCRPage from './pages/OCRPage';
import HomePage from './pages/HomePage';
import CheckPage from './pages/CheckPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route
            path="form"
            element={<OCRPage type="form" title="Form Document" />}
          />
          <Route
            path="pan"
            element={<OCRPage type="pan" title="PAN Card" />}
          />
          <Route
            path="gst"
            element={<OCRPage type="gst" title="GST Certificate" />}
          />
          <Route
            path="aadhar"
            element={<OCRPage type="aadhar" title="Aadhar Card" />}
          />
          <Route path="check" element={<CheckPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
