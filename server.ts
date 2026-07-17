import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Initialize Supabase Client (if keys are available in process.env or user secrets)
const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || "";
let supabaseClient: any = null;

if (supabaseUrl && supabaseAnonKey) {
  try {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
    console.log("Supabase Client initialized successfully with URL:", supabaseUrl);
  } catch (error) {
    console.error("Failed to initialize Supabase Client:", error);
  }
} else {
  console.log("Supabase credentials not fully configured. Using simulated persistent local memory.");
}

// ----------------------------------------------------
// Standard Institutional Data Store (Simulated Fallback Database)
// ----------------------------------------------------
let studentsDb = [
  {
    id: "alex-sterling",
    enrollmentNo: "KRMU-21-98765",
    fullName: "Alex Sterling",
    email: "alex.sterling@krmu.edu.in",
    dob: "14 May 2005",
    mobileNumber: "+91 98123 45678",
    bloodGroup: "A+",
    emergencyContact: "+91 98123 45679",
    program: "B.Tech Computer Science & Engineering",
    branch: "Computer Science & Engineering",
    currentSemester: "Semester 6",
    cgpa: 8.5,
    admissionYear: 2021,
    hostel: "Boys Hostel Block A",
    roomNumber: "A-304",
    transportRoute: "Route 3 — Delhi NCR Sector 45",
    classesAttended: 102,
    totalClasses: 124
  },
  {
    id: "piyush-kumar",
    enrollmentNo: "KRMU2426118",
    rollNo: "2401730018",
    admissionNo: "2401730288",
    fullName: "Piyush Singh",
    email: "piyush.kumar@krmu.ac.in",
    dob: "08 Mar 2006",
    mobileNumber: "+91 98765 43210",
    bloodGroup: "O+",
    emergencyContact: "+91 98765 43211",
    program: "B.Tech Computer Science & Engineering (Artificial Intelligence and Machine Learning)",
    branch: "Computer Science & Engineering",
    currentSemester: "Semester V",
    cgpa: 7.09,
    admissionYear: 2024,
    hostel: "Boys Hostel Block B",
    roomNumber: "B-214",
    transportRoute: "Route 7 — Gurugram Sector 14",
    classesAttended: 110,
    totalClasses: 125
  }
];

let facultyDb = [
  {
    id: "elena-vance",
    fullName: "Dr. Elena Vance",
    employeeId: "EMP-2045",
    designation: "Associate Professor",
    department: "CSE Department",
    email: "elena.vance@krmangalam.edu.in",
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
  },
  {
    id: "sarah-jenkins",
    fullName: "Dr. Sarah Jenkins",
    employeeId: "EMP-2098",
    designation: "Professor & Head",
    department: "CSE Department",
    email: "sarah.jenkins@krmangalam.edu.in",
    mobileNumber: "+91 98111 22233",
    joiningYear: 2020,
    employmentType: "Full Time",
    status: "Active",
    officeLocation: "Block C, Room 410",
    dob: "March 12, 1980",
    gender: "Female",
    bloodGroup: "O+",
    address: "Gurugram",
    emergencyContact: "+91 98111 22230",
    nationality: "Indian",
    facultyCode: "CSE-SJ-2020",
    highestQualification: "Ph.D. in AI",
    specialization: "Artificial Intelligence & ML",
    joiningDate: "August 10, 2020",
    experience: "16 Years",
    reportingHead: "Prof. Dr. Alan Grant (Dean, SOET)",
    officeHours: "Tue, Thu (10:00 AM - 12:00 PM)",
    cabin: "Cabin C-410A",
    extension: "Ext 2401",
    availability: "Available",
    photoUrl: ""
  },
  {
    id: "robert-chen",
    fullName: "Dr. Robert Chen",
    employeeId: "EMP-2101",
    designation: "Associate Professor",
    department: "CSE Department",
    email: "robert.chen@krmangalam.edu.in",
    mobileNumber: "+91 99123 45678",
    joiningYear: 2024,
    employmentType: "Full Time",
    status: "Active",
    officeLocation: "Block C, Room 415",
    dob: "November 22, 1988",
    gender: "Male",
    bloodGroup: "B+",
    address: "Delhi NCR",
    emergencyContact: "+91 99123 45670",
    nationality: "Indian",
    facultyCode: "CSE-RC-2024",
    highestQualification: "Ph.D. in Cyber Security",
    specialization: "Cyber Security & Networks",
    joiningDate: "January 05, 2024",
    experience: "8 Years",
    reportingHead: "Prof. Dr. Alan Grant (Dean, SOET)",
    officeHours: "Mon, Wed (11:00 AM - 01:00 PM)",
    cabin: "Cabin C-415B",
    extension: "Ext 2410",
    availability: "In Class",
    photoUrl: ""
  },
  {
    id: "amit-shah",
    fullName: "Dr. Amit Shah",
    employeeId: "EMP-2114",
    designation: "Assistant Professor",
    department: "CSE Department",
    email: "amit.shah@krmangalam.edu.in",
    mobileNumber: "+91 98765 11111",
    joiningYear: 2024,
    employmentType: "Full Time",
    status: "Active",
    officeLocation: "Block C, Room 416",
    dob: "September 05, 1991",
    gender: "Male",
    bloodGroup: "AB+",
    address: "Noida",
    emergencyContact: "+91 98765 11100",
    nationality: "Indian",
    facultyCode: "CSE-AS-2024",
    highestQualification: "M.Tech, Ph.D. Pursuing",
    specialization: "Computer Networks & Compiler Design",
    joiningDate: "February 01, 2024",
    experience: "5 Years",
    reportingHead: "Prof. Dr. Alan Grant (Dean, SOET)",
    officeHours: "Friday (10:00 AM - 01:00 PM)",
    cabin: "Cabin C-416A",
    extension: "Ext 2412",
    availability: "Available",
    photoUrl: ""
  }
];

let classActivitiesDb = [
  {
    id: "act-1",
    time: "09:00 AM",
    subject: "Artificial Intelligence",
    section: "CS-601 Sec A",
    faculty: "Dr. Elena Vance",
    status: "Uploaded",
    present: 56,
    absent: 4,
    uploadTime: "09:45 AM"
  },
  {
    id: "act-2",
    time: "10:00 AM",
    subject: "Database Management Systems (DBMS)",
    section: "CS-403 Sec B",
    faculty: "Dr. Robert Chen",
    status: "Pending Upload",
    present: 0,
    absent: 0,
    uploadTime: ""
  },
  {
    id: "act-3",
    time: "11:00 AM",
    subject: "Computer Networks",
    section: "CS-602 Sec A",
    faculty: "Dr. Amit Shah",
    status: "Upcoming",
    present: 0,
    absent: 0,
    uploadTime: ""
  },
  {
    id: "act-4",
    time: "12:00 PM",
    subject: "Compiler Design",
    section: "CS-603 Sec A",
    faculty: "Dr. Sarah Jenkins",
    status: "Ongoing",
    present: 0,
    absent: 0,
    uploadTime: ""
  },
  {
    id: "act-5",
    time: "01:00 PM",
    subject: "Cyber Security & Forensic",
    section: "CS-801 Sec C",
    faculty: "Dr. Robert Chen",
    status: "Missing Upload",
    present: 0,
    absent: 0,
    uploadTime: ""
  },
  {
    id: "act-6",
    time: "02:00 PM",
    subject: "Machine Learning Concepts",
    section: "CS-605 Sec B",
    faculty: "Dr. Elena Vance",
    status: "Upcoming",
    present: 0,
    absent: 0,
    uploadTime: ""
  }
];

let adminDb = [
  {
    id: "admin-governance",
    fullName: "Registrar General",
    designation: "Dean",
    email: "admin.portal@krmangalam.edu.in",
    phone: "+91 99999 11111",
    address: "SOET Main Building, KRMU Campus",
    emergencyContact: "+91 99999 22222",
    department: "Institutional Administration",
    employeeId: "ADM-0001",
    officeNumber: "Room B-101",
    administrationRole: "General Governance",
    status: "Active",
    photoUrl: ""
  }
];

let studentGoalsDb: Record<string, any[]> = {
  "piyush-kumar": [
    { id: "prep-1", subject: "Neural Networks", progressPercent: 85, focusArea: "Focus: Backpropagation" },
    { id: "prep-2", subject: "Compiler Design", progressPercent: 42, focusArea: "4 topics remaining" },
    { id: "prep-3", subject: "Ethical Hacking", progressPercent: 68, focusArea: "2 topics remaining" }
  ],
  "alex-sterling": [
    { id: "prep-1", subject: "Neural Networks", progressPercent: 80, focusArea: "Focus: Backpropagation" },
    { id: "prep-2", subject: "Compiler Design", progressPercent: 50, focusArea: "3 topics remaining" }
  ]
};

