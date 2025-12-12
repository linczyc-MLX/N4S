import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, Circle, Lock, ChevronRight } from 'lucide-react';
import { Client } from '../types';
import { getClient } from '../utils/storage';

export const PhaseOverview: React.FC = () => {
  const { clientId, phase } = useParams();
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadClient();
  }, [clientId]);

  const loadClient = async () => {
    if (!clientId) return;
    const loadedClient = await getClient(clientId);
    setClient(loadedClient);
    setLoading(false);
  };

  // Define workstreams for each phase
  const getWorkstreams = () => {
    if (phase === '1') {
      return [
        { id: 'launch', name: 'Launch', description: 'Initial setup and path confirmation', path: 'launch' },
        { id: 'client-profile', name: 'Client Profile Overview', description: 'Comprehensive lifestyle discovery', path: 'client-profile' },
        { id: 'exploration', name: 'Spatial Philosophy', description: 'Adjacencies and space planning', path: 'exploration' }
      ];
    } else if (phase === '2') {
      return [
        { id: 'context', name: 'Market Context', description: 'KYM analysis and buyer avatars', path: 'context' },
        { id: 'reconciliation', name: 'KYC-KYM Reconciliation', description: 'Balance desires with market reality', path: 'reconciliation' },
        { id: 'program', name: 'Program Finalization', description: 'Lock spatial program and budget', path: 'program' }
      ];
    } else {
      return [
        { id: 'team', name: 'Team Assembly', description: 'Architect and contractor matching', path: 'team' },
        { id: 'oversight', name: 'Design Oversight', description: 'Review and validate designs', path: 'oversight' },
        { id: 'handoff', name: 'Handoff', description: 'Transition to execution', path: 'handoff' }
      ];
    }
  };

  const workstreams = getWorkstreams();
  const phaseTitle = phase === '1' ? 'Ask Right Questions' : phase === '2' ? 'Have a Story to Tell' : 'Execution Readiness';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-slate-300 border-t-amber-600"></div>
      </div>
    );
  }

  if (!client) {
    return <div className="p-8">Client not found</div>;
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="text-sm text-slate-600 mb-2">
          {client.name} • Phase {phase}
        </div>
        <h1 className="text-4xl font-serif font-bold text-slate-900 mb-2">
          {phaseTitle}
        </h1>
        <p className="text-slate-600">
          Select a workstream to begin or continue
        </p>
      </div>

      {/* Workstreams */}
      <div className="space-y-4">
        {workstreams.map((workstream, index) => {
          const isCompleted = false; // TODO: Track completion
          const isUnlocked = true; // TODO: Implement proper unlocking logic
          
          return (
            <Link
              key={workstream.id}
              to={isUnlocked ? `/client/${clientId}/phase-${phase}/${workstream.path}` : '#'}
              onClick={e => !isUnlocked && e.preventDefault()}
              className={`block bg-white rounded-xl border-2 p-6 transition-all ${
                isUnlocked
                  ? 'border-slate-200 hover:border-amber-400 hover:shadow-lg'
                  : 'border-slate-100 opacity-50 cursor-not-allowed'
              }`}
            >
              <div className="flex items-center gap-4">
                <div>
                  {isCompleted ? (
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                  ) : isUnlocked ? (
                    <Circle className="w-8 h-8 text-amber-600" />
                  ) : (
                    <Lock className="w-8 h-8 text-slate-400" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-slate-900 mb-1">
                    {workstream.name}
                  </h3>
                  <p className="text-slate-600">
                    {workstream.description}
                  </p>
                </div>
                {isUnlocked && (
                  <ChevronRight className="w-6 h-6 text-amber-600" />
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
