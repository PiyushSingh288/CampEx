import React, { useState } from 'react';
import { jsPDF } from 'jspdf';

interface StudentRecord {
  id: string;
  fullName: string;
  rollNo: string;
  email: string;
  course: string;
  semester: string;
  section: string;
  subject: string;
  attendance: number;
  grade: string;
  internalMarks: number;
  assignmentMarks: number;
  quizMarks: number;
  midSemMarks: number;
  practicalMarks: number;
  status: string;
  photoUrl: string;
  phone: string;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  notices: { id: string; title: string; date: string }[];
  grievances: { id: string; title: string; status: string; date: string }[];
  attendanceHistory: { date: string; status: 'Present' | 'Absent' }[];
  gradeTrend: { sem: string; sgpa: number }[];
  academicRemarks?: string[];
}

const INITIAL_STUDENTS: StudentRecord[] = [
  {
    id: "stud-01",
    fullName: "Rahul Kumar",
    rollNo: "CS-2023-101",
    email: "rahul.kumar@krmu.edu.in",
    course: "B.Tech CSE (AI & ML)",
    semester: "Semester 5",
    section: "Section A",
    subject: "CS601: Distributed Systems",
    attendance: 78,
    grade: "B+",
    internalMarks: 22,
    assignmentMarks: 16,
    quizMarks: 8,
    midSemMarks: 24,
    practicalMarks: 9,
    status: "Active",
    photoUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150",
    phone: "+91 98765 11223",
    parentName: "Sanjay Kumar",
    parentPhone: "+91 98765 11220",
    parentEmail: "sanjay.kumar@gmail.com",
    notices: [
      { id: "n1", title: "Fee clearance overdue reminder", date: "2026-07-10" }
    ],
    grievances: [
      { id: "g1", title: "Hostel Wi-Fi slow connectivity issue", status: "Resolved", date: "2026-07-02" }
    ],
    attendanceHistory: [
      { date: "07-01", status: "Present" },
      { date: "07-03", status: "Present" },
      { date: "07-05", status: "Absent" },
      { date: "07-08", status: "Present" },
      { date: "07-10", status: "Present" },
      { date: "07-12", status: "Present" },
      { date: "07-14", status: "Present" }
    ],
    gradeTrend: [
      { sem: "Sem I", sgpa: 7.8 },
      { sem: "Sem II", sgpa: 8.2 },
      { sem: "Sem III", sgpa: 8.0 },
      { sem: "Sem IV", sgpa: 8.5 }
    ],
    academicRemarks: ["Consistent worker, active participant in class discussions."]
  },
  {
    id: "stud-02",
    fullName: "Aarav Sharma",
    rollNo: "CS-2023-102",
    email: "aarav.sharma@krmu.edu.in",
    course: "B.Tech CSE",
    semester: "Semester 5",
    section: "Section A",
    subject: "CS601: Distributed Systems",
    attendance: 68,
    grade: "C",
    internalMarks: 18,
    assignmentMarks: 12,
    quizMarks: 5,
    midSemMarks: 15,
    practicalMarks: 7,
    status: "Active",
    photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    phone: "+91 98123 00112",
    parentName: "Rajesh Sharma",
    parentPhone: "+91 98123 00110",
    parentEmail: "rajesh.sharma@gmail.com",
    notices: [
      { id: "n1", title: "Attendance warning letter sent", date: "2026-07-11" }
    ],
    grievances: [],
    attendanceHistory: [
      { date: "07-01", status: "Absent" },
      { date: "07-03", status: "Present" },
      { date: "07-05", status: "Absent" },
      { date: "07-08", status: "Absent" },
      { date: "07-10", status: "Present" },
      { date: "07-12", status: "Absent" },
      { date: "07-14", status: "Present" }
    ],
    gradeTrend: [
      { sem: "Sem I", sgpa: 6.5 },
      { sem: "Sem II", sgpa: 6.8 },
      { sem: "Sem III", sgpa: 6.2 },
      { sem: "Sem IV", sgpa: 6.7 }
    ],
    academicRemarks: ["Requires additional attention in labs. Needs regular study schedule."]
  },
  {
    id: "stud-03",
    fullName: "Sneha Reddy",
    rollNo: "CS-2024-201",
    email: "sneha.reddy@krmu.edu.in",
    course: "B.Tech CSE (Cyber Security)",
    semester: "Semester 3",
    section: "Section C",
    subject: "CS402: Operating Systems",
    attendance: 94,
    grade: "A+",
    internalMarks: 29,
    assignmentMarks: 19,
    quizMarks: 9,
    midSemMarks: 28,
    practicalMarks: 10,
    status: "Active",
    photoUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
    phone: "+91 97766 55443",
    parentName: "Venkata Reddy",
    parentPhone: "+91 97766 55440",
    parentEmail: "v.reddy@gmail.com",
    notices: [],
    grievances: [],
    attendanceHistory: [
      { date: "07-01", status: "Present" },
      { date: "07-03", status: "Present" },
      { date: "07-05", status: "Present" },
      { date: "07-08", status: "Present" },
      { date: "07-10", status: "Present" },
      { date: "07-12", status: "Present" },
      { date: "07-14", status: "Present" }
    ],
    gradeTrend: [
      { sem: "Sem I", sgpa: 9.2 },
      { sem: "Sem II", sgpa: 9.4 }
    ],
    academicRemarks: ["Exceptional candidate. Leads practical demonstrations."]
  },
  {
    id: "stud-04",
    fullName: "Priyanjali Sen",
    rollNo: "CS-2024-202",
    email: "priyanjali.sen@krmu.edu.in",
    course: "B.Tech CSE (AI & ML)",
    semester: "Semester 3",
    section: "Section C",
    subject: "CS402: Operating Systems",
    attendance: 84,
    grade: "A",
    internalMarks: 25,
    assignmentMarks: 17,
    quizMarks: 8,
    midSemMarks: 26,
    practicalMarks: 9,
    status: "Active",
    photoUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
    phone: "+91 91223 33445",
    parentName: "Amitabh Sen",
    parentPhone: "+91 91223 33440",
    parentEmail: "a.sen@gmail.com",
    notices: [],
    grievances: [
      { id: "g1", title: "Digital library credentials delay", status: "Resolved", date: "2026-06-15" }
    ],
    attendanceHistory: [
      { date: "07-01", status: "Present" },
      { date: "07-03", status: "Present" },
      { date: "07-05", status: "Present" },
      { date: "07-08", status: "Absent" },
      { date: "07-10", status: "Present" },
      { date: "07-12", status: "Present" },
      { date: "07-14", status: "Present" }
    ],
    gradeTrend: [
      { sem: "Sem I", sgpa: 8.5 },
      { sem: "Sem II", sgpa: 8.7 }
    ],
    academicRemarks: ["Very sincere and completes all modules on schedule."]
  },
  {
    id: "stud-05",
    fullName: "Rohan Malhotra",
    rollNo: "CS-2022-301",
    email: "rohan.malhotra@krmu.edu.in",
    course: "B.Tech CSE",
    semester: "Semester 7",
    section: "Section B",
    subject: "CS702: Advanced Computer Architecture",
    attendance: 72,
    grade: "B",
    internalMarks: 20,
    assignmentMarks: 14,
    quizMarks: 7,
    midSemMarks: 21,
    practicalMarks: 8,
    status: "On Leave",
    photoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
    phone: "+91 98888 77777",
    parentName: "Vikram Malhotra",
    parentPhone: "+91 98888 77770",
    parentEmail: "v.malhotra@gmail.com",
    notices: [
      { id: "n1", title: "Medical leave verification", date: "2026-07-09" }
    ],
    grievances: [
      { id: "g1", title: "Medical leave approval speed", status: "Pending", date: "2026-07-08" }
    ],
    attendanceHistory: [
      { date: "07-01", status: "Absent" },
      { date: "07-03", status: "Absent" },
      { date: "07-05", status: "Present" },
      { date: "07-08", status: "Present" },
      { date: "07-10", status: "Absent" },
      { date: "07-12", status: "Present" },
      { date: "07-14", status: "Absent" }
    ],
    gradeTrend: [
      { sem: "Sem I", sgpa: 7.2 },
      { sem: "Sem II", sgpa: 7.5 },
      { sem: "Sem III", sgpa: 7.1 },
      { sem: "Sem IV", sgpa: 7.6 },
      { sem: "Sem V", sgpa: 7.4 },
      { sem: "Sem VI", sgpa: 7.5 }
    ],
    academicRemarks: ["Currently on medical leave, needs buffer slots to finish projects."]
  },
  {
    id: "stud-06",
    fullName: "Neha Gupta",
    rollNo: "CS-2024-302",
    email: "neha.gupta@krmu.edu.in",
    course: "B.Tech CSE",
    semester: "Semester 3",
    section: "Section A",
    subject: "CS301: Database Management Systems",
    attendance: 88,
    grade: "A",
    internalMarks: 26,
    assignmentMarks: 18,
    quizMarks: 9,
    midSemMarks: 25,
    practicalMarks: 9,
    status: "Active",
    photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
    phone: "+91 92233 44556",
    parentName: "Sanjay Gupta",
    parentPhone: "+91 92233 44550",
    parentEmail: "sanjay.gupta@gmail.com",
    notices: [],
    grievances: [],
    attendanceHistory: [
      { date: "07-01", status: "Present" },
      { date: "07-03", status: "Present" },
      { date: "07-05", status: "Present" },
      { date: "07-08", status: "Present" },
      { date: "07-10", status: "Absent" },
      { date: "07-12", status: "Present" },
      { date: "07-14", status: "Present" }
    ],
    gradeTrend: [
      { sem: "Sem I", sgpa: 8.0 },
      { sem: "Sem II", sgpa: 8.3 }
    ],
    academicRemarks: ["Very good theoretical understanding of schema design."]
  },
  {
    id: "stud-07",
    fullName: "Vikram Aditya",
    rollNo: "CS-2024-303",
    email: "vikram.aditya@krmu.edu.in",
    course: "B.Tech CSE",
    semester: "Semester 3",
    section: "Section A",
    subject: "CS301: Database Management Systems",
    attendance: 71,
    grade: "B",
    internalMarks: 19,
    assignmentMarks: 13,
    quizMarks: 6,
    midSemMarks: 20,
    practicalMarks: 8,
    status: "Active",
    photoUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150",
    phone: "+91 93344 55667",
    parentName: "Karan Aditya",
    parentPhone: "+91 93344 55660",
    parentEmail: "karan.aditya@gmail.com",
    notices: [
      { id: "n1", title: "Warning on Mid-term performance", date: "2026-07-12" }
    ],
    grievances: [],
    attendanceHistory: [
      { date: "07-01", status: "Absent" },
      { date: "07-03", status: "Present" },
      { date: "07-05", status: "Present" },
      { date: "07-08", status: "Absent" },
      { date: "07-10", status: "Absent" },
      { date: "07-12", status: "Present" },
      { date: "07-14", status: "Absent" }
    ],
    gradeTrend: [
      { sem: "Sem I", sgpa: 7.0 },
      { sem: "Sem II", sgpa: 7.2 }
    ],
    academicRemarks: ["Capable student, but low attendance affects lab grades."]
  }
];

