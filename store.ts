
import { useState, useEffect } from 'react';
import { AppState, Course, Assignment, AssignmentStatus, AssignmentPriority, AssignmentType, TrashedItem } from './types';

const STORAGE_KEY = 'academic_command_center_data';

const MOCK_DATA: AppState = {
  termStart: new Date(Date.now() - 86400000 * 30).toISOString(),
  termEnd: new Date(Date.now() + 86400000 * 90).toISOString(),
  courses: [
    { id: 'c1', name: 'Introduction to Computer Science', code: 'CS101', color: '#3b82f6', targetGrade: 90, credits: 3, term: 'Fall 2024' },
    { id: 'c2', name: 'Calculus I', code: 'MATH101', color: '#ef4444', targetGrade: 85, credits: 4, term: 'Fall 2024' },
  ],
  assignments: [
    {
      id: 'a1',
      courseId: 'c2',
      name: 'Problem Set 1',
      description: 'Foundational exercises.',
      dueDate: new Date(Date.now() + 86400000 * 2).toISOString(),
      weight: 5,
      gradeReceived: 95,
      priority: AssignmentPriority.LOW,
      status: AssignmentStatus.SUBMITTED,
      type: AssignmentType.ASSIGNMENT,
      notes: 'Remember to check the derivative rules.',
      links: [{ title: 'Khan Academy Reference', url: 'https://khanacademy.org' }]
    },
    {
      id: 'a2',
      courseId: 'c1',
      name: 'Assignment 1: Hello World',
      description: 'Basic coding lab.',
      dueDate: new Date(Date.now() + 86400000 * 5).toISOString(),
      weight: 10,
      gradeReceived: 100,
      priority: AssignmentPriority.MEDIUM,
      status: AssignmentStatus.SUBMITTED,
      type: AssignmentType.LAB,
    }
  ],
  trash: [],
};

export function useAppState() {
  const [state, setState] = useState<AppState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Robustness check: Ensure essential arrays exist
        // Merging with MOCK_DATA structure ensures safeguards against missing new fields
        return {
          ...MOCK_DATA, // Start with defaults to ensure all keys exist
          ...parsed,    // Overwrite with saved data
          courses: Array.isArray(parsed.courses) ? parsed.courses : [],
          assignments: Array.isArray(parsed.assignments) ? parsed.assignments : [],
          trash: Array.isArray(parsed.trash) ? parsed.trash : []
        };
      }
    } catch (e) {
      console.error("Failed to load local storage data, reverting to mock data", e);
    }
    return MOCK_DATA;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error("Failed to save to local storage", e);
    }
  }, [state]);

  const addCourse = (course: Omit<Course, 'id'>) => {
    const newCourse = { ...course, id: Math.random().toString(36).substr(2, 9) };
    setState(prev => ({ ...prev, courses: [...prev.courses, newCourse] }));
  };

  const updateCourse = (id: string, updates: Partial<Course>) => {
    setState(prev => ({
      ...prev,
      courses: prev.courses.map(c => c.id === id ? { ...c, ...updates } : c)
    }));
  };

  const deleteCourse = (id: string) => {
    const courseToDelete = state.courses.find(c => c.id === id);
    if (!courseToDelete) return;
    
    const relatedAssignments = state.assignments.filter(a => a.courseId === id);
    
    setState(prev => ({
      ...prev,
      courses: prev.courses.filter(c => c.id !== id),
      assignments: prev.assignments.filter(a => a.courseId !== id),
      trash: [
        ...prev.trash, 
        { 
          id: Math.random().toString(36).substr(2, 9), 
          type: 'course', 
          data: { course: courseToDelete, assignments: relatedAssignments }, 
          deletedAt: new Date().toISOString() 
        }
      ]
    }));
  };

  const addAssignment = (assignment: Omit<Assignment, 'id'>) => {
    const newAssignment = { ...assignment, id: Math.random().toString(36).substr(2, 9) };
    setState(prev => ({ ...prev, assignments: [...prev.assignments, newAssignment] }));
  };

  const updateAssignment = (id: string, updates: Partial<Assignment>) => {
    setState(prev => ({
      ...prev,
      assignments: prev.assignments.map(a => a.id === id ? { ...a, ...updates } : a)
    }));
  };

  const deleteAssignment = (id: string) => {
    const assignmentToDelete = state.assignments.find(a => a.id === id);
    if (!assignmentToDelete) return;

    setState(prev => ({
      ...prev,
      assignments: prev.assignments.filter(a => a.id !== id),
      trash: [
        ...prev.trash, 
        { 
          id: Math.random().toString(36).substr(2, 9), 
          type: 'assignment', 
          data: assignmentToDelete, 
          deletedAt: new Date().toISOString() 
        }
      ]
    }));
  };

  const restoreFromTrash = (trashId: string) => {
    const item = state.trash.find(t => t.id === trashId);
    if (!item) return;

    setState(prev => {
      const newTrash = prev.trash.filter(t => t.id !== trashId);
      if (item.type === 'course') {
        return {
          ...prev,
          courses: [...prev.courses, item.data.course],
          assignments: [...prev.assignments, ...item.data.assignments],
          trash: newTrash
        };
      } else {
        return {
          ...prev,
          assignments: [...prev.assignments, item.data],
          trash: newTrash
        };
      }
    });
  };

  const emptyTrash = () => setState(prev => ({ ...prev, trash: [] }));

  const importCourseData = (data: any) => {
    const courseId = Math.random().toString(36).substr(2, 9);
    const newCourse = { ...data.course, id: courseId };
    const newAssignments = data.assignments.map((a: any) => ({
      ...a,
      id: Math.random().toString(36).substr(2, 9),
      courseId
    }));
    setState(prev => ({
      ...prev,
      courses: [...prev.courses, newCourse],
      assignments: [...prev.assignments, ...newAssignments]
    }));
  };

  const loadState = (newState: AppState) => {
    setState(newState);
  };

  return {
    state,
    addCourse,
    updateCourse,
    deleteCourse,
    addAssignment,
    updateAssignment,
    deleteAssignment,
    restoreFromTrash,
    emptyTrash,
    importCourseData,
    loadState
  };
}
