
import { Assignment, AssignmentStatus } from './types';
import { STATUS_COLORS, AVAILABLE_COLOR } from './constants';

export const getTaskDisplayInfo = (task: Assignment) => {
  const now = new Date();
  const due = new Date(task.dueDate);
  const diffTime = due.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // Logic: "Available" if Not Started and > 14 days out.
  if (task.status === AssignmentStatus.NOT_STARTED) {
    if (diffDays > 14) {
      return { 
        label: 'Available', 
        color: AVAILABLE_COLOR,
        isAvailableState: true 
      };
    }
    return { 
      label: 'Not Started', 
      color: STATUS_COLORS[AssignmentStatus.NOT_STARTED],
      isAvailableState: false
    };
  }

  return { 
    label: task.status, 
    color: STATUS_COLORS[task.status] || 'bg-slate-100 text-slate-600',
    isAvailableState: false
  };
};
