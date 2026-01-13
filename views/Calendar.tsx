
import React, { useState } from 'react';
import { AppState, Assignment } from '../types';
import { IconChevronLeft, IconChevronRight, IconPlus, IconCalendar } from '../components/Icons';

interface CalendarProps {
  state: AppState;
  onAddTask: (date: Date) => void;
}

const Calendar: React.FC<CalendarProps> = ({ state, onAddTask }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const daysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const startDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  const goToday = () => {
    const today = new Date();
    setCurrentMonth(today);
    setSelectedDate(today);
  };

  const monthName = currentMonth.toLocaleString('default', { month: 'long' });
  const year = currentMonth.getFullYear();

  const calendarDays = [];
  const totalDays = daysInMonth(currentMonth);
  const offset = startDayOfMonth(currentMonth);

  // Pad previous month days
  const prevMonthLastDay = daysInMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  for (let i = offset - 1; i >= 0; i--) {
    calendarDays.push({ day: prevMonthLastDay - i, current: false, date: new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, prevMonthLastDay - i) });
  }

  // Current month days
  for (let i = 1; i <= totalDays; i++) {
    calendarDays.push({ day: i, current: true, date: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i) });
  }

  // Next month days padding
  const remaining = 42 - calendarDays.length;
  for (let i = 1; i <= remaining; i++) {
    calendarDays.push({ day: i, current: false, date: new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, i) });
  }

  const tasksOnSelectedDate = state.assignments.filter(a => {
    const d = new Date(a.dueDate);
    return d.getDate() === selectedDate.getDate() &&
           d.getMonth() === selectedDate.getMonth() &&
           d.getFullYear() === selectedDate.getFullYear();
  });

  const getWorkloadLevel = (date: Date) => {
    const count = state.assignments.filter(a => {
      const d = new Date(a.dueDate);
      return d.getDate() === date.getDate() && d.getMonth() === date.getMonth() && d.getFullYear() === date.getFullYear();
    }).length;
    if (count === 0) return 'none';
    if (count === 1) return 'low';
    if (count === 2) return 'medium';
    return 'high';
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Calendar</h1>
          <p className="text-slate-500 text-sm mt-1">View your assignments by date</p>
        </div>
        <button 
          onClick={() => onAddTask(selectedDate)}
          className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center gap-2"
        >
          <IconPlus /> Add Task
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Calendar Card */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm p-8 flex flex-col min-h-[500px]">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-xl font-bold text-slate-800">{monthName} {year}</h2>
            <div className="flex items-center gap-4">
              <button onClick={prevMonth} className="p-2 hover:bg-slate-50 rounded-lg text-slate-400"><IconChevronLeft /></button>
              <button onClick={goToday} className="text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors">Today</button>
              <button onClick={nextMonth} className="p-2 hover:bg-slate-50 rounded-lg text-slate-400"><IconChevronRight /></button>
            </div>
          </div>

          <div className="grid grid-cols-7 text-center mb-6">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="text-[10px] font-black text-slate-400 uppercase tracking-widest py-2">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 flex-1 gap-px">
            {calendarDays.map((cell, idx) => {
              const isSelected = cell.date.toDateString() === selectedDate.toDateString();
              const workload = getWorkloadLevel(cell.date);
              
              return (
                <button
                  key={idx}
                  onClick={() => setSelectedDate(cell.date)}
                  className={`relative flex flex-col items-center justify-center p-4 rounded-2xl transition-all group ${
                    isSelected ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100 z-10' : 'hover:bg-slate-50'
                  }`}
                >
                  <span className={`text-sm font-bold ${!cell.current && !isSelected ? 'text-slate-300' : ''}`}>
                    {cell.day}
                  </span>
                  
                  {/* Workload dot if not selected */}
                  {!isSelected && workload !== 'none' && (
                    <div className={`w-1.5 h-1.5 rounded-full mt-1 ${
                      workload === 'low' ? 'bg-indigo-100' : 
                      workload === 'medium' ? 'bg-indigo-200' : 'bg-indigo-400'
                    }`} />
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-8 pt-8 border-t border-slate-50 flex items-center gap-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <span>Workload:</span>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-indigo-50" /> 1
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-indigo-200" /> 2
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-indigo-400" /> 3+
            </div>
          </div>
        </div>

        {/* Task Detail Sidebar */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 flex flex-col">
          <div className="flex items-center gap-3 mb-10 text-slate-800">
            <IconCalendar />
            <h3 className="font-bold">{selectedDate.toLocaleDateString('default', { weekday: 'long', month: 'long', day: 'numeric' })}</h3>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto pr-2">
            {tasksOnSelectedDate.map(task => (
              <div key={task.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 transition-all hover:border-indigo-200">
                <p className="text-xs font-black text-indigo-500 uppercase mb-1">{task.type}</p>
                <h4 className="text-sm font-bold text-slate-800 mb-1">{task.name}</h4>
                <div className="flex justify-between items-center mt-3">
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-white border border-slate-100 rounded-lg text-slate-500">{task.priority}</span>
                  <span className="text-[10px] font-bold text-slate-400">{task.weight}% weight</span>
                </div>
              </div>
            ))}

            {tasksOnSelectedDate.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                <p className="text-slate-400 text-sm font-medium">No tasks due on this date</p>
                <button 
                  onClick={() => onAddTask(selectedDate)}
                  className="flex items-center gap-2 bg-slate-50 text-slate-600 border border-slate-200 px-4 py-2 rounded-xl text-xs font-bold hover:bg-slate-100 transition-all"
                >
                  <IconPlus /> Add Task
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
