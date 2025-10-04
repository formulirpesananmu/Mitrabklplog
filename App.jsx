import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import LoginPage from '@/pages/LoginPage';
import OtpPage from '@/pages/OtpPage';
import ErrorPage from '@/pages/ErrorPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/otp" element={<OtpPage />} />
          <Route path="/error" element={<ErrorPage />} />
        </Routes>
        <Toaster />
      </div>
    </Router>
  );
}

export default App;