let studentGradesDb: Record<string, any> = {
  "piyush-kumar": {
    "Semester IV": {
      semester: "Semester IV",
      academicYear: "2025-2026",
      date: "23.06.2026",
      program: "B.Tech Computer Science & Engineering (Artificial Intelligence and Machine Learning)",
      sgpa: 7.09,
      cgpa: 7.09,
      totalCredits: 28,
      subjects: [
        { code: "SEC039", title: "R Programming for Data Science and Data Analytics Lab", type: "Lab", credits: 2.0, marks: 92, grade: "A+" },
        { code: "ETOECM059", title: "Energy Conservation and Management", type: "Theory", credits: 3.0, marks: 62, grade: "C" },
        { code: "ENSP252", title: "Machine Learning Practical with Python, Scikit-Learn, Matplotlib, Tensorflow", type: "Lab", credits: 2.0, marks: 94, grade: "A+" },
        { code: "ENSP202", title: "Machine Learning and Pattern Recognition", type: "Theory", credits: 4.0, marks: 50, grade: "P" },
        { code: "ENSI252", title: "Minor Project", type: "Project", credits: 2.0, marks: 95, grade: "A+" },
        { code: "ENCS256", title: "Analysis and Design of Algorithms Lab", type: "Lab", credits: 2.0, marks: 91, grade: "A+" },
        { code: "ENCS254", title: "Database Management Systems Lab", type: "Lab", credits: 2.0, marks: 98, grade: "O" },
        { code: "ENCS204", title: "Database Management Systems", type: "Theory", credits: 3.0, marks: 82, grade: "B+" },
        { code: "ENCS202", title: "Analysis and Design of Algorithms", type: "Theory", credits: 4.0, marks: 74, grade: "B" },
        { code: "CS002", title: "Community Services", type: "Audit", credits: 1.0, marks: 85, grade: "A" },
        { code: "AUC005", title: "Competitive Coding-II", type: "Audit", credits: 1.0, marks: 60, grade: "C" },
        { code: "AEC007", title: "Communication & Personality Development", type: "Audit", credits: 2.0, marks: 93, grade: "A+" }
      ]
    },
    "Semester III": {
      semester: "Semester III",
      academicYear: "2024-2025",
      date: "20.12.2025",
      program: "B.Tech Computer Science & Engineering (Artificial Intelligence and Machine Learning)",
      sgpa: 7.50,
      cgpa: 7.30,
      totalCredits: 26,
      subjects: [
        { code: "MTH201", title: "Discrete Mathematics", type: "Theory", credits: 4.0, marks: 78, grade: "B+" },
        { code: "CSE201", title: "Data Structures and Algorithms", type: "Theory", credits: 4.0, marks: 85, grade: "A" },
        { code: "CSE202", title: "Object Oriented Programming using Java", type: "Theory + Lab", credits: 4.0, marks: 88, grade: "A" },
        { code: "CSE203", title: "Digital Electronics", type: "Theory", credits: 3.0, marks: 72, grade: "B" },
        { code: "CSE251", title: "Data Structures Lab", type: "Lab", credits: 2.0, marks: 95, grade: "A+" },
        { code: "CSE252", title: "Java Programming Lab", type: "Lab", credits: 2.0, marks: 96, grade: "A+" }
      ]
    }
  },
  "alex-sterling": {
    "Semester V": {
      semester: "Semester V",
      academicYear: "2024-2025",
      date: "15.01.2025",
      program: "B.Tech Computer Science & Engineering",
      sgpa: 8.60,
      cgpa: 8.50,
      totalCredits: 24,
      subjects: [
        { code: "CSE301", title: "Advanced Neural Networks", type: "Theory", credits: 4.0, marks: 88, grade: "A" },
        { code: "CSE302", title: "Ethical Hacking & Security", type: "Theory", credits: 4.0, marks: 92, grade: "A+" },
        { code: "CSE303", title: "Compiler Design", type: "Theory", credits: 3.0, marks: 80, grade: "B+" },
        { code: "CSE351", title: "Artificial Intelligence Lab", type: "Lab", credits: 2.0, marks: 94, grade: "A+" }
      ]
    }
  }
};

let pendingDocumentsDb: Record<string, any[]> = {
  "piyush-kumar": [
    { id: "pend-1", name: "Migration Certificate", status: "Missing", description: "Original school leaving migration certificate required.", requirement: "Upload digital scan of original PDF, max 10MB." },
    { id: "pend-2", name: "Income Certificate for Scholarship", status: "Awaiting Dean Verification", description: "Submitted on June 28, 2026. Awaiting final seal.", requirement: "Latest signed family income document." }
  ],
  "alex-sterling": [
    { id: "pend-1", name: "Medical Fitness Certificate", status: "Missing", description: "Signed fitness certificate from a registered MBSS physician.", requirement: "Scan original PDF, max 5MB." }
  ]
};

let lecturesDb = [
  {
    id: "lec-1",
    timeStart: "09:00 AM",
    timeEnd: "10:30 AM",
    courseTitle: "Advanced Neural Networks",
    facultyName: "Dr. Sarah Jenkins",
    topic: "Module 4: Backpropagation Optimizations",
    hall: "Hall A-102",
    colorHex: "red"
  },
  {
    id: "lec-2",
    timeStart: "11:00 AM",
    timeEnd: "12:30 PM",
    courseTitle: "Ethical Hacking & Security",
    facultyName: "Prof. Robert Chen",
    topic: "Practical Session: Network Sniffing",
    hall: "Lab 402",
    colorHex: "blue"
  },
  {
    id: "lec-3",
    timeStart: "02:00 PM",
    timeEnd: "03:30 PM",
    courseTitle: "Compiler Design",
    facultyName: "Dr. Amit Shah",
    topic: "Lexical Analysis Intro",
    hall: "Lecture Theatre 2",
    colorHex: "orange"
  }
];

let prepGoalsDb = [
  { id: "prep-1", subject: "Neural Networks", progressPercent: 85, focusArea: "Focus: Backpropagation" },
  { id: "prep-2", subject: "Compiler Design", progressPercent: 42, focusArea: "4 topics remaining" },
  { id: "prep-3", subject: "Ethical Hacking", progressPercent: 68, focusArea: "2 topics remaining" }
];

let documentsDb = [
  { id: "doc-1", name: "Grade Report", lastUploaded: "2 days ago", type: "grade_report" },
  { id: "doc-2", name: "Fee Receipt", lastUploaded: "1 week ago", type: "fee_receipt" },
  { id: "doc-3", name: "Identity Card", lastUploaded: "1 month ago", type: "identity_card" }
];

let courseProgressDb = [
  { courseCode: "CSE-301", courseTitle: "Artificial Intelligence", type: "Theory + Lab", credits: 4.0, attendancePercent: 88, status: "ON Track" },
  { courseCode: "CSE-302", courseTitle: "Network Security", type: "Theory", credits: 3.0, attendancePercent: 76, status: "Warning" }
];

let syllabusProgressDb = [
  { id: "syl-1", courseTitle: "Cloud Computing", velocityLabel: "2 Lectures Ahead", velocityStatus: "ahead", currentProgress: 78, targetProgress: 70, currentUnit: "Unit 4" },
  { id: "syl-2", courseTitle: "Data Warehousing", velocityLabel: "1 Unit Behind", velocityStatus: "behind", currentProgress: 45, targetProgress: 60, currentUnit: "Unit 2" },
  { id: "syl-3", courseTitle: "Network Security", velocityLabel: "On Schedule", velocityStatus: "on_schedule", currentProgress: 65, targetProgress: 65, currentUnit: "Unit 3" }
];

