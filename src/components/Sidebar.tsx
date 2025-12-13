import React from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { Home, Users, ChevronRight, Lock } from 'lucide-react';
import { Client } from '../types';

interface SidebarProps {
  client?: Client;
}

export const Sidebar: React.FC<SidebarProps> = ({ client }) => {
  const location = useLocation();
  const { clientId } = useParams();

  const isActive = (path: string) => location.pathname === path;

  // Phase 1 stages
  const phase1Stages = [
    { id: '1.1', name: 'Launch', path: `/client/${clientId}/phase-1/launch` },
    { id: '1.2', name: 'Exploration', path: `/client/${clientId}/phase-1/exploration` },
    { id: '1.3', name: 'Definition', path: `/client/${clientId}/phase-1/definition` }
  ];

  // Phase 2 stages  
  const phase2Stages = [
    { id: '2.1', name: 'Context', path: `/client/${clientId}/phase-2/context` },
    { id: '2.2', name: 'Reconciliation', path: `/client/${clientId}/phase-2/reconciliation` },
    { id: '2.3', name: 'Program', path: `/client/${clientId}/phase-2/program` }
  ];

  // Phase 3 stages
  const phase3Stages = [
    { id: '3.1', name: 'Team Assembly', path: `/client/${clientId}/phase-3/team-assembly` },
    { id: '3.2', name: 'Design Oversight', path: `/client/${clientId}/phase-3/design-oversight` },
    { id: '3.3', name: 'Handoff', path: `/client/${clientId}/phase-3/handoff` }
  ];

  const isStageUnlocked = (phase: number, stage: number) => {
    if (!client) return false;
    if (client.phase > phase) return true;
    if (client.phase === phase && client.stage >= stage) return true;
    return false;
  };

  const StageLink = ({ phaseNum, stageNum, stage }: any) => {
    const unlocked = isStageUnlocked(phaseNum, stageNum);
    const currentStage = client?.phase === phaseNum && client?.stage === stageNum;

    return (
      <Link
        to={unlocked ? stage.path : '#'}
        className={`flex items-center justify-between px-4 py-2 text-sm transition-colors ${
          isActive(stage.path)
            ? 'bg-amber-100 text-amber-900 border-l-4 border-amber-600'
            : unlocked
            ? 'text-gray-700 hover:bg-gray-100'
            : 'text-gray-400 cursor-not-allowed'
        }`}
        onClick={(e) => !unlocked && e.preventDefault()}
      >
        <span className="flex items-center gap-2">
          {currentStage && <ChevronRight className="w-4 h-4 text-amber-600" />}
          <span className="font-mono text-xs">{stage.id}</span>
          <span>{stage.name}</span>
        </span>
        {!unlocked && <Lock className="w-4 h-4" />}
      </Link>
    );
  };

  return (
    <div className="w-80 bg-slate-900 text-white flex flex-col h-screen">
      {/* Header */}
      <div className="p-6 border-b border-slate-700">
        <Link to="/" className="flex items-center gap-3 group">
          <Home className="w-8 h-8 text-amber-500 group-hover:text-amber-400 transition-colors" />
          <div>
            <h1 className="text-xl font-serif font-bold tracking-tight">Not4Sale</h1>
            <p className="text-xs text-slate-400">Luxury Residential Advisory</p>
          </div>
        </Link>
      </div>

      {/* Client Context (if viewing a client) */}
      {client && (
        <div className="p-4 border-b border-slate-700 bg-slate-800">
          <div className="text-xs text-slate-400 mb-1">Current Client</div>
          <div className="font-semibold text-white">{client.name}</div>
          <div className="text-sm text-slate-300 mt-1">
            {client.path} • Phase {client.phase}, Stage {client.stage}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto">
        {!clientId ? (
          /* Dashboard navigation */
          <div className="p-4">
            <Link
              to="/"
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive('/')
                  ? 'bg-amber-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Users className="w-5 h-5" />
              <span className="font-medium">Your Clients</span>
            </Link>
          </div>
        ) : (
          /* Client journey navigation */
          <div className="py-4">
            {/* Phase 1 */}
            <div className="mb-6">
              <div className="px-4 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                Phase 1: Ask Right Questions
              </div>
              <div className="space-y-1">
                {phase1Stages.map((stage, idx) => (
                  <StageLink key={stage.id} phaseNum={1} stageNum={idx + 1} stage={stage} />
                ))}
              </div>
            </div>

            {/* Phase 2 */}
            <div className="mb-6">
              <div className="px-4 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                Phase 2: Have a Story to Tell
              </div>
              <div className="space-y-1">
                {phase2Stages.map((stage, idx) => (
                  <StageLink key={stage.id} phaseNum={2} stageNum={idx + 1} stage={stage} />
                ))}
              </div>
            </div>

            {/* Phase 3 */}
            <div className="mb-6">
              <div className="px-4 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                Phase 3: Execution Readiness
              </div>
              <div className="space-y-1">
                {phase3Stages.map((stage, idx) => (
                  <StageLink key={stage.id} phaseNum={3} stageNum={idx + 1} stage={stage} />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-700 text-xs text-slate-500">
        <div>N4S Platform v2.0</div>
        <div>Portfolio Advisory System</div>
      </div>
    </div>
  );
};
