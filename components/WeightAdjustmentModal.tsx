
import React, { useState, useEffect } from 'react';
import { Assignment, Course, AssignmentType, AssignmentPriority, AssignmentStatus } from '../types';
import { IconScale, IconChevronDown, IconPlus, IconTrash, IconSave } from './Icons';
import { TYPE_COLORS } from '../constants';

interface WeightAdjustmentModalProps {
  course: Course;
  assignments: Assignment[];
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<Assignment>) => void;
  onAdd: (assignment: Omit<Assignment, 'id'>) => void;
  onDelete: (id: string) => void;
}

const WeightAdjustmentModal: React.FC<WeightAdjustmentModalProps> = ({ 
  course, 
  assignments, 
  onClose, 
  onUpdate,
  onAdd,
  onDelete 
}) => {
  // We keep a local copy to allow bulk-like feel, but we will commit changes on Save.
  // To keep it simple given the props provided, we will track "pending deletions" and "pending updates"
  // but for the best UX, we will just use local state to track edits and then fire multiple calls on save.
  const [localAssignments, setLocalAssignments] = useState<Assignment[]>([]);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Deep copy assignments
    setLocalAssignments(JSON.parse(JSON.stringify(assignments)));
    
    // Default expand
    const initialExpand: Record<string, boolean> = {};
    Object.values(AssignmentType).forEach(t => {
      initialExpand[t] = true;
    });
    setExpandedGroups(initialExpand);
  }, [assignments]);

  const handleWeightChange = (id: string, weight: number) => {
    setLocalAssignments(prev => prev.map(a => a.id === id ? { ...a, weight } : a));
  };

  const handleNameChange = (id: string, name: string) => {
    setLocalAssignments(prev => prev.map(a => a.id === id ? { ...a, name } : a));
  };

  const handleDelete = (id: string) => {
    setLocalAssignments(prev => prev.filter(a => a.id !== id));
  };

  const handleAdd = (type: AssignmentType) => {
    // Create a temporary object. We will give it a temp ID for local state.
    const newTask: Assignment = {
      id: `temp-${Math.random().toString(36).substr(2, 9)}`,
      courseId: course.id,
      name: `New ${type}`,
      description: '',
      dueDate: new Date().toISOString(),
      weight: 0,
      priority: AssignmentPriority.MEDIUM,
      status: AssignmentStatus.NOT_STARTED,
      type: type
    };
    setLocalAssignments(prev => [...prev, newTask]);
  };

  const handleSave = () => {
    // 1. Identify Deletions: IDs in 'assignments' (original) that are NOT in 'localAssignments'
    const originalIds = assignments.map(a => a.id);
    const localIds = new Set(localAssignments.map(a => a.id));
    
    const toDelete = originalIds.filter(id => !localIds.has(id));
    
    // 2. Identify Updates: Items in local that have real IDs (not temp) and changed
    const toUpdate = localAssignments.filter(local => {
      if (local.id.startsWith('temp-')) return false; // is new
      const original = assignments.find(a => a.id === local.id);
      if (!original) return false;
      return original.weight !== local.weight || original.name !== local.name;
    });

    // 3. Identify Creations: Items with temp IDs
    const toCreate = localAssignments.filter(local => local.id.startsWith('temp-'));

    // Execute Actions
    toDelete.forEach(id => onDelete(id));
    toUpdate.forEach(item => onUpdate(item.id, { name: item.name, weight: item.weight }));
    toCreate.forEach(item => {
      // Remove temp id before adding
      const { id, ...data } = item;
      onAdd(data);
    });

    onClose();
  };

  const toggleGroup = (type: string) => {
    setExpandedGroups(prev => ({ ...prev, [type]: !prev[type] }));
  };

  // Grouping
  const groupedTasks: Record<string, Assignment[]> = {};
  Object.values(AssignmentType).forEach(t => groupedTasks[t] = []);
  localAssignments.forEach(a => {
    if (!groupedTasks[a.type]) groupedTasks[a.type] = [];
    groupedTasks[a.type].push(a);
  });

  const totalWeight = localAssignments.reduce((sum, a) => sum + a.weight, 0);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-white z-10">
           <div className="flex items-center gap-4">
             <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
               <IconScale />
             </div>
             <div>
               <h2 className="text-2xl font-black text-slate-900">Adjust Weightages</h2>
               <p className="text-slate-500 text-xs font-bold uppercase tracking-wide">Modify grading structure for <span className="text-indigo-600">{course.code}</span></p>
             </div>
           </div>
           <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 text-2xl transition-colors">&times;</button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50/50">
          
          {Object.values(AssignmentType).map(type => {
            const tasks = groupedTasks[type];
            // Only show if tasks exist or keep consistent? Let's show all so user can add.
            const groupWeight = tasks.reduce((sum, t) => sum + t.weight, 0);
            const isExpanded = expandedGroups[type];
            const colorClass = TYPE_COLORS[type];

            return (
              <div key={type} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div 
                  onClick={() => toggleGroup(type)}
                  className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                     <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${colorClass}`}>
                        {type}
                     </span>
                     <span className="text-xs font-bold text-slate-400">
                        {tasks.length} items
                     </span>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="text-xs font-bold text-slate-700">{groupWeight}% Total</span>
                    <div className={`text-slate-300 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                       <IconChevronDown />
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-slate-100 p-5 space-y-3 bg-white">
                    {tasks.map(task => (
                      <div key={task.id} className="flex gap-3 items-center animate-in slide-in-from-top-1">
                        <input 
                          type="text"
                          value={task.name}
                          onChange={(e) => handleNameChange(task.id, e.target.value)}
                          className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-100"
                          placeholder="Task Name"
                        />
                        <div className="relative w-24 shrink-0">
                           <input 
                             type="number"
                             min="0"
                             value={task.weight}
                             onChange={(e) => handleWeightChange(task.id, parseFloat(e.target.value) || 0)}
                             className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-100 text-center"
                           />
                           <span className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none">%</span>
                        </div>
                        <button 
                          onClick={() => handleDelete(task.id)}
                          className="w-10 h-10 flex items-center justify-center text-rose-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                        >
                          <IconTrash />
                        </button>
                      </div>
                    ))}
                    <button 
                      onClick={() => handleAdd(type)}
                      className="mt-2 text-xs font-black uppercase tracking-widest text-indigo-500 hover:text-indigo-700 flex items-center gap-2 py-2 px-1"
                    >
                      <IconPlus /> Add {type}
                    </button>
                  </div>
                )}
              </div>
            );
          })}

        </div>

        {/* Footer */}
        <div className="p-8 border-t border-slate-100 bg-white flex justify-between items-center z-10">
           <div className="flex items-center gap-3">
              <span className="text-xs font-black uppercase text-slate-400 tracking-widest">Total Weight:</span>
              <span className={`text-3xl font-black ${totalWeight === 100 ? 'text-emerald-500' : 'text-rose-500'}`}>
                {totalWeight}%
              </span>
              {totalWeight !== 100 && (
                <span className="text-[10px] font-bold text-rose-400 bg-rose-50 px-2 py-1 rounded-lg">
                  Should be 100%
                </span>
              )}
           </div>

           <button 
             onClick={handleSave}
             className="bg-indigo-600 text-white px-8 py-4 rounded-xl font-black uppercase tracking-widest text-xs shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:scale-105 transition-all flex items-center gap-2"
           >
             <IconSave /> Save Changes
           </button>
        </div>

      </div>
    </div>
  );
};

export default WeightAdjustmentModal;