let alertsDb: any[] = [
  { id: "alert-1", studentName: "Felix Argyle", attendancePercent: 64, avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuArs-ZwgfxzCQEYUXoZdQuMngJD4MQyiHBPKfHJeYzxTZLTxkgLhbhe6MMECdbwvEL9YstI1KLmdc4buGKRJ8U1vEX-N3euGo7ovSVJcXkQj9ksGYkYWdKNgrF0xQ0FKxIg7m-mQXHHWthhMA9P6530lns4LC0OsD__2m7lygxq54bCWGmacA5WYsv6wxuuAn1bXgAKKSgKSLhIVIrTAH5n1B9v0hP1g4d7lzLzpqTbGn8NmXZted6sGuoFzi5ZTC0cOStek4u8po" },
  { id: "alert-2", studentName: "Sarah Connor", attendancePercent: 68, avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCOEWN0wbVCbyzxnGr-Y1Wm4dcn3ZrvDllLK3_aKFoieqfSLzU0fkjv0Il9M_YTXW37JOvKQbHPC8tdHR2b1XS7xcyr2c8IR8nypLTL070nuaa1NEXDW1lSYLi_SLWMNzYjUmvgifZqhGqMsCfPt56Js3MCocJeXglUpMDaehVNMHE0DF_vsjMc2Lv_IFYLZrEEXR1eSwfi8cQImKG0em4krPMS6dhSYEBPoWG-EroOimO8r5GRJudIARNZiJ-FEh_Ts1waRMBLZns" }
];

let logsDb = [
  { id: "log-1", timestamp: "Today, 09:45 AM", actor: "Dr. Elena Vance", action: "Attendance uploaded for CS-601 Section A", status: "synced" },
  { id: "log-2", timestamp: "Today, 08:30 AM", actor: "Registrar Office", action: "Updated Semester Syllabus for Network Security", status: "synced" }
];

// Synchronized institutional database collections for the connected ERP
let grievancesDb = [
  {
    id: "GR-7214",
    studentId: "piyush-kumar",
    studentName: "Piyush Singh",
    rollNumber: "2401730018",
    title: "Hostel Block A DNS Timeout",
    department: "Computer Science & Engineering",
    category: "Hostel & Infrastructure",
    priority: "High",
    date: "2026-07-02",
    attachments: ["room_dns_error.png"],
    assignedTo: "Dr. Elena Vance",
    status: "Under Review",
    resolutionNotes: "IT team scheduled router maintenance for tonight.",
    timeline: [
      { date: "2026-07-02 10:00 AM", description: "Grievance submitted by student.", actor: "Student" },
      { date: "2026-07-03 02:30 PM", description: "Assigned to Dr. Elena Vance for department review.", actor: "Admin" }
    ],
    replies: [
      { author: "Dr. Elena Vance", role: "Faculty", text: "I have requested the Warden to provide router access logs to trace DNS timeouts.", timestamp: "2026-07-03 04:15 PM" }
    ]
  },
  {
    id: "GR-8521",
    studentId: "alex-sterling",
    studentName: "Alex Sterling",
    rollNumber: "KRMU-21-98765",
    title: "Late fee installment extension request",
    department: "Computer Science & Engineering",
    category: "Academic / Faculty",
    priority: "Medium",
    date: "2026-07-03",
    attachments: [],
    assignedTo: "Dr. Elena Vance",
    status: "Pending",
    resolutionNotes: "",
    timeline: [
      { date: "2026-07-03 11:15 AM", description: "Grievance registered in the academic system.", actor: "Student" }
    ],
    replies: []
  }
];

let notificationsDb = [
  {
    id: "notif-1",
    type: "Exam Notice",
    title: "Mid-Semester Examination Dates Declared",
    body: "Syllabus completions and mock test marks are updated. Exams start on Oct 24. Ensure no fee balances exist before collecting Admit Card.",
    sender: "Academic Registrar",
    date: "2026-07-04T03:00:00Z",
    readBy: [] as string[]
  },
  {
    id: "notif-2",
    type: "University Notice",
    title: "Minor Project Report Deadlines Extension",
    body: "Dean of Engineering has approved a 3-day extension. Scanned files must be uploaded under the documents portal block.",
    sender: "Dr. Elena Vance",
    date: "2026-07-03T14:30:00Z",
    readBy: [] as string[]
  },
  {
    id: "notif-3",
    type: "Maintenance Notice",
    title: "Hostels Block B Wi-Fi Upgrade Schedule",
    body: "The IT services team will perform network maintenance tonight from 11:00 PM to 01:00 AM.",
    sender: "IT Operations Office",
    date: "2026-07-02T09:00:00Z",
    readBy: [] as string[]
  }
];

let studentServicesDb = [
  {
    id: "SSR-102",
    studentId: "piyush-kumar",
    studentName: "Piyush Singh",
    rollNumber: "2401730018",
    type: "Bonafide",
    details: "Requesting Bonafide Certificate for state education scholarship application.",
    date: "2026-07-01",
    status: "Pending",
    remarks: ""
  },
  {
    id: "SSR-103",
    studentId: "alex-sterling",
    studentName: "Alex Sterling",
    rollNumber: "KRMU-21-98765",
    type: "Scholarship Status",
    details: "Merit-cum-Means Scholarship application fee waiver request.",
    date: "2026-06-30",
    status: "Approved",
    remarks: "Academic records verified. Approved 50% waiver."
  }
];

let feePaymentsDb = [
  {
    id: "PAY-9321",
    studentName: "Piyush Singh",
    rollNo: "2401730018",
    course: "B.Tech Computer Science & Engineering",
    semester: "Semester V",
    amount: 85000,
    paymentDate: "2026-06-15",
    receiptNumber: "KRMU-REC-2026-4819",
    mode: "Net Banking",
    status: "Paid",
    outstandingFees: 15000,
    lateFee: 0
  },
  {
    id: "PAY-9322",
    studentName: "Alex Sterling",
    rollNo: "KRMU-21-98765",
    course: "B.Tech Computer Science & Engineering",
    semester: "Semester VI",
    amount: 100000,
    paymentDate: "2026-05-10",
    receiptNumber: "KRMU-REC-2026-3012",
    mode: "Credit Card",
    status: "Paid",
    outstandingFees: 0,
    lateFee: 0
  }
];

let facultyLeavesDb = [
  {
    id: "LR-4812",
    facultyName: "Dr. Elena Vance",
    department: "Computer Science",
    leaveType: "Casual Leave",
    startDate: "2026-07-06",
    endDate: "2026-07-07",
    days: 2,
    reason: "Attending annual Distributed Systems ACM conference as speaker.",
    status: "Pending",
    appliedDate: "2026-07-01",
    documentName: "acm_invite.pdf",
    remarks: ""
  }
];

let leaveBalancesDb: Record<string, any> = {
  "elena-vance": { casual: 8, sick: 12, earned: 18, total: 38 },
  "sarah-jenkins": { casual: 10, sick: 10, earned: 20, total: 40 }
};

let researchApprovalsDb = [
  { id: "RES-201", facultyName: "Dr. Elena Vance", topic: "Fault Tolerance in Microservices Architecture", journal: "IEEE Transactions on Cloud Computing", status: "Approved", budget: "$4,500" }
];

let gatePassesDb: any[] = [
  {
    id: "GP-3091",
    studentId: "piyush-kumar",
    studentName: "Piyush Singh",
    rollNo: "2401730018",
    leavingDate: "2026-07-04",
    returnDate: "2026-07-05",
    leavingTime: "05:00 PM",
    returnTime: "08:00 PM",
    reason: "Going to local guardian home for weekend.",
    destination: "Gurugram Sector 45",
    guardianName: "Rakesh Singh",
    guardianContact: "+91 98111 22233",
    emergencyContact: "+91 98765 43210",
    transport: "Metro / Public Cab",
    status: "Pending",
    remarks: "",
    appliedDate: "2026-07-04"
  }
];

let emailsDb = [
  {
    id: "EM-501",
    subject: "Urgent: Complete Semester V Fees Payment",
    body: "Dear Student,\n\nThis is to remind you that your semester fees are overdue. Please pay to avoid late fines.",
    template: "Pending Fee Reminder",
    recipient: "piyush.kumar@krmu.ac.in",
    scope: "Individual Student Email",
    status: "Sent",
    sentAt: "2026-07-03"
  }
];

// ----------------------------------------------------
// REST API Core Routes
// ----------------------------------------------------

// Status & Diagnostics endpoint
app.get("/api/status", (req, res) => {
  res.json({
    status: "ok",
    supabaseConfigured: !!supabaseClient,
    time: new Date().toISOString()
  });
});

// Interactive Google & Microsoft SSO Account Picker
app.get("/auth/sso-picker", (req, res) => {
  const provider = req.query.provider === "microsoft" ? "microsoft" : "google";
  
  if (provider === "google") {
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Sign in - Google Accounts</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body class="bg-[#f0f4f9] flex items-center justify-center min-h-screen p-4 font-sans selection:bg-blue-100">
        <div class="bg-white rounded-[28px] p-10 max-w-[450px] w-full border border-gray-200 shadow-sm flex flex-col">
          <div class="flex justify-start mb-6">
            <svg class="h-6" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"></path>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
            </svg>
          </div>
          <h1 class="text-[24px] font-normal text-[#1f1f1f] tracking-tight mb-2">Choose an account</h1>
          <p class="text-[14px] text-[#444746] mb-6">to continue to <span class="font-semibold text-gray-800">SOET Secure Portal</span></p>
          
          <div class="space-y-1 mb-8 max-h-[300px] overflow-y-auto pr-1">
            <button onclick="select('piyush.kumar@krmu.ac.in')" class="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-100 transition-colors text-left border border-transparent">
              <div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">PK</div>
              <div class="flex-1">
                <p class="text-sm font-medium text-gray-800">Piyush Kumar</p>
                <p class="text-xs text-gray-500">piyush.kumar@krmu.ac.in</p>
              </div>
            </button>
            <button onclick="select('elena.vance@krmangalam.edu.in')" class="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-100 transition-colors text-left border border-transparent">
              <div class="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold text-sm">EV</div>
              <div class="flex-1">
                <p class="text-sm font-medium text-gray-800">Dr. Elena Vance</p>
                <p class="text-xs text-gray-500">elena.vance@krmangalam.edu.in</p>
              </div>
            </button>
            <button onclick="select('admin.portal@krmangalam.edu.in')" class="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-100 transition-colors text-left border border-transparent">
              <div class="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-sm">RG</div>
              <div class="flex-1">
                <p class="text-sm font-medium text-gray-800">Registrar General</p>
                <p class="text-xs text-gray-500">admin.portal@krmangalam.edu.in</p>
              </div>
            </button>
            <button onclick="select('piyushs2305@gmail.com')" class="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-100 transition-colors text-left border border-transparent">
              <div class="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold text-sm">P</div>
              <div class="flex-1">
                <p class="text-sm font-medium text-gray-800">Piyush Sharma</p>
                <p class="text-xs text-gray-500">piyushs2305@gmail.com (Personal)</p>
              </div>
            </button>
          </div>
          
          <div class="text-[12px] text-[#444746] leading-relaxed mt-auto pt-4 border-t border-gray-100">
            To continue, Google will share your name, email address, profile picture, and personal info with SOET.
          </div>
        </div>
        
        <script>
          function select(email) {
            if (window.opener) {
              window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS', email: email, provider: 'google' }, '*');
              window.close();
            } else {
              alert("Logged in as " + email);
            }
          }
        </script>
      </body>
      </html>
    `);
  } else {
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Sign in to your Microsoft account</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body class="bg-[#f2f2f2] flex items-center justify-center min-h-screen p-4 font-sans select-none">
        <div class="bg-white rounded-md p-11 max-w-[440px] w-full border border-[#d2d2d2] shadow-sm flex flex-col">
          <div class="flex items-center gap-2 mb-6">
            <svg class="h-6 w-6" viewBox="0 0 23 23">
              <path d="M0 0h23v23H0z" fill="#f3f3f3"></path>
              <path d="M1 1h10v10H1z" fill="#f35325"></path>
              <path d="M12 1h10v10H12z" fill="#81bc06"></path>
              <path d="M1 12h10v10H1z" fill="#05a6f0"></path>
              <path d="M12 12h10v10H12z" fill="#ffba08"></path>
            </svg>
            <span class="text-[#737373] text-[18px] font-semibold">Microsoft</span>
          </div>
          <h1 class="text-[24px] font-semibold text-[#1b1b1b] tracking-tight mb-2">Pick an account</h1>
          <p class="text-[15px] text-[#1b1b1b] mb-6">to continue to <span class="font-semibold">SOET Azure Directory</span></p>
          
          <div class="space-y-1 mb-8 max-h-[300px] overflow-y-auto">
            <button onclick="select('piyush.kumar@krmu.ac.in')" class="w-full flex items-center gap-3 p-3 hover:bg-gray-100 transition-colors text-left border-b border-gray-100">
              <div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">PK</div>
              <div class="flex-1">
                <p class="text-sm font-semibold text-gray-800">Piyush Kumar</p>
                <p class="text-xs text-gray-500">piyush.kumar@krmu.ac.in</p>
              </div>
            </button>
            <button onclick="select('elena.vance@krmangalam.edu.in')" class="w-full flex items-center gap-3 p-3 hover:bg-gray-100 transition-colors text-left border-b border-gray-100">
              <div class="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold text-xs">EV</div>
              <div class="flex-1">
                <p class="text-sm font-semibold text-gray-800">Dr. Elena Vance</p>
                <p class="text-xs text-gray-500">elena.vance@krmangalam.edu.in</p>
              </div>
            </button>
            <button onclick="select('admin.portal@krmangalam.edu.in')" class="w-full flex items-center gap-3 p-3 hover:bg-gray-100 transition-colors text-left border-b border-gray-100">
              <div class="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-xs">RG</div>
              <div class="flex-1">
                <p class="text-sm font-semibold text-gray-800">Registrar General</p>
                <p class="text-xs text-gray-500">admin.portal@krmangalam.edu.in</p>
              </div>
            </button>
            <button onclick="select('unlinked@outlook.com')" class="w-full flex items-center gap-3 p-3 hover:bg-gray-100 transition-colors text-left border-b border-gray-100">
              <div class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold text-xs">O</div>
              <div class="flex-1">
                <p class="text-sm font-semibold text-gray-800">Personal Outlook</p>
                <p class="text-xs text-gray-500">unlinked@outlook.com</p>
              </div>
            </button>
          </div>
          
          <div class="text-[12px] text-[#676767] leading-relaxed mt-auto">
            Sign-in is subject to your university's data security guidelines and access control policies.
          </div>
        </div>
        
        <script>
          function select(email) {
            if (window.opener) {
              window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS', email: email, provider: 'microsoft' }, '*');
              window.close();
            } else {
              alert("Logged in as " + email);
            }
          }
        </script>
      </body>
      </html>
    `);
  }
});

// Authentication Proxy Endpoint
app.post("/api/auth/login", async (req, res) => {
  const { email, password, role } = req.body;

  // Let's implement actual Supabase login if configured
  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password
      });
      if (error) {
        return res.status(401).json({ error: error.message });
      }

      // Check role assignment inside profiles
      const { data: profile, error: profileErr } = await supabaseClient
        .from("profiles")
        .select("*")
        .eq("id", data.user.id)
        .single();

      if (!profileErr && profile) {
        if (profile.role !== role) {
          return res.status(403).json({ error: `Unauthorized role. Expected ${role}, got ${profile.role}.` });
        }
        return res.json({ user: data.user, profile });
      }
    } catch (e: any) {
      console.warn("Supabase auth error, fallback to localized accounts:", e);
    }
  }

  // Fallback pattern matching for preview convenience
  console.log(`Local login verification for role: ${role}, email: ${email}`);
  let matchedUser = null;

  if (role === "student") {
    // Check if the login email matches Alex or Piyush, otherwise fallback
    matchedUser = studentsDb.find(s => s.email === email) || studentsDb[0];
  } else if (role === "faculty") {
    matchedUser = {
      id: "elena-vance",
      email: email || "elena.vance@krmangalam.edu.in",
      fullName: "Dr. Elena Vance",
      title: "Associate Professor, CSE"
    };
  } else if (role === "admin") {
    matchedUser = {
      id: "admin-governance",
      email: email || "admin.portal@krmangalam.edu.in",
      fullName: "Registrar's Office",
      title: "Institutional Director"
    };
  }

  if (matchedUser) {
    return res.json({
      success: true,
      user: {
        id: matchedUser.id,
        email: email,
        fullName: matchedUser.fullName,
        role: role,
        details: matchedUser
      }
    });
  }

  res.status(400).json({ error: "Invalid credentials" });
});

