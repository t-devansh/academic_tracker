
export enum AssignmentStatus {
  NOT_STARTED = 'Not Started',
  IN_PROGRESS = 'In Progress',
  NOT_SUBMITTED = 'Not Submitted',
  SUBMITTED = 'Submitted'
}

export enum AssignmentPriority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High'
}

export enum AssignmentType {
  ASSIGNMENT = 'Assignment',
  LAB = 'Lab',
  QUIZ = 'Quiz',
  MIDTERM = 'Midterm',
  FINAL = 'Final',
  OTHER = 'Other'
}

export interface Assignment {
  id: string;
  courseId: string;
  name: string;
  description: string;
  dueDate: string;
  isTBD?: boolean;
  weight: number; // Percentage of final grade (0-100)
  gradeReceived?: number; // Percentage (0-100)
  priority: AssignmentPriority;
  status: AssignmentStatus;
  type: AssignmentType;
  notes?: string;
  links?: { title: string; url: string }[];
}

export interface ClassSchedule {
  day: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';
  startTime: string; // Format "HH:mm" 24h
  endTime: string;   // Format "HH:mm" 24h
  location?: string;
}

export interface Course {
  id: string;
  name: string;
  code: string;
  color: string;
  targetGrade: number;
  credits: number;
  term?: string; // e.g., "Fall 2024"
  schedule?: ClassSchedule[];
}

export interface TrashedItem {
  id: string;
  type: 'course' | 'assignment';
  data: any;
  deletedAt: string;
}

export interface AppState {
  courses: Course[];
  assignments: Assignment[];
  trash: TrashedItem[];
  termStart?: string;
  termEnd?: string;
}