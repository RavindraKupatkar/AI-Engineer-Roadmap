import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { RoadmapData, RoadmapNode, HierarchyNode } from '../types';

interface RoadmapGraphProps {
  data: RoadmapData | null;
  onNodeClick: (node: RoadmapNode) => void;
  selectedNodeId?: string;
}

const RoadmapGraph: React.FC<RoadmapGraphProps> = ({ data, onNodeClick, selectedNodeId }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Handle Resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!data || !svgRef.current || dimensions.width === 0) return;

    // 1. Data Transformation: Flat list -> Hierarchy
    // We need to handle potential disconnects, but assuming Gemini follows instructions:
    const stratify = d3.stratify<RoadmapNode>()
      .id((d) => d.id)
      .parentId((d) => d.parentId === 'root' || !d.parentId ? (d.id === 'root' ? null : 'root') : d.parentId);

    let root;
    try {
       // Ensure there is a root, if Gemini messes up parentIds slightly
       const safeNodes = data.nodes.map(n => ({
         ...n,
         parentId: n.id === 'root' ? undefined : (n.parentId || 'root')
       }));
       root = stratify(safeNodes);
    } catch (e) {
      console.error("D3 Stratify Error:", e);
      return;
    }

    // 2. Setup Tree Layout (Left to Right)
    const nodeWidth = 220;
    const nodeHeight = 80;
    const levelSpacing = 300; // Horizontal space
    
    // Use tree layout
    const treeLayout = d3.tree<RoadmapNode>()
      .nodeSize([nodeHeight + 40, nodeWidth]); // [height, width] because we flip coords later

    const rootHierarchy = treeLayout(root);

    // 3. D3 Selection & Cleanup
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous

    const g = svg.append("g");

    // 4. Zoom Behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 2])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    svg.call(zoom);

    // Center initially
    const initialTransform = d3.zoomIdentity
      .translate(100, dimensions.height / 2)
      .scale(0.8);
    svg.call(zoom.transform, initialTransform);


    // 5. Draw Links (Curved lines)
    g.selectAll(".link")
      .data(rootHierarchy.links())
      .enter()
      .append("path")
      .attr("class", "link")
      .attr("d", d3.linkHorizontal<d3.HierarchyPointLink<RoadmapNode>, d3.HierarchyPointNode<RoadmapNode>>()
        .x(d => d.y)
        .y(d => d.x)
      )
      .attr("fill", "none")
      .attr("stroke", "#334155")
      .attr("stroke-width", 2)
      .attr("opacity", 0.6);

    // 6. Draw Nodes
    const nodes = g.selectAll(".node")
      .data(rootHierarchy.descendants())
      .enter()
      .append("g")
      .attr("class", "node cursor-pointer")
      .attr("transform", d => `translate(${d.y},${d.x})`)
      .on("click", (event, d) => {
        event.stopPropagation();
        onNodeClick(d.data);
      });

    // Node Rects
    nodes.append("rect")
      .attr("width", nodeWidth)
      .attr("height", nodeHeight)
      .attr("x", 0)
      .attr("y", -nodeHeight / 2)
      .attr("rx", 8)
      .attr("fill", d => {
        if (d.data.id === selectedNodeId) return "rgba(56, 189, 248, 0.2)"; // Active
        switch(d.data.category) {
            case 'foundation': return "#1e293b";
            case 'engineering': return "#1e1b4b";
            case 'agents': return "#312e81";
            case 'advanced': return "#4c1d95";
            default: return "#1e293b";
        }
      })
      .attr("stroke", d => {
        if (d.data.id === selectedNodeId) return "#38bdf8"; // Active Border
        switch(d.data.category) {
            case 'foundation': return "#64748b";
            case 'engineering': return "#6366f1";
            case 'agents': return "#a855f7";
            case 'advanced': return "#d946ef";
            default: return "#475569";
        }
      })
      .attr("stroke-width", d => d.data.id === selectedNodeId ? 3 : 1)
      .attr("filter", d => d.data.id === selectedNodeId ? "url(#glow)" : "")
      .transition()
      .duration(500)
      .attr("opacity", 1);

    // Glow effect definition
    const defs = svg.append("defs");
    const filter = defs.append("filter")
      .attr("id", "glow");
    filter.append("feGaussianBlur")
      .attr("stdDeviation", "2.5")
      .attr("result", "coloredBlur");
    const feMerge = filter.append("feMerge");
    feMerge.append("feMergeNode").attr("in", "coloredBlur");
    feMerge.append("feMergeNode").attr("in", "SourceGraphic");

    // Labels
    nodes.append("text")
      .attr("dy", -10)
      .attr("x", 15)
      .style("text-anchor", "start")
      .text(d => d.data.label)
      .attr("fill", "#f8fafc")
      .attr("font-weight", "bold")
      .attr("font-size", "14px")
      .style("pointer-events", "none");

    // Descriptions (truncated)
    nodes.append("foreignObject")
      .attr("width", nodeWidth - 30)
      .attr("height", 40)
      .attr("x", 15)
      .attr("y", 5)
      .append("xhtml:div")
      .style("font-size", "10px")
      .style("color", "#94a3b8")
      .style("overflow", "hidden")
      .style("text-overflow", "ellipsis")
      .style("display", "-webkit-box")
      .style("-webkit-line-clamp", "2")
      .style("-webkit-box-orient", "vertical")
      .html(d => d.data.description);

    // Complexity Badge
    nodes.append("rect")
      .attr("width", 10)
      .attr("height", 10)
      .attr("x", nodeWidth - 20)
      .attr("y", -nodeHeight / 2 + 10)
      .attr("rx", 2)
      .attr("fill", d => {
        switch(d.data.complexity) {
            case 'beginner': return "#4ade80";
            case 'intermediate': return "#fbbf24";
            case 'advanced': return "#f87171";
            default: return "#94a3b8";
        }
      });

  }, [data, dimensions, selectedNodeId, onNodeClick]);

  return (
    <div ref={containerRef} className="w-full h-full bg-neuro-bg relative overflow-hidden">
        {(!data) && (
            <div className="absolute inset-0 flex items-center justify-center text-slate-500">
                <p>Generating Neural Map...</p>
            </div>
        )}
      <svg ref={svgRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
      
      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-neuro-card/90 p-3 rounded-lg border border-slate-700 backdrop-blur-sm text-xs text-slate-300">
          <div className="font-bold mb-2 text-slate-100">Legend</div>
          <div className="flex items-center gap-2 mb-1"><span className="w-3 h-3 rounded-full bg-[#1e293b] border border-[#64748b]"></span> Foundation</div>
          <div className="flex items-center gap-2 mb-1"><span className="w-3 h-3 rounded-full bg-[#1e1b4b] border border-[#6366f1]"></span> Engineering</div>
          <div className="flex items-center gap-2 mb-1"><span className="w-3 h-3 rounded-full bg-[#312e81] border border-[#a855f7]"></span> Agents</div>
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#4c1d95] border border-[#d946ef]"></span> Advanced</div>
      </div>
    </div>
  );
};

export default RoadmapGraph;
