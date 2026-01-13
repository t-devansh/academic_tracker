
import React, { useState, useEffect } from 'react';
import { Course, ClassSchedule } from '../types';
import { IconImport, IconSave, IconPlus, IconTrash, IconClock } from './Icons';

interface CourseFormModalProps {
  onClose: () => void;
  onSave: (courseData: Omit<Course, 'id'>) => void;
  initialData?: Course;
  onSwitchToImport?: () => void;
}

const COLORS = ['#4F46E5', '#0891B2', '#7C3AED', '#EA580C', '#E11D48', '#059669', '#3b82f6', '#ef4444'];
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const CourseFormModal: React.FC<CourseFormModalProps> = ({ onClose, onSave, initialData, onSwitchToImport }) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [credits, setCredits] = useState(3);
  const [targetGrade, setTargetGrade] = useState(90);
  const [color, setColor] = useState(COLORS[0]);
  const [term, setTerm] = useState('Fall 2024');
  const [schedule, setSchedule] = useState<ClassSchedule[]>([]);

  // Schedule Input State
  const [schedDay, setSchedDay] = useState(DAYS[0]);
  const [schedStart, setSchedStart] = useState('09:00');
  const [schedEnd, setSchedEnd] = useState('10:30');
  const [schedLoc, setSchedLoc] = useState('');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setCode(initialData.code);
      setCredits(initialData.credits);
      setTargetGrade(initialData.targetGrade);
      setColor(initialData.color);
      setTerm(initialData.term || 'Fall 2024');
      setSchedule(initialData.schedule || []);
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !code) return;
    
    onSave({
      name,
      code,
      credits,
      targetGrade,
      color,
      term,
      schedule
    });
    onClose();
  };

  const addScheduleItem = () => {
    if (!schedStart || !schedEnd) return;
    const newItem: ClassSchedule = {
      day: schedDay as any,
      startTime: schedStart,
      endTime: schedEnd,
      location: schedLoc
    };
    setSchedule([...schedule, newItem]);
    // Reset location but keep time/day for quick adding
    setSchedLoc('');
  };

  const removeScheduleItem = (index: number) => {
    setSchedule(schedule.filter((_, i) => i !== index));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        <div className="p-8 pb-0 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-black text-slate-900">{initialData ? 'Edit Course' : 'Add New Course'}</h2>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">
              {initialData ? 'Modify Course Structure' : 'Setup your class details'}
            </p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 text-2xl">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
          
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-black text-indigo-600 uppercase tracking-widest border-b border-indigo-50 pb-2 mb-4">General Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Credits</label>
                <input 
                  type="number" 
                  value={credits}
                  onChange={e => setCredits(parseInt(e.target.value))}
                  className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-100"
                />
              </div>
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
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Target Grade (%)</label>
                <input 
                  type="number" 
                  value={targetGrade}
                  onChange={e => setTargetGrade(parseInt(e.target.value))}
                  className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-100"
                />
              </div>
              <div>
                 <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Term</label>
                 <input 
                  type="text" 
                  value={term}
                  onChange={e => setTerm(e.target.value)}
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
                    className={`w-8 h-8 rounded-full transition-all ${color === c ? 'ring-2 ring-offset-2 ring-slate-300 scale-110' : 'hover:scale-105 opacity-50'}`}
                    style={{ backgroundColor: c, opacity: color === c ? 1 : 0.4 }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Schedule Section */}
          <div className="space-y-4 pt-4">
            <h3 className="text-sm font-black text-indigo-600 uppercase tracking-widest border-b border-indigo-50 pb-2 mb-4 flex items-center gap-2">
              <IconClock /> Class Schedule
            </h3>
            
            {/* List Existing */}
            {schedule.length > 0 && (
              <div className="space-y-2 mb-4">
                {schedule.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-black uppercase bg-white border border-slate-200 px-2 py-1 rounded-lg text-slate-600">{item.day}</span>
                      <span className="text-sm font-bold text-slate-700">{item.startTime} - {item.endTime}</span>
                      {item.location && <span className="text-xs text-slate-400 font-medium border-l border-slate-200 pl-3">{item.location}</span>}
                    </div>
                    <button 
                      type="button" 
                      onClick={() => removeScheduleItem(idx)}
                      className="text-rose-400 hover:text-rose-600 p-1"
                    >
                      <IconTrash />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add New */}
            <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-50 space-y-3">
               <div className="grid grid-cols-3 gap-3">
                  <select 
                    value={schedDay}
                    onChange={(e) => setSchedDay(e.target.value)}
                    className="bg-white border-none rounded-lg px-3 py-2 text-xs font-bold text-slate-600 outline-none"
                  >
                    {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <input 
                    type="time" 
                    value={schedStart}
                    onChange={(e) => setSchedStart(e.target.value)}
                    className="bg-white border-none rounded-lg px-3 py-2 text-xs font-bold text-slate-600 outline-none"
                  />
                  <input 
                    type="time" 
                    value={schedEnd}
                    onChange={(e) => setSchedEnd(e.target.value)}
                    className="bg-white border-none rounded-lg px-3 py-2 text-xs font-bold text-slate-600 outline-none"
                  />
               </div>
               <div className="flex gap-3">
                  <input 
                    type="text" 
                    placeholder="Location (e.g. Room 301)"
                    value={schedLoc}
                    onChange={(e) => setSchedLoc(e.target.value)}
                    className="flex-1 bg-white border-none rounded-lg px-3 py-2 text-xs font-bold text-slate-600 outline-none"
                  />
                  <button 
                    type="button"
                    onClick={addScheduleItem}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-indigo-700"
                  >
                    Add
                  </button>
               </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-50 flex flex-col gap-3">
             <button 
              type="submit"
              className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-100"
            >
              <IconSave /> {initialData ? 'Save Changes' : 'Create Course'}
            </button>
            {!initialData && onSwitchToImport && (
              <button 
                type="button"
                onClick={onSwitchToImport}
                className="w-full bg-white text-indigo-600 border border-indigo-100 py-3.5 rounded-xl font-bold text-sm hover:bg-indigo-50 transition-all flex items-center justify-center gap-2"
              >
                <IconImport /> Import from Syllabus (JSON)
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default CourseFormModal;
