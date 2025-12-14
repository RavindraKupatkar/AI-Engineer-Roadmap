import React, { useState, useEffect } from 'react';
import RoadmapGraph from './components/RoadmapGraph';
import DetailPanel from './components/DetailPanel';
import { generateCombinedRoadmap } from './services/geminiService';
import { RoadmapData, RoadmapNode } from './types';

const App: React.FC = () => {
  const [data, setData] = useState<RoadmapData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedNode, setSelectedNode] = useState<RoadmapNode | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initData = async () => {
      try {
        setLoading(true);
        const roadmapData = await generateCombinedRoadmap();
        setData(roadmapData);
      } catch (err) {
        setError("Failed to generate the neural map. Please check your API key.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    initData();
  }, []);

  const handleNodeClick = (node: RoadmapNode) => {
    setSelectedNode(node);
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-neuro-bg text-slate-200">
      {/* Navbar */}
      <header className="h-16 border-b border-slate-700 bg-[#0f172a] flex items-center justify-between px-6 z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-neuro-accent to-purple-600 rounded flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20">
            N
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">
            Neuro<span className="text-neuro-accent">Map</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-4 text-sm">
            <span className="hidden md:block text-slate-500">
                AI Engineer × AI Agents Integration
            </span>
            <div className="h-4 w-px bg-slate-700 hidden md:block"></div>
            <a 
                href="#" 
                className="text-slate-400 hover:text-white transition-colors"
                onClick={() => window.location.reload()}
            >
                Regenerate
            </a>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 relative">
        {loading && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-neuro-bg/80 backdrop-blur-sm">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-slate-700 rounded-full"></div>
                    <div className="absolute top-0 left-0 w-16 h-16 border-4 border-neuro-accent rounded-full border-t-transparent animate-spin"></div>
                </div>
                <h2 className="mt-6 text-xl font-bold text-white animate-pulse">Synthesizing Curriculum</h2>
                <p className="text-slate-400 mt-2">Merging engineering principles with agentic behaviors...</p>
            </div>
        )}

        {error && (
             <div className="absolute inset-0 z-20 flex items-center justify-center bg-neuro-bg">
                <div className="max-w-md p-6 bg-red-900/20 border border-red-800 rounded-lg text-center">
                    <h3 className="text-xl font-bold text-red-500 mb-2">System Failure</h3>
                    <p className="text-slate-300">{error}</p>
                    <button 
                        onClick={() => window.location.reload()}
                        className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                    >
                        Retry Protocol
                    </button>
                </div>
             </div>
        )}

        <div className="w-full h-full">
            <RoadmapGraph 
                data={data} 
                onNodeClick={handleNodeClick}
                selectedNodeId={selectedNode?.id}
            />
        </div>

        {/* Slide-over Detail Panel */}
        {selectedNode && (
            <DetailPanel 
                node={selectedNode} 
                onClose={() => setSelectedNode(null)} 
            />
        )}
      </main>
    </div>
  );
};

export default App;
