
import React from 'react';
import { AppState } from '../types';
import { IconClock } from '../components/Icons';

interface TimetableProps {
  state: AppState;
}

const Timetable: React.FC<TimetableProps> = ({ state }) => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const startHour = 8;
  const endHour = 18; // 6 PM
  const hours = Array.from({ length: endHour - startHour + 1 }, (_, i) => startHour + i);

  // Helper to calculate position
  const getPosition = (startTime: string, endTime: string) => {
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    
    const startOffset = (startH - startHour) * 60 + startM;
    const duration = (endH * 60 + endM) - (startH * 60 + startM);
    
    return {
      top: `${(startOffset / ((endHour - startHour) * 60)) * 100}%`,
      height: `${(duration / ((endHour - startHour) * 60)) * 100}%`
    };
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 h-[calc(100vh-100px)] flex flex-col">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Weekly Timetable</h1>
          <p className="text-slate-500 text-sm mt-1">Your recurring class schedule</p>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        {/* Header Row */}
        <div className="flex border-b border-slate-100">
          <div className="w-20 shrink-0 border-r border-slate-100 bg-slate-50/50"></div>
          {days.map(day => (
            <div key={day} className="flex-1 py-4 text-center text-xs font-black text-slate-400 uppercase tracking-widest bg-slate-50/30 border-r border-slate-50 last:border-none">
              {day}
            </div>
          ))}
        </div>

        {/* Grid Body */}
        <div className="flex-1 overflow-y-auto relative flex">
          {/* Time Column */}
          <div className="w-20 shrink-0 border-r border-slate-100 bg-slate-50/30 text-right pr-3 pt-2">
            {hours.map(h => (
              <div key={h} className="h-[60px] text-[10px] font-bold text-slate-400 relative">
                <span className="absolute -top-2 right-3">{h}:00</span>
              </div>
            ))}
          </div>

          {/* Days Columns */}
          <div className="flex-1 flex relative">
            {/* Horizontal Grid Lines */}
            <div className="absolute inset-0 z-0 flex flex-col">
               {hours.map(h => (
                 <div key={h} className="h-[60px] border-b border-slate-100 w-full" />
               ))}
            </div>

            {days.map((day, idx) => (
              <div key={day} className="flex-1 border-r border-slate-100 last:border-none relative z-10">
                {state.courses.flatMap(course => 
                  (course.schedule || [])
                    .filter(s => s.day === day)
                    .map((session, i) => {
                       const pos = getPosition(session.startTime, session.endTime);
                       return (
                         <div 
                           key={`${course.id}-${i}`}
                           className="absolute inset-x-1 p-2 rounded-xl text-xs flex flex-col justify-center shadow-sm border overflow-hidden hover:z-20 hover:shadow-md transition-all group"
                           style={{ 
                             top: pos.top, 
                             height: pos.height,
                             backgroundColor: `${course.color}15`, // 10% opacity hex
                             borderColor: `${course.color}40`,
                             color: course.color
                           }}
                         >
                           <div className="font-black truncate group-hover:whitespace-normal">{course.code}</div>
                           <div className="truncate text-[10px] opacity-80">{course.name}</div>
                           <div className="mt-1 flex items-center gap-1 text-[9px] font-bold opacity-70">
                             <IconClock /> {session.startTime} - {session.endTime}
                           </div>
                           {session.location && (
                             <div className="mt-auto text-[9px] font-bold bg-white/50 w-fit px-1.5 py-0.5 rounded text-slate-600">
                               {session.location}
                             </div>
                           )}
                         </div>
                       );
                    })
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Timetable;
