
import React from 'react';
import { IconLayout, IconCalendar, IconChart, IconBook, IconImport, IconList, IconSettings, IconScholar } from './Icons';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate }) => {
  const items = [
    { id: 'dashboard', label: 'Dashboard', icon: <IconLayout /> },
    { id: 'courses', label: 'Courses', icon: <IconBook /> },
    { id: 'all-tasks', label: 'All Tasks', icon: <IconList /> },
    { id: 'calendar', label: 'Calendar', icon: <IconCalendar /> },
    { id: 'analytics', label: 'Performance', icon: <IconChart /> },
    { id: 'importer', label: 'Import Syllabus', icon: <IconImport /> },
    { id: 'settings', label: 'Settings', icon: <IconSettings /> },
  ];

  return (
    <aside className="w-64 border-r border-slate-200 bg-white flex flex-col h-screen sticky top-0">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
            <IconScholar />
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-900">Command Center</span>
        </div>

        <nav className="space-y-1">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                currentView === item.id
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-6 border-t border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs">UN</div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-slate-900">User Name</span>
            <span className="text-[10px] text-slate-400 font-medium">Student</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
