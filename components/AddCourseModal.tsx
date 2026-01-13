
import React, { useState } from 'react';
import { Course } from '../types';
import { IconImport, IconBook, IconSave } from './Icons';

interface AddCourseModalProps {
  onClose: () => void;
  onAdd: (course: Omit<Course, 'id'>) => void;
  onSwitchToImport: () => void;
}

const COLORS = ['#4F46E5', '#0891B2', '#7C3AED', '#EA580C', '#E11D48', '#059669', '#3b82f6', '#ef4444'];

const AddCourseModal: React.FC<AddCourseModalProps> = ({ onClose, onAdd, onSwitchToImport }) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [credits, setCredits] = useState(3);
  const [targetGrade, setTargetGrade] = useState(90);
  const [color, setColor] = useState(COLORS[0]);
  const [term, setTerm] = useState('Fall 2024');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !code) return;
    
    onAdd({
      name,
      code,
      credits,
      targetGrade,
      color,
      term
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col">
        <div className="p-8 pb-0 flex justify-between items-center">
          <h2 className="text-2xl font-black text-slate-900">Add New Course</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 text-2xl">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Course Code</label>
              <input 
                type="text" 
                placeholder="e.g. CS101" 
                value={code}
                onChange={e => setCode(e.target.value)}
                className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-100"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Course Name</label>
              <input 
                type="text" 
                placeholder="e.g. Intro to Computer Science" 
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-100"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Credits</label>
                <input 
                  type="number" 
                  value={credits}
                  onChange={e => setCredits(parseInt(e.target.value))}
                  className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-100"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Target Grade (%)</label>
                <input 
                  type="number" 
                  value={targetGrade}
                  onChange={e => setTargetGrade(parseInt(e.target.value))}
                  className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-100"
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Color Tag</label>
              <div className="flex gap-2 flex-wrap">
                {COLORS.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-8 h-8 rounded-full transition-all ${color === c ? 'ring-2 ring-offset-2 ring-slate-300 scale-110' : 'hover:scale-105'}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-50 flex flex-col gap-3">
             <button 
              type="submit"
              className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
            >
              <IconSave /> Save Course
            </button>
            <button 
              type="button"
              onClick={onSwitchToImport}
              className="w-full bg-indigo-50 text-indigo-600 py-3.5 rounded-xl font-bold text-sm hover:bg-indigo-100 transition-all flex items-center justify-center gap-2"
            >
              <IconImport /> Import from Syllabus (JSON)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCourseModal;
