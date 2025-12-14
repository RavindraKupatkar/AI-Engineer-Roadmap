export interface RoadmapNode {
  id: string;
  label: string;
  description: string;
  category: 'foundation' | 'engineering' | 'agents' | 'advanced';
  complexity: 'beginner' | 'intermediate' | 'advanced';
  parentId?: string; // Used to reconstruct hierarchy
}

export interface RoadmapData {
  nodes: RoadmapNode[];
}

export interface NodeDetailsResponse {
  summary: string;
  learningObjectives: string[];
  resources: { title: string; type: 'video' | 'article' | 'course'; url?: string }[];
  projectIdea: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

// D3 Types helpers
export interface HierarchyNode extends RoadmapNode {
  children?: HierarchyNode[];
}
