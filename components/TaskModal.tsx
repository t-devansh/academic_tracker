
import React, { useState, useEffect } from 'react';
import { Assignment, Course, AssignmentStatus, AssignmentPriority, AssignmentType } from '../types';
import { IconClock, IconPlus, IconTrash, IconCalendar, IconCheck, IconSave, IconChevronDown } from './Icons';

interface TaskModalProps {
  task: Assignment;
  course?: Course;
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<Assignment>) => void;
  onDelete: (id: string) => void;
}

const TaskModal: React.FC<TaskModalProps> = ({ task, course, onClose, onUpdate, onDelete }) => {
  const [localTask, setLocalTask] = useState<Assignment>(task);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [newLinkTitle, setNewLinkTitle] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');

  useEffect(() => {
    setLocalTask(task);
  }, [task]);

  const handleChange = (field: keyof Assignment, value: any) => {
    const updated = { ...localTask, [field]: value };
    setLocalTask(updated);
    onUpdate(task.id, { [field]: value });
  };

  const handleAddLink = () => {
    if (!newLinkTitle || !newLinkUrl) return;
    const links = [...(localTask.links || []), { title: newLinkTitle, url: newLinkUrl }];
    handleChange('links', links);
    setNewLinkTitle('');
    setNewLinkUrl('');
  };

  const handleRemoveLink = (index: number) => {
    const links = (localTask.links || []).filter((_, i) => i !== index);
    handleChange('links', links);
  };

  const isNewTask = !task.name;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="relative p-8 pb-4">
          <button 
            onClick={onClose}
            className="absolute top-8 right-8 w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 transition-colors z-10"
          >
            <span className="text-2xl font-bold">&times;</span>
          </button>
          
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="bg-indigo-50 text-indigo-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100">
              {course?.code || 'Draft'}
            </span>
            <div className="relative">
              <select 
                value={localTask.type}
                onChange={(e) => handleChange('type', e.target.value as AssignmentType)}
                className="appearance-none bg-slate-100 text-slate-600 border-none rounded-full pl-4 pr-8 py-1.5 text-[10px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-indigo-100 cursor-pointer hover:bg-slate-200 transition-colors"
              >
                {Object.values(AssignmentType).map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <IconChevronDown />
              </div>
            </div>
          </div>

          <input 
            type="text"
            value={localTask.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className="text-4xl font-black text-slate-900 w-full bg-transparent border-none p-0 focus:ring-0 outline-none placeholder-slate-200"
            placeholder="Name your task..."
          />
        </div>

        {/* Modal Body */}
        <div className="p-8 space-y-8 overflow-y-auto flex-1">
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Due Date</label>
              <input 
                type="datetime-local"
                value={localTask.dueDate.slice(0, 16)}
                onChange={(e) => handleChange('dueDate', new Date(e.target.value).toISOString())}
                className="w-full bg-slate-50 border-none rounded-xl p-3 text-xs font-bold text-slate-700 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Weight (%)</label>
              <input 
                type="number"
                value={localTask.weight}
                onChange={(e) => handleChange('weight', parseFloat(e.target.value))}
                className="w-full bg-slate-50 border-none rounded-xl p-3 text-xs font-bold text-slate-700 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Priority</label>
              <div className="relative">
                <select 
                  value={localTask.priority}
                  onChange={(e) => handleChange('priority', e.target.value as AssignmentPriority)}
                  className="w-full appearance-none bg-slate-50 border-none rounded-xl p-3 pr-8 text-xs font-bold text-slate-700 focus:ring-2 focus:ring-indigo-100 cursor-pointer"
                >
                  {Object.values(AssignmentPriority).map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <IconChevronDown />
                </div>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</label>
               <div className="relative">
                <select 
                  value={localTask.status}
                  onChange={(e) => handleChange('status', e.target.value as AssignmentStatus)}
                  className="w-full appearance-none bg-slate-50 border-none rounded-xl p-3 pr-8 text-xs font-bold text-slate-700 focus:ring-2 focus:ring-indigo-100 cursor-pointer"
                >
                  {Object.values(AssignmentStatus).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <IconChevronDown />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Grade Received (%)</label>
            <input 
              type="number"
              value={localTask.gradeReceived ?? ''}
              onChange={(e) => handleChange('gradeReceived', e.target.value ? parseFloat(e.target.value) : undefined)}
              placeholder="Enter score..."
              className="w-full bg-slate-50 border-none rounded-xl p-3 text-xs font-bold text-slate-700 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          {/* Notes Section - Darker box */}
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Notes & Reminders</label>
            <textarea
              value={localTask.notes || ''}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Start typing your thoughts..."
              className="w-full h-40 bg-slate-100 border-2 border-slate-200 rounded-[2rem] p-6 text-sm font-medium text-slate-700 shadow-inner focus:ring-4 focus:ring-indigo-50 transition-all resize-none outline-none placeholder-slate-400"
            />
          </div>

          {/* Links Section - Darkened as requested */}
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Resources</label>
            <div className="grid gap-3 mb-4">
              {localTask.links?.map((link, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-slate-100 border-2 border-slate-200 rounded-2xl shadow-inner group">
                  <div className="flex flex-col truncate">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-0.5">Link</span>
                    <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-indigo-600 hover:underline truncate">
                      {link.title}
                    </a>
                  </div>
                  <button 
                    onClick={() => handleRemoveLink(idx)}
                    className="text-rose-400 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity p-2"
                  >
                    <IconTrash />
                  </button>
                </div>
              ))}
            </div>
            
            <div className="flex gap-2 bg-slate-100 p-3 rounded-2xl border-2 border-slate-200 shadow-inner">
              <input 
                type="text" 
                placeholder="Title"
                value={newLinkTitle}
                onChange={(e) => setNewLinkTitle(e.target.value)}
                className="flex-[2] bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-100"
              />
              <input 
                type="text" 
                placeholder="https://..."
                value={newLinkUrl}
                onChange={(e) => setNewLinkUrl(e.target.value)}
                className="flex-[3] bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-100"
              />
              <button 
                onClick={handleAddLink}
                className="bg-slate-900 text-white p-2.5 rounded-xl hover:bg-black transition-colors"
              >
                <IconPlus />
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-8 bg-slate-50/50 flex justify-between items-center border-t border-slate-100">
          {!showConfirmDelete ? (
            <button 
              onClick={() => setShowConfirmDelete(true)}
              className="flex items-center gap-2 text-rose-500 text-[10px] font-black uppercase tracking-widest hover:bg-rose-50 px-5 py-2.5 rounded-xl transition-all"
            >
              <IconTrash /> Trash Task
            </button>
          ) : (
            <div className="flex items-center gap-4 animate-in slide-in-from-left-2 duration-200">
              <span className="text-[10px] font-black text-rose-600 uppercase">Are you sure?</span>
              <button onClick={() => { onDelete(task.id); onClose(); }} className="bg-rose-600 text-white px-4 py-2 rounded-lg text-[10px] font-black uppercase">Yes, Trash it</button>
              <button onClick={() => setShowConfirmDelete(false)} className="text-slate-400 text-[10px] font-black uppercase">Cancel</button>
            </div>
          )}
          
          <div className="flex gap-3">
            {isNewTask ? (
              <button 
                onClick={onClose}
                className="flex items-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-[1.5rem] text-xs font-black uppercase tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-95"
              >
                <IconSave /> Save Task
              </button>
            ) : (
              <button 
                onClick={() => { handleChange('status', AssignmentStatus.SUBMITTED); onClose(); }}
                className="flex items-center gap-2 bg-emerald-500 text-white px-8 py-4 rounded-[1.5rem] text-xs font-black uppercase tracking-widest hover:bg-emerald-600 shadow-xl shadow-emerald-100 transition-all active:scale-95"
              >
                <IconCheck /> Mark Complete
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskModal;
