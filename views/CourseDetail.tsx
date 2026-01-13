
import React, { useState } from 'react';
import { Course, Assignment, AssignmentStatus, AssignmentPriority, AssignmentType } from '../types';
import { STATUS_COLORS, PRIORITY_COLORS, TYPE_COLORS } from '../constants';
import { getTaskDisplayInfo } from '../utils';
import { IconClock, IconPlus, IconList, IconBook, IconTrash, IconChart, IconCircle, IconCheckCircle, IconSave, IconChevronDown, IconChevronUp, IconEdit, IconScale } from '../components/Icons';
import GradePredictorModal from '../components/GradePredictorModal';
import CourseFormModal from '../components/AddCourseModal';
import WeightAdjustmentModal from '../components/WeightAdjustmentModal';

interface CourseDetailProps {
  course: Course;
  assignments: Assignment[];
  onUpdateAssignment: (id: string, updates: Partial<Assignment>) => void;
  onAddAssignment: (assignment: Omit<Assignment, 'id'>) => void;
  onUpdateCourse: (id: string, updates: Partial<Course>) => void;
  onDeleteCourse: (id: string) => void;
  onOpenTask: (task: Assignment) => void;
}

// NOTE: Changed onAddAssignment signature in App.tsx to support object passing? 
// Actually App.tsx usually passes (courseId: string). 
// The WeightAdjustmentModal needs to add assignments fully defined.
// We need to update the prop type here or handle the difference.
// Let's assume App.tsx passes `addAssignment` from store which expects `Omit<Assignment, 'id'>`.
// But CourseDetail currently receives `onAddAssignment: (courseId: string) => void`.
// I will need to update CourseDetail's interface to accept the full store addAssignment function or update the wrapper.
// To keep it clean without changing App.tsx signature blindly, I will check what App passes.
// App passes: `onAddAssignment={handleAddAssignmentInCourse}` which creates a blank one.
// I need access to the raw store `addAssignment`.
// Solution: Update App.tsx to pass the raw store function as well, or update the existing prop.
// For now, I will assume I need to fix App.tsx integration in the next step.
// Wait, I can't change App.tsx in this file block. 
// I will change the interface here and expect App.tsx to be updated in the XML.