// Student Profile API
app.get("/api/student/:id/profile", async (req, res) => {
  const studentId = req.params.id;

  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient
        .from("students")
        .select("*")
        .eq("id", studentId)
        .single();
      if (!error && data) {
        return res.json(data);
      }
    } catch (e) {
      console.error("Supabase profile fetch error:", e);
    }
  }

  // Fallback
  const profile = studentsDb.find(s => s.id === studentId) || studentsDb[0];
  res.json(profile);
});

// Unified Profile GET API
app.get("/api/profile/:role/:id", async (req, res) => {
  const { role, id } = req.params;

  if (supabaseClient) {
    try {
      const tableName = role === "student" ? "students" : role === "faculty" ? "faculty" : "admin_profiles";
      const { data, error } = await supabaseClient
        .from(tableName)
        .select("*")
        .eq("id", id)
        .single();
      if (!error && data) {
        return res.json(data);
      }
    } catch (e) {
      console.error(`Supabase fetch error for ${role} profile:`, e);
    }
  }

  // Fallback to local memory databases
  if (role === "student") {
    const profile = studentsDb.find(s => s.id === id) || studentsDb.find(s => s.id === "piyush-kumar") || studentsDb[0];
    return res.json(profile);
  } else if (role === "faculty") {
    const profile = facultyDb.find(f => f.id === id) || facultyDb[0];
    return res.json(profile);
  } else if (role === "admin") {
    const profile = adminDb.find(a => a.id === id) || adminDb[0];
    return res.json(profile);
  }

  res.status(404).json({ error: "Profile not found" });
});

// Unified Profile PUT API
app.put("/api/profile/:role/:id", async (req, res) => {
  const { role, id } = req.params;
  const updatedData = req.body;

  if (supabaseClient) {
    try {
      const tableName = role === "student" ? "students" : role === "faculty" ? "faculty" : "admin_profiles";
      const { data, error } = await supabaseClient
        .from(tableName)
        .update(updatedData)
        .eq("id", id)
        .select()
        .single();
      if (!error && data) {
        if (role === "student") {
          const idx = studentsDb.findIndex(s => s.id === id);
          if (idx !== -1) studentsDb[idx] = { ...studentsDb[idx], ...data };
        } else if (role === "faculty") {
          const idx = facultyDb.findIndex(f => f.id === id);
          if (idx !== -1) facultyDb[idx] = { ...facultyDb[idx], ...data };
        } else if (role === "admin") {
          const idx = adminDb.findIndex(a => a.id === id);
          if (idx !== -1) adminDb[idx] = { ...adminDb[idx], ...data };
        }
        return res.json({ success: true, profile: data });
      } else {
        console.warn("Supabase update error:", error);
      }
    } catch (e) {
      console.error(`Supabase update error for ${role} profile:`, e);
    }
  }

  // Fallback updating local database
  if (role === "student") {
    const idx = studentsDb.findIndex(s => s.id === id);
    const targetIdx = idx !== -1 ? idx : studentsDb.findIndex(s => s.id === "piyush-kumar");
    if (targetIdx !== -1) {
      studentsDb[targetIdx] = { ...studentsDb[targetIdx], ...updatedData };
      return res.json({ success: true, profile: studentsDb[targetIdx] });
    }
  } else if (role === "faculty") {
    const idx = facultyDb.findIndex(f => f.id === id);
    if (idx !== -1) {
      facultyDb[idx] = { ...facultyDb[idx], ...updatedData };
      return res.json({ success: true, profile: facultyDb[idx] });
    } else {
      const newFac = { id, ...updatedData } as any;
      facultyDb.push(newFac);
      return res.json({ success: true, profile: newFac });
    }
  } else if (role === "admin") {
    const idx = adminDb.findIndex(a => a.id === id);
    if (idx !== -1) {
      adminDb[idx] = { ...adminDb[idx], ...updatedData };
      return res.json({ success: true, profile: adminDb[idx] });
    } else {
      const newAdmin = { id, ...updatedData } as any;
      adminDb.push(newAdmin);
      return res.json({ success: true, profile: newAdmin });
    }
  }

  res.status(404).json({ error: "Profile not found to update" });
});

// Profile Photo Upload Endpoint
app.post("/api/profile/:role/:id/upload", async (req, res) => {
  const { role, id } = req.params;
  const { photoUrl } = req.body;

  if (supabaseClient) {
    try {
      const tableName = role === "student" ? "students" : role === "faculty" ? "faculty" : "admin_profiles";
      const { data, error } = await supabaseClient
        .from(tableName)
        .update({ photoUrl: photoUrl })
        .eq("id", id)
        .select()
        .single();
      if (!error && data) {
        return res.json({ success: true, photoUrl: data.photoUrl });
      }
    } catch (e) {
      console.error("Supabase picture update error:", e);
    }
  }

  // Local fallback
  if (role === "student") {
    const idx = studentsDb.findIndex(s => s.id === id);
    const targetIdx = idx !== -1 ? idx : studentsDb.findIndex(s => s.id === "piyush-kumar");
    if (targetIdx !== -1) {
      (studentsDb[targetIdx] as any).photoUrl = photoUrl;
      return res.json({ success: true, photoUrl });
    }
  } else if (role === "faculty") {
    const idx = facultyDb.findIndex(f => f.id === id);
    if (idx !== -1) {
      (facultyDb[idx] as any).photoUrl = photoUrl;
      return res.json({ success: true, photoUrl });
    }
  } else if (role === "admin") {
    const idx = adminDb.findIndex(a => a.id === id);
    if (idx !== -1) {
      (adminDb[idx] as any).photoUrl = photoUrl;
      return res.json({ success: true, photoUrl });
    }
  }

  res.status(404).json({ error: "User not found for uploading photo" });
});

// Student Lectures API
app.get("/api/student/:id/lectures", (req, res) => {
  res.json(lecturesDb);
});

// Student Progress API
app.get("/api/student/:id/progress", (req, res) => {
  res.json(courseProgressDb);
});

// Student Document Wallet API
app.get("/api/student/:id/documents", (req, res) => {
  res.json(documentsDb);
});

app.post("/api/student/:id/documents/upload", (req, res) => {
  const { name, type } = req.body;
  const newDoc = {
    id: "doc-" + Date.now(),
    name: name || "Uploaded Document",
    lastUploaded: "Just now",
    type: type || "other"
  };
  documentsDb.push(newDoc);
  res.json({ success: true, documents: documentsDb });
});

// Student Goals APIs
app.get("/api/student/:id/goals", (req, res) => {
  const studentId = req.params.id;
  if (!studentGoalsDb[studentId]) {
    studentGoalsDb[studentId] = [
      { id: "prep-1", subject: "Neural Networks", progressPercent: 85, focusArea: "Focus: Backpropagation" },
      { id: "prep-2", subject: "Compiler Design", progressPercent: 42, focusArea: "4 topics remaining" },
      { id: "prep-3", subject: "Ethical Hacking", progressPercent: 68, focusArea: "2 topics remaining" }
    ];
  }
  res.json(studentGoalsDb[studentId]);
});

