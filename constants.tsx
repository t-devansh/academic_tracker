
import React from 'react';
import { AssignmentStatus, AssignmentPriority, AssignmentType } from './types';

export const STATUS_COLORS: Record<AssignmentStatus, string> = {
  [AssignmentStatus.NOT_STARTED]: 'bg-rose-50 text-rose-600 border-rose-100', // Red
  [AssignmentStatus.IN_PROGRESS]: 'bg-yellow-50 text-yellow-700 border-yellow-100', // Yellow
  [AssignmentStatus.NOT_SUBMITTED]: 'bg-purple-50 text-purple-600 border-purple-100', // Light Purple
  [AssignmentStatus.SUBMITTED]: 'bg-emerald-50 text-emerald-600 border-emerald-100', // Green
};

export const AVAILABLE_COLOR = 'bg-slate-100 text-slate-500 border-slate-200'; // Grey for >14 days

export const PRIORITY_COLORS: Record<AssignmentPriority, string> = {
  [AssignmentPriority.LOW]: 'text-emerald-600 bg-emerald-50',
  [AssignmentPriority.MEDIUM]: 'text-amber-600 bg-amber-50',
  [AssignmentPriority.HIGH]: 'text-rose-600 bg-rose-50',
};

export const TYPE_COLORS: Record<AssignmentType, string> = {
  [AssignmentType.ASSIGNMENT]: 'bg-indigo-50 text-indigo-700 border-indigo-100',
  [AssignmentType.LAB]: 'bg-cyan-50 text-cyan-700 border-cyan-100',
  [AssignmentType.QUIZ]: 'bg-purple-50 text-purple-700 border-purple-100',
  [AssignmentType.MIDTERM]: 'bg-orange-50 text-orange-700 border-orange-100',
  [AssignmentType.FINAL]: 'bg-rose-50 text-rose-700 border-rose-100',
  [AssignmentType.OTHER]: 'bg-slate-50 text-slate-700 border-slate-100',
};

export const DEFAULT_COLORS = [
  '#4F46E5', // indigo-600
  '#0891B2', // cyan-600
  '#7C3AED', // violet-600
  '#EA580C', // orange-600
  '#E11D48', // rose-600
  '#059669', // emerald-600
];
