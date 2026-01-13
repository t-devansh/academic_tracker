
import React, { useState } from 'react';
import { AppState, Assignment, AssignmentType } from '../types';
import { IconChevronLeft, IconChevronRight, IconExam, IconClock } from '../components/Icons';

interface ExamScheduleProps {
  state: AppState;
}

const ExamSchedule: React.FC<ExamScheduleProps> = ({ state }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const exams = state.assignments.filter(a => 
    [AssignmentType.MIDTERM, AssignmentType.FINAL, AssignmentType.QUIZ].includes(a.type)
  ).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  const upcomingExams = exams.filter(a => new Date(a.dueDate) >= new Date());

  const daysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const startDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  const goToday = () => setCurrentMonth(new Date());

  const monthName = currentMonth.toLocaleString('default', { month: 'long' });
  const year = currentMonth.getFullYear();

  const calendarDays = [];
  const totalDays = daysInMonth(currentMonth);
  const offset = startDayOfMonth(currentMonth);

  for (let i = offset - 1; i >= 0; i--) {
    calendarDays.push({ day: '', current: false });
  }
  for (let i = 1; i <= totalDays; i++) {
    calendarDays.push({ day: i, current: true, date: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i) });
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Exam Schedule</h1>
          <p className="text-slate-500 text-sm mt-1">Track your upcoming Quizzes, Midterms, and Finals</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left: Calendar */}
        <div className="lg:col-span-2 bg-white rounded-[2rem] border border-slate-100 shadow-sm p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-800">{monthName} {year}</h2>
            <div className="flex items-center gap-2">
              <button onClick={prevMonth} className="p-2 hover:bg-slate-50 rounded-lg text-slate-400"><IconChevronLeft /></button>
              <button onClick={goToday} className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100">Today</button>
              <button onClick={nextMonth} className="p-2 hover:bg-slate-50 rounded-lg text-slate-400"><IconChevronRight /></button>
            </div>
          </div>

          <div className="grid grid-cols-7 text-center mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((cell, idx) => {
              if (!cell.current) return <div key={idx} className="h-24"></div>;
              
              const dayExams = exams.filter(e => {
                const d = new Date(e.dueDate);
                return d.getDate() === cell.day && d.getMonth() === currentMonth.getMonth() && d.getFullYear() === currentMonth.getFullYear();
              });

              return (
                <div key={idx} className={`h-24 border rounded-xl p-2 flex flex-col items-start transition-colors ${dayExams.length > 0 ? 'bg-indigo-50/30 border-indigo-100' : 'bg-white border-slate-50 hover:border-slate-100'}`}>
                  <span className={`text-xs font-bold mb-1 ${dayExams.length > 0 ? 'text-indigo-600' : 'text-slate-400'}`}>{cell.day}</span>
                  <div className="w-full space-y-1 overflow-y-auto custom-scrollbar">
                    {dayExams.map(exam => (
                      <div key={exam.id} className="text-[9px] font-bold bg-white border border-indigo-100 text-indigo-700 px-1.5 py-1 rounded-md truncate shadow-sm">
                        {exam.name}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: List of Upcoming Exams */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm min-h-[500px] flex flex-col">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <IconExam /> Upcoming Exams
            </h3>
            
            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
              {upcomingExams.length > 0 ? upcomingExams.map(exam => {
                const date = new Date(exam.dueDate);
                const course = state.courses.find(c => c.id === exam.courseId);
                return (
                  <div key={exam.id} className="p-4 bg-rose-50 rounded-2xl border border-rose-100 hover:border-rose-300 transition-all group">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-black uppercase text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100">{exam.type}</span>
                      <span className="text-[10px] font-bold text-slate-400">{exam.weight}% Weight</span>
                    </div>
                    <h4 className="font-bold text-slate-800 leading-tight mb-1 group-hover:text-indigo-700">{exam.name}</h4>
                    <p className="text-xs font-bold text-slate-500 mb-3">{course?.code} - {course?.name}</p>
                    
                    <div className="flex items-center gap-2 text-rose-500 font-bold text-xs bg-white px-3 py-2 rounded-xl border border-slate-100 shadow-sm w-fit">
                      <IconClock />
                      {date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} at {date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                    </div>
                  </div>
                );
              }) : (
                <div className="flex flex-col items-center justify-center py-20 text-center text-slate-400">
                  <p className="text-sm font-medium">No upcoming exams found.</p>
                  <p className="text-xs mt-1">Great job keeping up!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamSchedule;
