import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useParams } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { InvestmentTracker } from './components/InvestmentTracker';
import { Dashboard } from './pages/Dashboard';
import { NewClient } from './pages/NewClient';
import { PhaseOverview } from './pages/PhaseOverview';
import { ClientProfile } from './pages/ClientProfile';
import { Client } from './types';
import { getClient } from './utils/storage';
import './App.css';

// Wrapper component for pages that need sidebar and client context
const ClientLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { clientId } = useParams();
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadClient();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId]);

  const loadClient = async () => {
    if (!clientId) {
      setLoading(false);
      return;
    }
    const loadedClient = await getClient(clientId);
    setClient(loadedClient);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-slate-300 border-t-amber-600"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar client={client || undefined} />
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
      {client && <InvestmentTracker client={client} />}
    </div>
  );
};

// Simple layout without sidebar for standalone pages
const SimpleLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-50">
      {children}
    </div>
  );
};

// Placeholder component for unimplemented workstreams
const PlaceholderWorkstream: React.FC<{ title: string }> = ({ title }) => {
  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <div className="bg-white rounded-xl border-2 border-slate-200 p-12 text-center">
        <h1 className="text-3xl font-serif font-bold text-slate-900 mb-4">
          {title}
        </h1>
        <p className="text-slate-600 mb-6">
          This workstream is under development and will be available soon.
        </p>
        <div className="inline-block px-6 py-3 bg-amber-100 text-amber-800 rounded-lg font-semibold">
          Coming in Phase A.2
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Dashboard - no sidebar */}
        <Route
          path="/"
          element={
            <div className="flex h-screen bg-slate-50">
              <Sidebar />
              <div className="flex-1 overflow-y-auto ml-80">
                <Dashboard />
              </div>
            </div></div>
          }
        />

        {/* New Client - no sidebar */}
        <Route path="/new-client" element={<NewClient />} />

        {/* Client routes - with sidebar and investment tracker */}
        <Route
          path="/client/:clientId/*"
          element={
            <ClientLayout>
              <Routes>
                {/* Phase overviews */}
                <Route path="phase-1/overview" element={<PhaseOverview />} />
                <Route path="phase-2/overview" element={<PhaseOverview />} />
                <Route path="phase-3/overview" element={<PhaseOverview />} />

                {/* Phase 1 workstreams */}
                <Route path="phase-1/launch" element={<PlaceholderWorkstream title="Launch" />} />
                <Route path="phase-1/client-profile" element={<ClientProfile />} />
                <Route path="phase-1/exploration" element={<PlaceholderWorkstream title="Spatial Philosophy" />} />
                <Route path="phase-1/definition" element={<PlaceholderWorkstream title="Definition" />} />

                {/* Phase 2 workstreams */}
                <Route path="phase-2/context" element={<PlaceholderWorkstream title="Market Context (KYM)" />} />
                <Route path="phase-2/reconciliation" element={<PlaceholderWorkstream title="KYC-KYM Reconciliation" />} />
                <Route path="phase-2/program" element={<PlaceholderWorkstream title="Program Finalization" />} />

                {/* Phase 3 workstreams */}
                <Route path="phase-3/team-assembly" element={<PlaceholderWorkstream title="Team Assembly" />} />
                <Route path="phase-3/design-oversight" element={<PlaceholderWorkstream title="Design Oversight" />} />
                <Route path="phase-3/handoff" element={<PlaceholderWorkstream title="Handoff to Execution" />} />
              </Routes>
            </ClientLayout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
