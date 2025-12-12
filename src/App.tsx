import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { NewClient } from './pages/NewClient';
import { PhaseOverview } from './pages/PhaseOverview';
import { ClientProfile } from './pages/ClientProfile';
import { Client } from './types';
import { getClient } from './utils/storage';

const App: React.FC = () => {
  return (
    <Router>
      <div className="flex h-screen">
        <Sidebar />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/new-client" element={<NewClient />} />
          <Route path="/client/:clientId/phase-:phase/overview" element={<PhaseOverview />} />
          <Route path="/client/:clientId/phase-1/client-profile" element={<ClientProfile />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