app.post("/api/student/:id/goals", (req, res) => {
  const studentId = req.params.id;
  const { subject, progressPercent, focusArea } = req.body;
  const newGoal = {
    id: "goal-" + Date.now(),
    subject: subject || "New Goal",
    progressPercent: Number(progressPercent) || 0,
    focusArea: focusArea || ""
  };
  if (!studentGoalsDb[studentId]) {
    studentGoalsDb[studentId] = [];
  }
  studentGoalsDb[studentId].push(newGoal);
  res.json({ success: true, goals: studentGoalsDb[studentId] });
});

app.put("/api/student/:id/goals/:goalId", (req, res) => {
  const studentId = req.params.id;
  const goalId = req.params.goalId;
  const { subject, progressPercent, focusArea } = req.body;
  if (studentGoalsDb[studentId]) {
    studentGoalsDb[studentId] = studentGoalsDb[studentId].map(g => {
      if (g.id === goalId) {
        return {
          ...g,
          subject: subject !== undefined ? subject : g.subject,
          progressPercent: progressPercent !== undefined ? Number(progressPercent) : g.progressPercent,
          focusArea: focusArea !== undefined ? focusArea : g.focusArea
        };
      }
      return g;
    });
  }
  res.json({ success: true, goals: studentGoalsDb[studentId] || [] });
});

app.delete("/api/student/:id/goals/:goalId", (req, res) => {
  const studentId = req.params.id;
  const goalId = req.params.goalId;
  if (studentGoalsDb[studentId]) {
    studentGoalsDb[studentId] = studentGoalsDb[studentId].filter(g => g.id !== goalId);
  }
  res.json({ success: true, goals: studentGoalsDb[studentId] || [] });
});

// Student Grades API
app.get("/api/student/:id/grades", (req, res) => {
  const studentId = req.params.id;
  const grades = studentGradesDb[studentId] || studentGradesDb["piyush-kumar"];
  res.json(grades);
});

// Student Pending Submissions API
app.get("/api/student/:id/pending-documents", (req, res) => {
  const studentId = req.params.id;
  const pending = pendingDocumentsDb[studentId] || pendingDocumentsDb["piyush-kumar"];
  res.json(pending);
});

app.post("/api/student/:id/pending-documents/:docId/upload", (req, res) => {
  const studentId = req.params.id;
  const docId = req.params.docId;
  
  if (pendingDocumentsDb[studentId]) {
    const docIndex = pendingDocumentsDb[studentId].findIndex(d => d.id === docId);
    if (docIndex > -1) {
      const doc = pendingDocumentsDb[studentId][docIndex];
      
      // Move to verified or approved
      doc.status = "Verified & Approved";
      
      // Add to documents list so it appears in the Digital Wallet!
      const newDoc = {
        id: "doc-" + Date.now(),
        name: doc.name,
        lastUploaded: "Just now",
        type: doc.name.toLowerCase().includes("receipt") ? "fee_receipt" as const : doc.name.toLowerCase().includes("grade") ? "grade_report" as const : "other" as const
      };
      documentsDb.push(newDoc);
    }
  }
  res.json({ success: true, pending: pendingDocumentsDb[studentId] || [] });
});

// ----------------------------------------------------
// Connected ERP REST API Routes
// ----------------------------------------------------

// 1. GRIEVANCES
app.get("/api/grievances", (req, res) => {
  res.json(grievancesDb);
});

app.get("/api/student/:id/grievances", (req, res) => {
  const studentId = req.params.id;
  res.json(grievancesDb.filter(g => g.studentId === studentId));
});

app.post("/api/student/:id/grievance", (req, res) => {
  const studentId = req.params.id;
  const { title, description, category, priority, attachments } = req.body;
  
  const studentInfo = studentsDb.find(s => s.id === studentId) || studentsDb[0];
  const gId = "GR-" + Math.floor(1000 + Math.random() * 9000);
  
  const newGrievance = {
    id: gId,
    studentId: studentId,
    studentName: studentInfo.fullName,
    rollNumber: studentInfo.rollNo || studentInfo.enrollmentNo,
    title: title || "General Issue",
    department: studentInfo.program.includes("AIML") ? "CSE-AIML" : "CSE",
    category: category || "General Support",
    priority: priority || "Medium",
    date: new Date().toISOString().split('T')[0],
    attachments: attachments || [],
    assignedTo: "Dr. Elena Vance",
    status: "Pending",
    resolutionNotes: "",
    timeline: [
      { date: new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString(), description: "Grievance raised by student.", actor: "Student" }
    ],
    replies: [] as any[]
  };
  
  grievancesDb.unshift(newGrievance);
  
  // Push notification
  const newNotif = {
    id: "notif-" + Date.now(),
    type: "Emergency Notice",
    title: `Grievance Raised: ${title}`,
    body: `Grievance ${gId} has been submitted by ${studentInfo.fullName} and is under review.`,
    sender: "Dean's Grievance Desk",
    date: new Date().toISOString(),
    readBy: []
  };
  notificationsDb.unshift(newNotif);

  res.json({ success: true, grievance: newGrievance, grievances: grievancesDb });
});

app.put("/api/grievances/:id", (req, res) => {
  const { id } = req.params;
  const { status, assignedTo, resolutionNotes, actionText, actorName, replyText } = req.body;
  
  const gIndex = grievancesDb.findIndex(g => g.id === id);
  if (gIndex > -1) {
    const g = grievancesDb[gIndex];
    if (status) g.status = status;
    if (assignedTo) g.assignedTo = assignedTo;
    if (resolutionNotes !== undefined) g.resolutionNotes = resolutionNotes;
    
    // Add reply if specified
    if (replyText) {
      if (!g.replies) g.replies = [];
      g.replies.push({
        author: actorName || "Faculty",
        role: actorName?.includes("Registrar") ? "Admin" : "Faculty",
        text: replyText,
        timestamp: new Date().toLocaleString()
      });
    }

    // Add timeline event
    const timestamp = new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString();
    g.timeline.push({
      date: timestamp,
      description: actionText || `Status updated to ${status}.`,
      actor: actorName || "Faculty/Admin"
    });
    
    // Push notification
    const newNotif = {
      id: "notif-" + Date.now(),
      type: "University Notice",
      title: `Grievance ${g.id} Updated: ${g.status}`,
      body: `Status of grievance "${g.title}" is now ${g.status}. ${resolutionNotes ? "Notes: " + resolutionNotes : ""}`,
      sender: actorName || "Dean's Desk",
      date: new Date().toISOString(),
      readBy: []
    };
    notificationsDb.unshift(newNotif);

    return res.json({ success: true, grievance: g, grievances: grievancesDb });
  }
  res.status(404).json({ error: "Grievance not found" });
});

app.post("/api/grievances/:id/reply", (req, res) => {
  const { id } = req.params;
  const { author, role, text } = req.body;
  const g = grievancesDb.find(g => g.id === id);
  if (g) {
    if (!g.replies) g.replies = [];
    g.replies.push({
      author,
      role,
      text,
      timestamp: new Date().toLocaleString()
    });
    g.timeline.push({
      date: new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString(),
      description: `Reply posted by ${author} (${role}).`,
      actor: author
    });
    return res.json({ success: true, grievance: g, grievances: grievancesDb });
  }
  res.status(404).json({ error: "Grievance not found" });
});

app.put("/api/grievances/:id/status", (req, res) => {
  const { id } = req.params;
  const { status, actorName, actorRole, notes } = req.body;
  const g = grievancesDb.find(g => g.id === id);
  if (g) {
    g.status = status;
    g.timeline.push({
      date: new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString(),
      description: notes || `Status updated to ${status} by ${actorName}.`,
      actor: actorName || "Staff"
    });
    
    // Trigger notification
    const newNotif = {
      id: "notif-" + Date.now(),
      type: "University Notice",
      title: `Grievance ${g.id} Status: ${g.status}`,
      body: `Your grievance regarding "${g.title}" is now ${g.status}.`,
      sender: actorName || "Registrar Desk",
      date: new Date().toISOString(),
      readBy: []
    };
    notificationsDb.unshift(newNotif);
    
    return res.json({ success: true, grievance: g, grievances: grievancesDb });
  }
  res.status(404).json({ error: "Grievance not found" });
});

// 2. NOTIFICATIONS
app.get("/api/notifications", (req, res) => {
  res.json(notificationsDb);
});

app.post("/api/notifications", (req, res) => {
  const { type, title, body, sender } = req.body;
  const newNotif = {
    id: "notif-" + Date.now(),
    type,
    title,
    body,
    sender: sender || "Academic Registrar",
    date: new Date().toISOString(),
    readBy: [] as string[]
  };
  notificationsDb.unshift(newNotif);
  res.json({ success: true, notification: newNotif, notifications: notificationsDb });
});

app.post("/api/notifications/:id/read", (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;
  const notif = notificationsDb.find(n => n.id === id);
  if (notif) {
    if (!notif.readBy.includes(userId)) {
      notif.readBy.push(userId);
    }
    return res.json({ success: true, notification: notif });
  }
  res.status(404).json({ error: "Notification not found" });
});

app.post("/api/notifications/mark-all-read", (req, res) => {
  const { userId } = req.body;
  notificationsDb.forEach(notif => {
    if (!notif.readBy.includes(userId)) {
      notif.readBy.push(userId);
    }
  });
  res.json({ success: true, notifications: notificationsDb });
});

// Admin Portal Helper APIs
app.get("/api/students", (req, res) => {
  res.json(studentsDb);
});

app.get("/api/faculty", (req, res) => {
  res.json(facultyDb);
});

app.get("/api/attendance/activity", (req, res) => {
  res.json(classActivitiesDb);
});

