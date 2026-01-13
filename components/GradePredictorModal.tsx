
import React, { useState, useEffect } from 'react';
import { Assignment, Course, AssignmentType } from '../types';
import { IconChart, IconChevronDown, IconChevronUp, IconPlus, IconTrash, IconCheckCircle, IconBook, IconList } from './Icons';
import { TYPE_COLORS } from '../constants';

interface GradePredictorModalProps {
  course: Course;
  assignments: Assignment[];
  onClose: () => void;
}

// Extended type for local simulation
interface SimulatedAssignment extends Assignment {
  isSimulated?: boolean;
}

const GradePredictorModal: React.FC<GradePredictorModalProps> = ({ course, assignments, onClose }) => {
  const [localAssignments, setLocalAssignments] = useState<SimulatedAssignment[]>([]);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const [targetGrade, setTargetGrade] = useState(course.targetGrade);

  useEffect(() => {
    // Deep copy assignments for local simulation
    setLocalAssignments(JSON.parse(JSON.stringify(assignments)));
    
    // Default expand all if few, or collapse if many. Let's expand types with missing grades.
    const initialExpand: Record<string, boolean> = {};
    Object.values(AssignmentType).forEach(t => {
      initialExpand[t] = false;
    });
    setExpandedGroups(initialExpand);
  }, [assignments]);

  const updateSimulatedGrade = (id: string, grade: number | undefined) => {
    setLocalAssignments(prev => prev.map(a => a.id === id ? { ...a, gradeReceived: grade } : a));
  };

  const updateSimulatedWeight = (id: string, weight: number) => {
    setLocalAssignments(prev => prev.map(a => a.id === id ? { ...a, weight: weight } : a));
  };

  const updateSimulatedName = (id: string, name: string) => {
    setLocalAssignments(prev => prev.map(a => a.id === id ? { ...a, name: name } : a));
  };

  const addSimulatedTask = (type: AssignmentType) => {
    const newTask: SimulatedAssignment = {
      id: Math.random().toString(36).substr(2, 9),
      courseId: course.id,
      name: `New ${type}`,
      description: '',
      dueDate: new Date().toISOString(),
      weight: 0,
      gradeReceived: 0, // Default to 0 so it calculates immediately? Or undefined? Let's say undefined to assume "Not done"
      priority: 'Medium' as any,
      status: 'Not Started' as any,
      type: type,
      isSimulated: true
    };
    setLocalAssignments(prev => [...prev, newTask]);
    setExpandedGroups(prev => ({ ...prev, [type]: true })); // Auto expand
  };

  const removeSimulatedTask = (id: string) => {
    setLocalAssignments(prev => prev.filter(a => a.id !== id));
  };

  const toggleGroup = (type: string) => {
    setExpandedGroups(prev => ({ ...prev, [type]: !prev[type] }));
  };

  // Calculation Logic
  const calculateTotals = () => {
    let totalScore = 0;
    let totalWeight = 0;

    localAssignments.forEach(a => {
      const grade = a.gradeReceived || 0;
      // If grade is undefined, we assume 0 for "current status" but strictly speaking 
      // the calculator usually implies "what if I get X".
      // We will treat undefined as 0 for calculation but user sees empty box.
      totalScore += (a.weight * grade / 100);
      totalWeight += a.weight;
    });

    return { totalScore, totalWeight };
  };

  const { totalScore, totalWeight } = calculateTotals();
  const gap = targetGrade - totalScore;
  
  // Group Logic
  const groupedTasks: Record<string, SimulatedAssignment[]> = {};
  // Ensure all types exist for structure
  Object.values(AssignmentType).forEach(t => groupedTasks[t] = []);
  localAssignments.forEach(a => {
    if (!groupedTasks[a.type]) groupedTasks[a.type] = [];
    groupedTasks[a.type].push(a);
  });

  // Render Helper for Group Card
  const renderGroupCard = (type: AssignmentType) => {
    const tasks = groupedTasks[type];
    if (tasks.length === 0) return null; // Hide empty groups? Or show for adding? Let's show only if has tasks or if we want to add.
    // Actually, user might want to add a "Final Exam" if it doesn't exist. 
    // Let's show all types that have tasks, plus a way to add new types? 
    // For simplicity, let's show types that have tasks. If "Final" is missing in syllabus, user can add it via a general "Add Component" maybe?
    // Let's iterate all types.
    
    const groupWeight = tasks.reduce((acc, t) => acc + t.weight, 0);
    const groupScore = tasks.reduce((acc, t) => acc + (t.weight * (t.gradeReceived || 0) / 100), 0);
    // Weighted Average for display: (Score / Weight) * 100
    const groupAvg = groupWeight > 0 ? (groupScore / groupWeight) * 100 : 0;
    
    const isExpanded = expandedGroups[type];

    // Colors
    const typeColorClass = TYPE_COLORS[type] || 'bg-slate-50 text-slate-700';
    // Parse bg color for icon container (simplified approach)
    const bgClass = typeColorClass.split(' ')[0]; 
    const textClass = typeColorClass.split(' ')[1];

    return (
      <div key={type} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden transition-all">
        {/* Header / Summary Row */}
        <div 
          onClick={() => toggleGroup(type)}
          className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/50 transition-colors"
        >
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${bgClass} ${textClass}`}>
              <IconList /> 
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg">{type}</h3>
              <p className="text-slate-400 text-xs font-medium">{tasks.length} components</p>
            </div>
          </div>

          <div className="flex items-center gap-4 md:gap-8 ml-16 md:ml-0">
             <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Grade Secured</span>
                <div className="bg-white border border-slate-200 rounded-lg px-3 py-2 min-w-[100px] shadow-sm">
                   <span className="font-bold text-slate-900">{groupScore.toFixed(1)} pts</span>
                   <span className="text-xs text-slate-400 ml-1">({Math.round(groupAvg)}%)</span>
                </div>
             </div>
             <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Weightage</span>
                <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 min-w-[120px] text-slate-500 font-medium text-sm">
                   {groupWeight}% of Total
                </div>
             </div>
             <div className={`text-slate-300 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
               <IconChevronDown />
             </div>
          </div>
        </div>

        {/* Expanded Details */}
        {isExpanded && (
          <div className="border-t border-slate-100 bg-slate-50/30 p-6 space-y-3 animate-in slide-in-from-top-2 duration-200">
             {/* Header for Table */}
             <div className="hidden md:flex px-2 pb-2">
                <div className="flex-[3] text-[10px] font-bold uppercase text-slate-400">Assignment / Exam</div>
                <div className="flex-[1] text-[10px] font-bold uppercase text-slate-400">Grade (%)</div>
                <div className="flex-[1] text-[10px] font-bold uppercase text-slate-400 text-right">Weight (%)</div>
             </div>

             {tasks.map(task => (
               <div key={task.id} className="flex flex-col md:flex-row gap-2 items-center">
                  <div className="flex-[3] w-full">
                     <input 
                       disabled={!task.isSimulated}
                       value={task.name}
                       onChange={(e) => updateSimulatedName(task.id, e.target.value)}
                       className={`w-full p-3 rounded-lg border text-sm font-medium focus:ring-2 focus:ring-indigo-100 outline-none ${task.isSimulated ? 'bg-white border-indigo-200 text-indigo-700' : 'bg-slate-50 border-slate-200 text-slate-700'}`}
                     />
                     {task.isSimulated && <p className="text-[9px] text-indigo-400 mt-1 ml-1">*Simulated Task</p>}
                  </div>
                  <div className="flex-[1] w-full relative">
                     <input 
                       type="number"
                       min="0" max="100"
                       value={task.gradeReceived ?? ''}
                       onChange={(e) => updateSimulatedGrade(task.id, e.target.value === '' ? undefined : parseFloat(e.target.value))}
                       placeholder="-"
                       className="w-full p-3 rounded-lg border border-slate-200 bg-white text-sm font-bold text-slate-900 focus:ring-2 focus:ring-indigo-100 outline-none"
                     />
                  </div>
                  <div className="flex-[1] w-full flex items-center gap-2">
                     <div className="relative w-full">
                        <input 
                           type="number"
                           value={task.weight}
                           onChange={(e) => updateSimulatedWeight(task.id, parseFloat(e.target.value) || 0)}
                           className="w-full p-3 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-600 focus:ring-2 focus:ring-indigo-100 outline-none text-right pr-8"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">%</span>
                     </div>
                     {task.isSimulated && (
                       <button onClick={() => removeSimulatedTask(task.id)} className="text-rose-400 hover:text-rose-600 p-2">
                         <IconTrash />
                       </button>
                     )}
                  </div>
               </div>
             ))}

             <button 
               onClick={() => addSimulatedTask(type)}
               className="mt-2 text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 py-2 px-1"
             >
               <IconPlus /> Add {type} Component
             </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-50 w-full max-w-5xl h-[85vh] rounded-[2rem] shadow-2xl overflow-hidden flex flex-col border border-slate-200">
        
        {/* Header */}
        <div className="bg-white p-6 border-b border-slate-200 flex justify-between items-center z-10 shadow-sm">
           <div className="flex items-center gap-4">
             <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
               <IconChart />
             </div>
             <div>
               <h2 className="text-2xl font-black text-slate-900">Grade Calculator</h2>
               <p className="text-slate-500 text-xs font-medium">Scenario Planner for <span className="text-indigo-600 font-bold">{course.code}</span></p>
             </div>
           </div>
           <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 text-xl transition-colors">&times;</button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
           {/* Render Cards for each type that has tasks */}
           {Object.values(AssignmentType).map(type => {
             // Only render if type exists in local assignments OR if we force it? 
             // Let's force render standard types if they have items, or if user added them.
             const hasTasks = localAssignments.some(a => a.type === type);
             if (hasTasks) return renderGroupCard(type);
             return null;
           })}
           
           {/* "Add New Group" Button if you want to support adding types that don't exist yet? */}
           {/* For now we just check existing types. If a type isn't used, maybe show a small list to add? */}
           <div className="flex gap-2 flex-wrap pt-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wide mr-2 py-2">Add Category:</span>
              {Object.values(AssignmentType).filter(t => !localAssignments.some(a => a.type === t)).map(type => (
                <button 
                  key={type}
                  onClick={() => addSimulatedTask(type)}
                  className="px-3 py-1.5 rounded-lg border border-dashed border-slate-300 text-slate-500 text-xs font-bold hover:border-indigo-400 hover:text-indigo-600 transition-colors"
                >
                  + {type}
                </button>
              ))}
           </div>
        </div>

        {/* Footer / Results */}
        <div className="bg-white border-t border-slate-200 p-6 md:p-8 z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
           <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              
              <div className="flex-1 w-full md:w-auto">
                 <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Target Goal</label>
                 <div className="flex items-center gap-4">
                    <input 
                      type="range" min="50" max="100" 
                      value={targetGrade} 
                      onChange={(e) => setTargetGrade(parseInt(e.target.value))}
                      className="flex-1 accent-indigo-600 h-2 bg-slate-100 rounded-lg cursor-pointer"
                    />
                    <span className="text-xl font-black text-indigo-600 min-w-[3ch]">{targetGrade}%</span>
                 </div>
              </div>

              <div className="flex gap-8 items-center">
                 <div className="text-right">
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Total Simulated</p>
                    <p className="text-4xl font-black text-slate-900">{totalScore.toFixed(1)}%</p>
                 </div>
                 
                 <div className={`px-6 py-3 rounded-2xl border-2 ${gap <= 0 ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-rose-50 border-rose-100 text-rose-600'}`}>
                    {gap <= 0 ? (
                      <div className="flex items-center gap-2">
                        <IconCheckCircle />
                        <div>
                           <p className="text-[10px] font-black uppercase tracking-widest">Target Met</p>
                           <p className="text-sm font-bold">+{Math.abs(gap).toFixed(1)}% surplus</p>
                        </div>
                      </div>
                    ) : (
                      <div>
                         <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Short By</p>
                         <p className="text-xl font-black">{gap.toFixed(1)}%</p>
                      </div>
                    )}
                 </div>
              </div>

           </div>
           
           <div className="mt-4 text-center">
             <p className="text-[10px] text-slate-400">
               * This calculator uses a local simulation. Changes here do not affect your actual dashboard data unless you manually update tasks there.
             </p>
           </div>
        </div>

      </div>
    </div>
  );
};

export default GradePredictorModal;
