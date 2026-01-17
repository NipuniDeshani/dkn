import React from 'react';
import { Server, Activity, CheckCircle, RefreshCw, Cpu, Database, Network } from 'lucide-react';

const SystemHealthPanel = () => {
    const systems = [
        {
            id: 'legacy-nlp',
            name: 'Legacy NLP Engine',
            description: 'Natural Language Processing v2.1',
            status: 'Operational',
            uptime: '99.9%',
            latency: '45ms',
            icon: Cpu
        },
        {
            id: 'ai-engine',
            name: 'AI Recommendation Engine',
            description: 'Content Matching & Personalization',
            status: 'Operational',
            uptime: '99.8%',
            latency: '120ms',
            icon: Sparkles
        },
        {
            id: 'index-service',
            name: 'Document Indexing Service',
            description: 'ElasticSearch Cluster',
            status: 'Idle',
            uptime: '100%',
            latency: '12ms',
            icon: Database
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-800">System Integrations</h2>
                <button className="flex items-center gap-2 px-3 py-1.5 text-sm bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition text-slate-600">
                    <RefreshCw size={14} /> Refresh Status
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {systems.map((sys) => (
                    <div key={sys.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>

                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
                                    <sys.icon size={24} />
                                </div>
                                <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-green-50 border border-green-100 text-green-700 text-xs font-medium">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                    {sys.status}
                                </div>
                            </div>

                            <h3 className="font-bold text-slate-800 text-lg mb-1">{sys.name}</h3>
                            <p className="text-sm text-slate-500 mb-4 h-10">{sys.description}</p>

                            <div className="flex items-center justify-between text-sm py-3 border-t border-slate-100">
                                <div className="flex flex-col">
                                    <span className="text-slate-400 text-xs uppercase font-bold">Uptime</span>
                                    <span className="font-mono text-slate-700">{sys.uptime}</span>
                                </div>
                                <div className="flex flex-col text-right">
                                    <span className="text-slate-400 text-xs uppercase font-bold">Latency</span>
                                    <span className="font-mono text-slate-700">{sys.latency}</span>
                                </div>
                            </div>

                            <div className="mt-3 text-xs text-slate-400 flex items-center gap-1">
                                <Activity size={12} />
                                Last heartbeat: Just now
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
                <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                    <Network size={20} className="text-slate-500" />
                    Connectivity Logs
                </h3>
                <div className="space-y-2 font-mono text-xs bg-white p-4 rounded border border-slate-200 h-40 overflow-y-auto">
                    <p className="text-green-600">[2023-10-23 14:30:05] NLP Engine connection established (Lat: 45ms)</p>
                    <p className="text-green-600">[2023-10-23 14:30:06] AI Recommendation Engine synchronized</p>
                    <p className="text-slate-500">[2023-10-23 14:35:12] Batch processing started for 5 new documents</p>
                    <p className="text-slate-500">[2023-10-23 14:35:15] Batch processing completed successfully</p>
                    <p className="text-blue-600">[2023-10-23 15:00:00] Scheduled health check passed</p>
                </div>
            </div>
        </div>
    );
};

// Start icon helper
import { Sparkles } from 'lucide-react'; // Re-importing inside simulating standalone file structure, but in real file I'd arrange imports at top.
export default SystemHealthPanel;
