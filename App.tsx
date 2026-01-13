
import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './views/Dashboard';
import Courses from './views/Courses';
import CourseDetail from './views/CourseDetail';
import Importer from './views/Importer';
import Calendar from './views/Calendar';
import AllTasks from './views/AllTasks';
import Settings from './views/Settings';
import TaskModal from './components/TaskModal';
import { useAppState } from './store';
import { AssignmentStatus, AssignmentPriority, AssignmentType, Assignment } from './types';

const App: React.FC = () => {
  const { state, updateAssignment, addAssignment, deleteAssignment, deleteCourse, restoreFromTrash, emptyTrash, importCourseData, loadState } = useAppState();
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [activeTask, setActiveTask] = useState<Assignment | null>(null);

  const navigateToCourse = (id: string) => {
    setSelectedCourseId(id);
    setCurrentView('course-detail');
  };

  const handleGlobalStatusUpdate = (id: string, status: AssignmentStatus) => {
    updateAssignment(id, { status });
  };

  const handleQuickAddTask = (date?: Date) => {
    if (state.courses.length === 0) {
      alert("Please add a course first!");
      setCurrentView('importer');
      return;
    }
    const defaultCourse = state.courses[0];
    const newId = Math.random().toString(36).substr(2, 9);
    const newTask: Assignment = {
      id: newId,
      courseId: defaultCourse.id,
      name: '',
      description: '',
      dueDate: date ? date.toISOString() : new Date().toISOString(),
      weight: 0,
      priority: AssignmentPriority.MEDIUM,
      status: AssignmentStatus.NOT_STARTED,
      type: AssignmentType.ASSIGNMENT,
    };
    addAssignment(newTask);
    setActiveTask(newTask);
  };

  const handleAddAssignmentInCourse = (courseId: string) => {
    const newId = Math.random().toString(36).substr(2, 9);
    const newTask: Assignment = {
      id: newId,
      courseId,
      name: '',
      description: '',
      dueDate: new Date().toISOString(),
      weight: 0,
      priority: AssignmentPriority.MEDIUM,
      status: AssignmentStatus.NOT_STARTED,
      type: AssignmentType.ASSIGNMENT,
    };
    addAssignment(newTask);
    setActiveTask(newTask);
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <Dashboard 
            state={state} 
            onNavigateToCourse={navigateToCourse}
            onUpdateStatus={handleGlobalStatusUpdate}
            onNavigate={setCurrentView}
            onOpenTask={setActiveTask}
          />
        );
      case 'courses':
        return (
          <Courses 
            state={state}
            onNavigateToCourse={navigateToCourse}
            onNavigateToImporter={() => setCurrentView('importer')}
          />
        );
      case 'course-detail':
        const course = state.courses.find(c => c.id === selectedCourseId);
        if (!course) {
          setCurrentView('dashboard');
          return null;
        }
        return (
          <CourseDetail 
            course={course}
            assignments={state.assignments.filter(a => a.courseId === course.id)}
            onUpdateAssignment={updateAssignment}
            onAddAssignment={handleAddAssignmentInCourse}
            onDeleteCourse={(id) => {
              deleteCourse(id);
              setCurrentView('dashboard');
            }}
            onOpenTask={setActiveTask}
          />
        );
      case 'importer':
        return (
          <Importer 
            onImport={(data) => {
              importCourseData(data);
              setCurrentView('dashboard');
            }}
          />
        );
      case 'calendar':
        return (
          <Calendar 
            state={state}
            onAddTask={handleQuickAddTask}
          />
        );
      case 'all-tasks':
        return (
          <AllTasks 
            state={state}
            onAddTask={handleQuickAddTask}
            onUpdateStatus={handleGlobalStatusUpdate}
          />
        );
      case 'settings':
        return (
          <Settings 
            state={state} 
            onRestore={restoreFromTrash}
            onEmptyTrash={emptyTrash}
            onLoadState={loadState}
          />
        );
      default:
        return <Dashboard state={state} onNavigateToCourse={navigateToCourse} onUpdateStatus={handleGlobalStatusUpdate} onNavigate={setCurrentView} onOpenTask={setActiveTask} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar currentView={currentView} onNavigate={(view) => {
        setCurrentView(view);
        if (view !== 'course-detail') setSelectedCourseId(null);
      }} />
      <main className="flex-1 p-10 max-w-7xl mx-auto w-full">
        {renderView()}
      </main>

      {/* Assignment Detail Modal */}
      {activeTask && (
        <TaskModal 
          task={activeTask}
          course={state.courses.find(c => c.id === activeTask.courseId)}
          onClose={() => setActiveTask(null)}
          onUpdate={updateAssignment}
          onDelete={deleteAssignment}
        />
      )}
    </div>
  );
};

export default App;