export default function FacultyStudents() {
  const [students, setStudents] = useState<StudentRecord[]>(INITIAL_STUDENTS);
  
  // Search and Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSubject, setFilterSubject] = useState('All');
  const [filterSemester, setFilterSemester] = useState('All');
  const [filterSection, setFilterSection] = useState('All');
  const [filterAttendanceRange, setFilterAttendanceRange] = useState('All');
  const [filterGrade, setFilterGrade] = useState('All');

  // Selected Student for Profile Drawer
  const [selectedStudent, setSelectedStudent] = useState<StudentRecord | null>(null);

  // Quick action confirmation/message states
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [remarkInput, setRemarkInput] = useState('');

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg(null);
    }, 4000);
  };

  // Filter Logic
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          student.rollNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          student.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSubject = filterSubject === 'All' || student.subject === filterSubject;
    const matchesSemester = filterSemester === 'All' || student.semester === filterSemester;
    const matchesSection = filterSection === 'All' || student.section === filterSection;
    
    let matchesAttendance = true;
    if (filterAttendanceRange === 'Below 75%') {
      matchesAttendance = student.attendance < 75;
    } else if (filterAttendanceRange === '75% & Above') {
      matchesAttendance = student.attendance >= 75;
    }

    const matchesGrade = filterGrade === 'All' || student.grade === filterGrade;

    return matchesSearch && matchesSubject && matchesSemester && matchesSection && matchesAttendance && matchesGrade;
  });

  // Calculate Dashboard Summary Metrics
  const totalStudentsCount = filteredStudents.length;
  const uniqueSections = Array.from(new Set(filteredStudents.map(s => s.section))).length;
  const uniqueSubjects = Array.from(new Set(filteredStudents.map(s => s.subject))).length;
  const avgAttendance = totalStudentsCount > 0 
    ? Math.round(filteredStudents.reduce((acc, s) => acc + s.attendance, 0) / totalStudentsCount) 
    : 0;
  const below75Count = filteredStudents.filter(s => s.attendance < 75).length;
  
  // Custom average grade computation (A+=10, A=9, B+=8, B=7, C=6)
  const gradePoints: Record<string, number> = { 'A+': 10, 'A': 9, 'B+': 8, 'B': 7, 'C': 6 };
  const avgPerformance = totalStudentsCount > 0
    ? (filteredStudents.reduce((acc, s) => acc + (gradePoints[s.grade] || 7), 0) / totalStudentsCount).toFixed(1)
    : 'N/A';

  // Faculty Actions
  const handleSendWarning = (student: StudentRecord) => {
    showToast(`Warning warning-notice issued and logged to ${student.fullName}'s main account. Letter also carbon copied to parent ${student.parentName}.`);
  };

  const handleSendAppreciation = (student: StudentRecord) => {
    showToast(`Certificate of commendation successfully dispatched to student ${student.fullName} for academic distinction.`);
  };

  const handleNotifyParent = (student: StudentRecord) => {
    showToast(`SMS / Email report summary sent to parent ${student.parentName} (${student.parentPhone}) successfully.`);
  };

  const handleAddRemark = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !remarkInput.trim()) return;
    
    setStudents(prev => prev.map(s => {
      if (s.id === selectedStudent.id) {
        return {
          ...s,
          academicRemarks: [remarkInput, ...(s.academicRemarks || [])]
        };
      }
      return s;
    }));

    setSelectedStudent(prev => prev ? {
      ...prev,
      academicRemarks: [remarkInput, ...(prev.academicRemarks || [])]
    } : null);

    setRemarkInput('');
    showToast('Academic remark successfully committed and appended to student permanent record.');
  };

  // Export Student Report (PDF)
  const handleExportStudentPDF = (student: StudentRecord) => {
    const doc = new jsPDF();
    
    // Top University Letterhead banner
    doc.setFillColor(158, 27, 50); // Brand Red
    doc.rect(0, 0, 210, 38, "F");
    
    doc.setTextColor(255, 255, 255);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(14);
    doc.text("K.R. MANGALAM UNIVERSITY", 14, 15);
    doc.setFontSize(8);
    doc.setFont("Helvetica", "normal");
    doc.text("SCHOOL OF ENGINEERING & TECHNOLOGY | OFFICIAL REGISTRAR TRANSCRIPT", 14, 23);
    doc.text("GENERATED VIA SOET FACULTY CONSOLE MAIN PORTAL", 14, 28);

    doc.setTextColor(33, 37, 41);
    doc.setFontSize(12);
    doc.setFont("Helvetica", "bold");
    doc.text(`ACADEMIC AUDIT RECORD: ${student.fullName.toUpperCase()}`, 14, 50);
    doc.setDrawColor(220, 224, 230);
    doc.line(14, 53, 196, 53);

    // Profile parameters
    doc.setFontSize(9);
    let y = 62;
    const writeField = (label: string, value: string) => {
      doc.setFont("Helvetica", "bold");
      doc.text(label, 14, y);
      doc.setFont("Helvetica", "normal");
      doc.text(value, 60, y);
      y += 8;
    };

    writeField("Roll Number:", student.rollNo);
    writeField("University Email:", student.email);
    writeField("Current Program:", student.course);
    writeField("Registration Status:", student.status);
    writeField("Course Semester:", `${student.semester} (${student.section})`);
    writeField("Assigned Elective:", student.subject);
    writeField("Aggregate Attendance:", `${student.attendance}%`);
    writeField("Current Projected Grade:", student.grade);

    y += 4;
    doc.setFont("Helvetica", "bold");
    doc.text("ACADEMIC PERFORMANCE BREAKDOWN", 14, y);
    doc.line(14, y + 2, 196, y + 2);
    y += 10;

    const writeMarks = (label: string, ob: number, max: number) => {
      doc.setFont("Helvetica", "bold");
      doc.text(label, 14, y);
      doc.setFont("Helvetica", "normal");
      doc.text(`${ob} Marks out of ${max}`, 60, y);
      y += 7;
    };

    writeMarks("Class Internals:", student.internalMarks, 30);
    writeMarks("Assignments:", student.assignmentMarks, 20);
    writeMarks("Quizzes:", student.quizMarks, 10);
    writeMarks("Mid-Sem Exam:", student.midSemMarks, 30);
    writeMarks("Practicals:", student.practicalMarks, 10);

    y += 6;
    doc.setFont("Helvetica", "bold");
    doc.text("FACULTY REMARKS & ADVISORIES", 14, y);
    doc.line(14, y + 2, 196, y + 2);
    y += 10;

    doc.setFont("Helvetica", "normal");
    const remarks = student.academicRemarks || ["No official remarks logged."];
    remarks.forEach((rem) => {
      doc.text(`- ${rem}`, 14, y);
      y += 6;
    });

    y += 10;
    doc.setFont("Helvetica", "bold");
    doc.text("PARENTAL DETAILS", 14, y);
    doc.line(14, y + 2, 196, y + 2);
    y += 10;
    writeField("Parent/Guardian:", student.parentName);
    writeField("Contact Phone:", student.parentPhone);
    writeField("Contact Email:", student.parentEmail);

    doc.save(`Transcript_${student.fullName.replace(/ /g, "_")}.pdf`);
    showToast(`PDF report card transcript successfully downloaded for ${student.fullName}.`);
  };

  return (
    <div className="space-y-6 text-left animate-in fade-in duration-200">
      
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white text-xs font-bold px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 border border-gray-800 animate-in slide-in-from-bottom-5 duration-200">
          <span className="material-symbols-outlined text-green-400">check_circle</span>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header Info */}
      <div className="bg-white p-6 border border-outline-variant rounded-2xl institution-shadow">
        <h2 className="text-2xl font-bold text-gray-800">Student Management Records</h2>
        <p className="text-sm text-gray-500">
          Central ERP registry and live performance metrics tracking for your assigned course cohorts.
        </p>
      </div>

      {/* Dashboard Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        
        <div className="bg-white p-4 border border-outline-variant rounded-xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Total Cohort</span>
            <span className="material-symbols-outlined text-sm">groups</span>
          </div>
          <div className="mt-2">
            <p className="text-2xl font-black text-gray-800">{totalStudentsCount}</p>
            <p className="text-[9px] text-green-600 font-bold uppercase mt-1">+2 enrolled this sem</p>
          </div>
        </div>

        <div className="bg-white p-4 border border-outline-variant rounded-xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Active Sections</span>
            <span className="material-symbols-outlined text-sm">grid_view</span>
          </div>
          <div className="mt-2">
            <p className="text-2xl font-black text-gray-800">{uniqueSections}</p>
            <p className="text-[9px] text-gray-400 uppercase mt-1">Assigned blocks</p>
          </div>
        </div>

        <div className="bg-white p-4 border border-outline-variant rounded-xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Subjects Taught</span>
            <span className="material-symbols-outlined text-sm">school</span>
          </div>
          <div className="mt-2">
            <p className="text-2xl font-black text-gray-800">{uniqueSubjects}</p>
            <p className="text-[9px] text-gray-400 uppercase mt-1">Core curriculums</p>
          </div>
        </div>

        <div className="bg-white p-4 border border-outline-variant rounded-xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Avg Attendance</span>
            <span className="material-symbols-outlined text-sm">calendar_today</span>
          </div>
          <div className="mt-2">
            <p className="text-2xl font-black text-gray-800">{avgAttendance}%</p>
            <p className="text-[9px] text-green-600 font-bold uppercase mt-1">Institutional cap 75%</p>
          </div>
        </div>

        <div className="bg-white p-4 border border-red-100 rounded-xl flex flex-col justify-between bg-red-50/10">
          <div className="flex items-center justify-between text-red-500">
            <span className="text-[10px] font-bold uppercase tracking-wider text-red-700">Below 75%</span>
            <span className="material-symbols-outlined text-sm">warning</span>
          </div>
          <div className="mt-2">
            <p className="text-2xl font-black text-red-700">{below75Count}</p>
            <p className="text-[9px] text-red-500 font-bold uppercase mt-1">Flagged for warning</p>
          </div>
        </div>

        <div className="bg-white p-4 border border-outline-variant rounded-xl flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Avg Grade Index</span>
            <span className="material-symbols-outlined text-sm">verified</span>
          </div>
          <div className="mt-2">
            <p className="text-2xl font-black text-gray-800">{avgPerformance}</p>
            <p className="text-[9px] text-gray-400 uppercase mt-1">Out of 10.0 scale</p>
          </div>
        </div>

      </div>

      {/* Filters and Controls */}
      <div className="bg-white p-6 border border-outline-variant rounded-2xl flex flex-col gap-4">
        
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          
          {/* Search bar */}
          <div className="relative w-full lg:w-1/3">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-gray-400 text-lg">search</span>
            <input
              type="text"
              placeholder="Search student by name, roll, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-brand-red"
            />
          </div>

          {/* Smart warnings summary alerts */}
          <div className="w-full lg:w-auto flex items-center justify-end gap-2 bg-red-50/20 p-2 rounded-xl border border-red-100/60 text-xs font-medium text-red-700">
            <span className="material-symbols-outlined text-red-600 text-sm">notifications_active</span>
            <span>Bulk Smart Alerts: <strong>{below75Count}</strong> students below 75% threshold in selected list.</span>
            <button
              onClick={() => showToast(`Successfully transmitted attendance warnings to ${below75Count} students.`)}
              className="px-3 py-1 bg-brand-red text-white text-[10px] font-black rounded-lg hover:bg-red-800 transition-all border-none cursor-pointer uppercase ml-2"
            >
              Send Mass Warning
            </button>
          </div>

        </div>

        {/* Filters bar */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          
          <div>
            <label className="block text-[9px] font-black text-gray-400 uppercase mb-1">Assigned Subject</label>
            <select
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              className="w-full bg-white border rounded-lg px-2.5 py-1.5 text-xs font-bold text-gray-600 focus:outline-none"
            >
              <option value="All">All Subjects</option>
              <option value="CS601: Distributed Systems">CS601: Distributed Systems</option>
              <option value="CS402: Operating Systems">CS402: Operating Systems</option>
              <option value="CS702: Advanced Computer Architecture">CS702: Advanced Computer Architecture</option>
              <option value="CS301: Database Management Systems">CS301: Database Management Systems</option>
            </select>
          </div>

          <div>
            <label className="block text-[9px] font-black text-gray-400 uppercase mb-1">Academic Semester</label>
            <select
              value={filterSemester}
              onChange={(e) => setFilterSemester(e.target.value)}
              className="w-full bg-white border rounded-lg px-2.5 py-1.5 text-xs font-bold text-gray-600 focus:outline-none"
            >
              <option value="All">All Semesters</option>
              <option value="Semester 3">Semester 3</option>
              <option value="Semester 5">Semester 5</option>
              <option value="Semester 7">Semester 7</option>
            </select>
          </div>

          <div>
            <label className="block text-[9px] font-black text-gray-400 uppercase mb-1">Allocated Section</label>
            <select
              value={filterSection}
              onChange={(e) => setFilterSection(e.target.value)}
              className="w-full bg-white border rounded-lg px-2.5 py-1.5 text-xs font-bold text-gray-600 focus:outline-none"
            >
              <option value="All">All Sections</option>
              <option value="Section A">Section A</option>
              <option value="Section B">Section B</option>
              <option value="Section C">Section C</option>
            </select>
          </div>

          <div>
            <label className="block text-[9px] font-black text-gray-400 uppercase mb-1">Attendance Range</label>
            <select
              value={filterAttendanceRange}
              onChange={(e) => setFilterAttendanceRange(e.target.value)}
              className="w-full bg-white border rounded-lg px-2.5 py-1.5 text-xs font-bold text-gray-600 focus:outline-none"
            >
              <option value="All">All Ranges</option>
              <option value="Below 75%">Below 75% Attendance</option>
              <option value="75% & Above">75% & Above Attendance</option>
            </select>
          </div>

          <div>
            <label className="block text-[9px] font-black text-gray-400 uppercase mb-1">Target Grade Filter</label>
            <select
              value={filterGrade}
              onChange={(e) => setFilterGrade(e.target.value)}
              className="w-full bg-white border rounded-lg px-2.5 py-1.5 text-xs font-bold text-gray-600 focus:outline-none"
            >
              <option value="All">All Grades</option>
              <option value="A+">Grade A+</option>
              <option value="A">Grade A</option>
              <option value="B+">Grade B+</option>
              <option value="B">Grade B</option>
              <option value="C">Grade C</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterSubject('All');
                setFilterSemester('All');
                setFilterSection('All');
                setFilterAttendanceRange('All');
                setFilterGrade('All');
              }}
              className="w-full py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-600 border rounded-lg text-xs font-bold cursor-pointer transition-all"
            >
              Reset Filters
            </button>
          </div>

        </div>

      </div>

      {/* Cohort Records Table */}
      <div className="bg-white border border-outline-variant rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 className="font-bold text-gray-800 text-sm">Cohorts Assigned ({filteredStudents.length} Students)</h3>
          <span className="text-[10px] font-bold text-gray-400 uppercase">Click 'View Profile' to manage student metrics</span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 text-[10px] font-black uppercase text-gray-400 tracking-wider border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">Student</th>
                <th className="px-6 py-4">Roll Number</th>
                <th className="px-6 py-4">University Email</th>
                <th className="px-6 py-4">Allocations</th>
                <th className="px-6 py-4 text-center">Attendance</th>
                <th className="px-6 py-4 text-center">Grade</th>
                <th className="px-6 py-4 text-center">Internals</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-gray-400 font-semibold bg-gray-50/20">
                    No assigned student cohorts found matching current filter parameters.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50/40 transition-colors">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-gray-100 border flex items-center justify-center">
                        {s.photoUrl ? (
                          <img src={s.photoUrl} alt={s.fullName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <span className="font-bold text-xs text-gray-500">{s.fullName[0]}</span>
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-gray-800">{s.fullName}</p>
                        <p className="text-[10px] text-gray-400">{s.course}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-gray-600">{s.rollNo}</td>
                    <td className="px-6 py-4 text-gray-500 font-medium">{s.email}</td>
                    <td className="px-6 py-4 text-gray-600">
                      <p className="font-semibold text-gray-700">{s.subject.split(':')[0]}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase">{s.semester} &bull; {s.section}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col items-center gap-1">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          s.attendance < 75 
                            ? 'bg-red-50 text-red-700 border border-red-100 animate-pulse' 
                            : 'bg-green-50 text-green-700 border border-green-100'
                        }`}>
                          {s.attendance}%
                        </span>
                        <div className="w-16 h-1 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full ${s.attendance < 75 ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: `${s.attendance}%` }}></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="px-2 py-1 bg-gray-100 rounded text-[10px] font-black text-gray-800">{s.grade}</span>
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-gray-600">{s.internalMarks} / 30</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border uppercase ${
                        s.status === 'Active' ? 'bg-green-50 text-green-700 border-green-100' :
                        s.status === 'On Leave' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                        'bg-gray-100 text-gray-500 border-gray-200'
                      }`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => setSelectedStudent(s)}
                        className="px-3 py-1 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-100 font-bold transition-all text-xs cursor-pointer flex items-center gap-1.5 mx-auto"
                      >
                        <span className="material-symbols-outlined text-sm">visibility</span> View Profile
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student Profile Right-Side Drawer Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop overlay */}
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={() => setSelectedStudent(null)}></div>
          
          {/* Drawer Panel */}
          <div className="relative w-full max-w-2xl bg-white h-screen overflow-y-auto shadow-2xl flex flex-col justify-between z-10 animate-in slide-in-from-right duration-250 border-l border-gray-100 text-left">
            
            {/* Header */}
            <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 border flex items-center justify-center">
                  {selectedStudent.photoUrl ? (
                    <img src={selectedStudent.photoUrl} alt={selectedStudent.fullName} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xl font-bold text-gray-500">{selectedStudent.fullName[0]}</span>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-black text-gray-800 tracking-tight">{selectedStudent.fullName}</h3>
                  <p className="text-xs text-gray-400 font-mono font-bold uppercase">{selectedStudent.rollNo} &bull; {selectedStudent.course}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="w-10 h-10 rounded-full hover:bg-gray-200 flex items-center justify-center text-gray-400 border-none bg-transparent cursor-pointer"
              >
                <span className="material-symbols-outlined text-2xl">close</span>
              </button>
            </div>

            {/* Content Drawer Area */}
            <div className="p-8 space-y-8 flex-1">
              
              {/* Quick Action Pills Row */}
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase mb-3">Direct Executive Controls</p>
                <div className="flex flex-wrap gap-2.5">
                  <button
                    onClick={() => handleSendWarning(selectedStudent)}
                    className="px-4 py-2 bg-red-50 text-brand-red border border-red-100 rounded-xl hover:bg-red-100 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-sm">warning</span> Issue Attendance Warning
                  </button>
                  <button
                    onClick={() => handleSendAppreciation(selectedStudent)}
                    className="px-4 py-2 bg-green-50 text-green-700 border border-green-100 rounded-xl hover:bg-green-100 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-sm">workspace_premium</span> Send Appreciation Letter
                  </button>
                  <button
                    onClick={() => handleNotifyParent(selectedStudent)}
                    className="px-4 py-2 bg-blue-50 text-blue-700 border border-blue-100 rounded-xl hover:bg-blue-100 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-sm">contact_phone</span> Notify Parent via SMS
                  </button>
                  <button
                    onClick={() => handleExportStudentPDF(selectedStudent)}
                    className="px-4 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-sm">download_for_offline</span> Export Transcript (PDF)
                  </button>
                </div>
              </div>

              {/* Grid 1: Basic Info & Parents */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Academic Context Card */}
                <div className="p-5 bg-gray-50 border border-gray-100 rounded-2xl">
                  <p className="text-[10px] text-gray-400 font-black uppercase mb-4 tracking-wider">Cohort Information</p>
                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between border-b pb-1.5 border-dashed">
                      <span className="text-gray-400 font-bold uppercase text-[9px]">Elective Subject:</span>
                      <span className="font-bold text-gray-800 text-right">{selectedStudent.subject}</span>
                    </div>
                    <div className="flex justify-between border-b pb-1.5 border-dashed">
                      <span className="text-gray-400 font-bold uppercase text-[9px]">Cohort Code:</span>
                      <span className="font-mono font-bold text-gray-800">{selectedStudent.rollNo}</span>
                    </div>
                    <div className="flex justify-between border-b pb-1.5 border-dashed">
                      <span className="text-gray-400 font-bold uppercase text-[9px]">Semester / Sec:</span>
                      <span className="font-bold text-gray-800">{selectedStudent.semester} ({selectedStudent.section})</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400 font-bold uppercase text-[9px]">University Email:</span>
                      <span className="font-semibold text-gray-800">{selectedStudent.email}</span>
                    </div>
                  </div>
                </div>

                {/* Parent Contact details */}
                <div className="p-5 bg-gray-50 border border-gray-100 rounded-2xl">
                  <p className="text-[10px] text-gray-400 font-black uppercase mb-4 tracking-wider">Parent/Guardian Information</p>
                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between border-b pb-1.5 border-dashed">
                      <span className="text-gray-400 font-bold uppercase text-[9px]">Guardian Name:</span>
                      <span className="font-bold text-gray-800">{selectedStudent.parentName}</span>
                    </div>
                    <div className="flex justify-between border-b pb-1.5 border-dashed">
                      <span className="text-gray-400 font-bold uppercase text-[9px]">Mobile Phone:</span>
                      <span className="font-mono font-bold text-gray-800">{selectedStudent.parentPhone}</span>
                    </div>
                    <div className="flex justify-between border-b pb-1.5 border-dashed">
                      <span className="text-gray-400 font-bold uppercase text-[9px]">Contact Email:</span>
                      <span className="font-semibold text-gray-800">{selectedStudent.parentEmail}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400 font-bold uppercase text-[9px]">Student Phone:</span>
                      <span className="font-mono font-semibold text-gray-800">{selectedStudent.phone}</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Segment 2: Marks & Academic Breakdown */}
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase mb-4">Continuous Assessment Marks Breakdown</p>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  
                  <div className="p-3 bg-gray-50 border rounded-xl text-center">
                    <p className="text-[9px] text-gray-400 font-bold uppercase">Class Internals</p>
                    <p className="text-sm font-black text-gray-800 mt-1">{selectedStudent.internalMarks} / 30</p>
                    <span className="text-[8px] text-gray-400 uppercase mt-0.5 font-bold">15% weight</span>
                  </div>

                  <div className="p-3 bg-gray-50 border rounded-xl text-center">
                    <p className="text-[9px] text-gray-400 font-bold uppercase">Assignments</p>
                    <p className="text-sm font-black text-gray-800 mt-1">{selectedStudent.assignmentMarks} / 20</p>
                    <span className="text-[8px] text-gray-400 uppercase mt-0.5 font-bold">10% weight</span>
                  </div>

                  <div className="p-3 bg-gray-50 border rounded-xl text-center">
                    <p className="text-[9px] text-gray-400 font-bold uppercase">Quizzes</p>
                    <p className="text-sm font-black text-gray-800 mt-1">{selectedStudent.quizMarks} / 10</p>
                    <span className="text-[8px] text-gray-400 uppercase mt-0.5 font-bold">5% weight</span>
                  </div>

                  <div className="p-3 bg-gray-50 border rounded-xl text-center">
                    <p className="text-[9px] text-gray-400 font-bold uppercase">Mid-Sem Exam</p>
                    <p className="text-sm font-black text-gray-800 mt-1">{selectedStudent.midSemMarks} / 30</p>
                    <span className="text-[8px] text-gray-400 uppercase mt-0.5 font-bold">20% weight</span>
                  </div>

                  <div className="p-3 bg-gray-50 border rounded-xl text-center col-span-2 md:col-span-1">
                    <p className="text-[9px] text-gray-400 font-bold uppercase">Practicals</p>
                    <p className="text-sm font-black text-gray-800 mt-1">{selectedStudent.practicalMarks} / 10</p>
                    <span className="text-[8px] text-gray-400 uppercase mt-0.5 font-bold">10% weight</span>
                  </div>

                </div>
              </div>

              {/* Segment 3: Charts Visualizers */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Attendance history log */}
                <div className="p-5 border rounded-2xl bg-white">
                  <p className="text-[10px] text-gray-400 font-bold uppercase mb-4">Cohort Attendance Registry Log</p>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar text-xs">
                    {selectedStudent.attendanceHistory.map((h, i) => (
                      <div key={i} className="flex justify-between items-center py-1.5 border-b border-gray-100 last:border-none">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-gray-400 text-sm">schedule</span>
                          <span className="font-bold text-gray-600">Lecture Session Date: {h.date}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded font-black uppercase text-[8px] ${
                          h.status === 'Present' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-brand-red'
                        }`}>
                          {h.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Grade Trend SVG Chart */}
                <div className="p-5 border rounded-2xl bg-white flex flex-col justify-between">
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase mb-4">CGPA Semester Progression</p>
                    
                    {/* Exquisite inline SVG trend lines chart */}
                    <div className="relative h-24 w-full flex items-end justify-between px-4 mt-2">
                      <svg className="absolute inset-0 w-full h-full text-brand-red" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <polyline
                          fill="none"
                          stroke="#9e1b32"
                          strokeWidth="2"
                          points={selectedStudent.gradeTrend.map((g, i) => `${(i / (selectedStudent.gradeTrend.length - 1)) * 100},${100 - (g.sgpa - 5) * 20}`).join(' ')}
                        />
                      </svg>
                      {selectedStudent.gradeTrend.map((g, i) => (
                        <div key={i} className="relative z-10 flex flex-col items-center">
                          <span className="text-[9px] font-black text-gray-800 bg-gray-100 px-1 rounded shadow-sm">{g.sgpa}</span>
                          <div className="w-2 h-2 bg-brand-red rounded-full border-2 border-white shadow-md my-1"></div>
                          <span className="text-[8px] text-gray-400 uppercase font-black">{g.sem}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <p className="text-[9px] text-gray-400 mt-4 leading-relaxed border-t pt-2 text-center">
                    Student displays a stable average SGPA of <strong>{ (selectedStudent.gradeTrend.reduce((acc, g) => acc + g.sgpa, 0) / selectedStudent.gradeTrend.length).toFixed(2) }</strong> across all semesters.
                  </p>
                </div>

              </div>

              {/* Segment 4: Notices, Grievances, Remarks lists */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Active notices & Grievances */}
                <div className="space-y-4">
                  
                  {/* Notices list */}
                  <div className="p-4 bg-gray-50 border rounded-2xl">
                    <p className="text-[10px] text-gray-400 font-bold uppercase mb-3">Recent Notices Issued</p>
                    {selectedStudent.notices.length === 0 ? (
                      <p className="text-xs text-gray-400 italic">No formal warning notices active.</p>
                    ) : (
                      selectedStudent.notices.map((n) => (
                        <div key={n.id} className="flex justify-between items-center bg-white p-2 rounded-lg border text-xs">
                          <span className="font-semibold text-gray-700 truncate max-w-[180px]" title={n.title}>{n.title}</span>
                          <span className="text-[9px] text-gray-400 font-bold">{n.date}</span>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Grievance list */}
                  <div className="p-4 bg-gray-50 border rounded-2xl">
                    <p className="text-[10px] text-gray-400 font-bold uppercase mb-3">Submitted Grievances</p>
                    {selectedStudent.grievances.length === 0 ? (
                      <p className="text-xs text-gray-400 italic">No active grievances logged.</p>
                    ) : (
                      selectedStudent.grievances.map((g) => (
                        <div key={g.id} className="flex justify-between items-center bg-white p-2 rounded-lg border text-xs mb-1.5 last:mb-0">
                          <span className="font-semibold text-gray-700 truncate max-w-[150px]">{g.title}</span>
                          <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${
                            g.status === 'Resolved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                          }`}>{g.status}</span>
                        </div>
                      ))
                    )}
                  </div>

                </div>

                {/* Academic Remarks */}
                <div className="p-5 bg-gray-50 border border-gray-100 rounded-2xl flex flex-col justify-between">
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase mb-3">Academic Counseling Remarks</p>
                    <div className="space-y-2 max-h-36 overflow-y-auto pr-2 custom-scrollbar text-xs">
                      {(!selectedStudent.academicRemarks || selectedStudent.academicRemarks.length === 0) ? (
                        <p className="text-gray-400 italic">No professional advisory comments issued yet.</p>
                      ) : (
                        selectedStudent.academicRemarks.map((rem, idx) => (
                          <div key={idx} className="bg-white p-3 rounded-lg border text-gray-600 leading-relaxed font-medium">
                            {rem}
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Add remark form */}
                  <form onSubmit={handleAddRemark} className="mt-4 flex gap-2">
                    <input
                      type="text"
                      placeholder="Add custom counseling remark..."
                      value={remarkInput}
                      onChange={(e) => setRemarkInput(e.target.value)}
                      className="flex-1 bg-white border rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-brand-red"
                    />
                    <button
                      type="submit"
                      className="px-3 py-2 bg-brand-red text-white text-xs font-bold rounded-xl border-none hover:bg-red-800 transition-all cursor-pointer flex-shrink-0"
                    >
                      Log Remark
                    </button>
                  </form>
                </div>

              </div>

            </div>

            {/* Footer */}
            <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 items-center">
              <button
                onClick={() => setSelectedStudent(null)}
                className="px-6 py-2 bg-white text-gray-700 border rounded-xl text-xs font-bold hover:bg-gray-100 transition-all cursor-pointer"
              >
                Close Drawer
              </button>
              <button
                onClick={() => handleExportStudentPDF(selectedStudent)}
                className="px-6 py-2 bg-brand-red text-white rounded-xl text-xs font-bold hover:bg-red-800 transition-all cursor-pointer border-none flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">print</span> Print Academic File
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