const CourseDetail: React.FC<CourseDetailProps & { onAddAssignmentRaw: (a: Omit<Assignment, 'id'>) => void, onDeleteAssignment: (id: string) => void }> = ({ 
  course, 
  assignments, 
  onUpdateAssignment, 
  onAddAssignment, // The one that takes courseId (quick add)
  onAddAssignmentRaw, // The one that takes full object (from store)
  onDeleteAssignment,
  onUpdateCourse, 
  onDeleteCourse, 
  onOpenTask 
}) => {
  const [activeTab, setActiveTab] = useState<'assignments' | 'gradebook'>('assignments');
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [expandedType, setExpandedType] = useState<AssignmentType | null>(null);
  const [showCalculator, setShowCalculator] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isWeightModalOpen, setIsWeightModalOpen] = useState(false);

  const completed = assignments.filter(a => a.status === AssignmentStatus.SUBMITTED && a.gradeReceived !== undefined);
  const pending = assignments.filter(a => a.status !== AssignmentStatus.SUBMITTED);
  
  const weightCompleted = completed.reduce((acc, a) => acc + a.weight, 0);
  const currentTotalPoints = completed.reduce((acc, a) => acc + (a.weight * (a.gradeReceived! / 100)), 0);
  const currentGrade = weightCompleted > 0 ? (currentTotalPoints / weightCompleted) * 100 : 0;
  
  const typeBreakdown = Object.values(AssignmentType).map(type => {
    const typeAssignments = assignments.filter(a => a.type === type);
    const weight = typeAssignments.reduce((acc, a) => acc + a.weight, 0);
    const typeCompleted = typeAssignments.filter(a => a.status === AssignmentStatus.SUBMITTED && a.gradeReceived !== undefined);
    const completedWeight = typeCompleted.reduce((acc, a) => acc + a.weight, 0);
    const avg = completedWeight > 0 
      ? typeCompleted.reduce((acc, a) => acc + (a.weight * a.gradeReceived! / 100), 0) / completedWeight * 100 
      : 0;

    return { type, weight, avg, assignments: typeAssignments };
  }).filter(t => t.weight > 0);

  // Donut Chart Logic
  const createDonutSegments = () => {
    let cumulativePercent = 0;
    return typeBreakdown.map((item, index) => {
      const percent = item.weight; 
      const startAngle = (cumulativePercent / 100) * 360;
      const endAngle = ((cumulativePercent + percent) / 100) * 360;
      cumulativePercent += percent;
      
      const x1 = 50 + 40 * Math.cos(Math.PI * startAngle / 180);
      const y1 = 50 + 40 * Math.sin(Math.PI * startAngle / 180);
      const x2 = 50 + 40 * Math.cos(Math.PI * endAngle / 180);
      const y2 = 50 + 40 * Math.sin(Math.PI * endAngle / 180);
      
      const largeArcFlag = percent > 50 ? 1 : 0;
      
      const pathData = [
        `M 50 50`,
        `L ${x1} ${y1}`,
        `A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2}`,
        `Z`
      ].join(' ');

      const colors = ['#6366f1', '#06b6d4', '#8b5cf6', '#f97316', '#f43f5e', '#64748b'];
      
      return <path d={pathData} fill={colors[index % colors.length]} stroke="white" strokeWidth="2" key={item.type} />;
    });
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-right duration-300">
      {/* Course Header */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden flex relative">
        <div className="w-2 shrink-0" style={{ backgroundColor: course.color }} />
        <div className="flex-1 p-8 md:p-12">
          <div className="flex justify-between items-start mb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h1 className="text-5xl font-black text-slate-900 tracking-tight">{course.code}</h1>
                <span className="bg-slate-100 text-slate-500 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border border-slate-200">{course.term}</span>
              </div>
              <p className="text-xl text-slate-400 font-medium">{course.name}</p>
            </div>
            <div className="flex gap-2">
               <button 
                onClick={() => setIsWeightModalOpen(true)}
                className="text-indigo-400 hover:text-indigo-600 p-3 hover:bg-indigo-50 rounded-2xl transition-all"
                title="Adjust Weightages"
              >
                <IconScale />
              </button>
              <button 
                onClick={() => setIsEditModalOpen(true)}
                className="text-indigo-400 hover:text-indigo-600 p-3 hover:bg-indigo-50 rounded-2xl transition-all"
                title="Edit Course Details"
              >
                <IconEdit />
              </button>
              <button 
                onClick={() => { if(confirm("Are you sure? This will move the course and its tasks to the Trash.")) onDeleteCourse(course.id); }}
                className="text-rose-400 hover:text-rose-600 p-3 hover:bg-rose-50 rounded-2xl transition-all"
                title="Delete Course"
              >
                <IconTrash />
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 pt-10 border-t border-slate-50 mt-10">
            <div className="group">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 group-hover:text-indigo-500 transition-colors">Current Average</p>
              <p className="text-4xl font-black text-slate-900">{weightCompleted > 0 ? `${Math.round(currentGrade)}%` : '--'}</p>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 text-indigo-500 font-bold">Points Logged</p>
              <p className="text-4xl font-black text-indigo-600">{currentTotalPoints.toFixed(1)}</p>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Tasks</p>
              <p className="text-4xl font-black text-slate-900">{assignments.length}</p>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 text-orange-500">Pending</p>
              <p className="text-4xl font-black text-orange-500">{pending.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-3 p-2 bg-white border border-slate-100 shadow-sm rounded-3xl w-fit">
        <button onClick={() => setActiveTab('assignments')} className={`px-8 py-3 rounded-2xl text-sm font-black uppercase tracking-widest transition-all ${activeTab === 'assignments' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-400 hover:text-slate-600'}`}>
          Assignments
        </button>
        <button onClick={() => setActiveTab('gradebook')} className={`px-8 py-3 rounded-2xl text-sm font-black uppercase tracking-widest transition-all ${activeTab === 'gradebook' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-400 hover:text-slate-600'}`}>
          Gradebook
        </button>
      </div>

      {activeTab === 'assignments' ? (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              {(['all', 'pending', 'completed'] as const).map(t => (
                <button key={t} onClick={() => setFilter(t)} className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === t ? 'bg-slate-900 text-white' : 'bg-white border border-slate-100 text-slate-400 hover:border-slate-300'}`}>
                  {t}
                </button>
              ))}
            </div>
            <button onClick={() => onAddAssignment(course.id)} className="bg-slate-900 text-white px-8 py-3 rounded-[1.5rem] font-black uppercase tracking-widest text-xs shadow-xl shadow-slate-200 hover:bg-black transition-all flex items-center gap-2">
              <IconPlus /> Add Task
            </button>
          </div>

          <div className="grid gap-3">
            {assignments.filter(a => {
              if (filter === 'pending') return a.status !== AssignmentStatus.SUBMITTED;
              if (filter === 'completed') return a.status === AssignmentStatus.SUBMITTED;
              return true;
            }).map(assignment => {
               const displayInfo = getTaskDisplayInfo(assignment);
               const isExam = [AssignmentType.MIDTERM, AssignmentType.FINAL, AssignmentType.QUIZ].includes(assignment.type);
               
               return (
                <div 
                  key={assignment.id} 
                  onClick={() => onOpenTask(assignment)} 
                  className={`group ${isExam ? 'bg-rose-50 border-rose-100' : 'bg-white border-slate-50'} p-6 rounded-[2rem] border shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-6 cursor-pointer`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${TYPE_COLORS[assignment.type]}`}>{assignment.type}</span>
                      <span className="text-indigo-500 font-black text-[10px] uppercase">{assignment.weight}% Weight</span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">{assignment.name || 'Untitled Task'}</h3>
                  </div>

                  <div className="flex items-center gap-8" onClick={(e) => e.stopPropagation()}>
                    {/* Quick Status Dropdown */}
                    <div className="flex flex-col items-end min-w-[120px]">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</span>
                      <div className="relative">
                        <select 
                          value={assignment.status}
                          onChange={(e) => onUpdateAssignment(assignment.id, { status: e.target.value as AssignmentStatus })}
                          className={`appearance-none rounded-xl px-4 py-1.5 text-[10px] font-black uppercase tracking-widest border cursor-pointer outline-none transition-all ${displayInfo.color}`}
                        >
                          {/* We map the actual enum, but the color is determined by the helper including "Available" logic for the BG */}
                          {Object.values(AssignmentStatus).map(s => <option key={s} value={s}>{s === AssignmentStatus.NOT_STARTED && displayInfo.isAvailableState ? 'Available' : s}</option>)}
                        </select>
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
                           <IconChevronDown />
                        </div>
                      </div>
                      {/* Show "Available" label if applicable under the dropdown if not captured by select text logic */}
                      {displayInfo.isAvailableState && assignment.status === AssignmentStatus.NOT_STARTED && (
                         <span className="text-[9px] font-bold text-slate-400 mt-1">Open to Start</span>
                      )}
                    </div>

                    {/* Due Date Display (Added) */}
                    <div className="hidden md:flex flex-col items-end mr-4">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Due Date</span>
                        <span className="text-sm font-bold text-slate-600">{new Date(assignment.dueDate).toLocaleDateString()}</span>
                    </div>

                    <div className="flex flex-col items-end">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Score (%)</span>
                      <input 
                        type="number"
                        value={assignment.gradeReceived ?? ''}
                        onChange={(e) => onUpdateAssignment(assignment.id, { gradeReceived: e.target.value ? parseFloat(e.target.value) : undefined })}
                        placeholder="--"
                        className="w-16 text-right text-2xl font-black bg-slate-50 border-none focus:ring-2 focus:ring-indigo-100 rounded-lg p-1"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20">
          <div className="lg:col-span-2 space-y-8">
            
            {/* 1. Performance Breakdown (Accordion) - Removed 3 dots */}
            <div className="bg-white p-10 rounded-[3rem] border border-slate-50 shadow-sm space-y-6">
              <div className="flex justify-between items-center">
                 <h3 className="text-2xl font-black text-slate-900">Performance Breakdown</h3>
              </div>

              <div className="divide-y divide-slate-100">
                {typeBreakdown.map((item) => (
                  <div key={item.type} className="py-4">
                    <button 
                      onClick={() => setExpandedType(expandedType === item.type ? null : item.type as AssignmentType)}
                      className="w-full flex items-center justify-between hover:bg-slate-50 p-2 rounded-xl transition-colors group"
                    >
                      <div className="flex flex-col items-start">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{item.type}</span>
                        <span className="text-xl font-bold text-slate-800">{Math.round(item.avg)}% Avg</span>
                      </div>
                      <div className="flex items-center gap-8">
                        <div className="text-right">
                          <span className="block text-[10px] font-black uppercase text-slate-400">Weight</span>
                          <span className="text-sm font-bold text-indigo-600">{item.weight}%</span>
                        </div>
                        <div className={`text-slate-300 transition-transform ${expandedType === item.type ? 'rotate-180' : ''}`}>
                          <IconChevronDown />
                        </div>
                      </div>
                    </button>
                    
                    {expandedType === item.type && (
                      <div className="mt-4 pl-4 space-y-2 border-l-2 border-slate-100 animate-in slide-in-from-top-2 duration-200">
                        {item.assignments.map(a => (
                          <div key={a.id} className="flex justify-between items-center py-2">
                            <span className="text-sm font-medium text-slate-600 truncate">{a.name}</span>
                            <div className="flex items-center gap-4">
                              <span className="text-xs text-slate-400">{a.weight}% wgt</span>
                              <span className={`text-sm font-bold ${a.gradeReceived !== undefined ? 'text-slate-800' : 'text-slate-300'}`}>
                                {a.gradeReceived !== undefined ? `${a.gradeReceived}%` : '--'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Calculator & Charts */}
          <div className="space-y-6">
            
             {/* 2. Donut Charts (Visual Summary) */}
             <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-50 flex flex-col items-center justify-center">
                 <h4 className="text-[10px] font-black uppercase text-slate-400 mb-6 tracking-widest w-full text-left">Weight Distribution</h4>
                 <div className="w-48 h-48 relative">
                    <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                       {createDonutSegments()}
                       <circle cx="50" cy="50" r="25" fill="white" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                       <span className="text-3xl font-black text-slate-900">{assignments.length}</span>
                       <span className="text-[9px] font-bold text-slate-400 uppercase">Tasks</span>
                    </div>
                 </div>
                 <div className="flex flex-wrap gap-2 justify-center mt-6">
                    {typeBreakdown.map((t, i) => (
                       <div key={t.type} className="flex items-center gap-1">
                          <div className={`w-2 h-2 rounded-full`} style={{ backgroundColor: ['#6366f1', '#06b6d4', '#8b5cf6', '#f97316', '#f43f5e'][i % 5] }}></div>
                          <span className="text-[9px] font-bold text-slate-500 uppercase">{t.type}</span>
                       </div>
                    ))}
                 </div>
             </div>

            {/* 3. Grade Calculator Button */}
            <button 
               onClick={() => setShowCalculator(true)}
               className="w-full bg-slate-900 p-8 rounded-[2.5rem] shadow-xl text-white hover:bg-black transition-all group flex flex-col items-center justify-center gap-4 border border-slate-800"
            >
              <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white group-hover:scale-110 transition-transform shadow-lg shadow-indigo-900/50">
                 <IconChart />
              </div>
              <div className="text-center">
                 <h3 className="text-lg font-bold">Grade Calculator</h3>
                 <p className="text-[10px] text-indigo-300 font-medium">Scenario Planner & Predictor</p>
              </div>
            </button>

          </div>
        </div>
      )}

      {showCalculator && (
         <GradePredictorModal 
           course={course}
           assignments={assignments}
           onClose={() => setShowCalculator(false)}
         />
      )}

      {isEditModalOpen && (
        <CourseFormModal 
          initialData={course}
          onClose={() => setIsEditModalOpen(false)}
          onSave={(updates) => onUpdateCourse(course.id, updates)}
        />
      )}

      {isWeightModalOpen && (
        <WeightAdjustmentModal
          course={course}
          assignments={assignments}
          onClose={() => setIsWeightModalOpen(false)}
          onUpdate={onUpdateAssignment}
          onAdd={onAddAssignmentRaw}
          onDelete={onDeleteAssignment}
        />
      )}
    </div>
  );
};

export default CourseDetail;