app.post("/api/students", (req, res) => {
  const { fullName, email, program } = req.body;
  const newStudent = {
    id: fullName.toLowerCase().replace(/\s+/g, '-'),
    enrollmentNo: "KRMU-" + Math.floor(21 + Math.random() * 5) + "-" + Math.floor(10000 + Math.random() * 90000),
    fullName,
    email,
    program,
    branch: "Computer Science & Engineering",
    currentSemester: "Semester I",
    cgpa: 0,
    admissionYear: 2026,
    hostel: "None",
    roomNumber: "N/A",
    transportRoute: "None",
    classesAttended: 0,
    totalClasses: 0
  };
  (studentsDb as any[]).push(newStudent);
  res.json({ success: true, student: newStudent, students: studentsDb });
});

app.post("/api/faculty", (req, res) => {
  const { fullName, email, designation } = req.body;
  const newFac = {
    id: fullName.toLowerCase().replace(/\s+/g, '-'),
    fullName,
    employeeId: "EMP-" + Math.floor(2000 + Math.random() * 500),
    designation,
    department: "CSE Department",
    email,
    mobileNumber: "+91 99999 " + Math.floor(10000 + Math.random() * 90000),
    joiningYear: 2026,
    employmentType: "Full Time",
    status: "Active",
    officeLocation: "Block C",
    dob: "January 1, 1990",
    gender: "Male",
    bloodGroup: "O+",
    address: "Gurugram",
    emergencyContact: "+91 99999 00000",
    nationality: "Indian",
    facultyCode: "CSE-" + (fullName.split(' ').map((n: string) => n[0]).join('')) + "-2026",
    highestQualification: "Ph.D.",
    specialization: "Computer Science",
    joiningDate: "July 01, 2026",
    experience: "1 Year",
    reportingHead: "Prof. Dr. Alan Grant (Dean, SOET)",
    officeHours: "TBD",
    cabin: "Cabin C-TBD",
    extension: "Ext TBD",
    availability: "Available",
    photoUrl: ""
  };
  (facultyDb as any[]).push(newFac);
  res.json({ success: true, faculty: newFac, facultyList: facultyDb });
});

// 3. STUDENT SERVICES
app.get("/api/student-services", (req, res) => {
  res.json(studentServicesDb);
});

app.get("/api/student/:id/student-services", (req, res) => {
  const studentId = req.params.id;
  res.json(studentServicesDb.filter(s => s.studentId === studentId));
});

app.post("/api/student/:id/student-services", (req, res) => {
  const studentId = req.params.id;
  const { type, details } = req.body;
  const studentInfo = studentsDb.find(s => s.id === studentId) || studentsDb[0];
  
  const newRequest = {
    id: "SSR-" + Math.floor(100 + Math.random() * 900),
    studentId,
    studentName: studentInfo.fullName,
    rollNumber: studentInfo.rollNo || studentInfo.enrollmentNo,
    type,
    details: details || `Request for ${type}.`,
    date: new Date().toISOString().split('T')[0],
    status: "Pending",
    remarks: ""
  };
  
  studentServicesDb.unshift(newRequest);
  res.json({ success: true, request: newRequest, services: studentServicesDb });
});

app.put("/api/student-services/:id", (req, res) => {
  const { id } = req.params;
  const { status, remarks } = req.body;
  const reqIndex = studentServicesDb.findIndex(s => s.id === id);
  if (reqIndex > -1) {
    const request = studentServicesDb[reqIndex];
    request.status = status;
    if (remarks !== undefined) request.remarks = remarks;
    
    // Create notification
    const newNotif = {
      id: "notif-" + Date.now(),
      type: "Result Updates",
      title: `${request.type} Request: ${status}`,
      body: `Your request for ${request.type} has been ${status}. Remarks: ${remarks || "None"}`,
      sender: "Student Services Center",
      date: new Date().toISOString(),
      readBy: []
    };
    notificationsDb.unshift(newNotif);

    return res.json({ success: true, request, services: studentServicesDb });
  }
  res.status(404).json({ error: "Request not found" });
});

// 4. STUDENT FEES
app.get("/api/fee-payments", (req, res) => {
  res.json(feePaymentsDb);
});

app.post("/api/student/:id/pay-fee", (req, res) => {
  const studentId = req.params.id;
  const { amount, semester, mode } = req.body;
  const studentInfo = studentsDb.find(s => s.id === studentId) || studentsDb[0];
  
  const newPayment = {
    id: "PAY-" + Math.floor(1000 + Math.random() * 9000),
    studentName: studentInfo.fullName,
    rollNo: studentInfo.rollNo || studentInfo.enrollmentNo,
    course: studentInfo.program,
    semester: semester || studentInfo.currentSemester,
    amount: Number(amount),
    paymentDate: new Date().toISOString().split('T')[0],
    receiptNumber: "KRMU-REC-" + Date.now().toString().slice(-4),
    mode: mode || "Net Banking",
    status: "Paid",
    outstandingFees: 0,
    lateFee: 0
  };
  
  feePaymentsDb.unshift(newPayment);
  
  // Notify
  const newNotif = {
    id: "notif-" + Date.now(),
    type: "Fee Alerts",
    title: `Fee Payment Successful: Sem ${semester}`,
    body: `Payment of ₹${amount} received. Receipt No: ${newPayment.receiptNumber}.`,
    sender: "Accounts Department",
    date: new Date().toISOString(),
    readBy: []
  };
  notificationsDb.unshift(newNotif);

  res.json({ success: true, payment: newPayment, payments: feePaymentsDb });
});

// 5. FACULTY LEAVES
app.get("/api/faculty-leaves", (req, res) => {
  res.json(facultyLeavesDb);
});

app.get("/api/faculty/leaves", (req, res) => {
  res.json(facultyLeavesDb);
});

app.post("/api/faculty/leaves", (req, res) => {
  const { leaveType, startDate, endDate, days, reason, documentName, appliedDate } = req.body;
  
  // Deduct from balance
  const balance = leaveBalancesDb["elena-vance"];
  if (balance) {
    if (leaveType === "Casual Leave") balance.casual = Math.max(0, balance.casual - Number(days));
    else if (leaveType === "Sick Leave") balance.sick = Math.max(0, balance.sick - Number(days));
    else if (leaveType === "Earned Leave") balance.earned = Math.max(0, balance.earned - Number(days));
    balance.total = balance.casual + balance.sick + balance.earned;
  }

  const newLeave = {
    id: "LR-" + Math.floor(1000 + Math.random() * 9000),
    facultyName: "Dr. Elena Vance",
    department: "Computer Science",
    leaveType,
    startDate,
    endDate,
    days: Number(days),
    reason,
    status: "Pending",
    appliedDate: appliedDate || new Date().toISOString().split('T')[0],
    documentName: documentName || "",
    remarks: ""
  };
  
  facultyLeavesDb.unshift(newLeave);
  res.json({ success: true, leave: newLeave, leaves: facultyLeavesDb, balances: leaveBalancesDb });
});

app.put("/api/faculty-leaves/:id", (req, res) => {
  const { id } = req.params;
  const { status, remarks } = req.body;
  const leaveIndex = facultyLeavesDb.findIndex(l => l.id === id);
  if (leaveIndex > -1) {
    const leave = facultyLeavesDb[leaveIndex];
    leave.status = status;
    if (remarks !== undefined) leave.remarks = remarks;
    
    // Notify
    const newNotif = {
      id: "notif-" + Date.now(),
      type: "Academic Notices",
      title: `Leave Application: ${status}`,
      body: `Leave request from ${leave.facultyName} has been ${status}. Remarks: ${remarks || "None"}`,
      sender: "Registrar Office",
      date: new Date().toISOString(),
      readBy: []
    };
    notificationsDb.unshift(newNotif);

    return res.json({ success: true, leave, leaves: facultyLeavesDb });
  }
  res.status(404).json({ error: "Leave application not found" });
});

app.get("/api/faculty/leaves/balance", (req, res) => {
  res.json(leaveBalancesDb);
});

// 6. HOSTEL GATE PASS SYSTEM
// Helper to parse date + time strings into a comparable JS Date object
function parseDateTime(dateStr: string, timeStr: string): Date {
  let hours = 0;
  let minutes = 0;
  if (timeStr) {
    try {
      const pm = timeStr.toUpperCase().includes("PM");
      const am = timeStr.toUpperCase().includes("AM");
      const cleanTime = timeStr.replace(/[APM]/gi, '').trim();
      const parts = cleanTime.split(':');
      hours = parseInt(parts[0], 10);
      minutes = parts[1] ? parseInt(parts[1], 10) : 0;
      if (pm && hours < 12) hours += 12;
      if (am && hours === 12) hours = 0;
    } catch (e) {
      console.error("Failed to parse time string:", timeStr);
    }
  }
  const date = new Date(dateStr);
  date.setHours(hours, minutes, 0, 0);
  return date;
}

