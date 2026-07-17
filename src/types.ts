/**
 * SOET Portal System Type Definitions
 */

export type UserRole = 'student' | 'faculty' | 'admin';

export interface BaseUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
}

export interface StudentProfile {
  id: string;
  enrollmentNo: string;
  fullName: string;
  email: string;
  dob: string;
  mobileNumber: string;
  bloodGroup: string;
  emergencyContact: string;
  program: string;
  branch: string;
  currentSemester: string;
  cgpa: number;
  admissionYear: number;
  hostel: string;
  roomNumber: string;
  transportRoute: string;
  classesAttended: number;
  totalClasses: number;
}

export interface Lecture {
  id: string;
  timeStart: string;
  timeEnd: string;
  courseTitle: string;
  facultyName: string;
  topic: string;
  hall: string;
  colorHex?: string;
}

export interface ExamPrepGoal {
  id: string;
  subject: string;
  progressPercent: number;
  focusArea: string;
}

export interface DocumentItem {
  id: string;
  name: string;
  lastUploaded: string;
  type: 'grade_report' | 'fee_receipt' | 'identity_card' | 'other';
  fileUrl?: string;
}

export interface SyllabusProgressItem {
  id: string;
  courseTitle: string;
  velocityLabel: string;
  velocityStatus: 'ahead' | 'behind' | 'on_schedule';
  currentProgress: number;
  targetProgress: number;
  currentUnit: string;
}

export interface AlertItem {
  id: string;
  studentName: string;
  attendancePercent: number;
  avatarUrl: string;
}

export interface GovernanceLogItem {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  status: 'synced' | 'pending';
}

export interface CourseProgress {
  courseCode: string;
  courseTitle: string;
  type: string;
  credits: number;
  attendancePercent: number;
  status: 'ON Track' | 'Warning';
}
