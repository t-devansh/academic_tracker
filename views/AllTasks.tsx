
import React, { useState } from 'react';
import { AppState, Assignment, AssignmentStatus, AssignmentPriority, AssignmentType } from '../types';
import { IconSearch, IconPlus, IconList } from '../components/Icons';
import { getTaskDisplayInfo } from '../utils';

interface AllTasksProps {
  state: AppState;
  onAddTask: () => void;
  onUpdateStatus: (id: string, status: AssignmentStatus) => void;
}

const AllTasks: React.FC<AllTasksProps> = ({ state, onAddTask, onUpdateStatus }) => {
  const [search, setSearch] = useState('');
  const [courseFilter, setCourseFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const filteredTasks = state.assignments.filter(task => {
    const course = state.courses.find(c => c.id === task.courseId);
    const matchesSearch = task.name.toLowerCase().includes(search.toLowerCase());
    const matchesCourse = courseFilter === 'All' || course?.name === courseFilter;
    const matchesType = typeFilter === 'All' || task.type === typeFilter;
    const matchesPriority = priorityFilter === 'All' || task.priority === priorityFilter;
    const matchesStatus = statusFilter === 'All' || task.status === statusFilter;
    
    return matchesSearch && matchesCourse && matchesType && matchesPriority && matchesStatus;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">All Tasks</h1>
          <p className="text-slate-500 text-sm mt-1">{filteredTasks.length} of {state.assignments.length} tasks</p>
        </div>
        <button 
          onClick={onAddTask}
          className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center gap-2"
        >
          <IconPlus /> Add Task
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            <IconSearch />
          </span>
          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2.5 pl-11 pr-4 text-sm focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
          />
        </div>

        <select 
          className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 outline-none hover:bg-slate-100 transition-all"
          value={courseFilter}
          onChange={(e) => setCourseFilter(e.target.value)}
        >
          <option>All Courses</option>
          {state.courses.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
        </select>

        <select 
          className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 outline-none hover:bg-slate-100 transition-all"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="All">All Types</option>
          {Object.values(AssignmentType).map(t => <option key={t} value={t}>{t}</option>)}
        </select>

        <select 
          className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 outline-none hover:bg-slate-100 transition-all"
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
        >
          <option value="All">All Priorities</option>
          {Object.values(AssignmentPriority).map(p => <option key={p} value={p}>{p}</option>)}
        </select>

        <select 
          className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 outline-none hover:bg-slate-100 transition-all"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="All">All Statuses</option>
          {Object.values(AssignmentStatus).map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Task List Content */}
      <div className="bg-white border border-slate-100 rounded-3xl min-h-[400px] shadow-sm flex flex-col">
        {filteredTasks.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b border-slate-50">
                <tr>
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Task Name</th>
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Course</th>
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Due Date</th>
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredTasks.map(task => {
                  const course = state.courses.find(c => c.id === task.courseId);
                  const displayInfo = getTaskDisplayInfo(task);
                  
                  return (
                    <tr key={task.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-5">
                        <div className="font-bold text-slate-800">{task.name}</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{task.type}</div>
                      </td>
                      <td className="px-8 py-5">
                         <span 
                          className="px-3 py-1 rounded-lg text-[10px] font-black text-white" 
                          style={{ backgroundColor: course?.color }}
                        >
                          {course?.code}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                         <span className="text-sm font-bold text-slate-600">
                          {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <select 
                          value={task.status}
                          onChange={(e) => onUpdateStatus(task.id, e.target.value as AssignmentStatus)}
                          className={`text-[10px] font-black uppercase tracking-tighter rounded-xl px-3 py-1.5 border cursor-pointer transition-all ${displayInfo.color}`}
                        >
                          {Object.values(AssignmentStatus).map(status => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                        {displayInfo.isAvailableState && <span className="ml-2 text-[9px] font-bold text-slate-300 uppercase">Available</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center py-20 text-center space-y-6">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
              <IconList />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800">No tasks found</h3>
              <p className="text-slate-400 text-sm mt-1">Add your first task to get started</p>
            </div>
            <button 
              onClick={onAddTask}
              className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-bold text-sm shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center gap-2"
            >
              <IconPlus /> Add Task
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllTasks;