// Helper to sync local gate pass objects with Supabase table
async function syncGatePassToSupabase(pass: any) {
  if (!supabaseClient) return;
  try {
    const mapped = {
      gate_pass_id: pass.id,
      student_id: pass.studentId,
      roll_number: pass.rollNo,
      hostel_block: pass.hostelBlock || '',
      room_number: pass.roomNumber || '',
      leave_type: pass.leaveType || 'Outstation Leave',
      destination: pass.destination || '',
      transport_mode: pass.transport || '',
      reason: pass.reason || '',
      exit_datetime: `${pass.leavingDate}T${pass.leavingTime || '00:00'}:00`,
      return_datetime: `${pass.returnDate}T${pass.returnTime || '00:00'}:00`,
      guardian_name: pass.guardianName || '',
      guardian_contact: pass.guardianContact || '',
      emergency_contact: pass.emergencyContact || '',
      document_url: pass.documentUrl || '',
      status: pass.status,
      approved_by: pass.approvedBy || '',
      approval_timestamp: pass.approvalTimestamp || null,
      qr_code: pass.qrCode || '',
      exit_scan_time: pass.exitScanTime || null,
      return_scan_time: pass.returnScanTime || null,
      qr_verification_status: pass.qrVerificationStatus || '',
      entry_status: pass.entryStatus || '',
      exit_status: pass.exitStatus || '',
      security_verification_log: pass.securityVerificationLog || '',
      created_at: pass.createdAt || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const { data: existing } = await supabaseClient
      .from("gate_passes")
      .select("gate_pass_id")
      .eq("gate_pass_id", pass.id);
      
    if (existing && existing.length > 0) {
      await supabaseClient
        .from("gate_passes")
        .update(mapped)
        .eq("gate_pass_id", pass.id);
    } else {
      await supabaseClient
        .from("gate_passes")
        .insert([mapped]);
    }
  } catch (err) {
    console.error("Supabase gate pass sync error:", err);
  }
}

// Simulated email dispatcher
function sendEmailSimulated(recipient: string, subject: string, body: string, template: string) {
  const newEmail = {
    id: "EM-" + Math.floor(100 + Math.random() * 900),
    subject,
    body,
    template,
    recipient,
    scope: "Gate Pass Notification",
    status: "Sent",
    sentAt: new Date().toISOString().split('T')[0]
  };
  emailsDb.unshift(newEmail);
  console.log(`[SIMULATED EMAIL SENT] To: ${recipient}, Subject: ${subject}`);
}

app.get("/api/gate-passes", async (req, res) => {
  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient
        .from("gate_passes")
        .select("*")
        .order("created_at", { ascending: false });
      if (!error && data) {
        const mapped = data.map((d: any) => ({
          id: d.gate_pass_id || d.id,
          studentId: d.student_id,
          studentName: d.student_name || (studentsDb.find(s => s.id === d.student_id)?.fullName) || 'Student',
          rollNo: d.roll_number,
          leavingDate: d.exit_datetime ? d.exit_datetime.split('T')[0] : d.leaving_date || '',
          returnDate: d.return_datetime ? d.return_datetime.split('T')[0] : d.return_date || '',
          leavingTime: d.exit_datetime ? d.exit_datetime.split('T')[1]?.substring(0, 5) : d.leaving_time || '',
          returnTime: d.return_datetime ? d.return_datetime.split('T')[1]?.substring(0, 5) : d.return_time || '',
          reason: d.reason,
          destination: d.destination,
          guardianName: d.guardian_name,
          guardianContact: d.guardian_contact,
          emergencyContact: d.emergency_contact,
          transport: d.transport_mode,
          status: d.status,
          remarks: d.remarks || '',
          approvedBy: d.approved_by || '',
          approvalTimestamp: d.approval_timestamp || '',
          qrCode: d.qr_code || '',
          documentUrl: d.document_url || '',
          appliedDate: d.created_at ? d.created_at.split('T')[0] : '',
          hostelBlock: d.hostel_block || '',
          roomNumber: d.room_number || '',
          leaveType: d.leave_type || 'Outstation Leave',
          exitScanTime: d.exit_scan_time || null,
          returnScanTime: d.return_scan_time || null,
          qrVerificationStatus: d.qr_verification_status || '',
          entryStatus: d.entry_status || '',
          exitStatus: d.exit_status || '',
          securityVerificationLog: d.security_verification_log || ''
        }));
        gatePassesDb = mapped;
        return res.json(mapped);
      }
    } catch (err) {
      console.error("Failed to fetch gate passes from Supabase:", err);
    }
  }
  res.json(gatePassesDb);
});

app.get("/api/student/:id/gate-passes", async (req, res) => {
  const studentId = req.params.id;
  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient
        .from("gate_passes")
        .select("*")
        .eq("student_id", studentId)
        .order("created_at", { ascending: false });
      if (!error && data) {
        const mapped = data.map((d: any) => ({
          id: d.gate_pass_id || d.id,
          studentId: d.student_id,
          studentName: d.student_name || (studentsDb.find(s => s.id === d.student_id)?.fullName) || 'Student',
          rollNo: d.roll_number,
          leavingDate: d.exit_datetime ? d.exit_datetime.split('T')[0] : d.leaving_date || '',
          returnDate: d.return_datetime ? d.return_datetime.split('T')[0] : d.return_date || '',
          leavingTime: d.exit_datetime ? d.exit_datetime.split('T')[1]?.substring(0, 5) : d.leaving_time || '',
          returnTime: d.return_datetime ? d.return_datetime.split('T')[1]?.substring(0, 5) : d.return_time || '',
          reason: d.reason,
          destination: d.destination,
          guardianName: d.guardian_name,
          guardianContact: d.guardian_contact,
          emergencyContact: d.emergency_contact,
          transport: d.transport_mode,
          status: d.status,
          remarks: d.remarks || '',
          approvedBy: d.approved_by || '',
          approvalTimestamp: d.approval_timestamp || '',
          qrCode: d.qr_code || '',
          documentUrl: d.document_url || '',
          appliedDate: d.created_at ? d.created_at.split('T')[0] : '',
          hostelBlock: d.hostel_block || '',
          roomNumber: d.room_number || '',
          leaveType: d.leave_type || 'Outstation Leave',
          exitScanTime: d.exit_scan_time || null,
          returnScanTime: d.return_scan_time || null,
          qrVerificationStatus: d.qr_verification_status || '',
          entryStatus: d.entry_status || '',
          exitStatus: d.exit_status || '',
          securityVerificationLog: d.security_verification_log || ''
        }));
        return res.json(mapped);
      }
    } catch (err) {
      console.error("Failed to fetch student gate passes from Supabase:", err);
    }
  }
  res.json(gatePassesDb.filter(g => g.studentId === studentId));
});

app.post("/api/student/:id/gate-pass", async (req, res) => {
  const studentId = req.params.id;
  const fields = req.body;
  const studentInfo = studentsDb.find(s => s.id === studentId) || studentsDb[0];
  
  const gatePassId = "GP-" + Math.floor(1000 + Math.random() * 9000);
  
  const newPass = {
    id: gatePassId,
    studentId,
    studentName: studentInfo.fullName,
    rollNo: studentInfo.rollNo || studentInfo.enrollmentNo,
    hostelBlock: studentInfo.hostel || 'Block B',
    roomNumber: studentInfo.roomNumber || 'B-214',
    leaveType: fields.leaveType || 'Outstation Leave',
    leavingDate: fields.leavingDate,
    returnDate: fields.returnDate,
    leavingTime: fields.leavingTime,
    returnTime: fields.returnTime,
    reason: fields.reason,
    destination: fields.destination,
    guardianName: fields.guardianName,
    guardianContact: fields.guardianContact,
    emergencyContact: fields.emergencyContact,
    transport: fields.transport || fields.transport_mode || 'Metro / Public Cab',
    status: "Pending",
    remarks: "",
    appliedDate: new Date().toISOString().split('T')[0],
    documentUrl: fields.documentUrl || '',
    createdAt: new Date().toISOString()
  };
  
  gatePassesDb.unshift(newPass);
  
  // Create notification
  const newNotif = {
    id: "notif-" + Date.now(),
    type: "Hostel Updates",
    title: `Hostel Gate Pass Raised: ${newPass.id}`,
    body: `Your hostel gate pass request has been raised and is pending warden approval.`,
    sender: "Hostel Warden",
    date: new Date().toISOString(),
    readBy: []
  };
  notificationsDb.unshift(newNotif);

  // Send Submission Email
  sendEmailSimulated(
    studentInfo.email,
    `Gate Pass Application Received: ${newPass.id}`,
    `Dear ${studentInfo.fullName},\n\nWe have received your Gate Pass application (${newPass.id}). Your warden is reviewing it.\n\nDetails:\n- Leaving: ${newPass.leavingDate} ${newPass.leavingTime}\n- Expected Return: ${newPass.returnDate} ${newPass.returnTime}\n- Destination: ${newPass.destination}\n\nBest Regards,\nHostel Administration`,
    "Gate Pass Submission"
  );

  // Sync to Supabase
  await syncGatePassToSupabase(newPass);

  res.json({ success: true, pass: newPass, passes: gatePassesDb });
});

