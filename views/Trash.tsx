
import React from 'react';
import { TrashedItem, Course, Assignment } from '../types';
import { IconTrash, IconImport, IconBook, IconList } from '../components/Icons';

interface TrashProps {
  trash: TrashedItem[];
  onRestore: (id: string) => void;
  onEmpty: () => void;
}

const Trash: React.FC<TrashProps> = ({ trash, onRestore, onEmpty }) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-slate-900">Settings & System</h1>
          <p className="text-slate-500 text-sm mt-1 uppercase font-black tracking-widest">Trash Recovery Center</p>
        </div>
        <button 
          onClick={() => { if(confirm("Permanently empty everything in trash?")) onEmpty(); }}
          className="bg-rose-50 text-rose-600 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-100 transition-all"
        >
          Empty Trash
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden min-h-[400px]">
        {trash.length === 0 ? (
          <div className="py-32 text-center space-y-4">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200">
              <IconTrash />
            </div>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Your trash is currently empty</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {trash.map((item) => (
              <div key={item.id} className="p-6 flex items-center justify-between hover:bg-slate-50/50 transition-colors group">
                <div className="flex items-center gap-6">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${item.type === 'course' ? 'bg-indigo-50 text-indigo-600' : 'bg-orange-50 text-orange-600'}`}>
                    {item.type === 'course' ? <IconBook /> : <IconList />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-black uppercase text-slate-300 tracking-widest">{item.type}</span>
                      <span className="text-[10px] text-slate-200">•</span>
                      <span className="text-[10px] font-black uppercase text-slate-300 tracking-widest">Deleted {new Date(item.deletedAt).toLocaleDateString()}</span>
                    </div>
                    <h3 className="font-bold text-slate-800">
                      {item.type === 'course' ? (item.data.course as Course).name : (item.data as Assignment).name}
                    </h3>
                  </div>
                </div>
                
                <button 
                  onClick={() => onRestore(item.id)}
                  className="flex items-center gap-2 text-indigo-600 px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-50 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <IconImport /> Restore
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Settings Sections placeholder */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-10 border-t border-slate-100">
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm opacity-50 grayscale pointer-events-none">
          <h3 className="font-black uppercase text-[10px] text-slate-400 mb-4">Account</h3>
          <p className="text-sm font-bold text-slate-900">Manage profile data and sync options coming soon.</p>
        </div>
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm opacity-50 grayscale pointer-events-none">
          <h3 className="font-black uppercase text-[10px] text-slate-400 mb-4">Appearance</h3>
          <p className="text-sm font-bold text-slate-900">Dark mode and custom themes coming soon.</p>
        </div>
      </div>
    </div>
  );
};

export default Trash;
