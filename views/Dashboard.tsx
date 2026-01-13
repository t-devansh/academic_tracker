
import React, { useState } from 'react';
import { AppState, AssignmentStatus, Assignment } from '../types';
import { IconBook, IconCheck, IconClock, IconWarning, IconCalendar } from '../components/Icons';
import { getTaskDisplayInfo } from '../utils';

interface DashboardProps {
  state: AppState;
  onNavigateToCourse: (id: string) => void;
  onUpdateStatus: (id: string, status: AssignmentStatus) => void;
  onNavigate: (view: string) => void;
  onOpenTask: (task: Assignment) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ state, onNavigateToCourse, onUpdateStatus, onNavigate, onOpenTask }) => {
  const [viewMode, setViewMode] = useState<'modern' | 'classic'>('modern');
  const now = new Date();
  
  const upcomingAssignments = state.assignments
    .filter(a => a.status !== AssignmentStatus.SUBMITTED)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  const upcomingCount = upcomingAssignments.length;
  const notStartedCount = state.assignments.filter(a => a.status === AssignmentStatus.NOT_STARTED).length;
  const inProgressCount = state.assignments.filter(a => a.status === AssignmentStatus.IN_PROGRESS).length;
  const overdueCount = state.assignments.filter(a => 
    a.status !== AssignmentStatus.SUBMITTED && 
    new Date(a.dueDate) < now
  ).length;

  // Term Progress Calculation
  const termStart = state.termStart ? new Date(state.termStart) : new Date(now.getFullYear(), 8, 1);
  const termEnd = state.termEnd ? new Date(state.termEnd) : new Date(now.getFullYear(), 11, 20);
  const totalDays = Math.ceil((termEnd.getTime() - termStart.getTime()) / (1000 * 60 * 60 * 24));
  const elapsedDays = Math.ceil((now.getTime() - termStart.getTime()) / (1000 * 60 * 60 * 24));
  const daysLeft = Math.max(0, Math.ceil((termEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  const termProgress = Math.min(100, Math.max(0, (elapsedDays / totalDays) * 100));

  const calculateCourseProgress = (courseId: string) => {
    const courseAssignments = state.assignments.filter(a => a.courseId === courseId);
    const totalWeight = courseAssignments.reduce((acc, curr) => acc + curr.weight, 0);
    const completedWeight = courseAssignments
      .filter(a => a.status === AssignmentStatus.SUBMITTED)
      .reduce((acc, curr) => acc + curr.weight, 0);
    return totalWeight > 0 ? Math.round((completedWeight / totalWeight) * 100) : 0;
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Overview of your academic progress</p>
        </div>
        
        {/* Term Progress Widget */}
        <div className="bg-white px-5 py-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-2 min-w-[200px]">
          <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
            <span>Term Progress</span>
            <span className="text-indigo-600">{daysLeft} days left</span>
          </div>
          <div className="w-full bg-slate-50 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-indigo-500 h-full rounded-full transition-all duration-1000" 
              style={{ width: `${termProgress}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-400 font-bold text-right">{Math.round(termProgress)}% Done</p>
        </div>
      </div>

      <div className="flex justify-end mb-2">
        <div className="flex bg-white border border-slate-100 p-1 rounded-xl shadow-sm">
           <button 
            onClick={() => setViewMode('modern')}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${viewMode === 'modern' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}
          >
            Modern
          </button>
          <button 
            onClick={() => setViewMode('classic')}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${viewMode === 'classic' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}
          >
            Classic
          </button>
        </div>
      </div>

      {/* Header Snapshot - 4 Column Layout */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-[1.5rem] border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-slate-400 text-sm font-medium">Upcoming Tasks</p>
            <p className="text-4xl font-bold text-slate-900">{upcomingCount}</p>
          </div>
          <div className="w-14 h-14 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-500">
            <IconBook />
          </div>
        </div>

        <div className="bg-white p-6 rounded-[1.5rem] border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between w-full">
            <div className="space-y-1">
              <p className="text-slate-400 text-sm font-medium">Not Started</p>
              <p className="text-4xl font-bold text-slate-900">{notStartedCount}/{state.assignments.length}</p>
            </div>
            <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500">
              <IconCheck />
            </div>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-4 overflow-hidden">
            <div className="bg-emerald-400 h-full rounded-full transition-all duration-700" style={{ width: `${(notStartedCount / state.assignments.length) * 100 || 0}%` }} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-[1.5rem] border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-slate-400 text-sm font-medium">In Progress</p>
            <p className="text-4xl font-bold text-slate-900">{inProgressCount}</p>
          </div>
          <div className="w-14 h-14 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-500">
            <IconClock />
          </div>
        </div>

        <div className="bg-white p-6 rounded-[1.5rem] border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-slate-400 text-sm font-medium">Overdue</p>
            <p className="text-4xl font-bold text-slate-900">{overdueCount}</p>
          </div>
          <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center text-slate-400">
            <IconWarning />
          </div>
        </div>
      </section>

      {viewMode === 'modern' ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Column: Upcoming Tasks */}
          <div className="lg:col-span-3 space-y-4">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-2xl font-bold text-slate-900">Upcoming Tasks</h2>
              <button onClick={() => onNavigate('calendar')} className="text-indigo-600 text-sm font-semibold hover:underline flex items-center gap-1">
                View Calendar <IconCalendar />
              </button>
            </div>
            <div className="space-y-3">
              {upcomingAssignments.slice(0, 5).map(task => {
                const course = state.courses.find(c => c.id === task.courseId);
                const date = new Date(task.dueDate);
                const displayInfo = getTaskDisplayInfo(task);
                return (
                  <div key={task.id} 
                    onClick={() => onOpenTask(task)}
                    className="bg-white p-5 rounded-[1.25rem] border border-slate-100 shadow-sm flex items-center gap-5 hover:border-slate-200 transition-colors cursor-pointer group"
                  >
                    <button 
                      onClick={(e) => { e.stopPropagation(); onUpdateStatus(task.id, AssignmentStatus.SUBMITTED); }}
                      className="w-7 h-7 rounded-full border-2 border-slate-200 flex items-center justify-center hover:border-indigo-500 transition-colors group-hover:border-slate-300"
                    >
                      <div className="w-3 h-3 rounded-full bg-indigo-500 opacity-0 group-hover:opacity-10 transition-opacity" />
                    </button>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold border border-rose-100 text-rose-500 bg-rose-50">
                          {course?.code}
                        </span>
                        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border flex items-center gap-1 ${displayInfo.color}`}>
                          {displayInfo.label}
                        </span>
                      </div>
                      <h3 className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{task.name}</h3>
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <div className="flex items-center gap-1.5 text-rose-500 font-bold text-sm">
                        <IconClock /> 
                        {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                      <div className="text-[10px] font-bold text-slate-400 mt-0.5">
                        {date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                );
              })}
              {upcomingCount === 0 && (
                <div className="py-12 bg-white rounded-[1.5rem] border border-dashed border-slate-200 text-center text-slate-400 font-medium">
                  No upcoming tasks. Enjoy your free time!
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Course Status */}
          <div className="lg:col-span-1 space-y-4">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-2xl font-bold text-slate-900">Course Status</h2>
              <button onClick={() => onNavigate('courses')} className="text-indigo-600 text-sm font-semibold hover:underline">
                View All →
              </button>
            </div>
            <div className="space-y-3">
              {state.courses.map(course => {
                const progress = calculateCourseProgress(course.id);
                return (
                  <div key={course.id} onClick={() => onNavigateToCourse(course.id)} className="bg-white p-6 rounded-[1.5rem] border border-slate-100 shadow-sm cursor-pointer hover:border-slate-200 transition-all relative overflow-hidden group">
                    <div className="absolute top-4 right-4 w-3 h-3 rounded-full" style={{ backgroundColor: course.color }} />
                    <h3 className="font-bold text-slate-900 text-lg leading-tight">{course.code}</h3>
                    <p className="text-slate-400 text-xs font-medium truncate mb-4">{course.name}</p>
                    
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                        <span>Progress</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${progress}%`, backgroundColor: course.color }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {state.courses.map((course) => {
            const progress = calculateCourseProgress(course.id);
            const nextTask = upcomingAssignments.find(a => a.courseId === course.id);
            return (
              <div key={course.id} onClick={() => onNavigateToCourse(course.id)} className="group bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-lg" style={{ backgroundColor: course.color }}>
                    {course.code.slice(0, 2)}
                  </div>
                  <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">View Details</span>
                </div>
                <h3 className="font-bold text-xl mb-1 text-slate-800">{course.name}</h3>
                <p className="text-sm text-slate-400 font-medium mb-8">{course.code}</p>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between text-xs font-bold mb-2">
                      <span className="text-slate-500">Progress</span>
                      <span className="text-slate-900">{progress}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${progress}%`, backgroundColor: course.color }} />
                    </div>
                  </div>
                  {nextTask && (
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <p className="text-[10px] uppercase tracking-widest font-black text-slate-400 mb-2">Next Deadline</p>
                      <p className="text-sm font-bold text-slate-700 truncate">{nextTask.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-rose-500 font-bold">{new Date(nextTask.dueDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
