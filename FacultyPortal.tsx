import React, { useState, useEffect } from 'react';
import { AlertItem, SyllabusProgressItem, GovernanceLogItem } from '../types';
import { jsPDF } from 'jspdf';
import { motion, AnimatePresence } from 'motion/react';
import Header from './Header';
import { supabase } from '../lib/supabase';
import FacultyStudents from './FacultyStudents';
import { FacultyDashboardSkeleton, TableSkeleton } from './Skeletons';

interface FacultyPortalProps {
  user: any;
  onLogout: () => void;
}

interface StudentAttendance {
  id: string;
  rollNo: string;
  regNo: string;
  name: string;
  program: string;
  semester: string;
  status: 'present' | 'absent' | 'late';
  attendancePercentage: number;
  remarks: string;
}

interface GrievanceItem {
  id: string;
  studentName: string;
  rollNo: string;
  title: string;
  description: string;
  status: 'Pending' | 'Under Review' | 'Resolved' | 'Escalated';
  priority: 'High' | 'Medium' | 'Low';
  department: string;
  createdAt: string;
  replies: { author: string; role: string; text: string; timestamp: string }[];
  history: { status: string; updatedBy: string; timestamp: string; note: string }[];
}

// 60 Students generator helper
const generateStudents = (): StudentAttendance[] => {
  const firstNames = [
    "Rahul", "Piyush", "Amit", "Sanjay", "Arjun", "Vijay", "Anil", "Sunil", "Rajesh", "Deepak",
    "Priya", "Sneha", "Anjali", "Ritu", "Neha", "Kiran", "Meera", "Swati", "Aarti", "Pooja",
    "Aarav", "Kabir", "Ishaan", "Rohan", "Aditya", "Yash", "Vihaan", "Krishna", "Arnav", "Sai",
    "Felix", "Sarah", "John", "David", "Michael", "Emily", "Jessica", "James", "Robert", "William",
    "Vikram", "Gaurav", "Nitin", "Sandeep", "Karan", "Abhishek", "Vivek", "Rajnish", "Manish", "Alok",
    "Divya", "Kriti", "Shreya", "Nisha", "Ridhi", "Tanvi", "Kavya", "Preeti", "Richa", "Sonia"
  ];

  const lastNames = [
    "Sharma", "Singh", "Kumar", "Verma", "Gupta", "Patel", "Mehta", "Joshi", "Yadav", "Mishra",
    "Argyle", "Connor", "Smith", "Jones", "Taylor", "Brown", "Wilson", "Johnson", "Davis", "Miller",
    "Sinha", "Prasad", "Rao", "Nair", "Pillai", "Choudhury", "Reddy", "Sethi", "Bose", "Sen",
    "Mukherjee", "Chatterjee", "Banerjee", "Das", "Dutta", "Roy", "Paul", "Sarkar", "Garg", "Bansal",
    "Goel", "Agarwal", "Gupta", "Trivedi", "Dwivedi", "Pandey", "Chaubey", "Shukla", "Awasthi", "Dubey"
  ];

  return Array.from({ length: 60 }, (_, idx) => {
    const rollNo = (idx + 1).toString().padStart(2, '0');
    const regNo = `KRMU240${1000 + idx}`;
    const name = `${firstNames[idx % firstNames.length]} ${lastNames[idx % lastNames.length]}`;
    
    let status: 'present' | 'absent' | 'late' = 'present';
    if (idx === 11 || idx === 23) status = 'absent';
    else if (idx === 35 || idx === 47) status = 'late';
    
    let attPct = 85;
    if (idx === 11) attPct = 40; 
    else if (idx === 23) attPct = 72; 
    else if (idx === 35) attPct = 64; 
    else if (idx === 47) attPct = 68; 
    else attPct = Math.floor(Math.random() * 20) + 76;

    return {
      id: `student-${idx + 1}`,
      rollNo,
      regNo,
      name,
      program: idx % 2 === 0 ? "B.Tech CSE" : "B.Tech CSE (AI/ML)",
      semester: "Semester V",
      status,
      attendancePercentage: attPct,
      remarks: idx === 11 ? "Severe shortage" : idx === 23 ? "Borderline warning" : "Regular"
    };
  });
};

interface FacultyProfile {
  id: string;
  fullName: string;
  employeeId: string;
  designation: string;
  department: string;
  email: string;
  mobileNumber: string;
  joiningYear: number;
  employmentType: string;
  status: string;
  officeLocation: string;
  dob: string;
  gender: string;
  bloodGroup: string;
  address: string;
  emergencyContact: string;
  nationality: string;
  facultyCode: string;
  highestQualification: string;
  specialization: string;
  joiningDate: string;
  experience: string;
  reportingHead: string;
  officeHours: string;
  cabin: string;
  extension: string;
  availability: string;
}

interface AcademicResponsibility {
  courseCode: string;
  courseName: string;
  semester: string;
  section: string;
  studentsCount: number;
  credits: number;
  status: string;
}

interface ResearchPublication {
  id: string;
  title: string;
  researchArea: string;
  journal: string;
  publicationYear: number;
  citationCount: number;
}

interface LeaveBalance {
  type: string;
  total: number;
  used: number;
  remaining: number;
  color: string;
  bgColor: string;
  textColor: string;
}

interface LeaveRequest {
  id: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  emergencyContact: string;
  documentName?: string;
  halfDay: boolean;
  status: 'Pending' | 'Approved' | 'Rejected';
  appliedDate: string;
}

interface Lecture {
  id: string;
  subjectName: string;
  courseCode: string;
  section: string;
  classroom: string;
  building: string;
  startTime: string;
  endTime: string;
  dayOfWeek: string;
  semester: string;
  studentCount: number;
  resources: string[];
  isCurrent?: boolean;
  isNext?: boolean;
}

