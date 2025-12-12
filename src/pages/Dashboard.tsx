import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Users, TrendingUp, Clock, ChevronRight } from 'lucide-react';
import { Client } from '../types';
import { getAllClients, getPathLabel, getPortfolioContextLabel } from '../utils/storage';

export const Dashboard: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    setLoading(true);
    const loadedClients = await getAllClients();
    setClients(loadedClients);
    setLoading(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-300';
      case 'paused': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getGradeColor = (grade?: string) => {
    if (!grade) return 'text-gray-400';
    const letter = grade.charAt(0);
    switch (letter) {
      case 'A': return 'text-green-600';
      case 'B': return 'text-blue-600';
      case 'C': return 'text-yellow-600';
      case 'D': return 'text-orange-600';
      case 'F': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="flex-1 bg-slate-50 overflow-y-auto">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-serif font-bold text-slate-900 mb-2">
                Your Clients
              </h1>
              <p className="text-slate-600">
                Portfolio advisory engagements across luxury residential projects
              </p>
            </div>
            <Link
              to="/new-client"
              className="flex items-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg shadow-lg transition-all hover:shadow-xl"
            >
              <Plus className="w-5 h-5" />
              Start New Client Project
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 mt-8">
            <div className="bg-white rounded-xl p-6 border-2 border-slate-200">
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-6 h-6 text-amber-600" />
                <span className="text-sm font-semibold text-slate-600 uppercase tracking-wider">
                  Active Clients
                </span>
              </div>
              <div className="text-4xl font-bold text-slate-900">
                {clients.filter(c => c.status === 'active').length}
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border-2 border-slate-200">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-6 h-6 text-green-600" />
                <span className="text-sm font-semibold text-slate-600 uppercase tracking-wider">
                  Avg N4S Score
                </span>
              </div>
              <div className="text-4xl font-bold text-slate-900">
                {clients.length > 0
                  ? Math.round(
                      clients
                        .filter(c => c.n4sScore)
                        .reduce((sum, c) => sum + (c.n4sScore || 0), 0) /
                        clients.filter(c => c.n4sScore).length
                    )
                  : '—'}
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border-2 border-slate-200">
              <div className="flex items-center gap-3 mb-2">
                <Clock className="w-6 h-6 text-blue-600" />
                <span className="text-sm font-semibold text-slate-600 uppercase tracking-wider">
                  In Progress
                </span>
              </div>
              <div className="text-4xl font-bold text-slate-900">
                {clients.filter(c => c.status === 'active' && c.phase < 3).length}
              </div>
            </div>
          </div>
        </div>

        {/* Client List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-slate-300 border-t-amber-600"></div>
            <p className="text-slate-600 mt-4">Loading clients...</p>
          </div>
        ) : clients.length === 0 ? (
          <div className="text-center py-20">
            <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-serif font-bold text-slate-700 mb-2">
              No clients yet
            </h3>
            <p className="text-slate-600 mb-6">
              Start your first client engagement to begin using the N4S platform
            </p>
            <Link
              to="/new-client"
              className="inline-flex items-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5" />
              Start New Client Project
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {clients.map(client => (
              <Link
                key={client.id}
                to={`/client/${client.id}/phase-${client.phase}/overview`}
                className="block bg-white rounded-xl border-2 border-slate-200 hover:border-amber-400 hover:shadow-lg transition-all"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-2xl font-serif font-bold text-slate-900">
                          {client.name}
                        </h3>
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(client.status)}`}>
                          {client.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-600">
                        <span className="font-mono font-semibold">{getPathLabel(client.path)}</span>
                        <span>•</span>
                        <span>{getPortfolioContextLabel(client.portfolioContext)}</span>
                        {client.location && (
                          <>
                            <span>•</span>
                            <span>{client.location}</span>
                          </>
                        )}
                      </div>
                    </div>
                    {client.n4sScore && (
                      <div className="text-right">
                        <div className="text-sm text-slate-600 mb-1">N4S Score</div>
                        <div className={`text-4xl font-bold ${getGradeColor(client.n4sGrade)}`}>
                          {client.n4sGrade || '—'}
                        </div>
                        <div className="text-sm text-slate-500 font-mono">
                          {client.n4sScore}/100
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <div>
                        <div className="text-xs text-slate-500 mb-1">Current Phase</div>
                        <div className="font-semibold text-slate-700">
                          Phase {client.phase}, Stage {client.stage}
                        </div>
                      </div>
                      {client.timeline && (
                        <div>
                          <div className="text-xs text-slate-500 mb-1">Timeline</div>
                          <div className="font-semibold text-slate-700">{client.timeline}</div>
                        </div>
                      )}
                      <div>
                        <div className="text-xs text-slate-500 mb-1">Last Updated</div>
                        <div className="font-semibold text-slate-700">
                          {new Date(client.updatedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-amber-600 font-semibold">
                      Continue
                      <ChevronRight className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