app.put("/api/gate-passes/:id", async (req, res) => {
  const { id } = req.params;
  const { status, remarks, returnDate, returnTime, approvedBy, documentUrl, leaveType } = req.body;
  const passIndex = gatePassesDb.findIndex(g => g.id === id);
  if (passIndex > -1) {
    const pass = gatePassesDb[passIndex];
    
    // Status update handling
    if (status !== undefined) {
      pass.status = status;
    }
    if (remarks !== undefined) {
      pass.remarks = remarks;
    }
    if (returnDate !== undefined) {
      pass.returnDate = returnDate;
    }
    if (returnTime !== undefined) {
      pass.returnTime = returnTime;
    }
    if (documentUrl !== undefined) {
      pass.documentUrl = documentUrl;
    }
    if (leaveType !== undefined) {
      pass.leaveType = leaveType;
    }

    const studentInfo = studentsDb.find(s => s.id === pass.studentId) || { email: "student@krmu.edu.in", fullName: pass.studentName, rollNo: pass.rollNo };

    if (status === "Approved") {
      pass.approvedBy = approvedBy || "Registrar General";
      pass.approvalTimestamp = new Date().toISOString();
      
      // Generate QR Content
      const qrData = JSON.stringify({
        gatePassId: pass.id,
        studentId: pass.studentId,
        rollNo: pass.rollNo,
        validUntil: `${pass.returnDate} ${pass.returnTime}`,
        status: "Approved"
      });
      pass.qrCode = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrData)}`;
      
      // Security Fields setup
      pass.qrVerificationStatus = "Ready";
      pass.entryStatus = "Approved to Exit";
      pass.exitStatus = "Pending Exit";
      pass.securityVerificationLog = `Approved by ${pass.approvedBy} at ${pass.approvalTimestamp}`;

      // Create notification for student
      const newNotif = {
        id: "notif-" + Date.now(),
        type: "Hostel Updates",
        title: `Gate Pass Approved: ${pass.id}`,
        body: `Your hostel gate pass request ${pass.id} has been Approved. Your QR pass is available in the student portal.`,
        sender: "Hostel Administration",
        date: new Date().toISOString(),
        readBy: []
      };
      notificationsDb.unshift(newNotif);

      // Send Approval Email
      sendEmailSimulated(
        studentInfo.email,
        `Your Gate Pass has been APPROVED: ${pass.id}`,
        `Dear ${pass.studentName},\n\nYour Gate Pass request ${pass.id} has been approved by ${pass.approvedBy}.\n\nValidity:\n- Approved Leaving: ${pass.leavingDate} ${pass.leavingTime}\n- Approved Return: ${pass.returnDate} ${pass.returnTime}\n\nPlease present the QR code generated in your portal to the security guards upon leaving and entering.\n\nBest Regards,\nHostel Administration`,
        "Gate Pass Approval"
      );

      // Log action
      const newLog = {
        id: "log-" + Date.now(),
        timestamp: new Date().toLocaleString(),
        actor: pass.approvedBy,
        action: `Gate Pass ${pass.id} approved for ${pass.studentName}.`,
        status: "synced" as const
      };
      logsDb.unshift(newLog);

    } else if (status === "Rejected") {
      // Create notification
      const newNotif = {
        id: "notif-" + Date.now(),
        type: "Hostel Updates",
        title: `Gate Pass REJECTED: ${pass.id}`,
        body: `Your gate pass request ${pass.id} was rejected. Reason: ${remarks || "Policy compliance check fail."}`,
        sender: "Hostel Administration",
        date: new Date().toISOString(),
        readBy: []
      };
      notificationsDb.unshift(newNotif);

      // Send rejection email
      sendEmailSimulated(
        studentInfo.email,
        `Gate Pass Rejection Alert: ${pass.id}`,
        `Dear ${pass.studentName},\n\nYour Gate Pass request (${pass.id}) has been rejected.\n\nReason: ${remarks || "Policy compliance check fail."}\n\nIf you have questions, please approach the hostel warden desk.\n\nBest Regards,\nHostel Administration`,
        "Gate Pass Rejection"
      );
      
    } else if (status === "More Info Required") {
      // Create notification
      const newNotif = {
        id: "notif-" + Date.now(),
        type: "Hostel Updates",
        title: `More Info Requested on Gate Pass: ${pass.id}`,
        body: `Additional information is required for your Gate Pass request. Warden Remarks: ${remarks || "None"}`,
        sender: "Hostel Warden",
        date: new Date().toISOString(),
        readBy: []
      };
      notificationsDb.unshift(newNotif);

      // Send email
      sendEmailSimulated(
        studentInfo.email,
        `Action Required: More Info Needed for Gate Pass ${pass.id}`,
        `Dear ${pass.studentName},\n\nAdditional information is required for your Gate Pass request ${pass.id}.\n\nRemarks: ${remarks || "Please upload local guardian permission slip."}\n\nYou can edit and resubmit your application from the student portal.\n\nBest Regards,\nHostel Administration`,
        "Gate Pass Information Requested"
      );
    } else if (status === "Cancelled") {
      // Create notification
      const newNotif = {
        id: "notif-" + Date.now(),
        type: "Hostel Updates",
        title: `Gate Pass Request Cancelled: ${pass.id}`,
        body: `Gate Pass ${pass.id} request has been cancelled by the applicant.`,
        sender: "System",
        date: new Date().toISOString(),
        readBy: []
      };
      notificationsDb.unshift(newNotif);
    } else if (status === "Outside") {
      pass.exitScanTime = new Date().toISOString();
      pass.exitStatus = "Exited Campus";
      pass.entryStatus = "In Transit";
      pass.securityVerificationLog += `\nExited gate scanned at ${pass.exitScanTime}`;
    } else if (status === "Returned") {
      pass.returnScanTime = new Date().toISOString();
      pass.entryStatus = "Returned to Campus";
      pass.exitStatus = "Archived";
      pass.securityVerificationLog += `\nReturned gate scanned at ${pass.returnScanTime}`;
    }

    // Sync to Supabase
    await syncGatePassToSupabase(pass);

    return res.json({ success: true, pass, passes: gatePassesDb });
  }
  res.status(404).json({ error: "Gate pass not found" });
});

// Periodic task to monitor overdue returns and expiring passes
setInterval(async () => {
  const now = new Date();
  for (const pass of gatePassesDb) {
    if (pass.status === 'Approved') {
      const returnTimeObj = parseDateTime(pass.returnDate, pass.returnTime);
      const diffMs = returnTimeObj.getTime() - now.getTime();
      
      // 1. Send warning reminder 1 hour before approved return time
      if (diffMs > 0 && diffMs <= 60 * 60 * 1000 && !pass.reminderSent) {
        pass.reminderSent = true;
        const studentInfo = studentsDb.find(s => s.id === pass.studentId) || { email: "student@krmu.edu.in", fullName: pass.studentName };
        
        sendEmailSimulated(
          studentInfo.email,
          `Gate Pass Expiring Soon: ${pass.id}`,
          `Dear ${pass.studentName},\n\nYour approved Gate Pass (${pass.id}) expires in less than 1 hour. Please return to campus by ${pass.returnTime} to avoid late penalties.\n\nBest Regards,\nHostel Administration`,
          "Gate Pass Reminder"
        );
        
        const newNotif = {
          id: "notif-rem-" + Date.now() + Math.random().toString(36).substr(2, 4),
          type: "Hostel Updates",
          title: `Your Gate Pass expires soon: ${pass.id}`,
          body: `Expected return by ${pass.returnTime}. Please report back to campus on time.`,
          sender: "Hostel Warden",
          date: new Date().toISOString(),
          readBy: []
        };
        notificationsDb.unshift(newNotif);
        
        await syncGatePassToSupabase(pass);
      }
      
      // 2. Mark overdue if return time is exceeded
      if (diffMs < 0) {
        pass.status = 'Overdue';
        const studentInfo = studentsDb.find(s => s.id === pass.studentId) || { email: "student@krmu.edu.in", fullName: pass.studentName };
        
        sendEmailSimulated(
          studentInfo.email,
          `CRITICAL: Gate Pass Overdue Alert: ${pass.id}`,
          `Dear ${pass.studentName},\n\nYou have exceeded the approved return deadline (${pass.returnDate} at ${pass.returnTime}) for Gate Pass ${pass.id}.\n\nYour status has been updated to OVERDUE. Your warden and parents are being notified.\n\nPlease contact the warden immediately.\n\nBest Regards,\nHostel Administration`,
          "Gate Pass Overdue"
        );
        
        if (pass.guardianContact) {
          console.log(`[SIMULATED PARENT SMS] To ${pass.guardianName} (${pass.guardianContact}): Student ${pass.studentName} is OVERDUE returning to hostel block ${pass.hostelBlock || 'B'}. Room ${pass.roomNumber || 'B-214'}.`);
        }
        
        const newNotif = {
          id: "notif-od-" + Date.now() + Math.random().toString(36).substr(2, 4),
          type: "Hostel Updates",
          title: `URGENT: Gate Pass Overdue: ${pass.id}`,
          body: `Your return deadline has passed. You are marked OVERDUE. Report to warden immediately.`,
          sender: "Hostel Warden",
          date: new Date().toISOString(),
          readBy: []
        };
        notificationsDb.unshift(newNotif);
        
        const adminAlert = {
          id: "alert-" + Date.now(),
          type: "Critical",
          message: `Overdue Return: ${pass.studentName} (${pass.rollNo}) room ${pass.roomNumber} has not returned by ${pass.returnTime}.`,
          timestamp: new Date().toISOString()
        };
        if (typeof alertsDb !== 'undefined') {
          alertsDb.unshift(adminAlert);
        }
        
        await syncGatePassToSupabase(pass);
      }
    }
  }
}, 30000); // Poll every 30 seconds


// 7. EMAILS
app.get("/api/emails", (req, res) => {
  res.json(emailsDb);
});

app.post("/api/emails/send", (req, res) => {
  const { subject, body, template, recipient, scope } = req.body;
  const newEmail = {
    id: "EM-" + Math.floor(100 + Math.random() * 900),
    subject,
    body,
    template,
    recipient,
    scope,
    status: "Sent",
    sentAt: new Date().toISOString().split('T')[0]
  };
  emailsDb.unshift(newEmail);
  res.json({ success: true, email: newEmail, emails: emailsDb });
});

// Faculty API - Critical Alerts
app.get("/api/faculty/alerts", (req, res) => {
  res.json(alertsDb);
});

// Faculty API - Syllabus Delivery Velocity
app.get("/api/faculty/syllabus", (req, res) => {
  res.json(syllabusProgressDb);
});

// Faculty API - Governance Logs
app.get("/api/faculty/logs", (req, res) => {
  res.json(logsDb);
});

// Faculty API - Finalize Attendance
app.post("/api/faculty/attendance/finalize", (req, res) => {
  const { totalPresent, totalStudents, course } = req.body;
  
  // Find CS-601 class activity and mark as Uploaded in real-time
  const matchedAct = classActivitiesDb.find(act => act.section === "CS-601 Sec A" || act.subject.toLowerCase().includes("artificial"));
  if (matchedAct) {
    matchedAct.status = "Uploaded";
    matchedAct.present = totalPresent || 56;
    matchedAct.absent = (totalStudents || 60) - (totalPresent || 56);
    matchedAct.uploadTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ", Today";
  }

  // Add log record
  const newLog = {
    id: "log-" + Date.now(),
    timestamp: "Just now",
    actor: "Dr. Elena Vance",
    action: `Attendance uploaded for ${course}. ${totalPresent}/${totalStudents} Present.`,
    status: "synced" as const
  };
  logsDb.unshift(newLog);

  res.json({ success: true, logs: logsDb });
});

// ----------------------------------------------------
// Front-End Integration Assets Routing
// ----------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server listening at http://0.0.0.0:${PORT}`);
  });
}

startServer();
