
import React, { useState } from 'react';
import { AssignmentPriority, AssignmentStatus, AssignmentType } from '../types';

interface ImporterProps {
  onImport: (data: any) => void;
}

const SCHEMA_EXAMPLE = {
  course: {
    name: "Course Name",
    code: "CODE101",
    credits: 3,
    targetGrade: 85,
    color: "#4F46E5"
  },
  assignments: [
    {
      name: "Assignment 1",
      weight: 10,
      dueDate: "2023-12-31T23:59:59Z",
      type: "Assignment",
      priority: "Medium",
      status: "Not Started"
    }
  ]
};

const Importer: React.FC<ImporterProps> = ({ onImport }) => {
  const [jsonInput, setJsonInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const copyPrompt = () => {
    const prompt = `Convert the following course syllabus into a single JSON object. 
Use this exact structure:
${JSON.stringify(SCHEMA_EXAMPLE, null, 2)}

Rules:
1. weights must sum to 100 if possible.
2. dueDate must be ISO 8601 strings.
3. type must be one of: Assignment, Lab, Quiz, Midterm, Final, Other.
4. priority must be: Low, Medium, High.
5. status must be: Not Started.

Syllabus Text: [PASTE YOUR SYLLABUS HERE]`;
    
    navigator.clipboard.writeText(prompt);
    alert('Prompt copied to clipboard! Paste it into your favorite AI.');
  };

  const handleImport = () => {
    try {
      const data = JSON.parse(jsonInput);
      
      // Basic Validation
      if (!data.course || !data.assignments || !Array.isArray(data.assignments)) {
        throw new Error('Invalid structure. Missing "course" or "assignments" array.');
      }

      // Map strings to Enums to ensure compatibility
      const cleanedData = {
        course: {
          ...data.course,
          color: data.course.color || '#4F46E5',
          targetGrade: data.course.targetGrade || 80,
          credits: data.course.credits || 3
        },
        assignments: data.assignments.map((a: any) => ({
          ...a,
          description: a.description || '',
          priority: Object.values(AssignmentPriority).includes(a.priority) ? a.priority : AssignmentPriority.MEDIUM,
          status: Object.values(AssignmentStatus).includes(a.status) ? a.status : AssignmentStatus.NOT_STARTED,
          type: Object.values(AssignmentType).includes(a.type) ? a.type : AssignmentType.ASSIGNMENT
        }))
      };

      onImport(cleanedData);
      setError(null);
    } catch (err: any) {
      setError(`Import Failed: ${err.message}`);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start gap-8">
        
        {/* Left: Instructions */}
        <div className="w-full md:w-1/3 space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-black text-slate-900">JSON Import</h1>
            <p className="text-slate-500 text-sm leading-relaxed">
              Populate your workspace by pasting a pre-formatted JSON object. You can generate this using any AI tool with our schema.
            </p>
          </div>

          <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5 space-y-4">
            <h3 className="font-bold text-indigo-900 text-sm flex items-center gap-2">
              <span className="flex items-center justify-center w-5 h-5 bg-indigo-600 text-white text-[10px] rounded-full">1</span>
              Get your JSON
            </h3>
            <p className="text-xs text-indigo-700">
              Copy our "AI Prompt" and use it with Gemini or ChatGPT to convert your course PDF/Text into the correct format.
            </p>
            <button 
              onClick={copyPrompt}
              className="w-full bg-white border border-indigo-200 text-indigo-600 py-2 rounded-xl text-xs font-bold hover:bg-indigo-100 transition-colors shadow-sm"
            >
              Copy AI Prompt
            </button>
          </div>

          <div className="bg-slate-900 rounded-2xl p-5 overflow-hidden">
            <h3 className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-3">Expected Schema</h3>
            <pre className="text-[10px] text-emerald-400 font-mono overflow-x-auto">
              {JSON.stringify(SCHEMA_EXAMPLE, null, 2)}
            </pre>
          </div>
        </div>

        {/* Right: Input Area */}
        <div className="w-full md:flex-1 space-y-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm min-h-[500px] flex flex-col">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Paste JSON Data</label>
            <textarea
              value={jsonInput}
              onChange={(e) => {
                setJsonInput(e.target.value);
                setError(null);
              }}
              placeholder='{ "course": { ... }, "assignments": [...] }'
              className="flex-1 w-full font-mono text-sm bg-slate-50 border border-slate-100 rounded-2xl p-6 focus:ring-2 focus:ring-indigo-200 resize-none outline-none transition-all"
            />
            
            {error && (
              <div className="mt-4 p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl text-xs font-medium">
                {error}
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button
                onClick={handleImport}
                disabled={!jsonInput.trim()}
                className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold text-sm shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Import Course Data
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Importer;
