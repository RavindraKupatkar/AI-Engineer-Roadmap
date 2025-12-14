import { Type, Schema } from "@google/genai";
import { RoadmapData, NodeDetailsResponse } from "../types";

// Use serverless API endpoint instead of direct client-side API calls
const API_ENDPOINT = '/api/gemini';

const ROADMAP_SYSTEM_INSTRUCTION = `
You are a Principal Curriculum Architect specializing in Artificial Intelligence. 
Your task is to intelligently merge two complex roadmaps: "AI Engineer Roadmap" and "AI Agents Roadmap".
You must identify common foundations (Python, Math, APIs), distinct engineering paths (MLOps, Deployment, RAG), and agentic paths (ReAct, Tool Use, Multi-Agent Orchestration).
Create a unified, logical dependency tree starting from a single "Start Here" root.
Categorize nodes strictly.
The output must be a flat list of nodes where each node (except root) has a 'parentId'.
`;

export const generateCombinedRoadmap = async (): Promise<RoadmapData> => {
  const modelId = "gemini-2.5-flash"; // Fast model for structure generation
  
  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      nodes: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            parentId: { type: Type.STRING, nullable: true },
            label: { type: Type.STRING },
            description: { type: Type.STRING },
            category: { type: Type.STRING, enum: ['foundation', 'engineering', 'agents', 'advanced'] },
            complexity: { type: Type.STRING, enum: ['beginner', 'intermediate', 'advanced'] },
          },
          required: ["id", "label", "description", "category", "complexity"],
        },
      },
    },
    required: ["nodes"],
  };

  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'generateContent',
        data: {
          model: modelId,
          contents: "Generate a comprehensive, combined roadmap for an 'AI Engineer' focusing on 'AI Agents'. The tree should have at least 20-25 nodes to cover depth. Ensure there is a single root node with id 'root'.",
          systemInstruction: ROADMAP_SYSTEM_INSTRUCTION,
          config: {
            responseMimeType: "application/json",
            responseSchema: schema,
            temperature: 0.3,
          },
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const result = await response.json();
    const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error("No response from Gemini");
    return JSON.parse(text) as RoadmapData;
  } catch (error) {
    console.error("Failed to generate roadmap:", error);
    throw error;
  }
};

export const getNodeDetails = async (nodeLabel: string, contextDescription: string): Promise<NodeDetailsResponse> => {
  const modelId = "gemini-2.5-flash";

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      summary: { type: Type.STRING },
      learningObjectives: { type: Type.ARRAY, items: { type: Type.STRING } },
      resources: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            type: { type: Type.STRING, enum: ['video', 'course', 'article'] },
            url: { type: Type.STRING },
          },
          required: ["title", "type", "url"],
        },
      },
      projectIdea: { type: Type.STRING },
    },
    required: ["summary", "learningObjectives", "resources", "projectIdea"],
  };

  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'generateContent',
        data: {
          model: modelId,
          contents: `Provide deep dive details for the roadmap node: "${nodeLabel}". 
Context: ${contextDescription}. 

You are a senior developer mentor. Your goal is to provide the BEST video-based learning resources.
1. Summary: Concise technical explanation.
2. Learning Objectives: 3-4 bullet points.
3. Resources: STRICTLY provide 3-5 high-quality video resources.
   - PRIORITY: YouTube tutorials (free, accessible), Udemy courses (comprehensive), Coursera (academic/theory).
   - MUST include a valid 'url' for every resource. If a direct link is not known, generate a smart Google Search URL (e.g., "https://www.google.com/search?q=LangChain+tutorial+youtube").
   - Label the title with the platform (e.g., "YouTube: Intro to Vectors", "Udemy: Master LangChain").
   - Mix theory and hands-on coding.
4. Project Idea: A specific, buildable micro-project.`,
          systemInstruction: undefined,
          config: {
            responseMimeType: "application/json",
            responseSchema: schema,
          },
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const result = await response.json();
    const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error("No response from Gemini");
    return JSON.parse(text) as NodeDetailsResponse;
  } catch (error) {
    console.error("Failed to fetch node details:", error);
    throw error;
  }
};
