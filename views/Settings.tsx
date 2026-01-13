
import React, { useState, useRef } from 'react';
import { AppState, TrashedItem, Course, Assignment } from '../types';
import { IconTrash, IconImport, IconBook, IconList, IconDownload, IconUpload, IconSettings, IconCheck } from '../components/Icons';

interface SettingsProps {
  state: AppState;
  onRestore: (id: string) => void;
  onEmptyTrash: () => void;
  onLoadState: (data: AppState) => void;
}

const Settings: React.FC<SettingsProps> = ({ state, onRestore, onEmptyTrash, onLoadState }) => {
  const [activeTab, setActiveTab] = useState<'general' | 'data' | 'trash'>('data');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `academic_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.courses && json.assignments) {
          if (confirm("This will overwrite your current data with the backup. Continue?")) {
            onLoadState(json);
            alert("Data restored successfully!");
          }
        } else {
          alert("Invalid backup file format.");
        }
      } catch (err) {
        alert("Failed to parse JSON file.");
      }
    };
    reader.readAsText(file);
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black text-slate-900">Settings & Data</h1>
          <p className="text-slate-500 text-sm mt-1 uppercase font-black tracking-widest">Manage your application state</p>
        </div>
      </div>

      <div className="flex gap-4 border-b border-slate-200">
        <button 
          onClick={() => setActiveTab('data')}
          className={`pb-4 px-2 text-sm font-bold transition-all border-b-2 ${activeTab === 'data' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
        >
          Data Management
        </button>
        <button 
          onClick={() => setActiveTab('trash')}
          className={`pb-4 px-2 text-sm font-bold transition-all border-b-2 ${activeTab === 'trash' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
        >
          Trash ({state.trash.length})
        </button>
        <button 
          onClick={() => setActiveTab('general')}
          className={`pb-4 px-2 text-sm font-bold transition-all border-b-2 ${activeTab === 'general' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
        >
          General
        </button>
      </div>

      {activeTab === 'data' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-6">
            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
              <IconDownload />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Export Backup</h3>
              <p className="text-slate-500 text-sm mt-2 leading-relaxed">
                Download a JSON file containing all your courses, tasks, grades, and settings. Save this file to your computer to prevent data loss.
              </p>
            </div>
            <button 
              onClick={handleExport}
              className="w-full bg-indigo-600 text-white px-6 py-4 rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
            >
              <IconDownload /> Download Data
            </button>
          </div>

          <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-6">
            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
              <IconUpload />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Restore Backup</h3>
              <p className="text-slate-500 text-sm mt-2 leading-relaxed">
                Restore your academic history from a previously saved JSON file. This is useful if you cleared your browser cache or changed devices.
              </p>
            </div>
            <input 
              type="file" 
              accept=".json" 
              ref={fileInputRef} 
              className="hidden" 
              onChange={handleFileChange}
            />
            <button 
              onClick={handleImportClick}
              className="w-full bg-emerald-50 text-emerald-700 px-6 py-4 rounded-xl font-bold text-sm hover:bg-emerald-100 border border-emerald-200 transition-all flex items-center justify-center gap-2"
            >
              <IconUpload /> Select File to Restore
            </button>
          </div>
        </div>
      )}

      {activeTab === 'trash' && (
        <div className="space-y-6">
           <div className="flex justify-end">
            <button 
              onClick={() => { if(confirm("Permanently empty everything in trash?")) onEmptyTrash(); }}
              className="bg-rose-50 text-rose-600 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-100 transition-all flex items-center gap-2"
            >
              <IconTrash /> Empty Trash
            </button>
           </div>
           
           <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden min-h-[400px]">
            {state.trash.length === 0 ? (
              <div className="py-32 text-center space-y-4">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200">
                  <IconTrash />
                </div>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Your trash is currently empty</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {state.trash.map((item) => (
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
        </div>
      )}

      {activeTab === 'general' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm opacity-50 grayscale pointer-events-none">
            <h3 className="font-black uppercase text-[10px] text-slate-400 mb-4">Account</h3>
            <p className="text-sm font-bold text-slate-900">Manage profile data and sync options coming soon.</p>
          </div>
          <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm opacity-50 grayscale pointer-events-none">
            <h3 className="font-black uppercase text-[10px] text-slate-400 mb-4">Appearance</h3>
            <p className="text-sm font-bold text-slate-900">Dark mode and custom themes coming soon.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
