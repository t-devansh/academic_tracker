
import React, { useState } from 'react';
import { AppState, AssignmentStatus, Course } from '../types';
import { IconPlus } from '../components/Icons';
import CourseFormModal from '../components/AddCourseModal';
import { useAppState } from '../store';

interface CoursesProps {
  state: AppState;
  onNavigateToCourse: (id: string) => void;
  onNavigateToImporter?: () => void;
}

const Courses: React.FC<CoursesProps> = ({ state, onNavigateToCourse, onNavigateToImporter }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { addCourse } = useAppState();

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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Your Courses</h1>
          <p className="text-slate-500 text-sm mt-1">Manage and track your enrolled courses</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {state.courses.map((course) => {
          const progress = calculateCourseProgress(course.id);
          return (
            <div 
              key={course.id} 
              onClick={() => onNavigateToCourse(course.id)}
              className="group bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-lg" style={{ backgroundColor: course.color }}>
                  {course.code.slice(0, 2)}
                </div>
                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  View Details
                </span>
              </div>
              <h3 className="font-bold text-xl mb-1 text-slate-800">{course.name}</h3>
              <p className="text-sm text-slate-400 font-medium mb-8">{course.code}</p>
              
              <div>
                <div className="flex justify-between text-xs font-bold mb-2">
                  <span className="text-slate-500">Total Progress</span>
                  <span className="text-slate-900">{progress}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${progress}%`, backgroundColor: course.color }}></div>
                </div>
              </div>
            </div>
          )
        })}
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-[2.5rem] p-8 text-slate-400 hover:border-indigo-400 hover:text-indigo-400 hover:bg-indigo-50/20 transition-all h-[300px] group"
        >
          <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <IconPlus />
          </div>
          <span className="text-sm font-bold uppercase tracking-wider">Add New Course</span>
        </button>
      </div>

      {isModalOpen && (
        <CourseFormModal 
          onClose={() => setIsModalOpen(false)}
          onSave={(course) => addCourse(course)}
          onSwitchToImport={() => {
            setIsModalOpen(false);
            if (onNavigateToImporter) onNavigateToImporter();
          }}
        />
      )}
    </div>
  );
};

export default Courses;
