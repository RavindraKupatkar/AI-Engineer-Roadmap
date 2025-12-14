import React, { useEffect, useState } from 'react';
import { RoadmapNode, NodeDetailsResponse } from '../types';
import { getNodeDetails } from '../services/geminiService';

interface DetailPanelProps {
  node: RoadmapNode | null;
  onClose: () => void;
}

const DetailPanel: React.FC<DetailPanelProps> = ({ node, onClose }) => {
  const [details, setDetails] = useState<NodeDetailsResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (node) {
      setLoading(true);
      setDetails(null);
      getNodeDetails(node.label, node.description)
        .then(setDetails)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [node]);

  if (!node) return null;

  return (
    <div className="fixed right-0 top-0 h-full w-full md:w-[450px] bg-neuro-card border-l border-slate-700 shadow-2xl transform transition-transform duration-300 z-50 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-slate-700 flex justify-between items-start bg-[#0f172a]">
        <div>
            <span className={`text-xs font-mono uppercase tracking-wider px-2 py-1 rounded ${
                node.complexity === 'beginner' ? 'bg-green-500/20 text-green-400' :
                node.complexity === 'intermediate' ? 'bg-amber-500/20 text-amber-400' :
                'bg-red-500/20 text-red-400'
            }`}>
                {node.complexity}
            </span>
            <h2 className="text-2xl font-bold text-white mt-2">{node.label}</h2>
            <p className="text-slate-400 text-sm mt-1">{node.category}</p>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-white">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="prose prose-invert prose-sm">
            <h3 className="text-neuro-accent">Overview</h3>
            <p className="text-slate-300">{node.description}</p>
        </div>

        {loading ? (
            <div className="flex flex-col items-center justify-center py-10 space-y-4">
                <div className="w-8 h-8 border-4 border-neuro-accent border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs text-slate-500 font-mono animate-pulse">Consulting Neural Network...</p>
            </div>
        ) : details ? (
            <>
                <div>
                    <h3 className="text-sm font-bold text-neuro-accent uppercase tracking-wider mb-3">Core Objectives</h3>
                    <ul className="space-y-2">
                        {details.learningObjectives.map((obj, i) => (
                            <li key={i} className="flex items-start text-sm text-slate-300">
                                <span className="mr-2 text-neuro-success">▹</span>
                                {obj}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                    <h3 className="text-sm font-bold text-purple-400 uppercase tracking-wider mb-2">Build This</h3>
                    <p className="text-sm text-slate-300 italic">"{details.projectIdea}"</p>
                </div>

                <div>
                    <h3 className="text-sm font-bold text-neuro-accent uppercase tracking-wider mb-3">
                        Video Resources & Courses
                    </h3>
                    <div className="space-y-2">
                        {details.resources.map((res, i) => {
                            const isClickable = !!res.url;
                            const Component = isClickable ? 'a' : 'div';
                            const props = isClickable ? { href: res.url, target: "_blank", rel: "noopener noreferrer" } : {};

                            return (
                                <Component 
                                    key={i} 
                                    {...props}
                                    className={`block group p-3 rounded bg-slate-800 hover:bg-slate-700 transition-colors border border-transparent hover:border-slate-600 no-underline ${isClickable ? 'cursor-pointer' : ''}`}
                                >
                                    <div className="flex justify-between items-center">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium text-slate-200 group-hover:text-neuro-accent transition-colors">
                                                {res.title}
                                            </span>
                                            {isClickable && <span className="text-[10px] text-slate-500 truncate max-w-[250px]">{res.url}</span>}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] uppercase bg-slate-900 px-1.5 py-0.5 rounded text-slate-500 group-hover:text-slate-300">
                                                {res.type}
                                            </span>
                                            {isClickable && (
                                                 <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-slate-500 group-hover:text-neuro-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                </svg>
                                            )}
                                        </div>
                                    </div>
                                </Component>
                            );
                        })}
                    </div>
                </div>
            </>
        ) : (
            <div className="text-center text-slate-500 text-sm">
                Failed to load details. Please try again.
            </div>
        )}
      </div>
    </div>
  );
};

export default DetailPanel;