export default function FacultyPortal({ user, onLogout }: FacultyPortalProps) {
  // Navigation initially set to Dashboard (Faculty Home Page) as requested
  const [activeTab, _setActiveTab] = useState<'dashboard' | 'profile' | 'academics' | 'attendance' | 'grievance' | 'notification' | 'students'>('dashboard');
  const [tabLoading, setTabLoading] = useState(true);

  const setActiveTab = (tab: typeof activeTab) => {
    _setActiveTab(tab);
    const skeletonTabs = ['dashboard', 'attendance', 'grievance', 'notification', 'students'];
    if (skeletonTabs.includes(tab)) {
      setTabLoading(true);
      const timer = setTimeout(() => {
        setTabLoading(false);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setTabLoading(false);
    }
  };

  // Initial trigger
  useEffect(() => {
    setTabLoading(true);
    const timer = setTimeout(() => {
      setTabLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);
  
  const [searchValue, setSearchValue] = useState('');
  const [attendanceSearchQuery, setAttendanceSearchQuery] = useState('');
  const [grievanceSearch, setGrievanceSearch] = useState('');

  // Sync search input when activeTab or query changes
  useEffect(() => {
    if (activeTab === 'attendance') {
      setSearchValue(attendanceSearchQuery);
    } else if (activeTab === 'grievance') {
      setSearchValue(grievanceSearch);
    } else {
      setSearchValue('');
    }
  }, [activeTab, attendanceSearchQuery, grievanceSearch]);

  const handleSearchChangeUnified = (val: string) => {
    setSearchValue(val);
    if (activeTab === 'attendance') {
      setAttendanceSearchQuery(val);
    } else if (activeTab === 'grievance') {
      setGrievanceSearch(val);
    }
  };

  // Faculty dynamic connected ERP states
  const [facultyNotifications, setFacultyNotifications] = useState<any[]>([]);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);
  const [notifCategoryFilter, setNotifCategoryFilter] = useState('All');
  const [selectedNotif, setSelectedNotif] = useState<any | null>(null);
  
  const [facultyProfile, setFacultyProfile] = useState<FacultyProfile>({
    id: "fac-0142",
    fullName: "Dr. Elena Vance",
    employeeId: "FAC-2023-0142",
    designation: "Associate Professor",
    department: "Computer Science & Engineering",
    email: "elena.vance@krmu.edu.in",
    mobileNumber: "+91 98765 43210",
    joiningYear: 2023,
    employmentType: "Full Time",
    status: "Active",
    officeLocation: "Block C, Room 412",
    dob: "October 14, 1985",
    gender: "Female",
    bloodGroup: "A+",
    address: "Flat 504, Block 2, University Green Apartments, Gurugram, Haryana, India",
    emergencyContact: "+91 98765 43219 (Spouse - Dr. Gordon Vance)",
    nationality: "Indian",
    facultyCode: "CSE-EV-2023",
    highestQualification: "Ph.D. in Computer Science",
    specialization: "Distributed Systems & Cloud Computing",
    joiningDate: "July 15, 2023",
    experience: "12 Years",
    reportingHead: "Prof. Dr. Alan Grant (Dean, SOET)",
    officeHours: "Mon, Wed, Fri (02:00 PM - 04:00 PM)",
    cabin: "Cabin C-412A",
    extension: "Ext 2405",
    availability: "Available for Consultation",
    photoUrl: ""
  });

  // Custom event listener for shared profile updates
  useEffect(() => {
    const handleProfileUpdate = (e: Event) => {
      const updatedProfile = (e as CustomEvent).detail;
      if (updatedProfile && updatedProfile.id === user?.id) {
        setFacultyProfile(prev => prev ? { ...prev, ...updatedProfile } : updatedProfile);
      }
    };
    window.addEventListener('soet-profile-updated', handleProfileUpdate);
    return () => {
      window.removeEventListener('soet-profile-updated', handleProfileUpdate);
    };
  }, [user]);

  // Load faculty profile from Supabase on mount for synchronization
  useEffect(() => {
    const fetchFacultyProfile = async () => {
      try {
        const { data, error } = await supabase.from('faculty').select('*').eq('id', user.id).single();
        if (data && !error) {
          setFacultyProfile(prev => ({ ...prev, ...data }));
        }
      } catch (err) {
        console.warn("Could not sync faculty profile from Supabase:", err);
      }
    };
    fetchFacultyProfile();
  }, [user]);

  const [responsibilities, setResponsibilities] = useState<AcademicResponsibility[]>([
    {
      courseCode: "CS601",
      courseName: "Distributed Systems",
      semester: "Semester 5",
      section: "Section A",
      studentsCount: 60,
      credits: 4,
      status: "Active"
    },
    {
      courseCode: "CS402",
      courseName: "Operating Systems",
      semester: "Semester 3",
      section: "Section C",
      studentsCount: 72,
      credits: 3,
      status: "Active"
    },
    {
      courseCode: "CS702",
      courseName: "Advanced Computer Architecture",
      semester: "Semester 7",
      section: "Section B",
      studentsCount: 55,
      credits: 4,
      status: "Active"
    },
    {
      courseCode: "CS301",
      courseName: "Database Management Systems",
      semester: "Semester 3",
      section: "Section A",
      studentsCount: 65,
      credits: 4,
      status: "Active"
    }
  ]);

  const [publications, setPublications] = useState<ResearchPublication[]>([
    {
      id: "pub-1",
      title: "Decentralized Resource Allocation in Edge Networks",
      researchArea: "Distributed Systems",
      journal: "IEEE Transactions on Parallel and Distributed Systems",
      publicationYear: 2025,
      citationCount: 24
    },
    {
      id: "pub-2",
      title: "Fault-Tolerant Consensus Mechanisms for Hybrid Blockchains",
      researchArea: "Blockchain & Consensus",
      journal: "Springer Journal of Cloud Computing",
      publicationYear: 2024,
      citationCount: 18
    },
    {
      id: "pub-3",
      title: "Dynamic Load Balancing in Cloud-Native Serverless Architectures",
      researchArea: "Cloud Computing",
      journal: "ACM Transactions on Internet Technology",
      publicationYear: 2023,
      citationCount: 35
    }
  ]);

  const handleDownloadPDF = (type: string) => {
    const doc = new jsPDF();
    
    // Header banner
    doc.setFillColor(158, 27, 50); // Brand Red
    doc.rect(0, 0, 210, 40, "F");
    
    // Logo text
    doc.setTextColor(255, 255, 255);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(16);
    doc.text("K.R. MANGALAM UNIVERSITY", 14, 20);
    doc.setFontSize(10);
    doc.setFont("Helvetica", "normal");
    doc.text("SCHOOL OF ENGINEERING & TECHNOLOGY | FACULTY PORTAL", 14, 28);
    
    // Content based on type
    doc.setTextColor(33, 37, 41);
    
    if (type === 'profile') {
      doc.setFontSize(14);
      doc.setFont("Helvetica", "bold");
      doc.text("OFFICIAL FACULTY PROFILE RECORD", 14, 55);
      
      doc.setDrawColor(220, 224, 230);
      doc.line(14, 58, 196, 58);
      
      doc.setFontSize(10);
      let y = 70;
      const drawField = (label: string, value: string) => {
        doc.setFont("Helvetica", "bold");
        doc.text(label, 14, y);
        doc.setFont("Helvetica", "normal");
        doc.text(value, 65, y);
        y += 10;
      };
      
      drawField("Full Name:", facultyProfile.fullName);
      drawField("Employee ID:", facultyProfile.employeeId);
      drawField("Designation:", facultyProfile.designation);
      drawField("Department:", facultyProfile.department);
      drawField("Email Address:", facultyProfile.email);
      drawField("Mobile Number:", facultyProfile.mobileNumber);
      drawField("Highest Qualification:", facultyProfile.highestQualification);
      drawField("Specialization:", facultyProfile.specialization);
      drawField("Joining Year:", String(facultyProfile.joiningYear));
      drawField("Employment Type:", facultyProfile.employmentType);
      drawField("Office Location:", facultyProfile.officeLocation);
      drawField("Faculty Code:", facultyProfile.facultyCode);
      
      y += 10;
      doc.setFont("Helvetica", "bold");
      doc.text("Academic Responsibilities (Assigned Courses):", 14, y);
      y += 8;
      doc.setFont("Helvetica", "normal");
      responsibilities.forEach((resp) => {
        doc.text(`- ${resp.courseCode}: ${resp.courseName} (${resp.semester}, ${resp.section}, ${resp.studentsCount} Students)`, 20, y);
        y += 6;
      });
      
      doc.save(`Faculty_Profile_${facultyProfile.fullName.replace(/ /g, "_")}.pdf`);
    } else if (type === 'workload') {
      doc.setFontSize(14);
      doc.setFont("Helvetica", "bold");
      doc.text("FACULTY WORKLOAD SUMMARY REPORT", 14, 55);
      
      doc.setDrawColor(220, 224, 230);
      doc.line(14, 58, 196, 58);
      
      doc.setFontSize(10);
      let y = 70;
      const drawField = (label: string, value: string) => {
        doc.setFont("Helvetica", "bold");
        doc.text(label, 14, y);
        doc.setFont("Helvetica", "normal");
        doc.text(value, 65, y);
        y += 10;
      };
      
      drawField("Faculty Name:", facultyProfile.fullName);
      drawField("Employee ID:", facultyProfile.employeeId);
      drawField("Department:", facultyProfile.department);
      drawField("Academic Session:", "2026-2027 (Odd Semester)");
      drawField("Total Teaching Hours:", "18 Hours / Week");
      drawField("Assigned Courses:", `${responsibilities.length} Active Courses`);
      drawField("Active Research Projects:", "3 Approved Projects");
      drawField("Administrative Duties:", "Academic Advisor, CSE Department");
      
      doc.save("Faculty_Workload_Report.pdf");
    } else if (type === 'performance') {
      doc.setFontSize(14);
      doc.setFont("Helvetica", "bold");
      doc.text("FACULTY PERFORMANCE & EVALUATION REPORT", 14, 55);
      
      doc.setDrawColor(220, 224, 230);
      doc.line(14, 58, 196, 58);
      
      doc.setFontSize(10);
      let y = 70;
      const drawField = (label: string, value: string) => {
        doc.setFont("Helvetica", "bold");
        doc.text(label, 14, y);
        doc.setFont("Helvetica", "normal");
        doc.text(value, 65, y);
        y += 10;
      };
      
      drawField("Faculty Name:", facultyProfile.fullName);
      drawField("Employee ID:", facultyProfile.employeeId);
      drawField("Average Class Attendance:", "88.5%");
      drawField("Student Feedback Rating:", "4.8 / 5.0");
      drawField("Research Publications count:", `${publications.length} Papers`);
      drawField("Average Syllabus Completion:", "92% (On Track)");
      drawField("Assigned Classes Conducted:", "42 Conducted / 45 Scheduled");
      drawField("Overall Performance Score:", "Outstanding (Grade A+)");
      
      doc.save("Faculty_Performance_Report.pdf");
    } else if (type === 'id-card') {
      const card = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: [100, 60]
      });
      
      card.setFillColor(158, 27, 50);
      card.rect(0, 0, 100, 12, "F");
      
      card.setTextColor(255, 255, 255);
      card.setFontSize(7);
      card.setFont("Helvetica", "bold");
      card.text("K.R. MANGALAM UNIVERSITY", 5, 5);
      card.setFontSize(4);
      card.setFont("Helvetica", "normal");
      card.text("SCHOOL OF ENGINEERING & TECHNOLOGY | FACULTY ID", 5, 9);
      
      card.setFillColor(240, 240, 240);
      card.rect(75, 18, 18, 22, "F");
      card.setTextColor(150, 150, 150);
      card.setFontSize(5);
      card.text("PHOTO", 80, 29);
      
      card.setTextColor(33, 37, 41);
      card.setFontSize(7);
      card.setFont("Helvetica", "bold");
      card.text(facultyProfile.fullName, 5, 20);
      
      card.setFontSize(5);
      card.setFont("Helvetica", "normal");
      card.text(`Employee ID: ${facultyProfile.employeeId}`, 5, 25);
      card.text(`Designation: ${facultyProfile.designation}`, 5, 29);
      card.text(`Department: CSE`, 5, 33);
      card.text(`Email: ${facultyProfile.email}`, 5, 37);
      card.text(`Blood Group: ${facultyProfile.bloodGroup}`, 5, 41);
      
      card.setFillColor(158, 27, 50);
      card.rect(0, 54, 100, 6, "F");
      card.setTextColor(255, 255, 255);
      card.setFontSize(4);
      card.text("VALID TILL: JUNE 2029", 5, 58);
      
      card.save(`Faculty_ID_Card_${facultyProfile.fullName.replace(/ /g, "_")}.pdf`);
    }
  };
  const [profileSubView, setProfileSubView] = useState<'main' | 'timetable' | 'leave' | 'edit-profile' | 'apply-leave'>('main');

  const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>([
    { type: "Casual Leave", total: 12, used: 4, remaining: 8, color: "bg-[#9e1b32]", bgColor: "bg-red-50/50", textColor: "text-[#9e1b32]" },
    { type: "Sick Leave", total: 12, used: 0, remaining: 12, color: "bg-green-600", bgColor: "bg-green-50/50", textColor: "text-green-700" },
    { type: "Earned Leave", total: 20, used: 0, remaining: 20, color: "bg-blue-600", bgColor: "bg-blue-50/50", textColor: "text-blue-700" },
    { type: "Maternity/Paternity Leave", total: 180, used: 0, remaining: 180, color: "bg-amber-500", bgColor: "bg-amber-50/50", textColor: "text-amber-700" }
  ]);

  const [leaveHistory, setLeaveHistory] = useState<LeaveRequest[]>([
    {
      id: "LV-2026-004",
      leaveType: "Casual Leave",
      startDate: "2026-04-10",
      endDate: "2026-04-11",
      days: 2,
      reason: "Attending family wedding",
      emergencyContact: "+91 98765 43219",
      halfDay: false,
      status: "Approved",
      appliedDate: "2026-04-05"
    },
    {
      id: "LV-2026-003",
      leaveType: "Casual Leave",
      startDate: "2026-03-14",
      endDate: "2026-03-14",
      days: 1,
      reason: "Personal urgent work",
      emergencyContact: "+91 98765 43219",
      halfDay: false,
      status: "Approved",
      appliedDate: "2026-03-12"
    },
    {
      id: "LV-2026-002",
      leaveType: "Casual Leave",
      startDate: "2026-02-18",
      endDate: "2026-02-18",
      days: 1,
      reason: "Routine medical checkup",
      emergencyContact: "+91 98765 43219",
      halfDay: false,
      status: "Approved",
      appliedDate: "2026-02-15"
    },
    {
      id: "LV-2026-001",
      leaveType: "Sick Leave",
      startDate: "2026-01-05",
      endDate: "2026-01-06",
      days: 2,
      reason: "Viral fever and doctor-advised rest",
      emergencyContact: "+91 98765 43219",
      halfDay: false,
      status: "Rejected",
      appliedDate: "2026-01-04"
    }
  ]);

  const [timetableLectures, setTimetableLectures] = useState<Lecture[]>([
    {
      id: "lec-1",
      subjectName: "Distributed Systems",
      courseCode: "CS601",
      section: "Section A",
      classroom: "Room 412",
      building: "Block C",
      startTime: "09:00 AM",
      endTime: "10:15 AM",
      dayOfWeek: "Monday",
      semester: "Semester V",
      studentCount: 60,
      resources: ["Syllabus.pdf", "Lecture 1 Slides.pptx", "Lab Manual - Socket Programming.pdf"]
    },
    {
      id: "lec-2",
      subjectName: "Operating Systems",
      courseCode: "CS402",
      section: "Section C",
      classroom: "Lab 3 (Second Floor)",
      building: "Block C",
      startTime: "10:30 AM",
      endTime: "12:00 PM",
      dayOfWeek: "Monday",
      semester: "Semester III",
      studentCount: 72,
      resources: ["OS Course Outline.pdf", "Lecture 2 - Processes and Threads.pdf"]
    },
    {
      id: "lec-3",
      subjectName: "Advanced Computer Architecture",
      courseCode: "CS702",
      section: "Section B",
      classroom: "Room 102",
      building: "Block A",
      startTime: "01:30 PM",
      endTime: "03:00 PM",
      dayOfWeek: "Monday",
      semester: "Semester VII",
      studentCount: 55,
      resources: ["ACA Syllabus.pdf", "Pipelining Slides.pdf"]
    },
    {
      id: "lec-4",
      subjectName: "Database Management Systems",
      courseCode: "CS301",
      section: "Section A",
      classroom: "Room 415",
      building: "Block C",
      startTime: "09:00 AM",
      endTime: "10:15 AM",
      dayOfWeek: "Tuesday",
      semester: "Semester III",
      studentCount: 65,
      resources: ["DBMS Syllabus.pdf", "ER Diagrams.pdf"]
    },
    {
      id: "lec-5",
      subjectName: "Distributed Systems",
      courseCode: "CS601",
      section: "Section A",
      classroom: "Room 412",
      building: "Block C",
      startTime: "11:00 AM",
      endTime: "12:15 PM",
      dayOfWeek: "Tuesday",
      semester: "Semester V",
      studentCount: 60,
      resources: ["Lecture 3 - Distributed Consensus.pdf"]
    },
    {
      id: "lec-6",
      subjectName: "Operating Systems",
      courseCode: "CS402",
      section: "Section C",
      classroom: "Lab 3 (Second Floor)",
      building: "Block C",
      startTime: "10:30 AM",
      endTime: "12:00 PM",
      dayOfWeek: "Wednesday",
      semester: "Semester III",
      studentCount: 72,
      resources: ["Lab Exercise 1 - System Calls.pdf"]
    },
    {
      id: "lec-7",
      subjectName: "Advanced Computer Architecture",
      courseCode: "CS702",
      section: "Section B",
      classroom: "Room 102",
      building: "Block A",
      startTime: "02:00 PM",
      endTime: "03:30 PM",
      dayOfWeek: "Wednesday",
      semester: "Semester VII",
      studentCount: 55,
      resources: ["Instruction Level Parallelism.pdf"]
    },
    {
      id: "lec-8",
      subjectName: "Database Management Systems",
      courseCode: "CS301",
      section: "Section A",
      classroom: "Room 415",
      building: "Block C",
      startTime: "09:00 AM",
      endTime: "10:15 AM",
      dayOfWeek: "Thursday",
      semester: "Semester III",
      studentCount: 65,
      resources: ["SQL Queries Handout.pdf"]
    },
    {
      id: "lec-9",
      subjectName: "Distributed Systems",
      courseCode: "CS601",
      section: "Section A",
      classroom: "Room 412",
      building: "Block C",
      startTime: "01:30 PM",
      endTime: "03:00 PM",
      dayOfWeek: "Thursday",
      semester: "Semester V",
      studentCount: 60,
      resources: ["Virtualization in Cloud.pptx"]
    },
    {
      id: "lec-10",
      subjectName: "Operating Systems",
      courseCode: "CS402",
      section: "Section C",
      classroom: "Lab 3 (Second Floor)",
      building: "Block C",
      startTime: "09:30 AM",
      endTime: "11:00 AM",
      dayOfWeek: "Friday",
      semester: "Semester III",
      studentCount: 72,
      resources: ["Deadlocks.pdf"],
      isCurrent: true
    },
    {
      id: "lec-11",
      subjectName: "Advanced Computer Architecture",
      courseCode: "CS702",
      section: "Section B",
      classroom: "Room 102",
      building: "Block A",
      startTime: "11:15 AM",
      endTime: "12:45 PM",
      dayOfWeek: "Friday",
      semester: "Semester VII",
      studentCount: 55,
      resources: ["Memory Hierarchy.pdf"],
      isNext: true
    }
  ]);

  const [selectedLecture, setSelectedLecture] = useState<Lecture | null>(null);
  const [lectureModalOpen, setLectureModalOpen] = useState(false);
  const [timetableFilter, setTimetableFilter] = useState<'today' | 'tomorrow' | 'week'>('today');
  const [timetableActiveView, setTimetableActiveView] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  const [leaveSearch, setLeaveSearch] = useState('');
  const [leaveYearFilter, setLeaveYearFilter] = useState('All');

  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [syllabusList, setSyllabusList] = useState<SyllabusProgressItem[]>([]);
  const [logs, setLogs] = useState<GovernanceLogItem[]>([]);
  
  // Interactive Attendance Registry
  const [students, setStudents] = useState<StudentAttendance[]>(() => generateStudents());
  const [selectedSubject, setSelectedSubject] = useState("CS-601: Distributed Systems");
  const [selectedSection, setSelectedSection] = useState("Section A");
  const [selectedDate, setSelectedDate] = useState("2026-07-03");
  const [selectedPeriod, setSelectedPeriod] = useState("Period 1 (09:00 AM - 10:30 AM)");
  const [attendanceFilter, setAttendanceFilter] = useState<'all' | 'present' | 'absent' | 'late'>('all');
  
  // Upload status and logs
  const [uploadStatus, setUploadStatus] = useState<'pending' | 'success'>('pending');
  const [lastUploadedTime, setLastUploadedTime] = useState<string | null>(null);

  // Sync state
  const [syncStatus, setSyncStatus] = useState<'Active' | 'Syncing' | 'Synced'>('Active');
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Modals state
  const [riskModalOpen, setRiskModalOpen] = useState(false);
  const [noticeModalOpen, setNoticeModalOpen] = useState(false);
  const [selectedNoticeStudent, setSelectedNoticeStudent] = useState<any>({
    studentName: 'Rahul Sharma',
    rollNo: '2401730288',
    attendancePercent: 40,
    phone: '+91 98765 43210'
  });

  // Critical Alerts list (No profile image, extra fields)
  const [criticalAlerts, setCriticalAlerts] = useState([
    { id: 'alert-1', studentName: 'Rahul Sharma', rollNo: '2401730288', phone: '+91 98765 43210', attendancePercent: 40, reason: 'Severe attendance shortage' },
    { id: 'alert-2', studentName: 'Felix Argyle', rollNo: '2401730035', phone: '+91 99123 45678', attendancePercent: 64, reason: 'Irregular attendance pattern' },
    { id: 'alert-3', studentName: 'Sarah Connor', rollNo: '2401730047', phone: '+91 98111 22233', attendancePercent: 68, reason: 'Below examination threshold' }
  ]);

  // Risk registry students (Exactly 12 students)
  const [riskStudents, setRiskStudents] = useState([
    { rollNo: '12', name: 'Rahul Sharma', department: 'CSE', semester: 'Semester V', attendancePercent: 40, riskLevel: 'High', parentContact: '+91 98765 43210', lastNotice: 'June 15, 2026', remark: 'Critically low attendance.' },
    { rollNo: '35', name: 'Felix Argyle', department: 'CSE (AI/ML)', semester: 'Semester V', attendancePercent: 64, riskLevel: 'High', parentContact: '+91 99123 45678', lastNotice: 'June 10, 2026', remark: 'Irregular attendance.' },
    { rollNo: '47', name: 'Sarah Connor', department: 'CSE', semester: 'Semester V', attendancePercent: 68, riskLevel: 'Medium', parentContact: '+91 98111 22233', lastNotice: 'June 20, 2026', remark: 'Medical leave.' },
    { rollNo: '24', name: 'Amit Verma', department: 'CSE', semester: 'Semester V', attendancePercent: 72, riskLevel: 'Medium', parentContact: '+91 98765 11111', lastNotice: 'None', remark: 'Borderline attendance.' },
    { rollNo: '08', name: 'Sanjay Joshi', department: 'CSE', semester: 'Semester V', attendancePercent: 71, riskLevel: 'Medium', parentContact: '+91 98765 22222', lastNotice: 'None', remark: 'Needs encouragement.' },
    { rollNo: '19', name: 'Priya Patel', department: 'CSE (AI/ML)', semester: 'Semester V', attendancePercent: 69, riskLevel: 'High', parentContact: '+91 98765 33333', lastNotice: 'June 12, 2026', remark: 'Frequently late.' },
    { rollNo: '30', name: 'Sneha Gupta', department: 'CSE', semester: 'Semester V', attendancePercent: 74, riskLevel: 'Medium', parentContact: '+91 98765 44444', lastNotice: 'None', remark: 'Borderline attendance.' },
    { rollNo: '42', name: 'Anjali Choudhury', department: 'CSE (AI/ML)', semester: 'Semester V', attendancePercent: 73, riskLevel: 'Medium', parentContact: '+91 98765 55555', lastNotice: 'None', remark: 'Irregular attendance.' },
    { rollNo: '15', name: 'Vijay Nair', department: 'CSE', semester: 'Semester V', attendancePercent: 55, riskLevel: 'High', parentContact: '+91 98765 66666', lastNotice: 'June 05, 2026', remark: 'Persistent absence.' },
    { rollNo: '27', name: 'Rajesh Sethi', department: 'CSE (AI/ML)', semester: 'Semester V', attendancePercent: 63, riskLevel: 'High', parentContact: '+91 98765 77777', lastNotice: 'June 18, 2026', remark: 'Shortage of attendance.' },
    { rollNo: '51', name: 'Deepak Sinha', department: 'CSE', semester: 'Semester V', attendancePercent: 70, riskLevel: 'Medium', parentContact: '+91 98765 88888', lastNotice: 'None', remark: 'Needs improvement.' },
    { rollNo: '58', name: 'Kiran Pillai', department: 'CSE (AI/ML)', semester: 'Semester V', attendancePercent: 72, riskLevel: 'Medium', parentContact: '+91 98765 99999', lastNotice: 'None', remark: 'Borderline case.' }
  ]);

  // Grievance Portal Data
  const [grievances, setGrievances] = useState<GrievanceItem[]>([
    {
      id: 'grievance-1',
      studentName: 'Piyush Singh',
      rollNo: '2401730018',
      title: 'Attendance calculation issue in Unit 3',
      description: 'My attendance for 25th June was marked absent but I was present and submitted the assignment on time. Kindly rectify.',
      status: 'Pending',
      priority: 'Medium',
      department: 'CSE (AI/ML)',
      createdAt: '2026-07-01T10:30:00Z',
      replies: [],
      history: [
        { status: 'Pending', updatedBy: 'System', timestamp: '2026-07-01 10:30 AM', note: 'Grievance submitted by student.' }
      ]
    },
    {
      id: 'grievance-2',
      studentName: 'Rahul Sharma',
      rollNo: '2401730288',
      title: 'Examination eligibility warning notice',
      description: 'Received warning notice for 40% attendance. I was on medical leave due to typhoid and have submitted medical certificates to the department.',
      status: 'Under Review',
      priority: 'High',
      department: 'CSE',
      createdAt: '2026-06-28T09:15:00Z',
      replies: [
        { author: 'Dr. Elena Vance', role: 'Faculty', text: 'Please upload your medical clearance certificate to the document wallet for registrar verification.', timestamp: 'June 29, 2026, 11:00 AM' }
      ],
      history: [
        { status: 'Pending', updatedBy: 'System', timestamp: '2026-06-28 09:15 AM', note: 'Grievance submitted.' },
        { status: 'Under Review', updatedBy: 'Dr. Elena Vance', timestamp: '2026-06-29 11:00 AM', note: 'Status changed to Under Review. Reply sent.' }
      ]
    },
    {
      id: 'grievance-3',
      studentName: 'Sarah Connor',
      rollNo: '2401730047',
      title: 'Syllabus velocity concern for Network Security',
      description: 'The lectures for Network Security are running behind schedule and we need extra doubt clearing classes before the mid-semester exams.',
      status: 'Resolved',
      priority: 'Low',
      department: 'CSE',
      createdAt: '2026-06-25T14:20:00Z',
      replies: [
        { author: 'Dr. Elena Vance', role: 'Faculty', text: 'Extra sessions scheduled for Saturdays at 10:00 AM. Resolved.', timestamp: 'June 26, 2026, 03:00 PM' }
      ],
      history: [
        { status: 'Pending', updatedBy: 'System', timestamp: '2026-06-25 02:20 PM', note: 'Grievance submitted.' },
        { status: 'Resolved', updatedBy: 'Dr. Elena Vance', timestamp: '2026-06-26 03:00 PM', note: 'Marked as Resolved. Extra sessions scheduled.' }
      ]
    },
    {
      id: 'grievance-4',
      studentName: 'Felix Argyle',
      rollNo: '2401730035',
      title: 'Lab system login credentials issue',
      description: 'Unable to login to the GPU laboratory server with my current KRMU credentials. Kindly reset the LDAP sync.',
      status: 'Escalated',
      priority: 'High',
      department: 'CSE (AI/ML)',
      createdAt: '2026-06-30T11:45:00Z',
      replies: [
        { author: 'Dr. Elena Vance', role: 'Faculty', text: 'Escalated to IT Helpdesk and System Administrator.', timestamp: 'July 01, 2026, 09:30 AM' }
      ],
      history: [
        { status: 'Pending', updatedBy: 'System', timestamp: '2026-06-30 11:45 AM', note: 'Grievance submitted.' },
        { status: 'Escalated', updatedBy: 'Dr. Elena Vance', timestamp: '2026-07-01 09:30 AM', note: 'Escalated to administrative IT helpdesk.' }
      ]
    }
  ]);

  const [grievanceStatusFilter, setGrievanceStatusFilter] = useState<'All' | 'Pending' | 'Under Review' | 'Resolved' | 'Escalated'>('All');
  const [grievancePriorityFilter, setGrievancePriorityFilter] = useState<'All' | 'High' | 'Medium' | 'Low'>('All');
  const [selectedGrievanceId, setSelectedGrievanceId] = useState<string | null>('grievance-1');
  const [grievanceReplyText, setGrievanceReplyText] = useState('');

  const selectedGrievance = grievances.find(g => g.id === selectedGrievanceId);

  const filteredGrievances = grievances.filter(g => {
    const matchesSearch = g.studentName.toLowerCase().includes(grievanceSearch.toLowerCase()) || 
                          g.title.toLowerCase().includes(grievanceSearch.toLowerCase()) ||
                          g.description.toLowerCase().includes(grievanceSearch.toLowerCase());
    const matchesStatus = grievanceStatusFilter === 'All' || g.status === grievanceStatusFilter;
    const matchesPriority = grievancePriorityFilter === 'All' || g.priority === grievancePriorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Load stats on boot
  useEffect(() => {
    async function loadStats() {
      try {
        const alertsRes = await fetch('/api/faculty/alerts');
        const alertsData = await alertsRes.json();
        if (alertsData && alertsData.length > 0) {
          // Keep additional fields
          const merged = alertsData.map((al: any, idx: number) => ({
            ...al,
            phone: idx === 0 ? '+91 98765 43210' : idx === 1 ? '+91 99123 45678' : '+91 98111 22233',
            reason: idx === 0 ? 'Severe attendance shortage' : idx === 1 ? 'Irregular attendance pattern' : 'Below examination threshold'
          }));
          setAlerts(merged);
        }

        const syllabusRes = await fetch('/api/faculty/syllabus');
        const syllabusData = await syllabusRes.json();
        setSyllabusList(syllabusData);

        const logsRes = await fetch('/api/faculty/logs');
        const logsData = await logsRes.json();
        setLogs(logsData);
      } catch (err) {
        console.error("Error loading faculty statistics:", err);
      }
    }
    loadStats();
    syncERPData();
    const interval = setInterval(syncERPData, 10000);
    return () => clearInterval(interval);
  }, []);

  const totalPresent = students.filter(s => s.status === 'present').length;

  // Toggle dynamic box status (Present -> Absent -> Late -> Present)
  const cycleStudentStatus = (id: string) => {
    setStudents(prev => prev.map(s => {
      if (s.id === id) {
        let nextStatus: 'present' | 'absent' | 'late' = 'present';
        if (s.status === 'present') nextStatus = 'absent';
        else if (s.status === 'absent') nextStatus = 'late';
        return { ...s, status: nextStatus };
      }
      return s;
    }));
  };

  const updateStudentStatus = (id: string, status: 'present' | 'absent' | 'late') => {
    setStudents(prev => prev.map(s => (s.id === id ? { ...s, status } : s)));
  };

  const markAllPresent = () => {
    setStudents(prev => prev.map(s => ({ ...s, status: 'present' })));
  };

  const markAllAbsent = () => {
    setStudents(prev => prev.map(s => ({ ...s, status: 'absent' })));
  };

  const resetSession = () => {
    setStudents(generateStudents());
  };

  // Upload attendance to backend
  const handleUploadAttendance = async () => {
    setActionMessage("Saving attendance registry to Supabase backend...");
    try {
      const res = await fetch('/api/faculty/attendance/finalize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          totalPresent,
          totalStudents: 60,
          course: "CS-601 Section A"
        }),
      });

      const data = await res.json();
      if (data.success) {
        setLogs(data.logs);
        setUploadStatus('success');
        setLastUploadedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ", Today");
        setActionMessage(`Successfully finalized! ${totalPresent}/60 students marked. Activity synced to governance log.`);
        setTimeout(() => setActionMessage(null), 5000);
      }
    } catch (err) {
      console.error(err);
      setActionMessage("Failed to sync attendance.");
    }
  };

  // Sync state
  const handleForceSync = () => {
    setSyncStatus('Syncing');
    setActionMessage("Performing forced state synchronization with Supabase Realtime...");
    setTimeout(() => {
      setSyncStatus('Synced');
      setActionMessage("Sync complete. Local logs, critical alerts and syllabus structures are fully updated.");
      setTimeout(() => {
        setSyncStatus('Active');
        setActionMessage(null);
      }, 3000);
    }, 1500);
  };

  // PDF report generation
  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(26, 54, 93); 
    doc.text("K.R. MANGALAM UNIVERSITY", 14, 20);
    
    doc.setFontSize(13);
    doc.setTextColor(100, 116, 139);
    doc.text("SOET Faculty Portal — Class Attendance Registry & Report", 14, 28);
    
    doc.setFontSize(10);
    doc.setTextColor(51, 65, 85);
    doc.setFont("Helvetica", "bold");
    doc.text(`Faculty Name:`, 14, 38);
    doc.setFont("Helvetica", "normal");
    doc.text(`Dr. Elena Vance`, 42, 38);
    
    doc.setFont("Helvetica", "bold");
    doc.text(`Course / Subject:`, 14, 44);
    doc.setFont("Helvetica", "normal");
    doc.text(selectedSubject, 42, 44);
    
    doc.setFont("Helvetica", "bold");
    doc.text(`Section & Period:`, 14, 50);
    doc.setFont("Helvetica", "normal");
    doc.text(`${selectedSection} | ${selectedPeriod}`, 42, 50);

    doc.setFont("Helvetica", "bold");
    doc.text(`Date of Registry:`, 110, 38);
    doc.setFont("Helvetica", "normal");
    doc.text(selectedDate, 145, 38);

    doc.setFont("Helvetica", "bold");
    doc.text(`Export Timestamp:`, 110, 44);
    doc.setFont("Helvetica", "normal");
    doc.text(new Date().toLocaleString(), 145, 44);

    const present = students.filter(s => s.status === 'present').length;
    const absent = students.filter(s => s.status === 'absent').length;
    const late = students.filter(s => s.status === 'late').length;
    const avgAtt = (students.reduce((acc, s) => acc + s.attendancePercentage, 0) / students.length).toFixed(1);
    
    doc.setFont("Helvetica", "bold");
    doc.text(`Summary statistics:`, 110, 50);
    doc.setFont("Helvetica", "normal");
    doc.text(`P: ${present} | A: ${absent} | L: ${late} (Total: ${students.length}) | Avg: ${avgAtt}%`, 145, 50);

    doc.setDrawColor(226, 232, 240);
    doc.line(14, 55, 196, 55);

    doc.setFillColor(241, 245, 249);
    doc.rect(14, 60, 182, 8, "F");
    
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(30, 41, 59);
    doc.text("Roll", 16, 65);
    doc.text("Reg Number", 28, 65);
    doc.text("Student Name", 55, 65);
    doc.text("Program", 95, 65);
    doc.text("Status", 135, 65);
    doc.text("Term %", 155, 65);
    doc.text("Remarks", 170, 65);

    let y = 74;
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(8);
    
    students.forEach((student, idx) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
        doc.setFillColor(241, 245, 249);
        doc.rect(14, y - 5, 182, 8, "F");
        doc.setFont("Helvetica", "bold");
        doc.text("Roll", 16, y);
        doc.text("Reg Number", 28, y);
        doc.text("Student Name", 55, y);
        doc.text("Program", 95, y);
        doc.text("Status", 135, y);
        doc.text("Term %", 155, y);
        doc.text("Remarks", 170, y);
        doc.setFont("Helvetica", "normal");
        y += 8;
      }

      if (idx % 2 === 1) {
        doc.setFillColor(248, 250, 252);
        doc.rect(14, y - 4, 182, 6, "F");
      }

      doc.setTextColor(51, 65, 85);
      doc.text(student.rollNo, 16, y);
      doc.text(student.regNo, 28, y);
      doc.text(student.name, 55, y);
      doc.text(student.program, 95, y);
      
      if (student.status === 'present') {
        doc.setTextColor(21, 128, 61);
        doc.text("PRESENT", 135, y);
      } else if (student.status === 'absent') {
        doc.setTextColor(220, 38, 38);
        doc.text("ABSENT", 135, y);
      } else {
        doc.setTextColor(180, 83, 9);
        doc.text("LATE", 135, y);
      }
      
      doc.setTextColor(51, 65, 85);
      doc.text(`${student.attendancePercentage}%`, 155, y);
      doc.text(student.remarks, 170, y);

      y += 6;
    });

    if (y > 250) {
      doc.addPage();
      y = 30;
    }
    
    doc.setDrawColor(226, 232, 240);
    doc.line(14, y + 10, 196, y + 10);
    
    y += 25;
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(9);
    doc.text("Faculty Signature:", 14, y);
    doc.setFont("Helvetica", "normal");
    doc.text("__________________________", 14, y + 5);
    doc.text("Dr. Elena Vance", 14, y + 10);
    doc.text("Associate Professor, CSE", 14, y + 15);

    doc.setFont("Helvetica", "bold");
    doc.text("Institutional Verification:", 120, y);
    doc.setFont("Helvetica", "normal");
    doc.text("__________________________", 120, y + 5);
    doc.text("Registrar's Office, SOET", 120, y + 10);
    doc.text("K.R. Mangalam University", 120, y + 15);

    doc.save(`Attendance_Report_${selectedSubject.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`);
  };

  // Parent Notices Utilities
  const generateNoticeText = (name: string, roll: string, percent: number) => {
    if (percent <= 40) {
      return `Dear Parent,\n\nThis is to inform you that your ward, ${name} (Roll No. ${roll}), currently has an attendance of only ${percent}%.\n\nAs per university regulations, attendance below the required percentage may make the student ineligible for examinations.\n\nKindly ensure regular attendance in upcoming classes.\n\nRegards,\nFaculty Advisor\nSchool of Engineering & Technology\nK.R. Mangalam University`;
    } else {
      return `Dear Parent,\n\nThis is to inform you that your ward, ${name} (Roll No. ${roll}), currently has an attendance of ${percent}%.\n\nWhile attendance is improving, it is still below the university's required threshold.\n\nPlease encourage regular attendance.\n\nRegards,\nFaculty Advisor\nSchool of Engineering & Technology\nK.R. Mangalam University`;
    }
  };

  const handleCopyNotice = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Notice copied to clipboard!");
  };

  const handleDownloadNotice = (name: string, text: string) => {
    const blob = new Blob([text], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Notice_Parents_${name.replace(/ /g, "_")}.txt`;
    link.click();
  };

  const handlePrintNotice = (text: string) => {
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(`<pre style="font-family: sans-serif; padding: 24px; line-height: 1.6; font-size: 14px;">${text}</pre>`);
      win.document.close();
      win.print();
    }
  };

  const syncERPData = async () => {
    try {
      const gRes = await fetch('/api/grievances');
      const gData = await gRes.json();
      setGrievances(gData);

      const nRes = await fetch('/api/notifications');
      const nData = await nRes.json();
      setFacultyNotifications(nData);

      const unreadCount = nData.filter((notif: any) => !notif.readBy.includes('fac-0142')).length;
      setUnreadNotifCount(unreadCount);
    } catch (err) {
      console.error("Error syncing Faculty ERP:", err);
    }
  };

  const handleMarkNotifRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}/read`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'fac-0142' })
      });
      syncERPData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await fetch(`/api/notifications/mark-all-read`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'fac-0142' })
      });
      syncERPData();
    } catch (err) {
      console.error(err);
    }
  };

  // Post response in grievance
  const handlePostGrievanceReply = async () => {
    if (!grievanceReplyText.trim() || !selectedGrievanceId) return;
    try {
      const res = await fetch(`/api/grievances/${selectedGrievanceId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author: 'Dr. Elena Vance',
          role: 'Faculty',
          text: grievanceReplyText
        })
      });
      if (res.ok) {
        setGrievanceReplyText('');
        setActionMessage("Reply posted and logged.");
        syncERPData();
        setTimeout(() => setActionMessage(null), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateGrievanceStatus = async (newStatus: 'Under Review' | 'Resolved' | 'Escalated' | 'Escated') => {
    if (!selectedGrievanceId) return;
    const correctStatus: 'Under Review' | 'Resolved' | 'Escalated' = newStatus === 'Escated' ? 'Escalated' : newStatus;
    try {
      const res = await fetch(`/api/grievances/${selectedGrievanceId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: correctStatus,
          actorName: 'Dr. Elena Vance',
          actorRole: 'Faculty',
          notes: `Status updated by Faculty Advisor to ${correctStatus}.`
        })
      });
      if (res.ok) {
        setActionMessage(`Grievance status updated to ${correctStatus}.`);
        syncERPData();
        setTimeout(() => setActionMessage(null), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Filter students for display
  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(attendanceSearchQuery.toLowerCase()) || s.rollNo.includes(attendanceSearchQuery);
    const matchesFilter = attendanceFilter === 'all' || s.status === attendanceFilter;
    return matchesSearch && matchesFilter;
  });

  const getSearchPlaceholder = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'Search faculty dashboard...';
      case 'profile':
        return 'Search profile details...';
      case 'attendance':
        return 'Search students, roll numbers...';
      case 'grievance':
        return 'Search grievances...';
      case 'academics':
        return 'Search courses or sections...';
      default:
        return 'Search faculty dashboard...';
    }
  };

  const handleHeaderSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (activeTab === 'attendance') {
      setAttendanceSearchQuery(val);
    } else if (activeTab === 'grievance') {
      setGrievanceSearch(val);
    }
  };

  const getHeaderSearchValue = () => {
    if (activeTab === 'attendance') {
      return attendanceSearchQuery;
    } else if (activeTab === 'grievance') {
      return grievanceSearch;
    }
    return '';
  };

  const handleExportTimetablePDF = () => {
    const doc = new jsPDF();
    
    // Header banner
    doc.setFillColor(158, 27, 50);
    doc.rect(0, 0, 210, 40, "F");
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont("Helvetica", "bold");
    doc.text("K.R. MANGALAM UNIVERSITY", 14, 18);
    doc.setFontSize(10);
    doc.setFont("Helvetica", "normal");
    doc.text("SCHOOL OF ENGINEERING & TECHNOLOGY | FACULTY TIMETABLE", 14, 25);
    doc.text(`Faculty: ${facultyProfile.fullName} | Employee ID: ${facultyProfile.employeeId}`, 14, 32);

    doc.setTextColor(50, 50, 50);
    doc.setFontSize(14);
    doc.setFont("Helvetica", "bold");
    doc.text("WEEKLY CLASS SCHEDULE", 14, 52);

    doc.setDrawColor(220, 224, 230);
    doc.line(14, 55, 196, 55);

    let y = 65;
    doc.setFontSize(10);
    
    // Headers for table
    doc.setFont("Helvetica", "bold");
    doc.text("Day", 14, y);
    doc.text("Time", 35, y);
    doc.text("Subject & Course Code", 75, y);
    doc.text("Room & Section", 145, y);
    doc.text("Students", 185, y);
    
    doc.line(14, y + 3, 196, y + 3);
    y += 10;
    doc.setFont("Helvetica", "normal");

    // Group by day to sort nicely
    const daysOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    daysOrder.forEach(day => {
      const dayLectures = timetableLectures.filter(l => l.dayOfWeek === day);
      dayLectures.forEach(l => {
        doc.setFont("Helvetica", "bold");
        doc.text(l.dayOfWeek.substring(0, 3), 14, y);
        doc.setFont("Helvetica", "normal");
        
        doc.text(`${l.startTime} - ${l.endTime}`, 35, y);
        
        const subjectText = `${l.subjectName} (${l.courseCode})`;
        doc.text(subjectText.length > 32 ? subjectText.substring(0, 32) + "..." : subjectText, 75, y);
        
        doc.text(`${l.classroom} [${l.section}]`, 145, y);
        doc.text(`${l.studentCount}`, 185, y);
        y += 8;

        if (y > 270) {
          doc.addPage();
          y = 20;
          doc.setFont("Helvetica", "bold");
          doc.text("Day", 14, y);
          doc.text("Time", 35, y);
          doc.text("Subject & Course Code", 75, y);
          doc.text("Room & Section", 145, y);
          doc.text("Students", 185, y);
          doc.line(14, y + 3, 196, y + 3);
          y += 10;
          doc.setFont("Helvetica", "normal");
        }
      });
      if (dayLectures.length > 0) {
        doc.setDrawColor(240, 240, 240);
        doc.line(14, y - 2, 196, y - 2);
        doc.setDrawColor(220, 224, 230);
        y += 4;
      }
    });

    doc.save(`Faculty_Timetable_${facultyProfile.fullName.replace(/ /g, "_")}.pdf`);
  };

  const handleExportLeavePDF = () => {
    const doc = new jsPDF();
    
    doc.setFillColor(158, 27, 50);
    doc.rect(0, 0, 210, 40, "F");
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont("Helvetica", "bold");
    doc.text("K.R. MANGALAM UNIVERSITY", 14, 18);
    doc.setFontSize(10);
    doc.setFont("Helvetica", "normal");
    doc.text("SCHOOL OF ENGINEERING & TECHNOLOGY | LEAVE REPORT", 14, 25);
    doc.text(`Faculty: ${facultyProfile.fullName} | Employee ID: ${facultyProfile.employeeId}`, 14, 32);

    doc.setTextColor(50, 50, 50);
    doc.setFontSize(14);
    doc.setFont("Helvetica", "bold");
    doc.text("ENTITLEMENTS SUMMARY", 14, 52);
    
    doc.setDrawColor(220, 224, 230);
    doc.line(14, 55, 196, 55);

    doc.setFontSize(10);
    let y = 65;
    
    leaveBalances.forEach(bal => {
      doc.setFont("Helvetica", "bold");
      doc.text(bal.type, 14, y);
      doc.setFont("Helvetica", "normal");
      doc.text(`Total: ${bal.total} | Used: ${bal.used} | Remaining: ${bal.remaining} Days`, 100, y);
      y += 8;
    });

    y += 10;
    doc.setFontSize(14);
    doc.setFont("Helvetica", "bold");
    doc.text("LEAVE APPLICATION RECORDS", 14, y);
    doc.line(14, y + 3, 196, y + 3);
    y += 10;

    doc.setFontSize(9);
    doc.setFont("Helvetica", "bold");
    doc.text("ID", 14, y);
    doc.text("Type", 36, y);
    doc.text("Period", 70, y);
    doc.text("Days", 115, y);
    doc.text("Reason", 130, y);
    doc.text("Status", 175, y);

    doc.line(14, y + 2, 196, y + 2);
    y += 8;
    doc.setFont("Helvetica", "normal");

    leaveHistory.forEach(req => {
      doc.text(req.id, 14, y);
      doc.text(req.leaveType, 36, y);
      doc.text(`${req.startDate} to ${req.endDate}`, 70, y);
      doc.text(`${req.days} Day${req.days > 1 ? 's' : ''}`, 115, y);
      
      const reasonTrunc = req.reason.length > 24 ? req.reason.substring(0, 24) + "..." : req.reason;
      doc.text(reasonTrunc, 130, y);
      doc.text(req.status, 175, y);
      y += 8;

      if (y > 270) {
        doc.addPage();
        y = 20;
        doc.setFont("Helvetica", "bold");
        doc.text("ID", 14, y);
        doc.text("Type", 36, y);
        doc.text("Period", 70, y);
        doc.text("Days", 115, y);
        doc.text("Reason", 130, y);
        doc.text("Status", 175, y);
        doc.line(14, y + 2, 196, y + 2);
        y += 8;
        doc.setFont("Helvetica", "normal");
      }
    });

    doc.save(`Faculty_Leave_Report_${facultyProfile.fullName.replace(/ /g, "_")}.pdf`);
  };

  const renderTimetable = () => {
    let filteredLectures = timetableLectures;
    if (timetableFilter === 'today') {
      filteredLectures = timetableLectures.filter(l => l.dayOfWeek === 'Friday');
    } else if (timetableFilter === 'tomorrow') {
      filteredLectures = timetableLectures.filter(l => l.dayOfWeek === 'Saturday');
    }
    
    return (
      <motion.div
        key="timetable"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <button 
              type="button"
              onClick={() => setProfileSubView('main')}
              className="flex items-center gap-2 text-sm font-bold text-[#9e1b32] hover:underline mb-1 cursor-pointer bg-transparent border-none p-0"
            >
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              Back to Profile
            </button>
            <h1 className="text-[32px] font-bold text-on-surface">Faculty Class Timetable</h1>
            <p className="text-sm text-on-surface-variant">Manage your teaching schedule, resources, and student attendance.</p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleExportTimetablePDF}
              className="flex items-center gap-2 px-4 py-2.5 bg-white text-on-surface border border-outline-variant rounded-lg text-sm font-bold hover:bg-slate-50 transition-all cursor-pointer shadow-sm"
            >
              <span className="material-symbols-outlined text-sm">download_for_offline</span>
              Export Timetable as PDF
            </button>
          </div>
        </div>

        {/* View Toggle tabs */}
        <div className="flex border-b border-outline-variant">
          <button
            type="button"
            onClick={() => setTimetableActiveView('daily')}
            className={`px-5 py-3 text-sm font-bold border-b-2 transition-all cursor-pointer bg-transparent ${
              timetableActiveView === 'daily' 
                ? 'border-[#9e1b32] text-[#9e1b32]' 
                : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Daily / List View
          </button>
          <button
            type="button"
            onClick={() => setTimetableActiveView('weekly')}
            className={`px-5 py-3 text-sm font-bold border-b-2 transition-all cursor-pointer bg-transparent ${
              timetableActiveView === 'weekly' 
                ? 'border-[#9e1b32] text-[#9e1b32]' 
                : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Weekly Grid View
          </button>
          <button
            type="button"
            onClick={() => setTimetableActiveView('monthly')}
            className={`px-5 py-3 text-sm font-bold border-b-2 transition-all cursor-pointer bg-transparent ${
              timetableActiveView === 'monthly' 
                ? 'border-[#9e1b32] text-[#9e1b32]' 
                : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Monthly Calendar View
          </button>
        </div>

        {timetableActiveView === 'daily' && (
          <div className="space-y-6">
            {/* Filter chips */}
            <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-outline-variant max-w-max">
              <button
                type="button"
                onClick={() => setTimetableFilter('today')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border-none ${
                  timetableFilter === 'today'
                    ? 'bg-[#9e1b32] text-white'
                    : 'text-on-surface hover:bg-slate-100 bg-transparent'
                }`}
              >
                Today (Friday)
              </button>
              <button
                type="button"
                onClick={() => setTimetableFilter('tomorrow')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border-none ${
                  timetableFilter === 'tomorrow'
                    ? 'bg-[#9e1b32] text-white'
                    : 'text-on-surface hover:bg-slate-100 bg-transparent'
                }`}
              >
                Tomorrow (Saturday)
              </button>
              <button
                type="button"
                onClick={() => setTimetableFilter('week')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border-none ${
                  timetableFilter === 'week'
                    ? 'bg-[#9e1b32] text-white'
                    : 'text-on-surface hover:bg-slate-100 bg-transparent'
                }`}
              >
                This Week (Mon - Fri)
              </button>
            </div>

            {/* Timetable List */}
            <div className="grid grid-cols-1 gap-4">
              {filteredLectures.length === 0 ? (
                <div className="bg-white p-12 rounded-2xl border border-outline-variant text-center max-w-xl mx-auto my-6">
                  <span className="material-symbols-outlined text-5xl text-gray-300 mb-2">event_busy</span>
                  <h3 className="text-lg font-bold text-gray-800 mb-1">No Lectures Scheduled</h3>
                  <p className="text-sm text-gray-500">There are no classes scheduled for the selected date filter.</p>
                </div>
              ) : (
                filteredLectures.map((lecture) => {
                  return (
                    <div
                      key={lecture.id}
                      onClick={() => {
                        setSelectedLecture(lecture);
                        setLectureModalOpen(true);
                      }}
                      className={`group p-6 bg-white border rounded-2xl institution-shadow transition-all hover:scale-[1.01] hover:border-red-200 cursor-pointer flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative overflow-hidden ${
                        lecture.isCurrent 
                          ? 'border-l-4 border-l-emerald-500 border-emerald-200 bg-emerald-50/10' 
                          : lecture.isNext 
                            ? 'border-l-4 border-l-indigo-500 border-indigo-200 bg-indigo-50/10' 
                            : 'border-outline-variant'
                      }`}
                    >
                      {/* Highlight Badges */}
                      {lecture.isCurrent && (
                        <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-bl-xl flex items-center gap-1">
                          <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></span>
                          Current Lecture
                        </div>
                      )}
                      {lecture.isNext && (
                        <div className="absolute top-0 right-0 bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-bl-xl">
                          Up Next
                        </div>
                      )}

                      <div className="flex flex-col md:flex-row items-start md:items-center gap-4 flex-1">
                        {/* Time box */}
                        <div className="flex flex-col justify-center items-center bg-slate-50 border border-outline-variant p-3 rounded-xl min-w-[120px] text-center">
                          <span className="text-xs font-bold text-outline uppercase">{lecture.dayOfWeek}</span>
                          <span className="text-sm font-extrabold text-on-surface mt-0.5">{lecture.startTime}</span>
                          <span className="text-[10px] text-on-surface-variant">to {lecture.endTime}</span>
                        </div>

                        {/* Lecture Info */}
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-extrabold text-outline-variant bg-[#dfe0ff] text-[#2a3aa6] px-2.5 py-0.5 rounded">
                              {lecture.courseCode}
                            </span>
                            <span className="text-xs font-bold text-outline-variant bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded">
                              {lecture.section}
                            </span>
                          </div>
                          <h3 className="text-base font-bold text-on-surface group-hover:text-[#9e1b32] transition-colors">
                            {lecture.subjectName}
                          </h3>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-on-surface-variant">
                            <div className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-sm">meeting_room</span>
                              <span>{lecture.classroom} ({lecture.building})</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-sm">groups</span>
                              <span>{lecture.studentCount} Students</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-stretch md:self-auto justify-end">
                        <span className="text-xs font-bold text-primary group-hover:translate-x-1 transition-transform flex items-center gap-1">
                          View Details
                          <span className="material-symbols-outlined text-sm">chevron_right</span>
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {timetableActiveView === 'weekly' && (
          <div className="bg-white border border-outline-variant rounded-2xl overflow-hidden institution-shadow">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-outline-variant">
                    <th className="px-4 py-3 text-xs font-black text-outline uppercase tracking-wider w-32 border-r border-outline-variant">Day</th>
                    <th className="px-4 py-3 text-xs font-black text-outline uppercase tracking-wider border-r border-outline-variant">Morning (09:00 AM - 12:00 PM)</th>
                    <th className="px-4 py-3 text-xs font-black text-outline uppercase tracking-wider">Afternoon (12:00 PM - 04:00 PM)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day) => {
                    const dayLectures = timetableLectures.filter(l => l.dayOfWeek === day);
                    const morningLectures = dayLectures.filter(l => {
                      const hour = parseInt(l.startTime.split(':')[0]);
                      const isAM = l.startTime.includes('AM');
                      return isAM && hour < 12;
                    });
                    const afternoonLectures = dayLectures.filter(l => {
                      const hour = parseInt(l.startTime.split(':')[0]);
                      const isAM = l.startTime.includes('AM');
                      return !isAM || hour === 12;
                    });

                    return (
                      <tr key={day} className="hover:bg-slate-50/50">
                        <td className="px-4 py-5 text-sm font-black text-on-surface border-r border-outline-variant bg-slate-50/40">{day}</td>
                        <td className="px-4 py-4 border-r border-outline-variant">
                          <div className="flex flex-col gap-2">
                            {morningLectures.length === 0 ? (
                              <span className="text-xs text-outline italic">No Classes</span>
                            ) : (
                              morningLectures.map(lec => (
                                <div 
                                  key={lec.id}
                                  onClick={() => {
                                    setSelectedLecture(lec);
                                    setLectureModalOpen(true);
                                  }}
                                  className={`p-2.5 rounded-lg border text-xs cursor-pointer hover:border-red-200 hover:shadow-sm transition-all ${
                                    lec.isCurrent ? 'bg-emerald-50 border-emerald-200 text-emerald-900 font-medium' : 'bg-slate-50 border-slate-200 text-slate-800'
                                  }`}
                                >
                                  <div className="flex items-center justify-between font-bold mb-0.5">
                                    <span>{lec.startTime} - {lec.endTime}</span>
                                    <span className="text-[10px] bg-white px-1 rounded border border-slate-200">{lec.classroom}</span>
                                  </div>
                                  <div className="font-extrabold text-on-surface truncate">{lec.subjectName}</div>
                                  <div className="text-[10px] text-outline mt-0.5">{lec.courseCode} • {lec.section}</div>
                                </div>
                              ))
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex flex-col gap-2">
                            {afternoonLectures.length === 0 ? (
                              <span className="text-xs text-outline italic">No Classes</span>
                            ) : (
                              afternoonLectures.map(lec => (
                                <div 
                                  key={lec.id}
                                  onClick={() => {
                                    setSelectedLecture(lec);
                                    setLectureModalOpen(true);
                                  }}
                                  className={`p-2.5 rounded-lg border text-xs cursor-pointer hover:border-red-200 hover:shadow-sm transition-all ${
                                    lec.isCurrent ? 'bg-emerald-50 border-emerald-200 text-emerald-900 font-medium' : 'bg-slate-50 border-slate-200 text-slate-800'
                                  }`}
                                >
                                  <div className="flex items-center justify-between font-bold mb-0.5">
                                    <span>{lec.startTime} - {lec.endTime}</span>
                                    <span className="text-[10px] bg-white px-1 rounded border border-slate-200">{lec.classroom}</span>
                                  </div>
                                  <div className="font-extrabold text-on-surface truncate">{lec.subjectName}</div>
                                  <div className="text-[10px] text-outline mt-0.5">{lec.courseCode} • {lec.section}</div>
                                </div>
                              ))
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {timetableActiveView === 'monthly' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white border border-outline-variant rounded-2xl p-6 institution-shadow lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-on-surface text-lg">July 2026</h3>
                <span className="text-xs font-semibold text-outline">Academic Calendar V</span>
              </div>
              
              <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold mb-2">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
                  <div key={idx} className="text-outline py-1">{day}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-2 text-center text-sm font-semibold">
                <div className="py-2.5 text-slate-300">28</div>
                <div className="py-2.5 text-slate-300">29</div>
                <div className="py-2.5 text-slate-300">30</div>
                {Array.from({ length: 31 }, (_, idx) => {
                  const dayNum = idx + 1;
                  const isFriday = (dayNum % 7 === 3);
                  const isMonday = (dayNum % 7 === 6);
                  const isTuesday = (dayNum % 7 === 0);
                  const isWednesday = (dayNum % 7 === 1);
                  const isThursday = (dayNum % 7 === 2);
                  const hasClasses = isMonday || isTuesday || isWednesday || isThursday || isFriday;
                  const isToday = dayNum === 3;

                  return (
                    <div 
                      key={dayNum} 
                      className={`relative py-2.5 rounded-lg border flex flex-col items-center justify-between cursor-pointer transition-all ${
                        isToday 
                          ? 'bg-[#9e1b32] text-white border-[#9e1b32]' 
                          : 'bg-white border-slate-100 hover:bg-slate-50'
                      }`}
                      onClick={() => {
                        setTimetableFilter('week');
                        setTimetableActiveView('daily');
                      }}
                    >
                      <span>{dayNum}</span>
                      {hasClasses && (
                        <span className={`w-1.5 h-1.5 rounded-full mt-1 ${isToday ? 'bg-white' : 'bg-[#9e1b32]'}`}></span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-slate-50 border border-outline-variant rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-on-surface text-base mb-4 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[#9e1b32]">info</span>
                  Monthly Summary
                </h3>
                <div className="space-y-3">
                  <div className="bg-white p-3 rounded-xl border border-outline-variant">
                    <p className="text-xs text-outline">Total Lecturing Days</p>
                    <p className="text-xl font-bold text-on-surface">23 Days</p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-outline-variant">
                    <p className="text-xs text-outline">Total Classes Scheduled</p>
                    <p className="text-xl font-bold text-on-surface">48 Classes</p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-outline-variant">
                    <p className="text-xs text-outline">Academic Deliverables</p>
                    <p className="text-xl font-bold text-green-600">On Track</p>
                  </div>
                </div>
              </div>
              <div className="text-xs text-outline mt-6">
                Clicking any highlighted day in the monthly view redirects to that day's scheduled list.
              </div>
            </div>
          </div>
        )}
      </motion.div>
    );
  };

  const renderLectureModal = () => {
    if (!selectedLecture || !lectureModalOpen) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-2xl max-w-lg w-full border border-outline-variant overflow-hidden institution-shadow"
        >
          <div className="bg-[#9e1b32] p-6 text-white flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-2.5 py-0.5 rounded">
                {selectedLecture.courseCode}
              </span>
              <h2 className="text-xl font-bold mt-1.5">{selectedLecture.subjectName}</h2>
            </div>
            <button 
              type="button"
              onClick={() => {
                setLectureModalOpen(false);
                setSelectedLecture(null);
              }}
              className="text-white hover:bg-white/10 rounded-full w-8 h-8 flex items-center justify-center cursor-pointer border-none bg-transparent"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <div className="p-6 space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-3 rounded-xl border border-outline-variant">
                <p className="text-[10px] font-bold text-outline uppercase tracking-wider">Classroom / Lab</p>
                <p className="text-sm font-bold text-on-surface mt-0.5">{selectedLecture.classroom}</p>
                <p className="text-[10px] text-outline-variant">{selectedLecture.building}</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-outline-variant">
                <p className="text-[10px] font-bold text-outline uppercase tracking-wider">Semester</p>
                <p className="text-sm font-bold text-on-surface mt-0.5">{selectedLecture.semester}</p>
                <p className="text-[10px] text-outline-variant">{selectedLecture.section}</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-outline-variant">
                <p className="text-[10px] font-bold text-outline uppercase tracking-wider">Time Window</p>
                <p className="text-sm font-bold text-on-surface mt-0.5">{selectedLecture.startTime} - {selectedLecture.endTime}</p>
                <p className="text-[10px] text-outline-variant">{selectedLecture.dayOfWeek}</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-outline-variant">
                <p className="text-[10px] font-bold text-outline uppercase tracking-wider">Student Enrolled</p>
                <p className="text-sm font-bold text-on-surface mt-0.5">{selectedLecture.studentCount} Students</p>
                <p className="text-[10px] text-outline-variant">Active registry available</p>
              </div>
            </div>

            <div>
              <p className="text-[10px] font-black text-outline uppercase tracking-widest mb-2">Class Course Resources</p>
              <div className="space-y-1.5">
                {selectedLecture.resources.map((resource, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-white border border-outline-variant rounded-lg text-xs font-semibold text-on-surface hover:bg-slate-50">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm text-primary">description</span>
                      <span className="truncate max-w-[240px]">{resource}</span>
                    </div>
                    <button 
                      type="button"
                      onClick={() => alert(`Downloading ${resource}...`)}
                      className="text-[#9e1b32] hover:underline bg-transparent border-none cursor-pointer text-xs"
                    >
                      Download
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-slate-50 p-4 border-t border-outline-variant flex justify-between gap-3">
            <button 
              type="button"
              onClick={() => {
                setLectureModalOpen(false);
                setSelectedLecture(null);
              }}
              className="px-4 py-2 bg-white text-on-surface border border-outline-variant rounded-lg text-xs font-bold hover:bg-slate-100 cursor-pointer"
            >
              Close
            </button>
            <button 
              type="button"
              onClick={() => {
                setLectureModalOpen(false);
                setSelectedSubject(`${selectedLecture.courseCode}: ${selectedLecture.subjectName}`);
                setSelectedSection(selectedLecture.section);
                setActiveTab('attendance');
              }}
              className="px-4 py-2 bg-[#9e1b32] text-white rounded-lg text-xs font-bold hover:opacity-90 cursor-pointer flex items-center gap-1 border-none"
            >
              <span className="material-symbols-outlined text-xs">done_all</span>
              Attendance Shortcut
            </button>
          </div>
        </motion.div>
      </div>
    );
  };

  const renderLeaveDashboard = () => {
    const filteredHistory = leaveHistory.filter(req => {
      const matchSearch = req.reason.toLowerCase().includes(leaveSearch.toLowerCase()) || 
                          req.leaveType.toLowerCase().includes(leaveSearch.toLowerCase());
      const year = req.appliedDate.split('-')[0];
      const matchYear = leaveYearFilter === 'All' ? true : year === leaveYearFilter;
      return matchSearch && matchYear;
    });

    return (
      <motion.div
        key="leave-dashboard"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="space-y-8"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <button 
              type="button"
              onClick={() => setProfileSubView('main')}
              className="flex items-center gap-2 text-sm font-bold text-[#9e1b32] hover:underline mb-1 cursor-pointer bg-transparent border-none p-0"
            >
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              Back to Profile
            </button>
            <h1 className="text-[32px] font-bold text-on-surface">Leave Management Dashboard</h1>
            <p className="text-sm text-on-surface-variant">View your active leave entitlements, historic applications, and track requests.</p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleExportLeavePDF}
              className="flex items-center gap-2 px-4 py-2.5 bg-white text-on-surface border border-outline-variant rounded-lg text-sm font-bold hover:bg-slate-50 transition-all cursor-pointer shadow-sm"
            >
              <span className="material-symbols-outlined text-sm">download_for_offline</span>
              Download Leave Report PDF
            </button>
            <button
              type="button"
              onClick={() => setProfileSubView('apply-leave')}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#9e1b32] text-white rounded-lg text-sm font-bold hover:opacity-90 transition-all cursor-pointer border-none shadow-sm"
            >
              <span className="material-symbols-outlined text-sm">add_circle</span>
              Apply Leave
            </button>
          </div>
        </div>

        <section>
          <h2 className="text-sm font-bold text-outline uppercase tracking-wider mb-4">Leave Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {leaveBalances.map((bal, idx) => {
              return (
                <div key={idx} className={`border border-outline-variant rounded-2xl p-6 institution-shadow bg-white flex flex-col justify-between relative overflow-hidden`}>
                  <div className={`absolute top-0 left-0 right-0 h-1.5 ${bal.color}`}></div>
                  
                  <div className="mb-4">
                    <p className={`text-xs font-black uppercase tracking-wider ${bal.textColor}`}>{bal.type}</p>
                    <p className="text-4xl font-black text-on-surface mt-2">{bal.remaining}</p>
                    <p className="text-xs text-outline font-semibold mt-0.5">Remaining Leave Balance</p>
                  </div>
                  
                  <div className="grid grid-cols-2 border-t border-slate-100 pt-4 mt-2 text-center">
                    <div className="border-r border-slate-100">
                      <p className="text-xs font-bold text-outline uppercase tracking-wider">Total</p>
                      <p className="text-sm font-black text-on-surface mt-0.5">{bal.total}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-outline uppercase tracking-wider">Used</p>
                      <p className="text-sm font-black text-slate-500 mt-0.5">{bal.used}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="text-sm font-bold text-outline uppercase tracking-wider">Leave History Table</h2>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative">
                <span className="material-symbols-outlined text-sm text-outline absolute left-3 top-1/2 -translate-y-1/2">search</span>
                <input
                  type="text"
                  placeholder="Search reason or type..."
                  value={leaveSearch}
                  onChange={(e) => setLeaveSearch(e.target.value)}
                  className="pl-9 pr-4 py-2 border border-outline-variant rounded-xl text-xs font-semibold focus:outline-none focus:border-red-400 bg-white min-w-[200px]"
                />
              </div>
              
              <select
                value={leaveYearFilter}
                onChange={(e) => setLeaveYearFilter(e.target.value)}
                className="px-3 py-2 border border-outline-variant rounded-xl text-xs font-semibold focus:outline-none focus:border-red-400 bg-white"
              >
                <option value="All">Filter by Year</option>
                <option value="2026">2026</option>
                <option value="2025">2025</option>
              </select>
            </div>
          </div>

          <div className="bg-white border border-outline-variant rounded-2xl overflow-hidden institution-shadow">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 border-b border-outline-variant">
                  <tr>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-outline">ID</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-outline">Leave Type</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-outline">Period</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-outline">Days</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-outline">Reason</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-outline">Status</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-outline">Applied On</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {filteredHistory.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-sm font-semibold text-outline">
                        No matching leave history found.
                      </td>
                    </tr>
                  ) : (
                    filteredHistory.map((req) => {
                      return (
                        <tr key={req.id} className="hover:bg-slate-50/50">
                          <td className="px-6 py-4 text-xs font-bold text-on-surface">{req.id}</td>
                          <td className="px-6 py-4 text-xs font-black text-[#9e1b32]">{req.leaveType}</td>
                          <td className="px-6 py-4 text-xs font-semibold text-on-surface">
                            {req.startDate} to {req.endDate}
                            {req.halfDay && <span className="ml-1.5 px-2 py-0.5 bg-yellow-50 text-yellow-700 border border-yellow-100 rounded text-[9px] font-black">Half Day</span>}
                          </td>
                          <td className="px-6 py-4 text-xs font-extrabold text-on-surface">{req.days} Day{req.days > 1 ? 's' : ''}</td>
                          <td className="px-6 py-4 text-xs text-outline max-w-[200px] truncate" title={req.reason}>{req.reason}</td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${
                              req.status === 'Approved' 
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                                : req.status === 'Pending' 
                                  ? 'bg-amber-50 text-amber-700 border-amber-100' 
                                  : 'bg-rose-50 text-rose-700 border-rose-100'
                            }`}>
                              {req.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-xs text-outline">{req.appliedDate}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </motion.div>
    );
  };

  const renderEditProfile = () => {
    return <EditProfileForm facultyProfile={facultyProfile} onSave={(updated) => {
      setFacultyProfile(updated);
      setActionMessage("Faculty Profile updated successfully!");
      setTimeout(() => setActionMessage(null), 5000);
      setProfileSubView('main');
    }} onCancel={() => setProfileSubView('main')} />;
  };

  const renderApplyLeave = () => {
    return <ApplyLeaveForm onSave={(newRequest) => {
      setLeaveHistory(prev => [newRequest, ...prev]);
      
      // Also deduct from balances dynamically
      setLeaveBalances(prev => prev.map(b => {
        if (b.type === newRequest.leaveType) {
          return {
            ...b,
            used: b.used + newRequest.days,
            remaining: Math.max(0, b.remaining - newRequest.days)
          };
        }
        return b;
      }));

      setActionMessage("Leave Application Submitted Successfully");
      setTimeout(() => setActionMessage(null), 5000);
      setProfileSubView('leave');
    }} onCancel={() => setProfileSubView('leave')} />;
  };

  return (
    <div className="flex min-h-screen bg-background font-sans" id="faculty-portal-root">
      
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-surface-container-lowest border-r border-outline-variant flex flex-col flex-shrink-0 fixed h-full z-50" id="faculty-sidebar">
        <div className="p-6 flex flex-col gap-8">
          <div className="flex items-center justify-center py-2" id="sidebar-logo-container">
            <img 
              alt="K.R. Mangalam University Logo" 
              className="h-12 w-auto object-contain" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCun7sPexucqbeRn5jjWPkAqJg84aQMczqkd6g5LGHkgaalRv4E49HnsUh0U7hDRCuVrUH25hdg_G5Xeyf8kaVoiYHZzLryDpAnqQooaSloZYGWAlsnaYAi984HLzfX5u_ELsDFiAEnNt2qewoUYWic5Kn6SrWsLg2vEaUjHrKP9xbu_JVL6PoZaA_oReyHj0DngXIkjyyF3CvmD3WImuX2z4Du8wzmKdEMUXMJmkcZJT48LhyzaFx4dYuBT9NYz1-f_jzBS881O6s"
            />
          </div>
          <nav className="flex flex-col gap-2" id="sidebar-nav">
            <button 
              id="sidebar-btn-dashboard"
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left cursor-pointer ${activeTab === 'dashboard' ? 'sidebar-active-indicator bg-surface-container text-primary font-medium' : 'text-on-surface-variant hover:bg-surface-container-low group'}`}
            >
              <span className="material-symbols-outlined text-outline group-hover:text-primary">dashboard</span>
              <span className="text-label-md font-medium">Dashboard</span>
            </button>
            <button 
              id="sidebar-btn-profile"
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left cursor-pointer ${activeTab === 'profile' ? 'sidebar-active-indicator bg-surface-container text-primary font-medium' : 'text-on-surface-variant hover:bg-surface-container-low group'}`}
            >
              <span className="material-symbols-outlined text-outline group-hover:text-primary">person</span>
              <span className="text-label-md font-medium">My Profile</span>
            </button>
            <button 
              id="sidebar-btn-academics"
              onClick={() => setActiveTab('academics')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left cursor-pointer ${activeTab === 'academics' ? 'sidebar-active-indicator bg-surface-container text-primary font-medium' : 'text-on-surface-variant hover:bg-surface-container-low group'}`}
            >
              <span className="material-symbols-outlined text-outline group-hover:text-primary">school</span>
              <span className="text-label-md font-medium">Academics</span>
            </button>
            <button 
              id="sidebar-btn-attendance"
              onClick={() => setActiveTab('attendance')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left cursor-pointer ${activeTab === 'attendance' ? 'sidebar-active-indicator bg-surface-container text-primary font-medium' : 'text-on-surface-variant hover:bg-surface-container-low group'}`}
            >
              <span className="material-symbols-outlined text-outline group-hover:text-primary">calendar_today</span>
              <span className="text-label-md font-medium">Attendance</span>
            </button>
            <button 
              id="sidebar-btn-students"
              onClick={() => setActiveTab('students')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left cursor-pointer ${activeTab === 'students' ? 'sidebar-active-indicator bg-surface-container text-primary font-medium' : 'text-on-surface-variant hover:bg-surface-container-low group'}`}
            >
              <span className="material-symbols-outlined text-outline group-hover:text-primary">groups</span>
              <span className="text-label-md font-medium">Students</span>
            </button>
            <button 
              id="sidebar-btn-grievance"
              onClick={() => setActiveTab('grievance')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left cursor-pointer ${activeTab === 'grievance' ? 'sidebar-active-indicator bg-surface-container text-primary font-medium' : 'text-on-surface-variant hover:bg-surface-container-low group'}`}
            >
              <span className="material-symbols-outlined text-outline group-hover:text-primary">report_problem</span>
              <span className="text-label-md font-medium">Grievance</span>
            </button>
            <button 
              id="sidebar-btn-notification"
              onClick={() => setActiveTab('notification')}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left cursor-pointer ${activeTab === 'notification' ? 'sidebar-active-indicator bg-surface-container text-primary font-medium' : 'text-on-surface-variant hover:bg-surface-container-low group'}`}
            >
              <span className="material-symbols-outlined text-outline group-hover:text-primary">notifications</span>
              <span className="text-label-md font-medium">Notification</span>
              {unreadNotifCount > 0 && (
                <span className="ml-auto bg-brand-red text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{unreadNotifCount}</span>
              )}
            </button>
          </nav>
        </div>
        
        <div className="mt-auto p-6 border-t border-outline-variant space-y-2" id="sidebar-footer">
          <button 
            id="sidebar-btn-logout"
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-error-container text-on-error-container font-bold text-sm hover:opacity-90 transition-opacity cursor-pointer border-none"
          >
            <span className="material-symbols-outlined text-sm">logout</span>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-64 flex flex-col min-h-screen" id="faculty-main-pane">
        
        {/* Top Bar - Header completely aligned to specifications */}
        <Header 
          role="faculty" 
          user={user} 
          onLogout={onLogout} 
          activeTab={activeTab} 
          setActiveTab={setActiveTab}
          searchValue={searchValue}
          onSearchChange={handleSearchChangeUnified}
        />

        {/* Main Canvas with page-level route transitions using motion */}
        <div className="p-8 max-w-[1440px] mx-auto space-y-6 w-full flex-1" id="faculty-canvas">
          
          {actionMessage && (
            <div className="p-4 bg-blue-50 text-blue-700 text-sm font-semibold rounded-lg border border-blue-200" id="banner-action-message">
              {actionMessage}
            </div>
          )}

          <AnimatePresence mode="wait">
            
            {/* TAB: DASHBOARD (FACULTY HOME PAGE) */}
            {activeTab === 'dashboard' && (
              tabLoading ? (
                <FacultyDashboardSkeleton />
              ) : (
                <motion.div 
                key="dashboard"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                className="space-y-6"
                id="dashboard-tab-content"
              >
                {/* Page Header Actions */}
                <div className="flex justify-between items-end" id="dashboard-header-container">
                  <div>
                    <h2 className="text-2xl font-bold text-on-surface">Course Management</h2>
                    <p className="text-sm text-on-surface-variant">Monitoring Distributed Systems &amp; Infrastructure Delivery</p>
                  </div>
                  <div className="flex gap-3">
                    <button 
                      id="btn-export-report"
                      onClick={handleExportPDF}
                      className="bg-surface text-on-surface border border-outline-variant px-5 py-2 rounded-lg text-sm font-bold hover:bg-surface-container transition-all flex items-center gap-2 institution-shadow cursor-pointer bg-white"
                    >
                      <span className="material-symbols-outlined text-sm">download</span> Export Report
                    </button>
                    <button 
                      id="btn-force-sync"
                      onClick={handleForceSync}
                      className="bg-primary text-on-primary px-5 py-2 rounded-lg text-sm font-bold shadow-sm hover:opacity-90 transition-all flex items-center gap-2 cursor-pointer border-none"
                    >
                      <span className="material-symbols-outlined text-sm">{syncStatus === 'Syncing' ? 'sync' : 'done'}</span> 
                      {syncStatus === 'Syncing' ? 'Syncing...' : syncStatus === 'Synced' ? 'Synced' : 'Force Sync'}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-12 gap-6" id="dashboard-grid-container">
                  
                  {/* Attendance Summary and Upload Status Panel */}
                  <div className="col-span-12 lg:col-span-8 precision-card rounded-xl overflow-hidden flex flex-col bg-white border border-outline-variant" id="card-attendance-overview">
                    <div className="px-6 py-4 bg-surface-container-low border-b border-outline-variant flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">assessment</span>
                        <h3 className="font-bold text-on-surface">Attendance Overview &amp; Status</h3>
                      </div>
                      <span className="text-xs font-bold text-primary">CS-601 Section A</span>
                    </div>
                    
                    <div className="p-6 flex-1 space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex flex-col justify-between" id="metric-present">
                          <span className="text-xs text-green-700 font-bold uppercase tracking-wider">Present Today</span>
                          <div className="mt-2 flex items-baseline gap-1">
                            <span className="text-3xl font-black text-green-800">{totalPresent}</span>
                            <span className="text-xs text-green-600 font-bold">/ 60 Students</span>
                          </div>
                        </div>

                        <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex flex-col justify-between" id="metric-absent">
                          <span className="text-xs text-red-700 font-bold uppercase tracking-wider">Absent Today</span>
                          <div className="mt-2 flex items-baseline gap-1">
                            <span className="text-3xl font-black text-red-800">{students.filter(s => s.status === 'absent').length}</span>
                            <span className="text-xs text-red-600 font-bold">/ 60 Students</span>
                          </div>
                        </div>

                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col justify-between" id="metric-late">
                          <span className="text-xs text-amber-700 font-bold uppercase tracking-wider">Late Today</span>
                          <div className="mt-2 flex items-baseline gap-1">
                            <span className="text-3xl font-black text-amber-800">{students.filter(s => s.status === 'late').length}</span>
                            <span className="text-xs text-amber-600 font-bold">/ 60 Students</span>
                          </div>
                        </div>
                      </div>

                      {/* Attendance Upload Status Section (Requirement 10) */}
                      <div className="p-5 rounded-2xl border border-outline-variant bg-surface-container-low" id="card-attendance-upload-status">
                        <h4 className="text-xs font-bold text-outline uppercase tracking-wider mb-3">Governance Upload Registry</h4>
                        
                        {uploadStatus === 'success' ? (
                          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-green-50/50 border border-green-200 p-4 rounded-xl">
                            <div className="flex items-start gap-3">
                              <span className="material-symbols-outlined text-green-700 text-3xl">check_circle</span>
                              <div>
                                <p className="text-sm font-bold text-green-800">Attendance Uploaded Successfully</p>
                                <p className="text-xs text-green-700 mt-0.5">The registry is finalized and securely committed in Supabase.</p>
                              </div>
                            </div>
                            <div className="text-xs text-green-700 font-medium text-right">
                              <p>Uploaded: <span className="font-bold">{lastUploadedTime}</span></p>
                              <p>Faculty: <span className="font-bold">Dr. Elena Vance</span></p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-red-50/50 border border-red-200 p-4 rounded-xl">
                            <div className="flex items-start gap-3">
                              <span className="material-symbols-outlined text-error text-3xl">warning</span>
                              <div>
                                <p className="text-sm font-bold text-error">Attendance Pending Upload</p>
                                <p className="text-xs text-red-700 mt-0.5">Today's registry for CS-601 Section A is not committed to Supabase yet.</p>
                              </div>
                            </div>
                            <div>
                              <button 
                                id="btn-dashboard-to-attendance"
                                onClick={() => setActiveTab('attendance')}
                                className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-lg hover:opacity-90 transition-all cursor-pointer border-none flex items-center gap-1.5"
                              >
                                <span className="material-symbols-outlined text-sm">calendar_today</span> Open Attendance Workspace
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="p-4 bg-surface-container-low border-t border-outline-variant flex justify-end gap-3 items-center">
                      <p className="mr-auto text-xs text-on-surface-variant">Syllabus coverage velocity: <span className="text-primary font-bold">65% on schedule</span></p>
                      <button 
                        id="btn-dashboard-go-to-workspace"
                        onClick={() => setActiveTab('attendance')}
                        className="px-6 py-2 bg-white text-on-surface border border-outline-variant rounded-lg text-xs font-bold hover:bg-surface-container transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <span className="material-symbols-outlined text-sm">edit_calendar</span> Go to Attendance Workspace
                      </button>
                    </div>
                  </div>

                  {/* Section: Critical Alerts & KPIs */}
                  <div className="col-span-12 lg:col-span-4 flex flex-col gap-6" id="dashboard-right-rail">
                    {/* Critical Alerts Component (Requirement 7) */}
                    <div className="precision-card rounded-xl overflow-hidden flex flex-col bg-white border border-outline-variant" id="card-critical-alerts">
                      <div className="p-4 bg-error-container border-b border-outline-variant">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-on-error-container">warning</span>
                          <h3 className="font-bold text-on-error-container text-sm">Critical Alerts</h3>
                        </div>
                      </div>
                      <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[350px] custom-scrollbar">
                        {criticalAlerts.map((alertItem) => (
                          <div key={alertItem.id} className="p-3 border border-outline-variant rounded-lg flex flex-col gap-2 group hover:bg-surface-container-low transition-colors">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="text-sm font-bold text-on-surface">{alertItem.studentName}</p>
                                <p className="text-[10px] text-outline font-semibold">Roll: {alertItem.rollNo} • Phone: {alertItem.phone}</p>
                              </div>
                              <span className="px-2 py-0.5 bg-red-50 text-red-700 text-[10px] font-bold rounded uppercase border border-red-100">
                                {alertItem.attendancePercent}% Att
                              </span>
                            </div>
                            <p className="text-xs text-on-surface-variant font-medium">Reason: {alertItem.reason}</p>
                            
                            {/* Quick Actions */}
                            <div className="flex gap-2 mt-1 pt-2 border-t border-outline-variant">
                              <button 
                                onClick={() => alert(`Calling parent of ${alertItem.studentName} at ${alertItem.phone}...`)}
                                className="flex-1 py-1.5 bg-surface border border-outline-variant hover:bg-surface-container text-on-surface rounded text-[10px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1 bg-white"
                              >
                                <span className="material-symbols-outlined text-xs">call</span> Call Parent
                              </button>
                              <button 
                                onClick={() => {
                                  setSelectedNoticeStudent(alertItem);
                                  setNoticeModalOpen(true);
                                }}
                                className="flex-1 py-1.5 bg-primary text-white hover:opacity-90 rounded text-[10px] font-bold transition-all cursor-pointer border-none flex items-center justify-center gap-1"
                              >
                                <span className="material-symbols-outlined text-xs">mail</span> Notice
                              </button>
                              <button 
                                onClick={() => alert(`Student: ${alertItem.studentName}\nRoll No: ${alertItem.rollNo}\nPhone: ${alertItem.phone}\nAttendance: ${alertItem.attendancePercent}%`)}
                                className="flex-1 py-1.5 bg-surface border border-outline-variant hover:bg-surface-container text-on-surface rounded text-[10px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1 bg-white"
                              >
                                <span className="material-symbols-outlined text-xs">visibility</span> Profile
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="p-4 border-t border-outline-variant bg-surface-container-low">
                        <button 
                          id="btn-trigger-parent-notices"
                          onClick={() => setNoticeModalOpen(true)}
                          className="w-full py-2 text-primary font-bold text-xs border border-primary rounded-lg hover:bg-primary hover:text-white transition-all cursor-pointer bg-transparent"
                        >
                          Generate Notice to Parents
                        </button>
                      </div>
                    </div>

                    {/* KPI Cards (Requirement 8 and 9) */}
                    <div className="grid grid-cols-1 gap-4" id="card-risk-students">
                      <div 
                        id="risk-students-kpi-card"
                        onClick={() => setRiskModalOpen(true)}
                        className="precision-card p-6 rounded-xl flex flex-col justify-between bg-white hover:border-primary border border-outline-variant cursor-pointer transition-all hover:shadow-md"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-label-md font-medium text-on-surface-variant uppercase tracking-wider text-[10px]">Students at Risk</span>
                          <span className="material-symbols-outlined text-primary text-lg">trending_up</span>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-on-surface">12</p>
                          <p className="text-[10px] text-error font-semibold">+2 this week • Click to inspect registry</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Syllabus Delivery Velocity */}
                  <div className="col-span-12 precision-card rounded-xl overflow-hidden bg-white border border-outline-variant" id="card-syllabus-velocity">
                    <div className="px-6 py-4 border-b border-outline-variant bg-surface-container-low flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary">speed</span>
                      <h3 className="font-bold text-on-surface">Syllabus Delivery Velocity</h3>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
                      {syllabusList.map((syl) => (
                        <div key={syl.id} className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-bold">{syl.courseTitle}</span>
                            <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase border ${syl.velocityStatus === 'ahead' ? 'bg-green-50 text-green-700 border-green-100' : syl.velocityStatus === 'behind' ? 'bg-red-50 text-primary border-red-100' : 'bg-surface-container text-on-surface-variant border-outline-variant'}`}>
                              {syl.velocityLabel}
                            </span>
                          </div>
                          <div className="relative h-2 bg-surface-container-highest rounded-full overflow-hidden">
                            <div 
                              className={`absolute top-0 left-0 h-full ${syl.velocityStatus === 'ahead' ? 'bg-green-500' : 'bg-primary'}`} 
                              style={{ width: `${syl.currentProgress}%` }}
                            ></div>
                          </div>
                          <div className="flex justify-between text-[10px] font-bold text-outline uppercase">
                            <span>{syl.currentUnit}</span>
                            <span>{syl.currentProgress}% / {syl.targetProgress}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Governance Activity Log */}
                  <div className="col-span-12 precision-card rounded-xl overflow-hidden bg-white border border-outline-variant" id="card-governance-log">
                    <div className="px-6 py-4 border-b border-outline-variant bg-surface-container-low flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">history</span>
                        <h3 className="font-bold text-on-surface">Governance Activity Log</h3>
                      </div>
                      <button className="text-xs text-primary font-bold hover:underline bg-transparent border-none cursor-pointer" onClick={() => alert("Loading full audit log trail...")}>
                        View All Activities
                      </button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-surface-container-low text-outline uppercase text-[10px] font-bold tracking-wider">
                          <tr>
                            <th className="px-6 py-3">Timestamp</th>
                            <th className="px-6 py-3">Faculty / Admin</th>
                            <th className="px-6 py-3">Action Performed</th>
                            <th className="px-6 py-3 text-right">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant">
                          {logs.map((log) => (
                            <tr key={log.id} className="hover:bg-surface-container-low transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap text-on-surface-variant">{log.timestamp}</td>
                              <td className="px-6 py-4 whitespace-nowrap font-medium">{log.actor}</td>
                              <td className="px-6 py-4">{log.action}</td>
                              <td className="px-6 py-4 text-right">
                                <span className="px-2 py-1 bg-green-50 text-green-700 text-[10px] font-bold rounded-full uppercase border border-green-100">
                                  {log.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>
              </motion.div>
              )
            )}

            {/* TAB: MY PROFILE */}
            {activeTab === 'profile' && (
              <>
                {profileSubView === 'main' && (
                  <motion.div 
                    key="profile"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.15 }}
                    className="space-y-8"
                    id="profile-tab-content"
                  >
                {/* My Profile Header */}
                <div>
                  <h1 className="text-[32px] font-bold text-on-surface mb-1">My Profile</h1>
                  <p className="text-sm text-on-surface-variant">Official faculty record as maintained by the School of Engineering &amp; Technology registry.</p>
                </div>

                {/* Main Profile Card */}
                <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-8 flex flex-col md:flex-row items-center gap-8 institution-shadow bg-white">
                  <div className="w-32 h-32 bg-primary rounded-2xl flex items-center justify-center text-white text-5xl font-bold select-none overflow-hidden border border-outline-variant">
                    <img 
                      alt="Dr. Elena Vance" 
                      className="w-full h-full object-cover" 
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuASInz3fouGCVLXLiMDjuPIO5hsZXNfB2qlfAg8AzuesXkvN92i3TPJ3B4bQ72Hq1eXNxEnKDh2EPb_AV7oacPba73KP8V0OHyMTKrnU3d4w65J9sEiW1nwzHQwiIuEWoY4bzwVl0suLWVyJFCZ5Nat4P7l2dlKPIiFB0_cO0Xixnj9PtQuvClvU9oNN08LtGVWfp6c7-PUwJX6pyULZOzIx1LcRbEeSe2CrKzTTCqGiJYEDNfVkGfit1HOxPUErUR87IMWtDn8_kw"
                      onError={(e) => {
                        (e.currentTarget as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-2">
                      <h2 className="text-4xl font-bold text-on-surface">{facultyProfile.fullName}</h2>
                      <span className="px-3 py-1 bg-surface-container text-on-surface-variant rounded-lg text-sm font-medium border border-outline-variant">
                        {facultyProfile.employeeId}
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap justify-center md:justify-start gap-6 text-on-surface-variant mb-6 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-lg">mail</span>
                        <span>{facultyProfile.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-lg">call</span>
                        <span>{facultyProfile.mobileNumber}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap justify-center md:justify-start gap-3">
                      <span className="px-6 py-1.5 bg-[#dfe0ff] text-[#2a3aa6] rounded-full text-sm font-bold uppercase">
                        {facultyProfile.designation}
                      </span>
                      <span className="px-6 py-1.5 bg-green-50 text-green-700 border border-green-100 rounded-full text-sm font-bold uppercase">
                        STATUS: {facultyProfile.status}
                      </span>
                      <span className="px-6 py-1.5 bg-surface-container-low text-on-surface rounded-full text-sm font-bold uppercase border border-outline-variant bg-gray-50">
                        OFFICE: {facultyProfile.officeLocation}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  
                  {/* Personal Details (Left Card) */}
                  <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl institution-shadow overflow-hidden bg-white">
                    <div className="p-6 border-b border-outline-variant flex items-center gap-3 bg-gray-50/50">
                      <span className="material-symbols-outlined text-primary">person</span>
                      <h3 className="text-lg font-bold uppercase tracking-wider text-on-surface">Personal Details</h3>
                    </div>
                    <div className="p-0 divide-y divide-outline-variant">
                      <div className="p-6 hover:bg-slate-50/50 transition-colors">
                        <p className="text-[10px] font-bold text-outline uppercase tracking-widest mb-1">Faculty Name</p>
                        <p className="text-sm font-bold text-on-surface">{facultyProfile.fullName}</p>
                      </div>
                      <div className="p-6 hover:bg-slate-50/50 transition-colors">
                        <p className="text-[10px] font-bold text-outline uppercase tracking-widest mb-1">Employee ID</p>
                        <p className="text-sm font-bold text-on-surface">{facultyProfile.employeeId}</p>
                      </div>
                      <div className="p-6 hover:bg-slate-50/50 transition-colors">
                        <p className="text-[10px] font-bold text-outline uppercase tracking-widest mb-1">Date of Birth</p>
                        <p className="text-sm font-bold text-on-surface">{facultyProfile.dob}</p>
                      </div>
                      <div className="p-6 hover:bg-slate-50/50 transition-colors">
                        <p className="text-[10px] font-bold text-outline uppercase tracking-widest mb-1">Gender</p>
                        <p className="text-sm font-bold text-on-surface">{facultyProfile.gender}</p>
                      </div>
                      <div className="p-6 hover:bg-slate-50/50 transition-colors">
                        <p className="text-[10px] font-bold text-outline uppercase tracking-widest mb-1">Email Address</p>
                        <p className="text-sm font-bold text-on-surface">{facultyProfile.email}</p>
                      </div>
                      <div className="p-6 hover:bg-slate-50/50 transition-colors">
                        <p className="text-[10px] font-bold text-outline uppercase tracking-widest mb-1">Mobile Number</p>
                        <p className="text-sm font-bold text-on-surface">{facultyProfile.mobileNumber}</p>
                      </div>
                      <div className="p-6 hover:bg-slate-50/50 transition-colors">
                        <p className="text-[10px] font-bold text-outline uppercase tracking-widest mb-1">Blood Group</p>
                        <p className="text-sm font-bold text-on-surface">{facultyProfile.bloodGroup}</p>
                      </div>
                      <div className="p-6 hover:bg-slate-50/50 transition-colors">
                        <p className="text-[10px] font-bold text-outline uppercase tracking-widest mb-1">Address</p>
                        <p className="text-sm font-bold text-on-surface">{facultyProfile.address}</p>
                      </div>
                      <div className="p-6 hover:bg-slate-50/50 transition-colors">
                        <p className="text-[10px] font-bold text-outline uppercase tracking-widest mb-1">Emergency Contact</p>
                        <p className="text-sm font-bold text-on-surface">{facultyProfile.emergencyContact}</p>
                      </div>
                      <div className="p-6 hover:bg-slate-50/50 transition-colors">
                        <p className="text-[10px] font-bold text-outline uppercase tracking-widest mb-1">Nationality</p>
                        <p className="text-sm font-bold text-on-surface">{facultyProfile.nationality}</p>
                      </div>
                    </div>
                  </div>

                  {/* Professional Details (Right Card) */}
                  <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl institution-shadow overflow-hidden bg-white">
                    <div className="p-6 border-b border-outline-variant flex items-center gap-3 bg-gray-50/50">
                      <span className="material-symbols-outlined text-primary">badge</span>
                      <h3 className="text-lg font-bold uppercase tracking-wider text-on-surface">Professional Details</h3>
                    </div>
                    <div className="p-0 divide-y divide-outline-variant">
                      <div className="p-6 hover:bg-slate-50/50 transition-colors">
                        <p className="text-[10px] font-bold text-outline uppercase tracking-widest mb-1">Department</p>
                        <p className="text-sm font-bold text-on-surface">{facultyProfile.department}</p>
                      </div>
                      <div className="p-6 hover:bg-slate-50/50 transition-colors">
                        <p className="text-[10px] font-bold text-outline uppercase tracking-widest mb-1">Designation</p>
                        <p className="text-sm font-bold text-on-surface">{facultyProfile.designation}</p>
                      </div>
                      <div className="p-6 hover:bg-slate-50/50 transition-colors">
                        <p className="text-[10px] font-bold text-outline uppercase tracking-widest mb-1">Faculty Type</p>
                        <p className="text-sm font-bold text-on-surface">{facultyProfile.employmentType}</p>
                      </div>
                      <div className="p-6 hover:bg-slate-50/50 transition-colors">
                        <p className="text-[10px] font-bold text-outline uppercase tracking-widest mb-1">Highest Qualification</p>
                        <p className="text-sm font-bold text-on-surface">{facultyProfile.highestQualification}</p>
                      </div>
                      <div className="p-6 hover:bg-slate-50/50 transition-colors">
                        <p className="text-[10px] font-bold text-outline uppercase tracking-widest mb-1">Specialization</p>
                        <p className="text-sm font-bold text-on-surface">{facultyProfile.specialization}</p>
                      </div>
                      <div className="p-6 hover:bg-slate-50/50 transition-colors">
                        <p className="text-[10px] font-bold text-outline uppercase tracking-widest mb-1">Joining Date</p>
                        <p className="text-sm font-bold text-on-surface">{facultyProfile.joiningDate}</p>
                      </div>
                      <div className="p-6 hover:bg-slate-50/50 transition-colors">
                        <p className="text-[10px] font-bold text-outline uppercase tracking-widest mb-1">Experience</p>
                        <p className="text-sm font-bold text-on-surface">{facultyProfile.experience}</p>
                      </div>
                      <div className="p-6 hover:bg-slate-50/50 transition-colors">
                        <p className="text-[10px] font-bold text-outline uppercase tracking-widest mb-1">Office Location</p>
                        <p className="text-sm font-bold text-on-surface">{facultyProfile.officeLocation}</p>
                      </div>
                      <div className="p-6 hover:bg-slate-50/50 transition-colors">
                        <p className="text-[10px] font-bold text-outline uppercase tracking-widest mb-1">Reporting Head</p>
                        <p className="text-sm font-bold text-on-surface">{facultyProfile.reportingHead}</p>
                      </div>
                      <div className="p-6 hover:bg-slate-50/50 transition-colors">
                        <p className="text-[10px] font-bold text-outline uppercase tracking-widest mb-1">Employment Status</p>
                        <p className="text-sm font-bold text-on-surface">{facultyProfile.status}</p>
                      </div>
                      <div className="p-6 hover:bg-slate-50/50 transition-colors">
                        <p className="text-[10px] font-bold text-outline uppercase tracking-widest mb-1">Faculty Code</p>
                        <p className="text-sm font-bold text-on-surface">{facultyProfile.facultyCode}</p>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Linked Accounts Section */}
                <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 mt-8 mb-8 institution-shadow bg-white">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="material-symbols-outlined text-primary">link</span>
                    <h3 className="text-lg font-bold uppercase tracking-wider text-on-surface">Linked Identity Accounts</h3>
                  </div>
                  <p className="text-xs text-on-surface-variant mb-6">Link your institutional single sign-on providers to login directly without entering password credentials.</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Google Connection */}
                    <div className="flex items-center justify-between p-4 border border-outline-variant rounded-xl bg-slate-50">
                      <div className="flex items-center gap-3">
                        <svg className="w-6 h-6" viewBox="0 0 24 24">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"></path>
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                        </svg>
                        <div>
                          <p className="text-sm font-bold text-on-surface">Google Account</p>
                          <p className="text-xs text-on-surface-variant">
                            {facultyProfile?.google_linked ? `Connected: ${facultyProfile.email}` : 'Not connected'}
                          </p>
                        </div>
                      </div>
                      <button 
                        onClick={async () => {
                          const nextState = !facultyProfile?.google_linked;
                          await supabase.from('faculty').update({ google_linked: nextState }).eq('id', facultyProfile?.id);
                          setFacultyProfile(prev => prev ? { ...prev, google_linked: nextState } : null as any);
                          
                          const event = new CustomEvent('soet-profile-updated', { detail: { ...facultyProfile, google_linked: nextState } });
                          window.dispatchEvent(event);
                        }}
                        className={`px-4 py-2 text-xs font-bold rounded-lg border cursor-pointer transition-colors ${facultyProfile?.google_linked ? 'bg-transparent text-error border-error hover:bg-error-container' : 'bg-primary text-white hover:bg-primary-dark border-transparent'}`}
                      >
                        {facultyProfile?.google_linked ? 'Unlink' : 'Link Account'}
                      </button>
                    </div>

                    {/* Microsoft Connection */}
                    <div className="flex items-center justify-between p-4 border border-outline-variant rounded-xl bg-slate-50">
                      <div className="flex items-center gap-3">
                        <svg className="w-6 h-6" viewBox="0 0 23 23">
                          <path d="M0 0h23v23H0z" fill="#f3f3f3"></path>
                          <path d="M1 1h10v10H1z" fill="#f35325"></path>
                          <path d="M12 1h10v10H12z" fill="#81bc06"></path>
                          <path d="M1 12h10v10H1z" fill="#05a6f0"></path>
                          <path d="M12 12h10v10H12z" fill="#ffba08"></path>
                        </svg>
                        <div>
                          <p className="text-sm font-bold text-on-surface">Microsoft Outlook</p>
                          <p className="text-xs text-on-surface-variant">
                            {facultyProfile?.microsoft_linked ? `Connected: ${facultyProfile.email}` : 'Not connected'}
                          </p>
                        </div>
                      </div>
                      <button 
                        onClick={async () => {
                          const nextState = !facultyProfile?.microsoft_linked;
                          await supabase.from('faculty').update({ microsoft_linked: nextState }).eq('id', facultyProfile?.id);
                          setFacultyProfile(prev => prev ? { ...prev, microsoft_linked: nextState } : null as any);
                          
                          const event = new CustomEvent('soet-profile-updated', { detail: { ...facultyProfile, microsoft_linked: nextState } });
                          window.dispatchEvent(event);
                        }}
                        className={`px-4 py-2 text-xs font-bold rounded-lg border cursor-pointer transition-colors ${facultyProfile?.microsoft_linked ? 'bg-transparent text-error border-error hover:bg-error-container' : 'bg-primary text-white hover:bg-primary-dark border-transparent'}`}
                      >
                        {facultyProfile?.microsoft_linked ? 'Unlink' : 'Link Account'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Academic Responsibilities Section */}
                <section>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-on-surface uppercase tracking-tight">Academic Responsibilities</h3>
                  </div>

                  <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl institution-shadow overflow-hidden bg-white">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead className="bg-surface-container-low">
                          <tr>
                            <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-outline border-b border-outline-variant">Course Code</th>
                            <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-outline border-b border-outline-variant">Course Name</th>
                            <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-outline border-b border-outline-variant">Semester</th>
                            <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-outline border-b border-outline-variant">Section</th>
                            <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-outline border-b border-outline-variant">Students</th>
                            <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-outline border-b border-outline-variant">Credits</th>
                            <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-outline border-b border-outline-variant">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant">
                          {responsibilities.map((resp) => (
                            <tr key={resp.courseCode} className="hover:bg-surface-bright transition-colors">
                              <td className="px-6 py-5 text-sm font-bold text-on-surface">{resp.courseCode}</td>
                              <td className="px-6 py-5 text-sm text-on-surface font-semibold">{resp.courseName}</td>
                              <td className="px-6 py-5 text-sm text-outline">{resp.semester}</td>
                              <td className="px-6 py-5 text-sm text-on-surface">{resp.section}</td>
                              <td className="px-6 py-5 text-sm text-primary font-bold">{resp.studentsCount} Students</td>
                              <td className="px-6 py-5 text-sm text-on-surface font-semibold">{resp.credits} Credits</td>
                              <td className="px-6 py-5">
                                <span className="px-3 py-1 text-[10px] font-black uppercase rounded-full border bg-green-50 text-green-700 border-green-100">
                                  {resp.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </section>

                {/* Faculty Workload Summary */}
                <section>
                  <h2 className="text-2xl font-bold text-on-surface mb-8 uppercase tracking-tight">Faculty Workload Summary</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    
                    <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 institution-shadow flex items-center gap-5 bg-white">
                      <div className="w-14 h-14 bg-surface-container-low rounded-xl flex items-center justify-center text-on-surface-variant bg-gray-50">
                        <span className="material-symbols-outlined text-3xl text-primary">schedule</span>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-outline uppercase tracking-widest mb-0.5">Teaching Hours</p>
                        <p className="text-lg font-bold text-on-surface">18 Hours / Week</p>
                      </div>
                    </div>

                    <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 institution-shadow flex items-center gap-5 bg-white">
                      <div className="w-14 h-14 bg-surface-container-low rounded-xl flex items-center justify-center text-on-surface-variant bg-gray-50">
                        <span className="material-symbols-outlined text-3xl text-primary">menu_book</span>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-outline uppercase tracking-widest mb-0.5">Assigned Courses</p>
                        <p className="text-lg font-bold text-on-surface">5 Courses</p>
                      </div>
                    </div>

                    <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 institution-shadow flex items-center gap-5 bg-white">
                      <div className="w-14 h-14 bg-surface-container-low rounded-xl flex items-center justify-center text-on-surface-variant bg-gray-50">
                        <span className="material-symbols-outlined text-3xl text-primary">science</span>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-outline uppercase tracking-widest mb-0.5">Research Projects</p>
                        <p className="text-lg font-bold text-on-surface">3 Active Projects</p>
                      </div>
                    </div>

                  </div>
                </section>

                {/* Faculty Performance */}
                <section>
                  <h2 className="text-2xl font-bold text-on-surface mb-8 uppercase tracking-tight">Faculty Performance</h2>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                    
                    <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 institution-shadow flex flex-col justify-between h-36 bg-white">
                      <div className="w-10 h-10 bg-surface-container-low rounded-lg flex items-center justify-center text-on-surface-variant mb-2 bg-gray-50">
                        <span className="material-symbols-outlined text-xl text-primary">co_present</span>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-outline uppercase tracking-widest mb-0.5">Average Attendance</p>
                        <p className="text-2xl font-bold text-on-surface">88.5%</p>
                      </div>
                    </div>

                    <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 institution-shadow flex flex-col justify-between h-36 bg-white">
                      <div className="w-10 h-10 bg-surface-container-low rounded-lg flex items-center justify-center text-on-surface-variant mb-2 bg-gray-50">
                        <span className="material-symbols-outlined text-xl text-primary">thumb_up</span>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-outline uppercase tracking-widest mb-0.5">Student Feedback</p>
                        <p className="text-2xl font-bold text-on-surface">4.8 / 5.0</p>
                      </div>
                    </div>

                    <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 institution-shadow flex flex-col justify-between h-36 bg-white">
                      <div className="w-10 h-10 bg-surface-container-low rounded-lg flex items-center justify-center text-on-surface-variant mb-2 bg-gray-50">
                        <span className="material-symbols-outlined text-xl text-primary">history_edu</span>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-outline uppercase tracking-widest mb-0.5">Publications</p>
                        <p className="text-2xl font-bold text-on-surface">14 Papers</p>
                      </div>
                    </div>

                    <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 institution-shadow flex flex-col justify-between h-36 bg-white">
                      <div className="w-10 h-10 bg-surface-container-low rounded-lg flex items-center justify-center text-on-surface-variant mb-2 bg-gray-50">
                        <span className="material-symbols-outlined text-xl text-primary">assignment_turned_in</span>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-outline uppercase tracking-widest mb-0.5">Syllabus Completion</p>
                        <p className="text-2xl font-bold text-on-surface">92%</p>
                      </div>
                    </div>

                    <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 institution-shadow flex flex-col justify-between h-36 bg-white">
                      <div className="w-10 h-10 bg-surface-container-low rounded-lg flex items-center justify-center text-on-surface-variant mb-2 bg-gray-50">
                        <span className="material-symbols-outlined text-xl text-primary">school</span>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-outline uppercase tracking-widest mb-0.5">Classes Conducted</p>
                        <p className="text-2xl font-bold text-on-surface">42 / 45</p>
                      </div>
                    </div>

                  </div>
                </section>

                {/* Recent Publications */}
                <section>
                  <h2 className="text-2xl font-bold text-on-surface mb-6 uppercase tracking-tight">Recent Publications</h2>
                  <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl institution-shadow overflow-hidden bg-white">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead className="bg-surface-container-low">
                          <tr>
                            <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-outline border-b border-outline-variant">Title</th>
                            <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-outline border-b border-outline-variant">Research Area</th>
                            <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-outline border-b border-outline-variant">Journal</th>
                            <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-outline border-b border-outline-variant">Year</th>
                            <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-outline border-b border-outline-variant">Citations</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant">
                          {publications.map((pub) => (
                            <tr key={pub.id} className="hover:bg-surface-bright transition-colors">
                              <td className="px-6 py-5 text-sm font-bold text-on-surface">{pub.title}</td>
                              <td className="px-6 py-5 text-sm text-outline">{pub.researchArea}</td>
                              <td className="px-6 py-5 text-sm text-on-surface">{pub.journal}</td>
                              <td className="px-6 py-5 text-sm text-on-surface font-semibold">{pub.publicationYear}</td>
                              <td className="px-6 py-5">
                                <span className="px-3 py-1 text-xs font-bold rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                                  {pub.citationCount} Citations
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </section>

                {/* Office Information */}
                <section>
                  <h2 className="text-2xl font-bold text-on-surface mb-8 uppercase tracking-tight">Office Information</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-6">
                    
                    <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 institution-shadow flex items-center gap-4 bg-white">
                      <div className="w-12 h-12 bg-surface-container-low rounded-xl flex items-center justify-center text-on-surface-variant bg-gray-50">
                        <span className="material-symbols-outlined text-2xl text-primary">meeting_room</span>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-outline uppercase tracking-widest mb-0.5">Office Number</p>
                        <p className="text-base font-bold text-on-surface">{facultyProfile.officeLocation}</p>
                      </div>
                    </div>

                    <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 institution-shadow flex items-center gap-4 bg-white">
                      <div className="w-12 h-12 bg-surface-container-low rounded-xl flex items-center justify-center text-on-surface-variant bg-gray-50">
                        <span className="material-symbols-outlined text-2xl text-primary">door_sliding</span>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-outline uppercase tracking-widest mb-0.5">Cabin</p>
                        <p className="text-base font-bold text-on-surface">{facultyProfile.cabin}</p>
                      </div>
                    </div>

                    <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 institution-shadow flex items-center gap-4 bg-white">
                      <div className="w-12 h-12 bg-surface-container-low rounded-xl flex items-center justify-center text-on-surface-variant bg-gray-50">
                        <span className="material-symbols-outlined text-2xl text-primary">call</span>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-outline uppercase tracking-widest mb-0.5">Extension</p>
                        <p className="text-base font-bold text-on-surface">{facultyProfile.extension}</p>
                      </div>
                    </div>

                    <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 institution-shadow flex items-center gap-4 bg-white">
                      <div className="w-12 h-12 bg-surface-container-low rounded-xl flex items-center justify-center text-on-surface-variant bg-gray-50">
                        <span className="material-symbols-outlined text-2xl text-primary">schedule</span>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-outline uppercase tracking-widest mb-0.5">Office Hours</p>
                        <p className="text-xs font-bold text-on-surface leading-tight">{facultyProfile.officeHours}</p>
                      </div>
                    </div>

                    <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 institution-shadow flex items-center gap-4 bg-white">
                      <div className="w-12 h-12 bg-surface-container-low rounded-xl flex items-center justify-center text-on-surface-variant bg-gray-50">
                        <span className="material-symbols-outlined text-2xl text-primary">event_available</span>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-outline uppercase tracking-widest mb-0.5">Availability</p>
                        <p className="text-xs font-bold text-green-600 uppercase tracking-wider">{facultyProfile.availability}</p>
                      </div>
                    </div>

                  </div>
                </section>

                {/* Downloads */}
                <section>
                  <h2 className="text-2xl font-bold text-on-surface mb-6 uppercase tracking-tight">Downloads</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <button 
                      onClick={() => handleDownloadPDF('profile')}
                      className="flex items-center justify-center gap-3 px-6 py-4 bg-white text-on-surface border border-outline-variant rounded-xl text-sm font-bold hover:bg-surface-container transition-all institution-shadow cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-primary text-xl">account_circle</span>
                      Download Faculty Profile
                    </button>
                    <button 
                      onClick={() => handleDownloadPDF('workload')}
                      className="flex items-center justify-center gap-3 px-6 py-4 bg-white text-on-surface border border-outline-variant rounded-xl text-sm font-bold hover:bg-surface-container transition-all institution-shadow cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-primary text-xl">pending_actions</span>
                      Download Workload Report
                    </button>
                    <button 
                      onClick={() => handleDownloadPDF('performance')}
                      className="flex items-center justify-center gap-3 px-6 py-4 bg-white text-on-surface border border-outline-variant rounded-xl text-sm font-bold hover:bg-surface-container transition-all institution-shadow cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-primary text-xl">insights</span>
                      Download Performance Report
                    </button>
                    <button 
                      onClick={() => handleDownloadPDF('id-card')}
                      className="flex items-center justify-center gap-3 px-6 py-4 bg-white text-on-surface border border-outline-variant rounded-xl text-sm font-bold hover:bg-surface-container transition-all institution-shadow cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-primary text-xl">badge</span>
                      Download ID Card
                    </button>
                  </div>
                </section>

                {/* Quick Actions */}
                <section>
                  <h2 className="text-2xl font-bold text-on-surface mb-6 uppercase tracking-tight">Quick Actions</h2>
                  <div className="flex flex-wrap gap-4">
                    <button 
                      onClick={() => setProfileSubView('timetable')}
                      className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-lg text-sm font-bold institution-shadow hover:opacity-90 transition-all cursor-pointer border-none"
                    >
                      <span className="material-symbols-outlined text-sm">calendar_month</span>
                      View Timetable
                    </button>
                    <button 
                      onClick={() => setProfileSubView('leave')}
                      className="flex items-center gap-2 px-6 py-2.5 bg-[#dfe0ff] text-[#2a3aa6] rounded-lg text-sm font-bold institution-shadow hover:opacity-90 transition-all cursor-pointer border-none"
                    >
                      <span className="material-symbols-outlined text-sm">time_to_leave</span>
                      View Leave Balance
                    </button>
                    <button 
                      onClick={() => setProfileSubView('edit-profile')}
                      className="flex items-center gap-2 px-6 py-2.5 bg-white text-on-surface border border-outline-variant rounded-lg text-sm font-bold hover:bg-slate-50 transition-all cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-sm">edit_note</span>
                      Update Profile
                    </button>
                    <button 
                      onClick={() => alert("Accessing university research repository... Current publications: 14. Projects: 3.")}
                      className="flex items-center gap-2 px-6 py-2.5 bg-white text-on-surface border border-outline-variant rounded-lg text-sm font-bold hover:bg-slate-50 transition-all cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-sm">science</span>
                      View Research
                    </button>
                    <button 
                      onClick={() => setProfileSubView('apply-leave')}
                      className="flex items-center gap-2 px-6 py-2.5 bg-red-50 text-brand-red border border-red-200 rounded-lg text-sm font-bold hover:bg-red-100 transition-all cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-sm">assignment_return</span>
                      Apply Leave
                    </button>
                  </div>
                </section>
              </motion.div>
            )}
            {profileSubView === 'timetable' && renderTimetable()}
            {profileSubView === 'leave' && renderLeaveDashboard()}
            {profileSubView === 'edit-profile' && renderEditProfile()}
            {profileSubView === 'apply-leave' && renderApplyLeave()}
          </>
        )}

            {/* TAB: ACADEMICS (EMPTY PLACEHOLDER MODULE) */}
            {activeTab === 'academics' && (
              <motion.div 
                key="academics"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                className="bg-white p-12 rounded-2xl border border-outline-variant text-center max-w-2xl mx-auto my-12"
                id="academics-tab-content"
              >
                <span className="material-symbols-outlined text-5xl text-gray-300 mb-4">school</span>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Academics Planning Portal</h3>
                <p className="text-sm text-gray-500 max-w-md mx-auto">
                  This module is reserved for future academic planning features.
                </p>
                <button 
                  id="btn-academics-back-home"
                  onClick={() => setActiveTab('dashboard')} 
                  className="mt-6 px-6 py-2.5 bg-primary text-white font-bold text-xs rounded-lg hover:opacity-90 transition-all cursor-pointer border-none"
                >
                  Return to Faculty Home Page
                </button>
              </motion.div>
            )}

            {/* TAB: ATTENDANCE WORKSPACE */}
            {activeTab === 'attendance' && (
              tabLoading ? (
                <TableSkeleton colsCount={6} rowsCount={6} />
              ) : (
                <motion.div 
                  key="attendance"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className="space-y-6"
                  id="attendance-tab-content"
                >
                <div className="flex justify-between items-end" id="attendance-header">
                  <div>
                    <h2 className="text-2xl font-bold text-on-surface">Daily Attendance Registry</h2>
                    <p className="text-sm text-on-surface-variant">Secure administrative logging and institutional record maintenance.</p>
                  </div>
                </div>

                {/* Subject Selector, Section, Date & Period selectors */}
                <div className="flex flex-wrap gap-4 items-center justify-between bg-surface-container-low p-4 rounded-xl border border-outline-variant" id="attendance-selectors-bar">
                  <div className="flex flex-wrap gap-3 items-center">
                    <div>
                      <label className="block text-[10px] font-bold text-outline uppercase mb-1">Subject</label>
                      <select 
                        value={selectedSubject} 
                        onChange={(e) => setSelectedSubject(e.target.value)}
                        className="bg-white border border-outline-variant rounded-lg px-3 py-1.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
                      >
                        <option value="CS-601: Distributed Systems">CS-601: Distributed Systems</option>
                        <option value="CS-602: Advanced Neural Networks">CS-602: Advanced Neural Networks</option>
                        <option value="CS-603: Compiler Design">CS-603: Compiler Design</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-outline uppercase mb-1">Section</label>
                      <select 
                        value={selectedSection} 
                        onChange={(e) => setSelectedSection(e.target.value)}
                        className="bg-white border border-outline-variant rounded-lg px-3 py-1.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
                      >
                        <option value="Section A">Section A</option>
                        <option value="Section B">Section B</option>
                        <option value="Section C">Section C</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-outline uppercase mb-1">Date</label>
                      <input 
                        type="date" 
                        value={selectedDate} 
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="bg-white border border-outline-variant rounded-lg px-3 py-1.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-outline uppercase mb-1">Period</label>
                      <select 
                        value={selectedPeriod} 
                        onChange={(e) => setSelectedPeriod(e.target.value)}
                        className="bg-white border border-outline-variant rounded-lg px-3 py-1.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
                      >
                        <option value="Period 1 (09:00 AM - 10:30 AM)">Period 1 (09:00 - 10:30)</option>
                        <option value="Period 2 (11:00 AM - 12:30 PM)">Period 2 (11:00 - 12:30)</option>
                        <option value="Period 3 (02:00 PM - 03:30 PM)">Period 3 (14:00 - 15:30)</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button 
                      id="btn-export-attendance"
                      onClick={handleExportPDF}
                      className="bg-white text-on-surface border border-outline-variant px-4 py-2 rounded-lg text-xs font-bold hover:bg-surface-container transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-xs">download</span> Export Attendance
                    </button>
                    <button 
                      id="btn-upload-attendance"
                      onClick={handleUploadAttendance}
                      className="bg-primary text-on-primary px-4 py-2 rounded-lg text-xs font-bold shadow-sm hover:opacity-90 transition-all flex items-center gap-1.5 cursor-pointer border-none"
                    >
                      <span className="material-symbols-outlined text-xs">cloud_upload</span> Upload Attendance
                    </button>
                  </div>
                </div>

                {/* Attendance status summaries and registries */}
                <div className="flex flex-wrap items-center justify-between gap-4 mb-4 bg-surface-container-low p-3 rounded-lg border border-outline-variant text-xs" id="attendance-status-banner">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-on-surface">Attendance Summary:</span>
                    <span className="px-2.5 py-1 bg-green-50 text-green-700 font-bold rounded-full">
                      {totalPresent} Present
                    </span>
                    <span className="px-2.5 py-1 bg-red-50 text-red-700 font-bold rounded-full">
                      {students.filter(s => s.status === 'absent').length} Absent
                    </span>
                    <span className="px-2.5 py-1 bg-amber-50 text-amber-700 font-bold rounded-full">
                      {students.filter(s => s.status === 'late').length} Late
                    </span>
                    <span className="text-outline">({students.length} Total)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-on-surface">Upload Status:</span>
                      {uploadStatus === 'success' ? (
                        <span className="flex items-center gap-1 text-green-700 font-bold">
                          <span className="material-symbols-outlined text-xs">check_circle</span> Uploaded
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-red-700 font-bold animate-pulse">
                          <span className="material-symbols-outlined text-xs">warning</span> Pending Upload
                        </span>
                      )}
                    </div>
                    {lastUploadedTime && (
                      <div className="text-outline text-[11px] border-l border-outline-variant pl-3">
                        Uploaded <span className="font-semibold text-on-surface">{lastUploadedTime}</span> by <span className="font-semibold text-on-surface">Dr. Elena Vance</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-12 gap-6" id="attendance-workspace-layout">
                  {/* Grid Selector */}
                  <div className="col-span-12 xl:col-span-6 precision-card p-6 rounded-xl bg-white border border-outline-variant flex flex-col" id="card-attendance-grid-interact">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-bold text-on-surface flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">apps</span>
                        Interactive Student Grid
                      </h4>
                      <div className="flex gap-3">
                        <button onClick={markAllPresent} className="text-xs text-primary underline font-bold bg-transparent border-none cursor-pointer">All Present</button>
                        <button onClick={markAllAbsent} className="text-xs text-red-600 underline font-bold bg-transparent border-none cursor-pointer">All Absent</button>
                        <button onClick={resetSession} className="text-xs text-on-surface-variant underline bg-transparent border-none cursor-pointer">Reset</button>
                      </div>
                    </div>
                    <p className="text-xs text-on-surface-variant mb-4">Click any box to cycle: <span className="text-green-700 font-semibold">Present</span> → <span className="text-red-700 font-semibold">Absent</span> → <span className="text-amber-700 font-semibold">Late</span></p>
                    
                    <div className="grid grid-cols-6 sm:grid-cols-10 gap-2.5 overflow-y-auto max-h-[350px] custom-scrollbar pr-2">
                      {students.map((student) => {
                        return (
                          <div 
                            key={student.id}
                            onClick={() => cycleStudentStatus(student.id)}
                            className={`aspect-square flex flex-col items-center justify-center rounded-lg border text-xs font-bold cursor-pointer transition-all duration-200 select-none hover:scale-105 ${
                              student.status === 'present' ? 'bg-green-50 text-green-700 border-green-200' :
                              student.status === 'absent' ? 'bg-error-container text-error border-outline-variant' :
                              'bg-amber-50 text-amber-700 border-amber-200'
                            }`}
                          >
                            <span>{student.rollNo}</span>
                            <span className="text-[8px] opacity-70 uppercase mt-0.5">{student.status.substring(0, 3)}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Table Selector */}
                  <div className="col-span-12 xl:col-span-6 precision-card p-6 rounded-xl bg-white border border-outline-variant flex flex-col" id="card-attendance-list-interact">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                      <h4 className="font-bold text-on-surface flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">list</span>
                        Student Attendance Directory
                      </h4>
                      <div className="relative w-full sm:w-48">
                        <span className="absolute inset-y-0 left-2.5 flex items-center text-outline">
                          <span className="material-symbols-outlined text-xs">search</span>
                        </span>
                        <input 
                          type="text"
                          value={attendanceSearchQuery}
                          onChange={(e) => setAttendanceSearchQuery(e.target.value)}
                          placeholder="Search student..."
                          className="w-full bg-surface-container-low border border-outline-variant rounded-lg py-1 pl-8 pr-3 text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Filters */}
                    <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1">
                      {(['all', 'present', 'absent', 'late'] as const).map((filterOpt) => (
                        <button
                          key={filterOpt}
                          onClick={() => setAttendanceFilter(filterOpt)}
                          className={`px-3 py-1 rounded-full text-[11px] font-bold capitalize cursor-pointer border ${
                            attendanceFilter === filterOpt 
                              ? 'bg-primary text-white border-primary' 
                              : 'bg-white text-on-surface-variant border-outline-variant hover:bg-surface-container-low'
                          }`}
                        >
                          {filterOpt} ({
                            filterOpt === 'all' ? students.length :
                            students.filter(s => s.status === filterOpt).length
                          })
                        </button>
                      ))}
                    </div>

                    {/* Table */}
                    <div className="overflow-y-auto max-h-[280px] custom-scrollbar pr-2 border border-outline-variant rounded-lg">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-surface-container-low text-outline uppercase text-[9px] font-bold sticky top-0">
                          <tr>
                            <th className="px-3 py-2">Roll</th>
                            <th className="px-3 py-2">Student Name</th>
                            <th className="px-3 py-2">Program</th>
                            <th className="px-3 py-2 text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant">
                          {filteredStudents.length === 0 ? (
                            <tr>
                              <td colSpan={4} className="px-4 py-8 text-center text-outline font-semibold">No students found matching filters</td>
                            </tr>
                          ) : (
                            filteredStudents.map((student) => (
                              <tr key={student.id} className="hover:bg-surface-container-low transition-colors">
                                <td className="px-3 py-2.5 font-bold text-on-surface">{student.rollNo}</td>
                                <td className="px-3 py-2.5">
                                  <div className="font-bold text-on-surface">{student.name}</div>
                                  <div className="text-[10px] text-outline">{student.regNo}</div>
                                </td>
                                <td className="px-3 py-2.5 text-on-surface-variant">{student.program}</td>
                                <td className="px-3 py-2.5 text-center">
                                  <select
                                    value={student.status}
                                    onChange={(e) => updateStudentStatus(student.id, e.target.value as any)}
                                    className={`px-2.5 py-1 rounded-full font-bold text-[10px] border cursor-pointer uppercase ${
                                      student.status === 'present' ? 'bg-green-50 text-green-700 border-green-200' :
                                      student.status === 'absent' ? 'bg-error-container text-error border-outline-variant' :
                                      'bg-amber-50 text-amber-700 border-amber-200'
                                    }`}
                                  >
                                    <option value="present">Present</option>
                                    <option value="absent">Absent</option>
                                    <option value="late">Late</option>
                                  </select>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </motion.div>
              )
            )}

            {/* TAB: STUDENTS WORKSPACE */}
            {activeTab === 'students' && (
              tabLoading ? (
                <TableSkeleton colsCount={5} rowsCount={6} />
              ) : (
                <motion.div 
                  key="students"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className="space-y-6"
                  id="students-tab-content"
                >
                  <FacultyStudents />
                </motion.div>
              )
            )}

            {/* TAB: GRIEVANCE REDRESSAL WORKSPACE */}
            {activeTab === 'grievance' && (
              tabLoading ? (
                <TableSkeleton colsCount={5} rowsCount={6} />
              ) : (
                <motion.div 
                  key="grievance"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className="grid grid-cols-12 gap-6"
                  id="grievance-tab-content"
                >
                <div className="col-span-12">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-on-surface">Student Grievance Redressal</h2>
                      <p className="text-sm text-on-surface-variant">Review, track, and resolve student complaints and academic concerns.</p>
                    </div>
                    
                    {/* Filters and search in header */}
                    <div className="flex flex-wrap gap-2 items-center w-full md:w-auto">
                      <div className="relative flex-1 md:flex-none">
                        <span className="absolute inset-y-0 left-2.5 flex items-center text-outline">
                          <span className="material-symbols-outlined text-xs">search</span>
                        </span>
                        <input 
                          type="text"
                          value={grievanceSearch}
                          onChange={(e) => setGrievanceSearch(e.target.value)}
                          placeholder="Search student or description..."
                          className="bg-white border border-outline-variant rounded-lg py-1.5 pl-8 pr-4 text-xs w-full md:w-56 focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>
                      
                      <select
                        value={grievanceStatusFilter}
                        onChange={(e) => setGrievanceStatusFilter(e.target.value as any)}
                        className="bg-white border border-outline-variant rounded-lg px-3 py-1.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
                      >
                        <option value="All">All Statuses</option>
                        <option value="Pending">Pending</option>
                        <option value="Under Review">Under Review</option>
                        <option value="Resolved">Resolved</option>
                        <option value="Escalated">Escalated</option>
                      </select>

                      <select
                        value={grievancePriorityFilter}
                        onChange={(e) => setGrievancePriorityFilter(e.target.value as any)}
                        className="bg-white border border-outline-variant rounded-lg px-3 py-1.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
                      >
                        <option value="All">All Priorities</option>
                        <option value="High">High Priority</option>
                        <option value="Medium">Medium Priority</option>
                        <option value="Low">Low Priority</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Master List Pane */}
                <div className="col-span-12 lg:col-span-5 flex flex-col gap-4">
                  <div className="precision-card bg-white p-4 rounded-xl border border-outline-variant flex flex-col h-[520px]" id="grievance-master-list">
                    <h3 className="font-bold text-xs text-on-surface mb-3 uppercase tracking-wider text-outline flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-sm">assignment_late</span>
                      Assigned Complaints ({filteredGrievances.length})
                    </h3>
                    
                    <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
                      {filteredGrievances.length === 0 ? (
                        <div className="text-center py-12 text-outline font-semibold text-xs">
                          No grievances found matching the filters.
                        </div>
                      ) : (
                        filteredGrievances.map((g) => {
                          const isSelected = selectedGrievanceId === g.id;
                          return (
                            <div 
                              key={g.id}
                              onClick={() => setSelectedGrievanceId(g.id)}
                              className={`p-3 border rounded-lg cursor-pointer transition-all ${
                                isSelected 
                                  ? 'border-primary bg-primary-container/20 shadow-sm' 
                                  : 'border-outline-variant hover:bg-surface-container-low'
                              }`}
                            >
                              <div className="flex justify-between items-start gap-2 mb-1.5">
                                <h4 className="font-bold text-xs text-on-surface truncate max-w-[200px]" title={g.title}>{g.title}</h4>
                                <div className="flex gap-1.5 shrink-0">
                                  <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${
                                    g.priority === 'High' ? 'bg-red-100 text-red-700' :
                                    g.priority === 'Medium' ? 'bg-amber-100 text-amber-700' :
                                    'bg-slate-100 text-slate-700'
                                  }`}>
                                    {g.priority}
                                  </span>
                                  <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${
                                    g.status === 'Pending' ? 'bg-blue-100 text-blue-700' :
                                    g.status === 'Under Review' ? 'bg-purple-100 text-purple-700' :
                                    g.status === 'Resolved' ? 'bg-green-100 text-green-700' :
                                    'bg-red-100 text-red-700'
                                  }`}>
                                    {g.status}
                                  </span>
                                </div>
                              </div>
                              <p className="text-[11px] text-on-surface-variant line-clamp-2 mb-2">{g.description}</p>
                              <div className="flex justify-between items-center text-[10px] text-outline font-semibold uppercase">
                                <span>{g.studentName} ({g.rollNo})</span>
                                <span>{new Date(g.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>

                {/* Detail Workspace Pane */}
                <div className="col-span-12 lg:col-span-7">
                  {selectedGrievance ? (
                    <div className="precision-card bg-white p-6 rounded-xl border border-outline-variant flex flex-col h-[520px]" id="grievance-details-panel">
                      <div className="border-b border-outline-variant pb-4 mb-4">
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <span className="text-[10px] font-black text-outline uppercase tracking-widest">{selectedGrievance.department} • Roll No {selectedGrievance.rollNo}</span>
                            <h3 className="font-bold text-base text-on-surface mt-0.5">{selectedGrievance.title}</h3>
                          </div>
                          <div className="flex gap-2 shrink-0">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${
                              selectedGrievance.priority === 'High' ? 'bg-red-50 text-red-700 border-red-200' :
                              selectedGrievance.priority === 'Medium' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                              'bg-slate-50 text-slate-700 border-slate-200'
                            }`}>
                              {selectedGrievance.priority}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${
                              selectedGrievance.status === 'Pending' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                              selectedGrievance.status === 'Under Review' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                              selectedGrievance.status === 'Resolved' ? 'bg-green-50 text-green-700 border-green-200' :
                              'bg-red-50 text-red-700 border-red-200'
                            }`}>
                              {selectedGrievance.status}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mt-3 text-xs text-on-surface-variant font-medium">
                          <span className="font-bold text-on-surface">Student:</span>
                          <span>{selectedGrievance.studentName}</span>
                          <span className="text-outline-variant">|</span>
                          <span className="font-bold text-on-surface">Submitted:</span>
                          <span>{new Date(selectedGrievance.createdAt).toLocaleString()}</span>
                        </div>
                      </div>

                      {/* Chat log and description */}
                      <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar mb-4 text-xs">
                        <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant">
                          <p className="font-bold text-on-surface mb-1">Grievance Description:</p>
                          <p className="text-on-surface-variant leading-relaxed font-medium">{selectedGrievance.description}</p>
                        </div>

                        {/* Timeline */}
                        <div className="space-y-2 pt-2 border-t border-outline-variant">
                          <p className="font-bold text-outline text-[10px] uppercase tracking-wider">Workflow Audit Timeline</p>
                          {selectedGrievance.history.map((h, hIdx) => (
                            <div key={hIdx} className="flex gap-2 text-[11px] items-start">
                              <span className="material-symbols-outlined text-[14px] text-primary mt-0.5">circle</span>
                              <div>
                                <span className="font-bold text-on-surface">{h.note}</span>
                                <span className="text-[10px] text-outline ml-1.5">({h.updatedBy} • {h.timestamp})</span>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Replies */}
                        <div className="space-y-3 pt-3 border-t border-outline-variant">
                          <p className="font-bold text-outline text-[10px] uppercase tracking-wider">Official Responses</p>
                          {selectedGrievance.replies.length === 0 ? (
                            <p className="text-outline text-[11px] italic">No replies posted yet.</p>
                          ) : (
                            selectedGrievance.replies.map((r, rIdx) => (
                              <div key={rIdx} className={`p-3 rounded-lg flex flex-col gap-1 ${
                                r.role === 'Faculty' ? 'bg-primary-container/10 border border-primary/10 ml-6' : 'bg-slate-50 border border-slate-100 mr-6'
                              }`}>
                                <div className="flex justify-between items-center text-[10px] font-bold text-outline uppercase">
                                  <span>{r.author} ({r.role})</span>
                                  <span>{r.timestamp}</span>
                                </div>
                                <p className="text-on-surface-variant font-medium mt-0.5">{r.text}</p>
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                      {/* Actions and reply box */}
                      <div className="border-t border-outline-variant pt-4 mt-auto">
                        <div className="flex gap-3 mb-3">
                          <textarea
                            value={grievanceReplyText}
                            onChange={(e) => setGrievanceReplyText(e.target.value)}
                            placeholder="Type your official response/instructions here..."
                            className="flex-1 border border-outline-variant rounded-xl p-2.5 text-xs focus:ring-1 focus:ring-primary focus:outline-none min-h-[50px] max-h-[80px]"
                          />
                          <button 
                            id="btn-post-reply"
                            onClick={handlePostGrievanceReply}
                            className="bg-primary text-on-primary px-4 rounded-xl text-xs font-bold hover:opacity-90 transition-all cursor-pointer flex items-center justify-center border-none shrink-0"
                          >
                            <span className="material-symbols-outlined text-sm mr-1">send</span> Send
                          </button>
                        </div>

                        <div className="flex gap-2">
                          <button 
                            id="btn-grievance-review"
                            onClick={() => handleUpdateGrievanceStatus('Under Review')}
                            disabled={selectedGrievance.status === 'Resolved' || selectedGrievance.status === 'Escalated'}
                            className="flex-1 py-2 bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-xs font-bold hover:bg-slate-100 transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                          >
                            <span className="material-symbols-outlined text-sm">visibility</span> Begin Review
                          </button>
                          <button 
                            id="btn-grievance-resolve"
                            onClick={() => handleUpdateGrievanceStatus('Resolved')}
                            disabled={selectedGrievance.status === 'Resolved'}
                            className="flex-1 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-xs font-bold transition-all cursor-pointer border-none flex items-center justify-center gap-1.5 disabled:opacity-50"
                          >
                            <span className="material-symbols-outlined text-sm">check_circle</span> Resolve
                          </button>
                          <button 
                            id="btn-grievance-escalate"
                            onClick={() => handleUpdateGrievanceStatus('Escated')}
                            disabled={selectedGrievance.status === 'Resolved' || selectedGrievance.status === 'Escalated'}
                            className="flex-1 py-2 bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                          >
                            <span className="material-symbols-outlined text-sm">arrow_upward</span> Escalate
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="precision-card bg-white p-12 rounded-xl border border-outline-variant text-center h-[520px] flex flex-col justify-center items-center">
                      <span className="material-symbols-outlined text-5xl text-outline mb-4">forum</span>
                      <h3 className="font-bold text-on-surface text-base mb-1">Select a Grievance</h3>
                      <p className="text-xs text-on-surface-variant max-w-sm">Choose a student grievance from the directory list on the left to review documentation, exchange chat messages, and execute administrative actions.</p>
                    </div>
                  )}
                </div>
              </motion.div>
              )
            )}

            {/* TAB: NOTIFICATIONS */}
            {activeTab === 'notification' && (
              tabLoading ? (
                <TableSkeleton colsCount={4} rowsCount={5} />
              ) : (
                <motion.div 
                  key="notification"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className="max-w-4xl mx-auto space-y-8"
                  id="notification-tab-content"
                >
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-outline-variant text-left">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b pb-4 border-gray-100">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800">Faculty Notices &amp; Circulars</h2>
                      <p className="text-sm text-gray-500">Official academic announcements, registrar directives, meeting schedules, and policy guidelines.</p>
                    </div>
                    {unreadNotifCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-xs font-bold text-brand-red hover:underline bg-transparent border-none cursor-pointer flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-sm">done_all</span> Mark all as read
                      </button>
                    )}
                  </div>

                  {/* Categories */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {['All', 'Notice', 'Exam', 'Event', 'Administrative'].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setNotifCategoryFilter(cat)}
                        className={`px-4 py-1.5 rounded-full text-xs font-bold border cursor-pointer transition-all ${
                          notifCategoryFilter === cat
                            ? 'bg-brand-red border-brand-red text-white'
                            : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  {/* Notifications List */}
                  <div className="space-y-4">
                    {facultyNotifications
                      .filter((n) => notifCategoryFilter === 'All' || n.category === notifCategoryFilter)
                      .length === 0 ? (
                        <div className="p-8 text-center bg-gray-50 border border-dashed rounded-xl text-gray-400">
                          No circulars found in this category.
                        </div>
                      ) : (
                        facultyNotifications
                          .filter((n) => notifCategoryFilter === 'All' || n.category === notifCategoryFilter)
                          .map((n) => {
                            const isUnread = !n.readBy.includes('fac-0142');
                            return (
                              <div
                                key={n.id}
                                onClick={() => {
                                  setSelectedNotif(n);
                                  if (isUnread) {
                                    handleMarkNotifRead(n.id);
                                  }
                                }}
                                className={`p-6 rounded-2xl border transition-all cursor-pointer flex gap-4 ${
                                  isUnread 
                                    ? 'bg-red-50/20 border-red-100 hover:bg-red-50/30' 
                                    : 'bg-gray-50/50 border-gray-100 hover:bg-gray-50'
                                }`}
                              >
                                <span className={`material-symbols-outlined text-2xl mt-1 ${
                                  n.category === 'Exam' ? 'text-brand-red' :
                                  n.category === 'Administrative' ? 'text-indigo-600' : 'text-blue-600'
                                }`}>
                                  {n.category === 'Exam' ? 'assignment_late' :
                                   n.category === 'Administrative' ? 'gavel' : 'notifications'}
                                </span>
                                <div className="flex-1">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${
                                      n.category === 'Exam' ? 'bg-red-100 text-brand-red' :
                                      n.category === 'Administrative' ? 'bg-indigo-100 text-indigo-800' : 'bg-blue-100 text-blue-800'
                                    }`}>
                                      {n.category}
                                    </span>
                                    {isUnread && (
                                      <span className="bg-brand-red text-white text-[8px] font-bold px-1.5 py-0.2 rounded-full uppercase">NEW</span>
                                    )}
                                    <span className="text-[10px] text-gray-400 ml-auto">{n.date}</span>
                                  </div>
                                  <h4 className={`font-bold text-gray-800 text-sm mt-1.5 ${isUnread ? 'text-black' : 'text-gray-700'}`}>
                                    {n.title}
                                  </h4>
                                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                    {n.text}
                                  </p>
                                  <span className="text-[10px] text-gray-400 block mt-2">Sender: {n.sender}</span>
                                </div>
                              </div>
                            );
                          })
                      )}
                  </div>
                </div>
              </motion.div>
              )
            )}

            {/* Notification Details Modal */}
            {selectedNotif && activeTab === 'notification' && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="modal-overlay absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedNotif(null)}></div>
                <div className="bg-white rounded-3xl max-w-lg w-full relative z-10 p-8 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-150 text-left">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="bg-red-50 text-brand-red text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                        {selectedNotif.category} circular
                      </span>
                      <h3 className="font-bold text-gray-800 text-lg mt-2">{selectedNotif.title}</h3>
                    </div>
                    <button 
                      onClick={() => setSelectedNotif(null)}
                      className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 border-none bg-transparent cursor-pointer"
                    >
                      <span className="material-symbols-outlined">close</span>
                    </button>
                  </div>

                  <div className="py-4 border-t border-b border-gray-100">
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {selectedNotif.text}
                    </p>
                  </div>

                  <div className="flex justify-between items-center text-xs text-gray-400 pt-4">
                    <span>Issued By: {selectedNotif.sender}</span>
                    <span>Date: {selectedNotif.date}</span>
                  </div>
                </div>
              </div>
            )}

          </AnimatePresence>

        </div>

        <footer className="py-6 px-8 border-t border-outline-variant text-center text-outline text-xs bg-white">
          © 2026 Precision Institutional Portal. All rights reserved.
        </footer>
      </main>

      {/* MODAL 1: STUDENTS AT RISK REGISTRY TABLE (Requirement 9) */}
      {riskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" id="risk-registry-modal">
          <div className="modal-overlay absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setRiskModalOpen(false)}></div>
          <div className="bg-white rounded-3xl max-w-5xl w-full relative z-10 p-8 shadow-2xl border border-gray-100 flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-800">Students At Risk Registry</h2>
                <p className="text-xs text-gray-400 uppercase tracking-wider">SOET Attendance Deficiency Management System</p>
              </div>
              <button 
                id="btn-close-risk-modal"
                onClick={() => setRiskModalOpen(false)}
                className="size-8 rounded-full border border-gray-200 hover:bg-gray-100 flex items-center justify-center text-gray-500 cursor-pointer bg-white"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>

            {/* Table wrapper */}
            <div className="flex-1 overflow-auto border border-outline-variant rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[9px] font-bold sticky top-0 border-b border-outline-variant">
                  <tr>
                    <th className="px-4 py-3">Roll No</th>
                    <th className="px-4 py-3">Student Name</th>
                    <th className="px-4 py-3">Department</th>
                    <th className="px-4 py-3">Semester</th>
                    <th className="px-4 py-3 text-center">Attendance %</th>
                    <th className="px-4 py-3 text-center">Risk Level</th>
                    <th className="px-4 py-3">Parent Contact</th>
                    <th className="px-4 py-3">Last Notice</th>
                    <th className="px-4 py-3">Faculty Remark</th>
                    <th className="px-4 py-3 text-right">Quick Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {riskStudents.map((student) => (
                    <tr key={student.rollNo} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-gray-700">{student.rollNo}</td>
                      <td className="px-4 py-3 font-bold text-gray-800">{student.name}</td>
                      <td className="px-4 py-3">{student.department}</td>
                      <td className="px-4 py-3">{student.semester}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          student.attendancePercent <= 40 ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-amber-50 text-amber-700 border border-amber-100'
                        }`}>
                          {student.attendancePercent}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                          student.riskLevel === 'High' ? 'bg-red-600 text-white' : 'bg-amber-500 text-white'
                        }`}>
                          {student.riskLevel}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono">{student.parentContact}</td>
                      <td className="px-4 py-3 text-gray-500">{student.lastNotice}</td>
                      <td className="px-4 py-3 text-gray-600 italic">"{student.remark}"</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex gap-1.5 justify-end">
                          <button 
                            onClick={() => alert(`Dialing parent of ${student.name} at ${student.parentContact}...`)}
                            className="size-7 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer border-none"
                            title="Call Parent"
                          >
                            <span className="material-symbols-outlined text-sm">call</span>
                          </button>
                          <button 
                            onClick={() => {
                              setSelectedNoticeStudent({
                                studentName: student.name,
                                rollNo: student.rollNo,
                                attendancePercent: student.attendancePercent,
                                phone: student.parentContact
                              });
                              setNoticeModalOpen(true);
                            }}
                            className="size-7 rounded bg-primary hover:opacity-90 text-white flex items-center justify-center cursor-pointer border-none"
                            title="Generate Notice"
                          >
                            <span className="material-symbols-outlined text-sm">mail</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex justify-end gap-3" id="risk-modal-actions">
              <button 
                id="btn-export-risk-csv"
                onClick={() => alert("Exporting risk student registry to CSV spreadsheet format...")}
                className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-bold hover:bg-slate-50 cursor-pointer flex items-center gap-1.5 bg-white"
              >
                <span className="material-symbols-outlined text-xs">download</span> Export CSV
              </button>
              <button 
                id="btn-close-risk-registry"
                onClick={() => setRiskModalOpen(false)}
                className="px-6 py-2 bg-slate-800 text-white text-xs font-bold rounded-lg hover:bg-slate-900 cursor-pointer border-none"
              >
                Close Registry
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: PARENT NOTICE GENERATION & UTILITY PANEL (Requirement 6) */}
      {noticeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" id="parent-notices-modal">
          <div className="modal-overlay absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setNoticeModalOpen(false)}></div>
          <div className="bg-white rounded-3xl max-w-4xl w-full relative z-10 p-8 shadow-2xl border border-gray-100 flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-800">Deficiency Alert notice generator</h2>
                <p className="text-xs text-gray-400 uppercase tracking-wider">Automated Parent Correspondence Delivery</p>
              </div>
              <button 
                id="btn-close-notices-top"
                onClick={() => setNoticeModalOpen(false)}
                className="size-8 rounded-full border border-gray-200 hover:bg-gray-100 flex items-center justify-center text-gray-500 cursor-pointer bg-white"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 flex-1 overflow-hidden" id="notice-modal-grid">
              
              {/* Left Column: Deficiency students list */}
              <div className="md:col-span-4 border border-outline-variant rounded-xl p-4 flex flex-col overflow-hidden bg-slate-50" id="notice-left-column">
                <p className="text-[10px] font-bold uppercase text-slate-500 mb-3 tracking-wider">Select Student</p>
                <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                  {riskStudents.map((student) => {
                    const isSelected = selectedNoticeStudent.rollNo === student.rollNo;
                    return (
                      <div 
                        key={student.rollNo}
                        onClick={() => setSelectedNoticeStudent({
                          studentName: student.name,
                          rollNo: student.rollNo,
                          attendancePercent: student.attendancePercent,
                          phone: student.parentContact
                        })}
                        className={`p-2.5 border rounded-lg cursor-pointer transition-all flex justify-between items-center bg-white ${
                          isSelected ? 'border-primary bg-primary-container/10 ring-1 ring-primary' : 'border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <div>
                          <p className="text-xs font-bold text-gray-800">{student.name}</p>
                          <p className="text-[10px] text-gray-400">Roll: {student.rollNo}</p>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          student.attendancePercent <= 40 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {student.attendancePercent}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Notice preview & utilities */}
              <div className="md:col-span-8 flex flex-col overflow-hidden" id="notice-right-column">
                <p className="text-[10px] font-bold uppercase text-slate-500 mb-2 tracking-wider">Official Preview (Auto-generated letter)</p>
                <div className="flex-1 flex flex-col overflow-hidden">
                  <textarea
                    id="parent-notice-textarea"
                    readOnly
                    value={generateNoticeText(selectedNoticeStudent.studentName, selectedNoticeStudent.rollNo, selectedNoticeStudent.attendancePercent)}
                    className="flex-1 w-full p-4 border border-outline-variant rounded-xl text-xs font-mono bg-slate-50 leading-relaxed text-gray-800 resize-none focus:outline-none"
                  />
                  
                  {/* Action row with Copy, Download, Print, future-proof email/WhatsApp */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-4" id="notice-actions-grid">
                    <button 
                      id="btn-notice-copy"
                      onClick={() => handleCopyNotice(generateNoticeText(selectedNoticeStudent.studentName, selectedNoticeStudent.rollNo, selectedNoticeStudent.attendancePercent))}
                      className="px-3 py-2 bg-slate-800 text-white rounded-lg text-xs font-bold hover:bg-slate-900 transition-all cursor-pointer border-none flex items-center justify-center gap-1"
                    >
                      <span className="material-symbols-outlined text-xs">content_copy</span> Copy
                    </button>
                    <button 
                      id="btn-notice-download"
                      onClick={() => handleDownloadNotice(selectedNoticeStudent.studentName, generateNoticeText(selectedNoticeStudent.studentName, selectedNoticeStudent.rollNo, selectedNoticeStudent.attendancePercent))}
                      className="px-3 py-2 bg-white text-slate-800 border border-slate-200 rounded-lg text-xs font-bold hover:bg-slate-100 transition-all cursor-pointer flex items-center justify-center gap-1"
                    >
                      <span className="material-symbols-outlined text-xs">download</span> Save
                    </button>
                    <button 
                      id="btn-notice-print"
                      onClick={() => handlePrintNotice(generateNoticeText(selectedNoticeStudent.studentName, selectedNoticeStudent.rollNo, selectedNoticeStudent.attendancePercent))}
                      className="px-3 py-2 bg-white text-slate-800 border border-slate-200 rounded-lg text-xs font-bold hover:bg-slate-100 transition-all cursor-pointer flex items-center justify-center gap-1"
                    >
                      <span className="material-symbols-outlined text-xs">print</span> Print
                    </button>
                    
                    {/* Future extensions */}
                    <button 
                      id="btn-notice-email-future"
                      onClick={() => alert("Email integration scheduled for Phase 3 deployment. Currently locked.")}
                      className="px-3 py-2 bg-slate-100 text-slate-400 rounded-lg text-[10px] font-bold cursor-not-allowed border-none relative flex flex-col items-center justify-center"
                      title="Future Integration"
                    >
                      <span>Send Email</span>
                      <span className="text-[8px] uppercase tracking-wider opacity-60">Locked</span>
                    </button>
                    <button 
                      id="btn-notice-whatsapp-future"
                      onClick={() => alert("WhatsApp API integration scheduled for Phase 3 deployment. Currently locked.")}
                      className="px-3 py-2 bg-slate-100 text-slate-400 rounded-lg text-[10px] font-bold cursor-not-allowed border-none relative flex flex-col items-center justify-center"
                      title="Future Integration"
                    >
                      <span>WhatsApp</span>
                      <span className="text-[8px] uppercase tracking-wider opacity-60">Locked</span>
                    </button>
                  </div>
                </div>
              </div>

            </div>

            <div className="mt-6 flex justify-end border-t border-slate-100 pt-4" id="notices-modal-footer">
              <button 
                id="btn-close-notices-bottom"
                onClick={() => setNoticeModalOpen(false)}
                className="px-6 py-2 bg-slate-800 text-white text-xs font-bold rounded-lg hover:bg-slate-900 cursor-pointer border-none"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {renderLectureModal()}

    </div>
  );
}

interface EditProfileFormProps {
  facultyProfile: FacultyProfile;
  onSave: (updated: FacultyProfile) => void;
  onCancel: () => void;
}

function EditProfileForm({ facultyProfile, onSave, onCancel }: EditProfileFormProps) {
  const [formData, setFormData] = useState<FacultyProfile>({ ...facultyProfile });
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profilePic, setProfilePic] = useState<string>(facultyProfile.fullName); // Simple placeholder representation
  const [tempPicUrl, setTempPicUrl] = useState<string | null>(null);

  const handleInputChange = (field: keyof FacultyProfile, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      setTempPicUrl(url);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword && newPassword !== confirmPassword) {
      alert("New Password and Confirm Password do not match!");
      return;
    }
    onSave(formData);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="bg-white border border-outline-variant rounded-2xl p-8 max-w-4xl mx-auto space-y-8 institution-shadow"
    >
      <div className="flex items-center justify-between border-b border-outline-variant pb-4">
        <div>
          <h2 className="text-2xl font-bold text-on-surface">Edit Faculty Profile</h2>
          <p className="text-sm text-on-surface-variant">Modify your official record registry details and security password.</p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="text-[#9e1b32] hover:underline bg-transparent border-none font-bold text-sm cursor-pointer"
        >
          Cancel &amp; Exit
        </button>
      </div>

      <form onSubmit={handleFormSubmit} className="space-y-8">
        
        {/* Profile Picture Section */}
        <div className="bg-slate-50 p-6 rounded-2xl border border-outline-variant flex flex-col sm:flex-row items-center gap-6">
          <div className="w-24 h-24 bg-primary rounded-2xl flex items-center justify-center text-white text-3xl font-black select-none overflow-hidden border border-outline-variant">
            {tempPicUrl ? (
              <img src={tempPicUrl} alt="Uploaded Avatar" className="w-full h-full object-cover" />
            ) : (
              <img 
                alt="Dr. Elena Vance" 
                className="w-full h-full object-cover" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuASInz3fouGCVLXLiMDjuPIO5hsZXNfB2qlfAg8AzuesXkvN92i3TPJ3B4bQ72Hq1eXNxEnKDh2EPb_AV7oacPba73KP8V0OHyMTKrnU3d4w65J9sEiW1nwzHQwiIuEWoY4bzwVl0suLWVyJFCZ5Nat4P7l2dlKPIiFB0_cO0Xixnj9PtQuvClvU9oNN08LtGVWfp6c7-PUwJX6pyULZOzIx1LcRbEeSe2CrKzTTCqGiJYEDNfVkGfit1HOxPUErUR87IMWtDn8_kw"
              />
            )}
          </div>
          <div className="space-y-2 flex-1 text-center sm:text-left">
            <h3 className="text-sm font-bold text-on-surface">Profile Picture Upload</h3>
            <p className="text-xs text-outline font-semibold">Supported formats: JPG, PNG. Max size 2MB.</p>
            <div className="flex flex-col sm:flex-row items-center gap-3 justify-center sm:justify-start">
              <label className="px-4 py-2 bg-white border border-outline-variant hover:bg-slate-100 rounded-lg text-xs font-bold text-on-surface cursor-pointer select-none">
                Choose Image
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileChange} 
                  className="hidden" 
                />
              </label>
              {tempPicUrl && (
                <button
                  type="button"
                  onClick={() => setTempPicUrl(null)}
                  className="text-xs font-bold text-red-600 hover:underline cursor-pointer bg-transparent border-none"
                >
                  Reset Picture
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Category: Personal Details */}
        <div className="space-y-4">
          <h3 className="text-xs font-black uppercase text-outline tracking-wider border-b border-outline-variant pb-1">Personal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-on-surface mb-1">Full Name</label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                className="w-full px-4 py-2.5 border border-outline-variant rounded-xl text-sm font-semibold focus:outline-none focus:border-red-400 bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-on-surface mb-1">Email Address</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full px-4 py-2.5 border border-outline-variant rounded-xl text-sm font-semibold focus:outline-none focus:border-red-400 bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-on-surface mb-1">Mobile Number</label>
              <input
                type="text"
                required
                value={formData.mobileNumber}
                onChange={(e) => handleInputChange('mobileNumber', e.target.value)}
                className="w-full px-4 py-2.5 border border-outline-variant rounded-xl text-sm font-semibold focus:outline-none focus:border-red-400 bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-on-surface mb-1">Emergency Contact Info</label>
              <input
                type="text"
                required
                value={formData.emergencyContact}
                onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                className="w-full px-4 py-2.5 border border-outline-variant rounded-xl text-sm font-semibold focus:outline-none focus:border-red-400 bg-white"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-on-surface mb-1">Residential Address</label>
              <textarea
                rows={2}
                required
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className="w-full px-4 py-2.5 border border-outline-variant rounded-xl text-sm font-semibold focus:outline-none focus:border-red-400 bg-white"
              />
            </div>
          </div>
        </div>

        {/* Category: Academic Information */}
        <div className="space-y-4">
          <h3 className="text-xs font-black uppercase text-outline tracking-wider border-b border-outline-variant pb-1">Academic Registry Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-on-surface mb-1">Academic Department</label>
              <input
                type="text"
                required
                value={formData.department}
                onChange={(e) => handleInputChange('department', e.target.value)}
                className="w-full px-4 py-2.5 border border-outline-variant rounded-xl text-sm font-semibold focus:outline-none focus:border-red-400 bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-on-surface mb-1">Faculty Designation</label>
              <input
                type="text"
                required
                value={formData.designation}
                onChange={(e) => handleInputChange('designation', e.target.value)}
                className="w-full px-4 py-2.5 border border-outline-variant rounded-xl text-sm font-semibold focus:outline-none focus:border-red-400 bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-on-surface mb-1">Highest Academic Qualification</label>
              <input
                type="text"
                required
                value={formData.highestQualification}
                onChange={(e) => handleInputChange('highestQualification', e.target.value)}
                className="w-full px-4 py-2.5 border border-outline-variant rounded-xl text-sm font-semibold focus:outline-none focus:border-red-400 bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-on-surface mb-1">Professional Experience (Years)</label>
              <input
                type="text"
                required
                value={formData.experience}
                onChange={(e) => handleInputChange('experience', e.target.value)}
                className="w-full px-4 py-2.5 border border-outline-variant rounded-xl text-sm font-semibold focus:outline-none focus:border-red-400 bg-white"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-on-surface mb-1">Research Specialization Area</label>
              <input
                type="text"
                required
                value={formData.specialization}
                onChange={(e) => handleInputChange('specialization', e.target.value)}
                className="w-full px-4 py-2.5 border border-outline-variant rounded-xl text-sm font-semibold focus:outline-none focus:border-red-400 bg-white"
              />
            </div>
          </div>
        </div>

        {/* Category: Professional Details */}
        <div className="space-y-4">
          <h3 className="text-xs font-black uppercase text-outline tracking-wider border-b border-outline-variant pb-1">Professional Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-bold text-on-surface mb-1">Employee ID</label>
              <input
                type="text"
                disabled
                value={formData.employeeId}
                className="w-full px-4 py-2.5 border border-outline-variant rounded-xl text-sm font-semibold bg-slate-50 text-slate-500 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-on-surface mb-1">Joining Date</label>
              <input
                type="text"
                disabled
                value={formData.joiningDate}
                className="w-full px-4 py-2.5 border border-outline-variant rounded-xl text-sm font-semibold bg-slate-50 text-slate-500 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-on-surface mb-1">Office Room / Cabin</label>
              <input
                type="text"
                required
                value={formData.officeLocation}
                onChange={(e) => handleInputChange('officeLocation', e.target.value)}
                className="w-full px-4 py-2.5 border border-outline-variant rounded-xl text-sm font-semibold focus:outline-none focus:border-red-400 bg-white"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-on-surface mb-1">Available Consultation Office Hours</label>
              <input
                type="text"
                required
                value={formData.officeHours}
                onChange={(e) => handleInputChange('officeHours', e.target.value)}
                className="w-full px-4 py-2.5 border border-outline-variant rounded-xl text-sm font-semibold focus:outline-none focus:border-red-400 bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-on-surface mb-1">Internal Cabin Phone Ext.</label>
              <input
                type="text"
                required
                value={formData.extension}
                onChange={(e) => handleInputChange('extension', e.target.value)}
                className="w-full px-4 py-2.5 border border-outline-variant rounded-xl text-sm font-semibold focus:outline-none focus:border-red-400 bg-white"
              />
            </div>
          </div>
        </div>

        {/* Category: Password Change */}
        <div className="space-y-4">
          <h3 className="text-xs font-black uppercase text-outline tracking-wider border-b border-outline-variant pb-1">Security / Password Change</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-bold text-on-surface mb-1">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-2.5 border border-outline-variant rounded-xl text-sm font-semibold focus:outline-none focus:border-red-400 bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-on-surface mb-1">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2.5 border border-outline-variant rounded-xl text-sm font-semibold focus:outline-none focus:border-red-400 bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-on-surface mb-1">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2.5 border border-outline-variant rounded-xl text-sm font-semibold focus:outline-none focus:border-red-400 bg-white"
              />
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-4 border-t border-outline-variant pt-6">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2.5 bg-white text-on-surface border border-outline-variant rounded-xl text-sm font-bold hover:bg-slate-50 transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 bg-[#9e1b32] text-white rounded-xl text-sm font-bold hover:opacity-90 transition-all cursor-pointer border-none"
          >
            Save Changes
          </button>
        </div>

      </form>
    </motion.div>
  );
}

interface ApplyLeaveFormProps {
  onSave: (newRequest: LeaveRequest) => void;
  onCancel: () => void;
}

function ApplyLeaveForm({ onSave, onCancel }: ApplyLeaveFormProps) {
  const [leaveType, setLeaveType] = useState("Casual Leave");
  const [startDate, setStartDate] = useState("2026-07-06");
  const [endDate, setEndDate] = useState("2026-07-07");
  const [reason, setReason] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("+91 98765 43219");
  const [halfDay, setHalfDay] = useState(false);
  const [documentName, setDocumentName] = useState<string | undefined>(undefined);

  const calculateDays = () => {
    if (halfDay) return 0.5;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diff = end.getTime() - start.getTime();
    if (isNaN(diff)) return 1;
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
    return Math.max(1, days);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setDocumentName(e.target.files[0].name);
    }
  };

  const handleReset = () => {
    setLeaveType("Casual Leave");
    setStartDate("2026-07-06");
    setEndDate("2026-07-07");
    setReason("");
    setEmergencyContact("+91 98765 43219");
    setHalfDay(false);
    setDocumentName(undefined);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (new Date(startDate) > new Date(endDate)) {
      alert("Start Date cannot be after End Date!");
      return;
    }
    const days = calculateDays();
    const id = `LR-${Math.floor(1000 + Math.random() * 9000)}`;
    const appliedDate = new Date().toISOString().split('T')[0];

    onSave({
      id,
      leaveType,
      startDate,
      endDate,
      days,
      reason,
      emergencyContact,
      documentName,
      halfDay,
      status: 'Pending',
      appliedDate
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="bg-white border border-outline-variant rounded-2xl p-8 max-w-2xl mx-auto space-y-8 institution-shadow"
    >
      <div className="flex items-center justify-between border-b border-outline-variant pb-4">
        <div>
          <h2 className="text-2xl font-bold text-on-surface">Leave Application Form</h2>
          <p className="text-sm text-on-surface-variant">Apply for leave and upload supporting medical or personal registry files.</p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="text-[#9e1b32] hover:underline bg-transparent border-none font-bold text-sm cursor-pointer"
        >
          Cancel
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Leave type and dates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-on-surface mb-1">Leave Type</label>
            <select
              value={leaveType}
              onChange={(e) => setLeaveType(e.target.value)}
              className="w-full px-4 py-2.5 border border-outline-variant rounded-xl text-sm font-semibold focus:outline-none focus:border-red-400 bg-white"
            >
              <option value="Casual Leave">Casual Leave (CL)</option>
              <option value="Sick Leave">Sick Leave (SL)</option>
              <option value="Earned Leave">Earned Leave (EL)</option>
              <option value="Maternity/Paternity Leave">Maternity/Paternity Leave</option>
            </select>
          </div>

          <div className="flex items-center pt-6">
            <label className="flex items-center gap-2 cursor-pointer select-none text-sm font-bold text-on-surface">
              <input
                type="checkbox"
                checked={halfDay}
                onChange={(e) => setHalfDay(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              Apply as Half Day (0.5 days)
            </label>
          </div>

          <div>
            <label className="block text-xs font-bold text-on-surface mb-1">Start Date</label>
            <input
              type="date"
              required
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-2.5 border border-outline-variant rounded-xl text-sm font-semibold focus:outline-none focus:border-red-400 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-on-surface mb-1">End Date</label>
            <input
              type="date"
              required
              disabled={halfDay}
              value={halfDay ? startDate : endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className={`w-full px-4 py-2.5 border border-outline-variant rounded-xl text-sm font-semibold focus:outline-none focus:border-red-400 bg-white ${halfDay ? 'bg-slate-50 cursor-not-allowed text-slate-400' : ''}`}
            />
          </div>
        </div>

        {/* Reason */}
        <div>
          <label className="block text-xs font-bold text-on-surface mb-1">Reason for Leave</label>
          <textarea
            rows={3}
            required
            placeholder="Please write down a clear professional explanation for leaving request..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full px-4 py-2.5 border border-outline-variant rounded-xl text-sm font-semibold focus:outline-none focus:border-red-400 bg-white"
          />
        </div>

        {/* Emergency Contact & Upload Document */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-on-surface mb-1">Emergency Contact Number</label>
            <input
              type="text"
              required
              value={emergencyContact}
              onChange={(e) => setEmergencyContact(e.target.value)}
              className="w-full px-4 py-2.5 border border-outline-variant rounded-xl text-sm font-semibold focus:outline-none focus:border-red-400 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-on-surface mb-1">Supporting Document (Medical cert / invite)</label>
            <div className="border border-dashed border-outline-variant rounded-xl p-3 flex items-center justify-between gap-3 bg-slate-50">
              <span className="material-symbols-outlined text-outline text-2xl">upload_file</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold truncate text-on-surface">
                  {documentName ? documentName : "No file chosen"}
                </p>
                <p className="text-[10px] text-outline font-semibold">PDF, JPG up to 5MB</p>
              </div>
              <label className="px-3 py-1.5 bg-white border border-outline-variant hover:bg-slate-100 rounded-lg text-xs font-bold text-on-surface cursor-pointer whitespace-nowrap">
                Browse
                <input 
                  type="file" 
                  accept=".pdf,image/*" 
                  onChange={handleFileUpload} 
                  className="hidden" 
                />
              </label>
            </div>
          </div>
        </div>

        {/* Dynamic leaves computed counter */}
        <div className="bg-slate-50 p-4 rounded-xl border border-outline-variant text-center">
          <p className="text-xs font-bold text-outline">Total Days Computed</p>
          <p className="text-2xl font-black text-on-surface mt-1">
            {calculateDays()} Day{calculateDays() !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Actions buttons */}
        <div className="flex justify-between items-center gap-4 border-t border-outline-variant pt-6">
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold cursor-pointer border-none"
          >
            Reset Form
          </button>
          
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2.5 bg-white text-on-surface border border-outline-variant rounded-xl text-xs font-bold hover:bg-slate-50 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#9e1b32] text-white rounded-xl text-xs font-bold hover:opacity-90 transition-all cursor-pointer border-none"
            >
              Submit Application
            </button>
          </div>
        </div>

      </form>
    </motion.div>
  );
}

