import React, { useState, useEffect } from 'react';
import { StudentProfile, Lecture, ExamPrepGoal, DocumentItem, CourseProgress } from '../types';
import Header from './Header';
import { supabase } from '../lib/supabase';
import AcademicPlanner from './AcademicPlanner';
import { StudentDashboardSkeleton, TableSkeleton } from './Skeletons';

interface StudentPortalProps {
  user: any;
  onLogout: () => void;
}

export default function StudentPortal({ user, onLogout }: StudentPortalProps) {
  const [activeTab, _setActiveTab] = useState<'dashboard' | 'profile' | 'academics' | 'attendance' | 'grades' | 'fee_details' | 'grievance' | 'notification' | 'academic_planner'>('dashboard');
  const [tabLoading, setTabLoading] = useState(true);

  const setActiveTab = (tab: typeof activeTab) => {
    _setActiveTab(tab);
    const skeletonTabs = ['dashboard', 'attendance', 'fee_details', 'grievance', 'notification'];
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
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [prepGoals, setPrepGoals] = useState<ExamPrepGoal[]>([]);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [courses, setCourses] = useState<CourseProgress[]>([]);
  const [searchValue, setSearchValue] = useState('');
  
  // Custom event listener for shared profile & notification updates
  useEffect(() => {
    const handleProfileUpdate = (e: Event) => {
      const updatedProfile = (e as CustomEvent).detail;
      if (updatedProfile && updatedProfile.id === user?.id) {
        setStudent(prev => prev ? { ...prev, ...updatedProfile } : updatedProfile);
      }
    };

    const handleNotifUpdate = (e: Event) => {
      const updatedNotifs = (e as CustomEvent).detail;
      // Triggers data reloading or sync if needed
      loadData();
    };

    window.addEventListener('soet-profile-updated', handleProfileUpdate);
    window.addEventListener('soet-notifications-updated', handleNotifUpdate);

    return () => {
      window.removeEventListener('soet-profile-updated', handleProfileUpdate);
      window.removeEventListener('soet-notifications-updated', handleNotifUpdate);
    };
  }, [user]);
  
  const [timetableModalOpen, setTimetableModalOpen] = useState(false);
  const [grievanceTitle, setGrievanceTitle] = useState('');
  const [grievanceDesc, setGrievanceDesc] = useState('');
  const [grievanceMsg, setGrievanceMsg] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);

  // Expanded student functional states
  const [grievanceSubTab, setGrievanceSubTab] = useState<'submit' | 'track' | 'pending'>('submit');
  const [pendingDocs, setPendingDocs] = useState<any[]>([]);
  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<any | null>(null);
  const [goalSubject, setGoalSubject] = useState('');
  const [goalProgress, setGoalProgress] = useState(0);
  const [goalFocus, setGoalFocus] = useState('');
  
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [selectedWalletDoc, setSelectedWalletDoc] = useState<any | null>(null);

  const [activeGradeSemester, setActiveGradeSemester] = useState<string>('Semester IV');
  const [studentGrades, setStudentGrades] = useState<any>(null);

  // New connected ERP student states
  const [studentGrievances, setStudentGrievances] = useState<any[]>([]);
  const [gatePasses, setGatePasses] = useState<any[]>([]);
  const [leavingDate, setLeavingDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [leavingTime, setLeavingTime] = useState('');
  const [returnTime, setReturnTime] = useState('');
  const [passReason, setPassReason] = useState('');
  const [passDestination, setPassDestination] = useState('');
  const [guardianName, setGuardianName] = useState('');
  const [guardianContact, setGuardianContact] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [passTransport, setPassTransport] = useState('Metro / Public Cab');
  const [passMsg, setPassMsg] = useState<string | null>(null);
  const [passFormOpen, setPassFormOpen] = useState(false);

  const [studentNotifications, setStudentNotifications] = useState<any[]>([]);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);
  const [notifCategoryFilter, setNotifCategoryFilter] = useState<string>('All');
  const [selectedNotif, setSelectedNotif] = useState<any | null>(null);

  const studentId = user.id === 'piyush-kumar' ? 'piyush-kumar' : 'alex-sterling';

  const loadData = async () => {
    try {
      // Fetch from Supabase first for profile sync
      try {
        const { data, error } = await supabase.from('students').select('*').eq('id', user.id).single();
        if (data && !error) {
          setStudent(data);
        } else {
          const profileRes = await fetch(`/api/student/${studentId}/profile`);
          const profileData = await profileRes.json();
          setStudent(profileData);
        }
      } catch (e) {
        const profileRes = await fetch(`/api/student/${studentId}/profile`);
        const profileData = await profileRes.json();
        setStudent(profileData);
      }

      const lecturesRes = await fetch(`/api/student/${studentId}/lectures`);
      const lecturesData = await lecturesRes.json();
      setLectures(lecturesData);

      const docsRes = await fetch(`/api/student/${studentId}/documents`);
      const docsData = await docsRes.json();
      setDocuments(docsData);

      const progressRes = await fetch(`/api/student/${studentId}/progress`);
      const progressData = await progressRes.json();
      setCourses(progressData);

      // Dynamic goals
      const goalsRes = await fetch(`/api/student/${studentId}/goals`);
      const goalsData = await goalsRes.json();
      setPrepGoals(goalsData);

      // Dynamic grades
      const gradesRes = await fetch(`/api/student/${studentId}/grades`);
      const gradesData = await gradesRes.json();
      setStudentGrades(gradesData);

      // Dynamic pending docs
      const pendingRes = await fetch(`/api/student/${studentId}/pending-documents`);
      const pendingData = await pendingRes.json();
      setPendingDocs(pendingData);

      // Centralized grievances
      const grievancesRes = await fetch(`/api/student/${studentId}/grievances`);
      const grievancesData = await grievancesRes.json();
      setStudentGrievances(grievancesData);

      // Hostel Gate Passes
      const passesRes = await fetch(`/api/student/${studentId}/gate-passes`);
      const passesData = await passesRes.json();
      setGatePasses(passesData);

      // Dynamic notifications notice board
      const notifRes = await fetch('/api/notifications');
      const notifData = await notifRes.json();
      setStudentNotifications(notifData);
      const unreadCount = notifData.filter((n: any) => !n.readBy.includes(studentId)).length;
      setUnreadNotifCount(unreadCount);
    } catch (err) {
      console.error("Error loading student data:", err);
    }
  };

  // Fetch student profile, lectures, documents, and courses
  useEffect(() => {
    loadData();
    
    // Set up a 10s auto-sync timer for the ERP
    const interval = setInterval(() => {
      loadData();
    }, 10000);
    return () => clearInterval(interval);
  }, [studentId]);

  const handleMarkNotifRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}/read`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: studentId })
      });
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await fetch(`/api/notifications/mark-all-read`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: studentId })
      });
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleGatePassSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/student/${studentId}/gate-pass`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leavingDate,
          returnDate,
          leavingTime,
          returnTime,
          reason: passReason,
          destination: passDestination,
          guardianName,
          guardianContact,
          emergencyContact,
          transport: passTransport
        })
      });
      const data = await res.json();
      if (data.success) {
        setPassMsg("Gate Pass requested successfully! Warden notified.");
        setLeavingDate('');
        setReturnDate('');
        setLeavingTime('');
        setReturnTime('');
        setPassReason('');
        setPassDestination('');
        setPassFormOpen(false);
        loadData();
        setTimeout(() => setPassMsg(null), 5000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress("Uploading file to Supabase Storage...");

    // Simulate network delay then save to documentsDb
    setTimeout(async () => {
      try {
        const res = await fetch(`/api/student/${studentId}/documents/upload`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: file.name.split('.')[0] || "New Uploaded File",
            type: "other"
          }),
        });
        const data = await res.json();
        if (data.success) {
          setDocuments(data.documents);
          setUploadProgress("File uploaded successfully and synced with Supabase!");
          setTimeout(() => setUploadProgress(null), 3000);
        }
      } catch (err) {
        console.error("Error saving document:", err);
        setUploadProgress("Failed to upload document");
      } finally {
        setIsUploading(false);
      }
    }, 1500);
  };

  const [grievanceCategory, setGrievanceCategory] = useState('Hostel & Infrastructure');
  const [grievancePriority, setGrievancePriority] = useState('Medium');

  const handleGrievanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!grievanceTitle || !grievanceDesc) return;

    try {
      const res = await fetch(`/api/student/${studentId}/grievance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: grievanceTitle,
          description: grievanceDesc,
          category: grievanceCategory,
          priority: grievancePriority
        }),
      });
      const data = await res.json();
      if (data.success) {
        setGrievanceMsg("Grievance logged successfully! Ticket ID: #" + data.grievance.id + ". It is directly visible to your Faculty advisor and Registrar.");
        setGrievanceTitle('');
        setGrievanceDesc('');
        loadData(); // Synchronize all boards
        setTimeout(() => setGrievanceMsg(null), 8000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePrintDoc = (elementId: string, title: string) => {
    const printContent = document.getElementById(elementId);
    if (!printContent) return;
    const win = window.open('', '', 'width=900,height=650');
    if (win) {
      win.document.write(`
        <html>
          <head>
            <title>${title}</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&display=swap');
              body { font-family: 'Inter', sans-serif; }
            </style>
          </head>
          <body class="p-8 bg-white text-gray-800">
            ${printContent.innerHTML}
            <script>
              window.onload = function() {
                window.print();
                setTimeout(() => window.close(), 500);
              }
            </script>
          </body>
        </html>
      `);
      win.document.close();
    }
  };

  const attendancePercent = (student && student.totalClasses > 0) ? Math.round((student.classesAttended / student.totalClasses) * 100) : 82;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col flex-shrink-0" data-purpose="sidebar">
        <div className="p-6 flex items-center justify-center border-b border-gray-100">
          <div className="flex items-center space-x-2">
            <img 
              alt="K.R. Mangalam University Logo" 
              className="h-10 w-full object-contain" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBnKdGPVcNqUKhKsG04ViNN62k0y1aFVf1jiNIuyjupxzmK-s0eGEIvH5dvNkDrtzF8blF_LqzrV0CL9208yyu0q_aGk1WDAncivYDX9DIS2KdHDpT_tWXvobD6Ry2ThBcKAOUOnmwxgapHn7MqQ2KjWWDwaQowdQc_u0h0Hm8l9xBJNpWAdV4ph-sNwW_atV_7k7ZivT6zPD2yL08WpDPz0SEKqB7IORRKaYV67ErqKDgh_hemGgujB5awLDK6c2Tp7svoTIPwY44"
            />
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto py-6 space-y-1 custom-scrollbar">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center px-6 py-3 font-medium transition-colors cursor-pointer text-left ${activeTab === 'dashboard' ? 'bg-brand-red text-white' : 'text-gray-600 hover:bg-gray-50 hover:text-brand-red'}`}
          >
            <span className="material-symbols-outlined text-lg mr-3">dashboard</span>
            Dashboard
          </button>
          
          <button 
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center px-6 py-3 font-medium transition-colors cursor-pointer text-left ${activeTab === 'profile' ? 'bg-brand-red text-white' : 'text-gray-600 hover:bg-gray-50 hover:text-brand-red'}`}
          >
            <span className="material-symbols-outlined text-lg mr-3">person</span>
            My Profile
          </button>

          <button 
            onClick={() => setActiveTab('academics')}
            className={`w-full flex items-center px-6 py-3 font-medium transition-colors cursor-pointer text-left ${activeTab === 'academics' ? 'bg-brand-red text-white' : 'text-gray-600 hover:bg-gray-50 hover:text-brand-red'}`}
          >
            <span className="material-symbols-outlined text-lg mr-3">school</span>
            Academics
          </button>

          <button 
            onClick={() => setActiveTab('attendance')}
            className={`w-full flex items-center px-6 py-3 font-medium transition-colors cursor-pointer text-left ${activeTab === 'attendance' ? 'bg-brand-red text-white' : 'text-gray-600 hover:bg-gray-50 hover:text-brand-red'}`}
          >
            <span className="material-symbols-outlined text-lg mr-3">calendar_today</span>
            Attendance
          </button>

          <button 
            onClick={() => setActiveTab('grades')}
            className={`w-full flex items-center px-6 py-3 font-medium transition-colors cursor-pointer text-left ${activeTab === 'grades' ? 'bg-brand-red text-white' : 'text-gray-600 hover:bg-gray-50 hover:text-brand-red'}`}
          >
            <span className="material-symbols-outlined text-lg mr-3">verified</span>
            Grades
          </button>

          <button 
            onClick={() => setActiveTab('academic_planner')}
            className={`w-full flex items-center px-6 py-3 font-medium transition-colors cursor-pointer text-left ${activeTab === 'academic_planner' ? 'bg-brand-red text-white' : 'text-gray-600 hover:bg-gray-50 hover:text-brand-red'}`}
          >
            <span className="material-symbols-outlined text-lg mr-3">calculate</span>
            Academic Planner
          </button>

          <button 
            onClick={() => setActiveTab('fee_details')}
            className={`w-full flex items-center px-6 py-3 font-medium transition-colors cursor-pointer text-left ${activeTab === 'fee_details' ? 'bg-brand-red text-white' : 'text-gray-600 hover:bg-gray-50 hover:text-brand-red'}`}
          >
            <span className="material-symbols-outlined text-lg mr-3">payments</span>
            Fee Details
          </button>

          <button 
            onClick={() => setActiveTab('grievance')}
            className={`w-full flex items-center px-6 py-3 font-medium transition-colors cursor-pointer text-left ${activeTab === 'grievance' ? 'bg-brand-red text-white' : 'text-gray-600 hover:bg-gray-50 hover:text-brand-red'}`}
          >
            <span className="material-symbols-outlined text-lg mr-3">report_problem</span>
            Grievance
          </button>

          <button 
            onClick={() => setActiveTab('notification')}
            className={`w-full flex items-center px-6 py-3 font-medium transition-colors cursor-pointer text-left ${activeTab === 'notification' ? 'bg-brand-red text-white' : 'text-gray-600 hover:bg-gray-50 hover:text-brand-red'}`}
          >
            <span className="material-symbols-outlined text-lg mr-3">notifications</span>
            Notification
            {unreadNotifCount > 0 && (
              <span className="ml-auto bg-white text-brand-red text-[10px] font-bold px-2 py-0.5 rounded-full">{unreadNotifCount}</span>
            )}
          </button>
        </nav>
        
        <div className="p-6 border-t border-gray-100 space-y-1">
          <button 
            onClick={onLogout}
            className="w-full flex items-center px-6 py-3 text-brand-red hover:bg-red-50 transition-colors text-left cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg mr-3">logout</span>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Application Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header 
          role="student" 
          user={user} 
          onLogout={onLogout} 
          activeTab={activeTab} 
          setActiveTab={setActiveTab}
          searchValue={searchValue}
          onSearchChange={setSearchValue}
        />

        {/* Main Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-[#f8fafc]">
          
          {/* TAB 1: DASHBOARD VIEW */}
          {activeTab === 'dashboard' && (
            (tabLoading || !student) ? (
              <StudentDashboardSkeleton />
            ) : (
              <>
              {/* Hero Greeting Card */}
              <section className="mb-8" data-purpose="hero-section">
                <div className="bg-[#2d1b5a] rounded-3xl p-8 text-white relative overflow-hidden shadow-xl">
                  <div className="relative z-10 max-w-2xl">
                    <h1 className="text-3xl font-bold mb-4">Good morning, {student.fullName.split(' ')[0]}. Let's make today productive.</h1>
                    <p className="text-indigo-100 text-lg opacity-90 leading-relaxed">
                      You've completed 72% of your targets. Your mid-semester examinations are approaching in 14 days.
                    </p>
                  </div>
                  <div className="absolute right-12 top-1/2 -translate-y-1/2">
                    <button 
                      onClick={() => setTimetableModalOpen(true)}
                      className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/30 px-8 py-3 rounded-xl font-semibold transition-all cursor-pointer flex items-center justify-center"
                    >
                      View Schedule
                    </button>
                  </div>
                  <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-white/5 rounded-full"></div>
                </div>
              </section>

              {/* Quick Stats Grid */}
              <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8" data-purpose="stats-overview">
                
                {/* Attendance Card */}
                <div 
                  onClick={() => setActiveTab('attendance')}
                  className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-6 cursor-pointer hover:border-brand-red/30 transition-all group"
                >
                  <div className="relative flex items-center justify-center">
                    <svg className="w-16 h-16 transform -rotate-90">
                      <circle className="text-gray-100" cx="32" cy="32" fill="transparent" r="28" stroke="currentColor" strokeWidth="4"></circle>
                      <circle 
                        className="text-brand-red group-hover:opacity-80 transition-opacity" 
                        cx="32" 
                        cy="32" 
                        fill="transparent" 
                        r="28" 
                        stroke="currentColor" 
                        strokeWidth="4"
                        strokeDasharray="175" 
                        strokeDashoffset={175 - (175 * attendancePercent) / 100}
                      ></circle>
                    </svg>
                    <span className="absolute text-sm font-bold text-brand-red">{attendancePercent}%</span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 group-hover:text-brand-red transition-colors">Attendance</p>
                    <div className="flex items-center mb-1">
                      <span className="bg-blue-50 text-blue-600 text-xs px-2 py-0.5 rounded-full font-bold">On Track</span>
                    </div>
                    <p className="text-lg font-bold">{student.classesAttended} <span className="text-sm font-normal text-gray-400">of {student.totalClasses}</span></p>
                    <p className="text-[10px] text-gray-400 uppercase">Classes Attended</p>
                  </div>
                </div>

                {/* CGPA Card */}
                <div 
                  onClick={() => setActiveTab('grades')}
                  className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-6 cursor-pointer hover:border-brand-red/30 transition-all group"
                >
                  <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 group-hover:bg-brand-red/10 group-hover:text-brand-red transition-all">
                    <span className="material-symbols-outlined text-3xl">school</span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 group-hover:text-brand-red transition-colors">Current CGPA</p>
                    <div className="flex items-baseline">
                      <span className="text-3xl font-bold">{student.cgpa}</span>
                      <span className="text-gray-400 ml-1">/ 10</span>
                    </div>
                  </div>
                </div>

                {/* Requests Card */}
                <div 
                  onClick={() => { setActiveTab('grievance'); setGrievanceSubTab('pending'); }}
                  className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-6 cursor-pointer hover:border-brand-red/30 transition-all group"
                >
                  <div className="w-14 h-14 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 group-hover:bg-brand-red/10 group-hover:text-brand-red transition-all">
                    <span className="material-symbols-outlined text-3xl">drafts</span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 group-hover:text-brand-red transition-colors">Pending Requests</p>
                    <div className="flex items-center space-x-2">
                      <span className="text-3xl font-bold">{pendingDocs.filter(d => d.status === 'Missing').length}</span>
                      <span className="bg-red-50 text-red-600 text-xs px-2 py-0.5 rounded-full font-bold">Urgent</span>
                    </div>
                    <p className="text-[10px] text-gray-400 uppercase mt-1">Document approvals awaiting</p>
                  </div>
                </div>

              </section>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Upcoming Lectures */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-8" data-purpose="lectures-schedule">
                  <div className="flex justify-between items-center mb-8">
                    <h2 className="text-xl font-bold text-gray-800">Upcoming Lectures</h2>
                    <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">Today, Oct 24</span>
                  </div>
                  
                  <div className="relative space-y-8">
                    <div className="timeline-line"></div>
                    
                    {lectures.map((lecture, idx) => (
                      <div key={lecture.id} className="flex items-start relative">
                        <div className="w-24 flex-shrink-0 text-right pr-8">
                          <p className="text-sm font-bold text-brand-red">{lecture.timeStart}</p>
                          <p className="text-xs text-gray-400">{lecture.timeEnd}</p>
                        </div>
                        <div className={`z-10 w-4 h-4 rounded-full border-4 border-white mt-1.5 ml-[-8px] ${idx === 0 ? 'bg-brand-red' : idx === 1 ? 'bg-blue-600' : 'bg-orange-300'}`}></div>
                        <div className={`flex-1 ml-8 p-6 border rounded-2xl group transition-all hover:border-brand-red/30 shadow-sm ${idx === 0 ? 'bg-orange-50/30 border-orange-100' : 'bg-white border-gray-100'}`}>
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-gray-800 text-lg">{lecture.courseTitle}</h3>
                            <span className={`text-xs px-3 py-1 rounded-md font-bold ${idx === 0 ? 'bg-red-50 text-brand-red' : idx === 1 ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-600'}`}>
                              {lecture.hall}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 font-medium">{lecture.facultyName} • {lecture.topic}</p>
                        </div>
                      </div>
                    ))}

                  </div>
                </div>

                {/* Exam Prep Planner */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8" data-purpose="exam-planner">
                  <h2 className="text-xl font-bold text-gray-800 mb-8">Exam Prep Planner</h2>
                  
                  <div className="space-y-10">
                    {prepGoals.map((goal, idx) => (
                      <div key={goal.id}>
                        <div className="flex justify-between items-end mb-2">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-gray-800">{goal.subject}</h4>
                            <button 
                              onClick={() => {
                                setEditingGoal(goal);
                                setGoalSubject(goal.subject);
                                setGoalProgress(goal.progressPercent);
                                setGoalFocus(goal.focusArea);
                                setGoalModalOpen(true);
                              }}
                              className="text-gray-400 hover:text-brand-red p-1 rounded transition-colors border-none bg-transparent cursor-pointer flex items-center justify-center"
                              title="Edit Goal"
                            >
                              <span className="material-symbols-outlined text-xs">edit</span>
                            </button>
                            <button 
                              onClick={async () => {
                                if (confirm(`Delete goal for ${goal.subject}?`)) {
                                  try {
                                    const res = await fetch(`/api/student/${studentId}/goals/${goal.id}`, { method: 'DELETE' });
                                    const data = await res.json();
                                    if (data.success) {
                                      setPrepGoals(data.goals);
                                    }
                                  } catch (err) {
                                    console.error(err);
                                  }
                                }
                              }}
                              className="text-gray-400 hover:text-brand-red p-1 rounded transition-colors border-none bg-transparent cursor-pointer flex items-center justify-center"
                              title="Delete Goal"
                            >
                              <span className="material-symbols-outlined text-xs">delete</span>
                            </button>
                          </div>
                          <span className={`text-xs font-bold ${idx % 3 === 0 ? 'text-brand-red' : idx % 3 === 1 ? 'text-blue-600' : 'text-indigo-600'}`}>
                            {goal.progressPercent}% Ready
                          </span>
                        </div>
                        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${idx % 3 === 0 ? 'bg-brand-red' : idx % 3 === 1 ? 'bg-blue-600' : 'bg-indigo-600'}`}
                            style={{ width: `${goal.progressPercent}%` }}
                          ></div>
                        </div>
                        <p className="text-[10px] text-gray-400 mt-2 font-medium uppercase tracking-tighter">{goal.focusArea}</p>
                      </div>
                    ))}
                  </div>

                  <button 
                    onClick={() => {
                      setEditingGoal(null);
                      setGoalSubject('');
                      setGoalProgress(50);
                      setGoalFocus('');
                      setGoalModalOpen(true);
                    }}
                    className="w-full mt-12 py-3 border-2 border-brand-red text-brand-red rounded-xl font-bold uppercase text-xs tracking-widest hover:bg-brand-red hover:text-white transition-all cursor-pointer"
                  >
                    Update Goals
                  </button>
                </div>

              </div>

              {/* Digital Document Wallet */}
              <section className="mt-8" data-purpose="document-wallet">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-brand-red rounded-lg flex items-center justify-center text-white">
                      <span className="material-symbols-outlined text-sm">folder</span>
                    </div>
                    <h2 className="text-xl font-bold text-gray-800">Digital Document Wallet</h2>
                  </div>
                  <button 
                    className="text-sm font-bold text-brand-red hover:underline cursor-pointer bg-transparent border-none" 
                    onClick={() => { setActiveTab('grievance'); setGrievanceSubTab('pending'); }}
                  >
                    See All Documents
                  </button>
                </div>

                {uploadProgress && (
                  <div className="mb-4 p-3 bg-blue-50 text-blue-700 text-xs font-semibold rounded-lg border border-blue-200">
                    {uploadProgress}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {documents.map((doc, idx) => (
                    <div 
                      key={doc.id} 
                      className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center space-x-4 hover:border-brand-red/20 transition-all cursor-pointer"
                      onClick={() => { setSelectedWalletDoc(doc); setWalletModalOpen(true); }}
                    >
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${idx === 0 ? 'bg-red-50 text-red-500' : idx === 1 ? 'bg-blue-50 text-blue-500' : 'bg-indigo-50 text-indigo-500'}`}>
                        <span className="material-symbols-outlined text-2xl">description</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-sm text-gray-800 truncate">{doc.name}</p>
                        <p className="text-[10px] text-gray-400 mt-1">Last Upload: {doc.lastUploaded}</p>
                      </div>
                    </div>
                  ))}

                  {/* Upload New Button Card */}
                  <label className="bg-gray-50 p-5 rounded-2xl border-2 border-dashed border-gray-200 flex items-center space-x-4 hover:bg-white hover:border-brand-red transition-all cursor-pointer group">
                    <input 
                      type="file" 
                      className="hidden" 
                      onChange={handleFileUpload}
                      disabled={isUploading}
                    />
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-gray-400 group-hover:text-brand-red shadow-sm">
                      <span className="material-symbols-outlined text-2xl">{isUploading ? 'sync' : 'add'}</span>
                    </div>
                    <div>
                      <p className="font-bold text-sm text-gray-800">Upload New</p>
                      <p className="text-[10px] text-gray-400 mt-1">Max 10MB per file</p>
                    </div>
                  </label>
                </div>
              </section>
            </>
            )
          )}

          {/* TAB 2: PROFILE VIEW */}
          {activeTab === 'profile' && (
            <div>
              {/* My Profile Header */}
              <div className="mb-8">
                <h1 className="text-[32px] font-bold text-on-surface mb-1">My Profile</h1>
                <p className="text-sm text-on-surface-variant">Official student record as maintained by the university registry.</p>
              </div>

              {/* Main Profile Card */}
              <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-8 mb-8 flex flex-col md:flex-row items-center gap-8 institution-shadow">
                <div className="w-32 h-32 bg-primary rounded-2xl flex items-center justify-center text-white text-5xl font-bold select-none">
                  {student.fullName.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1 text-center md:text-left">
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-2">
                    <h2 className="text-4xl font-bold text-on-surface">{student.fullName}</h2>
                    <span className="px-3 py-1 bg-surface-container text-on-surface-variant rounded-lg text-sm font-medium border border-outline-variant">
                      {student.enrollmentNo}
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap justify-center md:justify-start gap-6 text-on-surface-variant mb-6 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-lg">mail</span>
                      <span>{student.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-lg">call</span>
                      <span>{student.mobileNumber}</span>
                    </div>
                  </div>

                  <div className="flex justify-center md:justify-start gap-3">
                    <span className="px-6 py-1.5 bg-[#dfe0ff] text-[#2a3aa6] rounded-full text-sm font-bold uppercase">
                      {student.currentSemester}
                    </span>
                    <span className="px-6 py-1.5 bg-surface-container-low text-on-surface rounded-full text-sm font-bold uppercase">
                      CGPA {student.cgpa}
                    </span>
                  </div>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                
                {/* Personal Details */}
                <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl institution-shadow overflow-hidden">
                  <div className="p-6 border-b border-outline-variant flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary">person</span>
                    <h3 className="text-lg font-bold uppercase tracking-wider text-on-surface">Personal Details</h3>
                  </div>
                  <div className="p-0 divide-y divide-outline-variant">
                    <div className="p-6">
                      <p className="text-[10px] font-bold text-outline uppercase tracking-widest mb-1">Student Name</p>
                      <p className="text-sm font-bold text-on-surface">{student.fullName}</p>
                    </div>
                    <div className="p-6">
                      <p className="text-[10px] font-bold text-outline uppercase tracking-widest mb-1">Date of Birth</p>
                      <p className="text-sm font-bold text-on-surface">{student.dob}</p>
                    </div>
                    <div className="p-6">
                      <p className="text-[10px] font-bold text-outline uppercase tracking-widest mb-1">Email Address</p>
                      <p className="text-sm font-bold text-on-surface">{student.email}</p>
                    </div>
                    <div className="p-6">
                      <p className="text-[10px] font-bold text-outline uppercase tracking-widest mb-1">Mobile Number</p>
                      <p className="text-sm font-bold text-on-surface">{student.mobileNumber}</p>
                    </div>
                    <div className="p-6">
                      <p className="text-[10px] font-bold text-outline uppercase tracking-widest mb-1">Blood Group</p>
                      <p className="text-sm font-bold text-on-surface">{student.bloodGroup}</p>
                    </div>
                    <div className="p-6">
                      <p className="text-[10px] font-bold text-outline uppercase tracking-widest mb-1">Emergency Contact</p>
                      <p className="text-sm font-bold text-on-surface">{student.emergencyContact}</p>
                    </div>
                  </div>
                </div>

                {/* Academic Details */}
                <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl institution-shadow overflow-hidden">
                  <div className="p-6 border-b border-outline-variant flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary">book</span>
                    <h3 className="text-lg font-bold uppercase tracking-wider text-on-surface">Academic Details</h3>
                  </div>
                  <div className="p-0 divide-y divide-outline-variant">
                    <div className="p-6">
                      <p className="text-[10px] font-bold text-outline uppercase tracking-widest mb-1">Enrollment No.</p>
                      <p className="text-sm font-bold text-on-surface">{student.enrollmentNo}</p>
                    </div>
                    <div className="p-6">
                      <p className="text-[10px] font-bold text-outline uppercase tracking-widest mb-1">Program</p>
                      <p className="text-sm font-bold text-on-surface">{student.program}</p>
                    </div>
                    <div className="p-6">
                      <p className="text-[10px] font-bold text-outline uppercase tracking-widest mb-1">Branch</p>
                      <p className="text-sm font-bold text-on-surface">{student.branch}</p>
                    </div>
                    <div className="p-6">
                      <p className="text-[10px] font-bold text-outline uppercase tracking-widest mb-1">Current Semester</p>
                      <p className="text-sm font-bold text-on-surface">{student.currentSemester}</p>
                    </div>
                    <div className="p-6">
                      <p className="text-[10px] font-bold text-outline uppercase tracking-widest mb-1">CGPA</p>
                      <p className="text-sm font-bold text-on-surface">{student.cgpa}</p>
                    </div>
                    <div className="p-6">
                      <p className="text-[10px] font-bold text-outline uppercase tracking-widest mb-1">Admission Year</p>
                      <p className="text-sm font-bold text-on-surface">{student.admissionYear}</p>
                    </div>
                  </div>
                </div>

              </div>

              {/* Linked Accounts Section */}
              <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 mb-12 institution-shadow">
                <div className="flex items-center gap-3 mb-6">
                  <span className="material-symbols-outlined text-primary">link</span>
                  <h3 className="text-lg font-bold uppercase tracking-wider text-on-surface">Linked Identity Accounts</h3>
                </div>
                <p className="text-xs text-on-surface-variant mb-6">Link your institutional single sign-on providers to login directly without entering password credentials.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Google Connection */}
                  <div className="flex items-center justify-between p-4 border border-outline-variant rounded-xl bg-surface-container-low">
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
                          {student?.google_linked ? `Connected: ${student.email}` : 'Not connected'}
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={async () => {
                        const nextState = !student?.google_linked;
                        await supabase.from('students').update({ google_linked: nextState }).eq('id', student?.id);
                        setStudent(prev => prev ? { ...prev, google_linked: nextState } : null);
                        
                        const event = new CustomEvent('soet-profile-updated', { detail: { ...student, google_linked: nextState } });
                        window.dispatchEvent(event);
                      }}
                      className={`px-4 py-2 text-xs font-bold rounded-lg border cursor-pointer transition-colors ${student?.google_linked ? 'bg-transparent text-error border-error hover:bg-error-container' : 'bg-primary text-white hover:bg-primary-dark border-transparent'}`}
                    >
                      {student?.google_linked ? 'Unlink' : 'Link Account'}
                    </button>
                  </div>

                  {/* Microsoft Connection */}
                  <div className="flex items-center justify-between p-4 border border-outline-variant rounded-xl bg-surface-container-low">
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
                          {student?.microsoft_linked ? `Connected: ${student.email}` : 'Not connected'}
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={async () => {
                        const nextState = !student?.microsoft_linked;
                        await supabase.from('students').update({ microsoft_linked: nextState }).eq('id', student?.id);
                        setStudent(prev => prev ? { ...prev, microsoft_linked: nextState } : null);
                        
                        const event = new CustomEvent('soet-profile-updated', { detail: { ...student, microsoft_linked: nextState } });
                        window.dispatchEvent(event);
                      }}
                      className={`px-4 py-2 text-xs font-bold rounded-lg border cursor-pointer transition-colors ${student?.microsoft_linked ? 'bg-transparent text-error border-error hover:bg-error-container' : 'bg-primary text-white hover:bg-primary-dark border-transparent'}`}
                    >
                      {student?.microsoft_linked ? 'Unlink' : 'Link Account'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Academic Progress Section */}
              <section className="mb-12">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-on-surface">Academic Progress</h3>
                  <button 
                    onClick={() => setTimetableModalOpen(true)}
                    className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-lg text-sm font-bold institution-shadow hover:opacity-90 transition-all cursor-pointer border-none"
                  >
                    <span className="material-symbols-outlined text-sm">calendar_month</span>
                    Weekly Timetable
                  </button>
                </div>

                <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl institution-shadow overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-surface-container-low">
                        <tr>
                          <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-outline border-b border-outline-variant">Course Code</th>
                          <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-outline border-b border-outline-variant">Course Title</th>
                          <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-outline border-b border-outline-variant">Type</th>
                          <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-outline border-b border-outline-variant">Credits</th>
                          <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-outline border-b border-outline-variant">Attendance</th>
                          <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-outline border-b border-outline-variant">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-outline-variant">
                        {courses.map((course) => (
                          <tr key={course.courseCode} className="hover:bg-surface-bright transition-colors">
                            <td className="px-6 py-5 text-sm font-bold text-on-surface">{course.courseCode}</td>
                            <td className="px-6 py-5 text-sm text-on-surface">{course.courseTitle}</td>
                            <td className="px-6 py-5 text-sm text-outline">{course.type}</td>
                            <td className="px-6 py-5 text-sm text-on-surface">{course.credits.toFixed(1)}</td>
                            <td className="px-6 py-5">
                              <div className="flex items-center gap-3">
                                <div className="w-32 h-1.5 bg-surface-container rounded-full overflow-hidden">
                                  <div 
                                    className="bg-primary h-full" 
                                    style={{ width: `${course.attendancePercent}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm font-bold text-primary">{course.attendancePercent}%</span>
                              </div>
                            </td>
                            <td className="px-6 py-5">
                              <span className={`px-3 py-1 text-[10px] font-black uppercase rounded-full border ${course.status === 'ON Track' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-yellow-50 text-yellow-700 border-yellow-100'}`}>
                                {course.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="p-4 bg-surface-container-low border-t border-outline-variant text-center">
                    <button className="text-sm font-bold text-primary hover:underline bg-transparent border-none cursor-pointer" onClick={() => alert("Mark sheet secure PDF downloaded via registry API.")}>
                      View Detailed Marksheet
                    </button>
                  </div>
                </div>
              </section>

              {/* Hostel & Transport */}
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-on-surface mb-8 uppercase tracking-tight">Hostel &amp; Transport</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 institution-shadow flex items-center gap-5">
                    <div className="w-14 h-14 bg-surface-container-low rounded-xl flex items-center justify-center text-on-surface-variant">
                      <span className="material-symbols-outlined text-3xl">apartment</span>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-outline uppercase tracking-widest mb-0.5">Hostel</p>
                      <p className="text-lg font-bold text-on-surface">{student.hostel}</p>
                    </div>
                  </div>

                  <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 institution-shadow flex items-center gap-5">
                    <div className="w-14 h-14 bg-surface-container-low rounded-xl flex items-center justify-center text-on-surface-variant">
                      <span className="material-symbols-outlined text-3xl">door_front</span>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-outline uppercase tracking-widest mb-0.5">Room Number</p>
                      <p className="text-lg font-bold text-on-surface">{student.roomNumber}</p>
                    </div>
                  </div>

                  <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 institution-shadow flex items-center gap-5">
                    <div className="w-14 h-14 bg-surface-container-low rounded-xl flex items-center justify-center text-on-surface-variant">
                      <span className="material-symbols-outlined text-3xl">directions_bus</span>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-outline uppercase tracking-widest mb-0.5">Transport Route</p>
                      <p className="text-lg font-bold text-on-surface leading-tight">{student.transportRoute}</p>
                    </div>
                  </div>

                </div>
              </section>

              {/* Hostel Gate Pass System */}
              <section className="mb-12">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-on-surface uppercase tracking-tight">Hostel Outstation Gate Pass</h2>
                    <p className="text-sm text-outline">File and track official outstation gate passes. Approved passes notify security guards at the perimeter gates.</p>
                  </div>
                  <button
                    onClick={() => setPassFormOpen(!passFormOpen)}
                    className="flex items-center justify-center gap-2 px-6 py-2.5 bg-brand-red text-white rounded-lg text-sm font-bold shadow-sm hover:bg-red-800 transition-all cursor-pointer border-none self-start sm:self-center"
                  >
                    <span className="material-symbols-outlined text-sm">vpn_key</span>
                    {passFormOpen ? "Close Request Form" : "Request Gate Pass"}
                  </button>
                </div>

                {passMsg && (
                  <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-xl text-sm border border-green-200">
                    {passMsg}
                  </div>
                )}

                {passFormOpen && (
                  <form onSubmit={handleGatePassSubmit} className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-8 mb-8 institution-shadow space-y-6 animate-in slide-in-from-top-4 duration-300">
                    <h3 className="text-lg font-bold text-on-surface">New Outstation Gate Pass Request</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-bold text-outline uppercase mb-1">Leaving Date</label>
                        <input
                          type="date"
                          value={leavingDate}
                          onChange={(e) => setLeavingDate(e.target.value)}
                          className="w-full p-3 border border-outline-variant bg-surface-container-lowest text-on-surface rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-brand-red"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-outline uppercase mb-1">Estimated Return Date</label>
                        <input
                          type="date"
                          value={returnDate}
                          onChange={(e) => setReturnDate(e.target.value)}
                          className="w-full p-3 border border-outline-variant bg-surface-container-lowest text-on-surface rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-brand-red"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-outline uppercase mb-1">Leaving Time</label>
                        <input
                          type="time"
                          value={leavingTime}
                          onChange={(e) => setLeavingTime(e.target.value)}
                          className="w-full p-3 border border-outline-variant bg-surface-container-lowest text-on-surface rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-brand-red"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-outline uppercase mb-1">Estimated Return Time</label>
                        <input
                          type="time"
                          value={returnTime}
                          onChange={(e) => setReturnTime(e.target.value)}
                          className="w-full p-3 border border-outline-variant bg-surface-container-lowest text-on-surface rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-brand-red"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-bold text-outline uppercase mb-1">Destination Address</label>
                        <input
                          type="text"
                          placeholder="e.g. Primary residence address or relative home"
                          value={passDestination}
                          onChange={(e) => setPassDestination(e.target.value)}
                          className="w-full p-3 border border-outline-variant bg-surface-container-lowest text-on-surface rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-brand-red"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-outline uppercase mb-1">Transport Mode</label>
                        <select
                          value={passTransport}
                          onChange={(e) => setPassTransport(e.target.value)}
                          className="w-full p-3 border border-outline-variant bg-surface-container-lowest text-on-surface rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-brand-red"
                        >
                          <option value="Metro / Public Cab">Metro / Public Cab</option>
                          <option value="Institutional Shuttle">Institutional Shuttle</option>
                          <option value="Parent Pickup">Parent Pickup</option>
                          <option value="Personal Vehicle">Personal Vehicle</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-xs font-bold text-outline uppercase mb-1">Local Guardian Name</label>
                        <input
                          type="text"
                          placeholder="Guardian full name"
                          value={guardianName}
                          onChange={(e) => setGuardianName(e.target.value)}
                          className="w-full p-3 border border-outline-variant bg-surface-container-lowest text-on-surface rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-brand-red"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-outline uppercase mb-1">Guardian Contact Number</label>
                        <input
                          type="tel"
                          placeholder="+91 XXXXX XXXXX"
                          value={guardianContact}
                          onChange={(e) => setGuardianContact(e.target.value)}
                          className="w-full p-3 border border-outline-variant bg-surface-container-lowest text-on-surface rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-brand-red"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-outline uppercase mb-1">Emergency Secondary Contact</label>
                        <input
                          type="tel"
                          placeholder="+91 XXXXX XXXXX"
                          value={emergencyContact}
                          onChange={(e) => setEmergencyContact(e.target.value)}
                          className="w-full p-3 border border-outline-variant bg-surface-container-lowest text-on-surface rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-brand-red"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-outline uppercase mb-1">Reason for Leave</label>
                      <textarea
                        rows={3}
                        placeholder="Please state a valid reason (e.g. medical checkup, weekend family visit)."
                        value={passReason}
                        onChange={(e) => setPassReason(e.target.value)}
                        className="w-full p-3 border border-outline-variant bg-surface-container-lowest text-on-surface rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-brand-red"
                        required
                      ></textarea>
                    </div>

                    <div className="p-4 bg-surface-container rounded-xl flex items-center gap-3">
                      <span className="material-symbols-outlined text-primary">info</span>
                      <p className="text-xs text-on-surface-variant font-medium">By submitting, an automated request with parent authorization logs is dispatched to Warden Block C and Student Welfare Admin.</p>
                    </div>

                    <div className="flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setPassFormOpen(false)}
                        className="px-6 py-2 rounded-lg text-sm font-bold text-outline hover:bg-surface-container border-none cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2 rounded-lg text-sm font-bold bg-brand-red text-white hover:bg-red-800 border-none cursor-pointer"
                      >
                        Submit Request
                      </button>
                    </div>
                  </form>
                )}

                {/* Gate Pass List */}
                <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl institution-shadow overflow-hidden">
                  {gatePasses.length === 0 ? (
                    <div className="p-8 text-center text-outline">
                      No gate pass requests found.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead className="bg-surface-container-low">
                          <tr>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-outline">Pass ID</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-outline">Out Date/Time</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-outline">Return Date/Time</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-outline">Destination</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-outline">Status</th>
                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-outline">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant">
                          {gatePasses.map((pass) => (
                            <tr key={pass.id} className="hover:bg-surface-bright transition-colors">
                              <td className="px-6 py-4 text-xs font-bold text-on-surface">{pass.id}</td>
                              <td className="px-6 py-4 text-xs text-on-surface">{pass.leavingDate} at {pass.leavingTime}</td>
                              <td className="px-6 py-4 text-xs text-on-surface">{pass.returnDate} at {pass.returnTime}</td>
                              <td className="px-6 py-4 text-xs text-on-surface max-w-[150px] truncate">{pass.destination}</td>
                              <td className="px-6 py-4 text-xs">
                                <span className={`px-2.5 py-0.5 rounded-full font-bold uppercase text-[10px] border ${
                                  pass.status === 'Approved' ? 'bg-green-50 text-green-700 border-green-100' :
                                  pass.status === 'Outside' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                  pass.status === 'Overdue' ? 'bg-red-50 text-red-700 border-red-200 animate-pulse' :
                                  pass.status === 'Returned' ? 'bg-gray-100 text-gray-700 border-gray-200' :
                                  pass.status === 'Rejected' ? 'bg-red-50 text-red-700 border-red-100' :
                                  pass.status === 'More Info Required' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                  'bg-amber-50 text-amber-700 border-amber-100'
                                }`}>
                                  {pass.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-xs">
                                {['Approved', 'Outside', 'Overdue', 'Returned'].includes(pass.status) ? (
                                  <button
                                    onClick={() => {
                                      const printWindow = window.open('', '_blank');
                                      if (printWindow) {
                                        printWindow.document.write(`
                                          <html>
                                            <head>
                                              <title>Campus Outstation Gate Pass - ${student?.fullName || pass.studentName}</title>
                                              <style>
                                                body { font-family: 'Courier New', monospace; padding: 40px; text-align: center; color: #333; }
                                                .slip { border: 3px double #333; padding: 30px; max-width: 480px; margin: auto; text-align: left; }
                                                .title { text-align: center; font-weight: bold; font-size: 20px; border-bottom: 2px dashed #333; padding-bottom: 15px; margin-bottom: 15px; }
                                                .row { display: flex; justify-content: space-between; margin: 8px 0; font-size: 14px; }
                                                .row span:first-child { font-weight: bold; }
                                                .qr { text-align: center; margin-top: 25px; margin-bottom: 15px; }
                                                .qr img { border: 2px solid #333; padding: 5px; width: 150px; height: 150px; }
                                                .footer { text-align: center; border-top: 2px dashed #333; padding-top: 15px; font-size: 12px; margin-top: 20px; }
                                              </style>
                                            </head>
                                            <body>
                                              <div class="slip">
                                                <div class="title">K.R. MANGALAM UNIVERSITY<br/>OFFICIAL TRANSIT PASS</div>
                                                <div class="row"><span>Pass ID:</span><span>${pass.id}</span></div>
                                                <div class="row"><span>Student Name:</span><span>${student?.fullName || pass.studentName}</span></div>
                                                <div class="row"><span>Roll Number:</span><span>${student?.enrollmentNo || pass.rollNo || '2401730018'}</span></div>
                                                <div class="row"><span>Hostel Block:</span><span>${student?.hostel || 'A'} - Room ${student?.roomNumber || '102'}</span></div>
                                                <div class="row"><span>Leaving Date:</span><span>${pass.leavingDate}</span></div>
                                                <div class="row"><span>Expected Return:</span><span>${pass.returnDate} @ ${pass.returnTime}</span></div>
                                                <div class="row"><span>Destination:</span><span>${pass.destination}</span></div>
                                                <div class="row"><span>Authorized By:</span><span>${pass.approvedBy || 'Registrar Board'}</span></div>
                                                <div class="row"><span>Pass Status:</span><span>${pass.status}</span></div>
                                                ${pass.qrCode ? `
                                                <div class="qr">
                                                  <img src="${pass.qrCode}" alt="Security QR"/>
                                                  <div style="font-size:10px; margin-top: 5px;">SCANNABLE GATE TRANSIT SECURITY ID</div>
                                                </div>
                                                ` : ''}
                                                <div class="footer">This digital authorization is cryptographically verified on the university ERP mainframe.</div>
                                              </div>
                                              <script>window.print();</script>
                                            </body>
                                          </html>
                                        `);
                                        printWindow.document.close();
                                      }
                                    }}
                                    className="flex items-center gap-1 text-primary hover:underline font-bold bg-transparent border-none cursor-pointer text-left"
                                  >
                                    <span className="material-symbols-outlined text-sm">print</span> Print Pass
                                  </button>
                                ) : (
                                  <span className="text-outline italic text-[11px] max-w-[150px] block truncate" title={pass.remarks || "Awaiting administrative review"}>
                                    {pass.remarks || "Awaiting administrative review"}
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </section>
            </div>
          )}

          {/* TAB 3: GRIEVANCE FORM & PENDING SUBMISSIONS */}
          {activeTab === 'grievance' && (
            <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex bg-gray-100 p-1 rounded-xl mb-6 max-w-lg">
                <button
                  onClick={() => setGrievanceSubTab('submit')}
                  className={`flex-1 py-2 text-center text-sm rounded-lg transition-all cursor-pointer border-none font-medium ${grievanceSubTab === 'submit' ? 'bg-white text-brand-red font-bold shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
                >
                  Submit Grievance
                </button>
                <button
                  onClick={() => setGrievanceSubTab('track')}
                  className={`flex-1 py-2 text-center text-sm rounded-lg transition-all cursor-pointer border-none font-medium ${grievanceSubTab === 'track' ? 'bg-white text-brand-red font-bold shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
                >
                  Track Status ({studentGrievances.length})
                </button>
                <button
                  onClick={() => { setGrievanceSubTab('pending'); }}
                  className={`flex-1 py-2 text-center text-sm rounded-lg transition-all cursor-pointer border-none font-medium ${grievanceSubTab === 'pending' ? 'bg-white text-brand-red font-bold shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
                >
                  Pending Docs ({pendingDocs.length})
                </button>
              </div>

              {grievanceSubTab === 'submit' && (
                <div className="max-w-2xl">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Submit Student Grievance</h2>
                  <p className="text-sm text-gray-500 mb-6">Your grievance will be directly visible to the Dean of Engineering and Academic Registrar.</p>
                  
                  {grievanceMsg && (
                    <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg text-sm border border-green-200">
                      {grievanceMsg}
                    </div>
                  )}

                  <form onSubmit={handleGrievanceSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Grievance Category</label>
                        <select
                          value={grievanceCategory}
                          onChange={(e) => setGrievanceCategory(e.target.value)}
                          className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-red text-sm bg-white"
                        >
                          <option value="Hostel & Infrastructure">Hostel &amp; Infrastructure</option>
                          <option value="Academic / Faculty">Academic / Faculty</option>
                          <option value="Fee & Finance">Fee &amp; Finance</option>
                          <option value="Transport Services">Transport Services</option>
                          <option value="IT Support / Wi-Fi">IT Support / Wi-Fi</option>
                          <option value="General Support">General Support</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Priority Level</label>
                        <select
                          value={grievancePriority}
                          onChange={(e) => setGrievancePriority(e.target.value)}
                          className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-red text-sm bg-white"
                        >
                          <option value="Low">Low</option>
                          <option value="Medium">Medium</option>
                          <option value="High">High</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Grievance Subject / Title</label>
                      <input 
                        type="text" 
                        value={grievanceTitle}
                        onChange={(e) => setGrievanceTitle(e.target.value)}
                        placeholder="e.g. Hostels wifi connectivity issue, Fee installment request" 
                        className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-red text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Detailed Description</label>
                      <textarea 
                        rows={6}
                        value={grievanceDesc}
                        onChange={(e) => setGrievanceDesc(e.target.value)}
                        placeholder="Explain the issues in detail with your room or lecture group context." 
                        className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-red text-sm"
                        required
                      ></textarea>
                    </div>
                    <button 
                      type="submit" 
                      className="w-full bg-brand-red hover:bg-red-800 text-white py-3 rounded-xl font-bold transition-all cursor-pointer border-none"
                    >
                      Submit Official Grievance
                    </button>
                  </form>
                </div>
              )}

              {grievanceSubTab === 'track' && (
                tabLoading ? (
                  <TableSkeleton colsCount={3} rowsCount={4} />
                ) : (
                  <div className="space-y-6 animate-in fade-in duration-200">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800">Track Grievances</h2>
                      <p className="text-sm text-gray-500">Live grievance redressal tracking with status and correspondence.</p>
                    </div>
                    
                    {studentGrievances.length === 0 ? (
                      <div className="p-8 text-center bg-gray-50 border border-dashed rounded-xl text-gray-400">
                        No grievances filed yet.
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {studentGrievances.map((g) => (
                          <div key={g.id} className="p-6 bg-gray-50 rounded-2xl border border-gray-100 space-y-4 text-left">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                              <div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="text-[10px] bg-red-100 text-brand-red px-2 py-0.5 rounded-full font-bold uppercase">{g.priority} Priority</span>
                                  <span className="text-xs text-gray-400 font-medium">{g.id} • Filed on {g.date} • {g.category}</span>
                                </div>
                                <h3 className="font-bold text-gray-800 text-lg mt-1">{g.title}</h3>
                                <p className="text-sm text-gray-600 mt-1">{g.description}</p>
                              </div>
                              <span className={`text-xs px-3 py-1 rounded-full font-bold uppercase ${
                                g.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                g.status === 'Under Review' ? 'bg-blue-100 text-blue-800' :
                                g.status === 'Escalated' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                              }`}>
                                {g.status}
                              </span>
                            </div>

                            {g.resolutionNotes && (
                              <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                                <p className="text-xs font-bold text-green-800">Official Resolution:</p>
                                <p className="text-xs text-green-700 mt-1">{g.resolutionNotes}</p>
                              </div>
                            )}

                            {g.replies && g.replies.length > 0 && (
                              <div className="space-y-2 pt-3 border-t border-gray-200">
                                <h4 className="text-xs font-bold text-gray-500 uppercase">Communication History</h4>
                                {g.replies.map((reply: any, idx: number) => (
                                  <div key={idx} className="p-3 bg-white rounded-xl border border-gray-100">
                                    <div className="flex justify-between text-[10px] text-gray-400 font-bold mb-1">
                                      <span>{reply.author} ({reply.role})</span>
                                      <span>{reply.timestamp}</span>
                                    </div>
                                    <p className="text-xs text-gray-700">{reply.text}</p>
                                  </div>
                                ))}
                              </div>
                            )}
                            
                            <div className="pt-3 border-t border-gray-200/60">
                              <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">Audit Log / Timeline</h4>
                              <div className="relative pl-4 border-l border-gray-200 space-y-3">
                                {g.timeline?.map((step: any, sIdx: number) => (
                                  <div key={sIdx} className="relative text-xs">
                                    <div className="absolute -left-[21px] top-1 size-2 rounded-full bg-brand-red"></div>
                                    <span className="font-bold text-gray-600">{step.date}</span>
                                    <span className="mx-2 text-gray-400">|</span>
                                    <span className="text-gray-500">{step.description}</span>
                                    <span className="text-[10px] ml-1 bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">by {step.actor}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              )}

              {grievanceSubTab === 'pending' && (
                tabLoading ? (
                  <TableSkeleton colsCount={2} rowsCount={3} />
                ) : (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Required Document Submissions</h2>
                    <p className="text-sm text-gray-500 mb-6">Undergraduate credentials awaiting registrar verification. Upload scanned original files to sync with digital document wallet.</p>
                    
                    <div className="space-y-6">
                      {pendingDocs.map(doc => (
                        <div key={doc.id} className="p-6 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-bold text-gray-800">{doc.name}</h3>
                              <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                                doc.status === 'Missing' ? 'bg-red-50 text-red-600' : 
                                doc.status.includes('Awaiting') ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600'
                              }`}>
                                {doc.status}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 mb-1">{doc.description}</p>
                            <p className="text-[10px] text-gray-400 font-medium uppercase">Requirement: {doc.requirement}</p>
                          </div>
                          <div>
                            {doc.status === 'Missing' && (
                              <label className="px-4 py-2 bg-brand-red text-white text-xs font-bold rounded-lg hover:bg-red-800 cursor-pointer transition-colors block text-center">
                                Upload File
                                <input 
                                  type="file" 
                                  className="hidden" 
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    try {
                                      const res = await fetch(`/api/student/${studentId}/pending-documents/${doc.id}/upload`, {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ fileName: file.name })
                                      });
                                      const data = await res.json();
                                      if (data.success) {
                                        alert(`Successfully uploaded "${file.name}" for ${doc.name}! Verification in progress.`);
                                        loadData();
                                      }
                                    } catch (err) {
                                      console.error(err);
                                    }
                                  }}
                                />
                              </label>
                            )}
                            {doc.status.includes('Awaiting') && (
                              <span className="text-xs text-gray-400 italic">Under Registrar Audit</span>
                            )}
                            {doc.status.includes('Verified') && (
                              <div className="flex items-center text-green-600 gap-1 text-xs font-bold">
                                <span className="material-symbols-outlined text-sm">check_circle</span> Approved
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              )}
            </div>
          )}

          {/* TAB academics */}
          {activeTab === 'academics' && (
            <div className="max-w-4xl mx-auto space-y-8">
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">Academic Schedule</h2>
                    <p className="text-sm text-gray-500">Spring Semester 2024 • Section CSE-B</p>
                  </div>
                  <button 
                    onClick={() => setTimetableModalOpen(true)}
                    className="px-5 py-2 bg-brand-red text-white text-sm font-bold rounded-lg hover:bg-red-800 transition-colors cursor-pointer border-none"
                  >
                    View Timetable Grid
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <span className="material-symbols-outlined text-brand-red text-lg">menu_book</span> Enrolled Courses
                    </h3>
                    <div className="space-y-3">
                      {courses.map(c => (
                        <div key={c.courseCode} className="flex justify-between items-center p-3 bg-white rounded-xl border border-gray-100">
                          <div>
                            <p className="font-bold text-sm text-gray-800">{c.courseCode} - {c.courseTitle}</p>
                            <p className="text-xs text-gray-400">{c.type} • {c.credits} Credits</p>
                          </div>
                          <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${c.status === 'ON Track' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                            {c.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <span className="material-symbols-outlined text-brand-red text-lg">trending_up</span> Syllabus velocity index
                    </h3>
                    <div className="space-y-4">
                      <div className="p-3 bg-white rounded-xl border border-gray-100">
                        <div className="flex justify-between text-xs font-bold text-gray-700 mb-1">
                          <span>Machine Learning and Pattern Recognition</span>
                          <span className="text-green-600">On Track</span>
                        </div>
                        <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-green-500 h-full rounded-full" style={{ width: '78%' }}></div>
                        </div>
                      </div>
                      <div className="p-3 bg-white rounded-xl border border-gray-100">
                        <div className="flex justify-between text-xs font-bold text-gray-700 mb-1">
                          <span>Database Management Systems</span>
                          <span className="text-brand-red">1 Unit Behind</span>
                        </div>
                        <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-brand-red h-full rounded-full" style={{ width: '45%' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB attendance */}
          {activeTab === 'attendance' && (
            (tabLoading || !student) ? (
              <TableSkeleton colsCount={3} rowsCount={5} />
            ) : (
              <div className="max-w-4xl mx-auto space-y-8">
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">Attendance Register</h2>
                    <p className="text-sm text-gray-500">Showing official attendance report from class scanners</p>
                  </div>
                  <div className="p-4 bg-brand-red/5 rounded-2xl border border-brand-red/10 flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xs font-bold text-gray-400 uppercase">Aggregated Percentage</p>
                      <p className="text-2xl font-black text-brand-red">{attendancePercent}%</p>
                    </div>
                    <span className="material-symbols-outlined text-3xl text-brand-red">check_circle</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="p-6 bg-red-50/50 rounded-2xl border border-red-100 flex items-start gap-4">
                    <span className="material-symbols-outlined text-2xl text-brand-red mt-0.5">warning</span>
                    <div>
                      <h4 className="font-bold text-gray-800 text-sm">Low Attendance Warnings</h4>
                      <p className="text-xs text-gray-500 mt-1">
                        University rules mandate minimum 75% attendance. Network Security is at 76% (A single absence will drop this to Warning status).
                      </p>
                    </div>
                  </div>
                  <div className="p-6 bg-blue-50/50 rounded-2xl border border-blue-100 flex items-start gap-4">
                    <span className="material-symbols-outlined text-2xl text-blue-600 mt-0.5">info</span>
                    <div>
                      <h4 className="font-bold text-gray-800 text-sm">Automatic Scanner Synced</h4>
                      <p className="text-xs text-gray-500 mt-1">
                        Scans are uploaded after every lecture block. Contact your faculty coordinator for attendance correction requests.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-bold text-gray-800">Course Breakdown</h3>
                  <div className="space-y-3">
                    {courses.map(c => (
                      <div key={c.courseCode} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                        <div>
                          <p className="font-bold text-gray-800">{c.courseCode} - {c.courseTitle}</p>
                          <p className="text-xs text-gray-400">{c.type}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="w-32 bg-gray-200 h-2 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${c.attendancePercent < 75 ? 'bg-red-500' : c.attendancePercent < 80 ? 'bg-amber-500' : 'bg-green-500'}`} style={{ width: `${c.attendancePercent}%` }}></div>
                          </div>
                          <span className={`text-sm font-bold w-12 text-right ${c.attendancePercent < 75 ? 'text-red-600' : 'text-gray-800'}`}>{c.attendancePercent}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            )
          )}

          {/* TAB grades */}
          {activeTab === 'grades' && (
            <div className="max-w-4xl mx-auto space-y-8" id="grades-transcript-container">
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">Academic Transcript & Marksheet</h2>
                    <p className="text-sm text-gray-500">Official Semester wise Grade Sheet</p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handlePrintDoc('grades-sheet-printable', 'Semester Marksheet')}
                      className="px-4 py-2 bg-white border border-gray-200 text-gray-700 text-xs font-bold rounded-lg hover:bg-gray-50 flex items-center gap-1 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-sm">print</span> Print Transcript
                    </button>
                    <button 
                      onClick={() => handlePrintDoc('grades-sheet-printable', 'Semester Marksheet')}
                      className="px-4 py-2 bg-brand-red text-white text-xs font-bold rounded-lg hover:bg-red-800 flex items-center gap-1 cursor-pointer border-none"
                    >
                      <span className="material-symbols-outlined text-sm">download</span> Download Marksheet
                    </button>
                  </div>
                </div>

                <div className="flex bg-gray-100 p-1 rounded-xl mb-6 max-w-sm">
                  {Object.keys(studentGrades || {}).map(sem => (
                    <button
                      key={sem}
                      onClick={() => setActiveGradeSemester(sem)}
                      className={`flex-1 py-1.5 text-center text-xs rounded-lg transition-all border-none font-medium cursor-pointer ${activeGradeSemester === sem ? 'bg-white text-brand-red font-bold shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
                    >
                      {sem}
                    </button>
                  ))}
                </div>

                {student && studentGrades && studentGrades[activeGradeSemester] ? (
                  <div className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm" id="grades-sheet-printable">
                    <div className="bg-gray-50 p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between gap-4">
                      <div>
                        <h3 className="font-bold text-gray-800 text-lg uppercase">K.R. Mangalam University</h3>
                        <p className="text-[10px] text-gray-400 font-medium tracking-wide uppercase">Sohna Road, Gurugram, Delhi NCR</p>
                        <p className="text-xs font-bold text-brand-red mt-2">SEMESTER GRADE SHEET ({studentGrades[activeGradeSemester].semester})</p>
                      </div>
                      <div className="text-right text-xs">
                        <p className="font-medium text-gray-500">Reg. No.: <span className="font-bold text-gray-800">{student.enrollmentNo}</span></p>
                        <p className="font-medium text-gray-500">Roll No.: <span className="font-bold text-gray-800">{student.rollNo || "2401730018"}</span></p>
                        <p className="font-medium text-gray-500">Adm. No.: <span className="font-bold text-gray-800">{student.admissionNo || "2401730288"}</span></p>
                        <p className="font-medium text-gray-500">Name: <span className="font-bold text-gray-800">{student.fullName}</span></p>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse text-left text-xs">
                        <thead>
                          <tr className="bg-gray-100 font-black text-gray-500 border-b border-gray-100 uppercase tracking-wider">
                            <th className="p-4">Subject Code</th>
                            <th className="p-4">Subject Title</th>
                            <th className="p-4">Type</th>
                            <th className="p-4 text-center">Credits</th>
                            <th className="p-4 text-center">Letter Grade</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {studentGrades[activeGradeSemester].subjects.map((s: any) => (
                            <tr key={s.code} className="hover:bg-gray-50/50">
                              <td className="p-4 font-mono font-bold text-gray-800">{s.code}</td>
                              <td className="p-4 font-medium text-gray-700">{s.title}</td>
                              <td className="p-4 text-gray-500">{s.type}</td>
                              <td className="p-4 text-center font-bold text-gray-600">{s.credits.toFixed(1)}</td>
                              <td className="p-4 text-center font-black text-brand-red text-sm">{s.grade}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="p-6 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                      <div className="flex gap-6">
                        <div className="text-center sm:text-left">
                          <p className="text-[10px] text-gray-400 font-medium uppercase">Semester SGPA</p>
                          <p className="text-xl font-bold text-gray-800">{studentGrades[activeGradeSemester].sgpa}</p>
                        </div>
                        <div className="text-center sm:text-left">
                          <p className="text-[10px] text-gray-400 font-medium uppercase">Cumulative CGPA</p>
                          <p className="text-xl font-bold text-gray-800">{studentGrades[activeGradeSemester].cgpa}</p>
                        </div>
                        <div className="text-center sm:text-left">
                          <p className="text-[10px] text-gray-400 font-medium uppercase">Total Credits Earned</p>
                          <p className="text-xl font-bold text-gray-800">{studentGrades[activeGradeSemester].totalCredits}</p>
                        </div>
                      </div>
                      <div className="text-right text-[10px] text-gray-400">
                        <p>Date of Declaration: {studentGrades[activeGradeSemester].date}</p>
                        <p className="font-bold text-green-600 mt-1">Computer Generated Sheet. Does not require sign.</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-center text-sm text-gray-400">No marksheet records loaded</p>
                )}
              </div>
            </div>
          )}

          {/* TAB academic_planner */}
          {activeTab === 'academic_planner' && (
            <div className="max-w-6xl mx-auto space-y-8">
              <AcademicPlanner student={student} />
            </div>
          )}

          {/* TAB fee_details */}
          {activeTab === 'fee_details' && (
            (tabLoading || !student) ? (
              <TableSkeleton colsCount={5} rowsCount={6} />
            ) : (
              <div className="max-w-4xl mx-auto space-y-8">
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">Fee Accounts Ledgers</h2>
                    <p className="text-sm text-gray-500">Showing official university bank transactions and receipts</p>
                  </div>
                  <span className="text-xs px-3 py-1 bg-green-50 text-green-600 rounded-full font-bold">Accounts Cleared</span>
                </div>

                <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase">Recent Payment Reference</p>
                    <p className="text-lg font-bold text-gray-800">Semester V Tuition Fee</p>
                    <p className="text-xs text-gray-400 mt-0.5">Receipt No: KRMU/2026-2027/00200 • Paid on 25 Jun 2026</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="text-2xl font-black text-brand-red">145,000.00 INR</p>
                    <button 
                      onClick={() => {
                        const feeDoc = documents.find(d => d.type === 'fee_receipt') || { id: 'doc-2', name: 'Fee Receipt' };
                        setSelectedWalletDoc(feeDoc);
                        setWalletModalOpen(true);
                      }}
                      className="px-4 py-2 bg-brand-red text-white text-xs font-bold rounded-lg hover:bg-red-800 transition-all cursor-pointer border-none flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-sm">download</span> Receipt
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-bold text-gray-800 text-sm">Payment History Log</h3>
                  <div className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-gray-100 text-gray-500 border-b border-gray-100 uppercase font-black">
                          <th className="p-4">Receipt Ref</th>
                          <th className="p-4">Period</th>
                          <th className="p-4">Bank Mode</th>
                          <th className="p-4 text-right">Amount (INR)</th>
                          <th className="p-4 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        <tr className="hover:bg-gray-50/50">
                          <td className="p-4 font-mono font-bold text-gray-800">KRMU/2026-2027/00200</td>
                          <td className="p-4 font-medium text-gray-700">Semester V - Tuition & Dev Fee</td>
                          <td className="p-4 text-gray-500">ICICI Card swipe (Card *5432)</td>
                          <td className="p-4 text-right font-bold text-gray-800">145,000.00</td>
                          <td className="p-4 text-center"><span className="px-2 py-0.5 bg-green-50 text-green-600 rounded-full font-bold">Paid</span></td>
                        </tr>
                        <tr className="hover:bg-gray-50/50">
                          <td className="p-4 font-mono font-bold text-gray-800">KRMU/2025-2026/00140</td>
                          <td className="p-4 font-medium text-gray-700">Semester IV - Tuition & Dev Fee</td>
                          <td className="p-4 text-gray-500">Netbanking NetPay-ICICI</td>
                          <td className="p-4 text-right font-bold text-gray-800">145,000.00</td>
                          <td className="p-4 text-center"><span className="px-2 py-0.5 bg-green-50 text-green-600 rounded-full font-bold">Paid</span></td>
                        </tr>
                        <tr className="hover:bg-gray-50/50">
                          <td className="p-4 font-mono font-bold text-gray-800">KRMU/2025-2026/00098</td>
                          <td className="p-4 font-medium text-gray-700">Semester III - Tuition & Dev Fee</td>
                          <td className="p-4 text-gray-500">Netbanking NetPay-ICICI</td>
                          <td className="p-4 text-right font-bold text-gray-800">135,000.00</td>
                          <td className="p-4 text-center"><span className="px-2 py-0.5 bg-green-50 text-green-600 rounded-full font-bold">Paid</span></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
            )
          )}

          {/* TAB notification */}
          {activeTab === 'notification' && (
            (tabLoading || !student) ? (
              <TableSkeleton colsCount={3} rowsCount={6} />
            ) : (
              <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-200">
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-left">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b pb-4 border-gray-100">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">University Bulletin Board</h2>
                    <p className="text-sm text-gray-500">Live academic notices, fee alerts, and placements updates from Student Welfare and Dean offices.</p>
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
                  {['All', 'Notice', 'Exam', 'Fee', 'Placement', 'Hostel', 'Event'].map((cat) => (
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
                  {studentNotifications
                    .filter((n) => notifCategoryFilter === 'All' || n.category === notifCategoryFilter)
                    .length === 0 ? (
                      <div className="p-8 text-center bg-gray-50 border border-dashed rounded-xl text-gray-400">
                        No announcements found in this category.
                      </div>
                    ) : (
                      studentNotifications
                        .filter((n) => notifCategoryFilter === 'All' || n.category === notifCategoryFilter)
                        .map((n) => {
                          const isUnread = !n.readBy.includes(studentId);
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
                                n.category === 'Fee' ? 'text-amber-600' :
                                n.category === 'Placement' ? 'text-indigo-600' : 'text-blue-600'
                              }`}>
                                {n.category === 'Exam' ? 'assignment_late' :
                                 n.category === 'Fee' ? 'payments' :
                                 n.category === 'Placement' ? 'work' : 'notifications'}
                              </span>
                              <div className="flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${
                                    n.category === 'Exam' ? 'bg-red-100 text-brand-red' :
                                    n.category === 'Fee' ? 'bg-amber-100 text-amber-800' :
                                    n.category === 'Placement' ? 'bg-indigo-100 text-indigo-800' : 'bg-blue-100 text-blue-800'
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
            </div>
            )
          )}

          {/* Notification Details Modal */}
          {selectedNotif && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="modal-overlay absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedNotif(null)}></div>
              <div className="bg-white rounded-3xl max-w-lg w-full relative z-10 p-8 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-150 text-left">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="bg-red-50 text-brand-red text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                      {selectedNotif.category} Alert
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

                <div className="py-4 border-t border-b border-gray-100 space-y-3">
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {selectedNotif.text}
                  </p>
                  
                  {selectedNotif.category === 'Fee' && (
                    <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 text-xs">
                      <p className="font-bold text-amber-800 mb-1">Fee Clearance Shortcut</p>
                      <p className="text-amber-700">Please clear the balance amounts before final exams to download your digital Admit Card.</p>
                      <button 
                        onClick={() => { setSelectedNotif(null); setActiveTab('fee_details'); }}
                        className="mt-2.5 px-4 py-1.5 bg-amber-600 text-white rounded-lg font-bold border-none cursor-pointer hover:bg-amber-700"
                      >
                        Go to Payments
                      </button>
                    </div>
                  )}

                  {selectedNotif.category === 'Exam' && (
                    <div className="p-4 bg-red-50 rounded-xl border border-red-100 text-xs">
                      <p className="font-bold text-red-800 mb-1">Admit Card &amp; Seating</p>
                      <p className="text-red-700">Verify your attendance percentage before submitting the exam form.</p>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center text-xs text-gray-400 pt-4">
                  <span>Sender: {selectedNotif.sender}</span>
                  <span>Date: {selectedNotif.date}</span>
                </div>
              </div>
            </div>
          )}

        </div>

        <footer className="py-6 px-8 border-t border-outline-variant text-center text-outline text-xs bg-white">
          © 2024 Precision Institutional Portal. All rights reserved.
        </footer>
      </main>

      {/* Weekly Timetable Modal */}
      {timetableModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="modal-overlay absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setTimetableModalOpen(false)}></div>
          <div className="relative w-full max-w-5xl bg-surface-container-lowest rounded-2xl institution-shadow overflow-hidden flex flex-col max-h-[90vh] z-10 animate-in fade-in zoom-in duration-200">
            
            <div className="p-6 border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
              <div>
                <h2 className="text-2xl font-bold text-on-surface">Weekly Academic Schedule</h2>
                <p className="text-sm text-on-surface-variant">Spring Semester 2024 • Section CSE-B</p>
              </div>
              <button 
                className="w-10 h-10 rounded-full hover:bg-surface-container-high flex items-center justify-center text-outline transition-colors cursor-pointer border-none bg-transparent" 
                onClick={() => setTimetableModalOpen(false)}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="flex-1 overflow-auto p-6">
              <table className="w-full border-collapse border border-outline-variant min-w-[800px]">
                <thead className="bg-surface-container-high">
                  <tr>
                    <th className="border border-outline-variant p-4 text-[10px] font-black text-outline uppercase w-24">Time</th>
                    <th className="border border-outline-variant p-4 text-[10px] font-black text-on-surface uppercase">Mon</th>
                    <th className="border border-outline-variant p-4 text-[10px] font-black text-on-surface uppercase">Tue</th>
                    <th className="border border-outline-variant p-4 text-[10px] font-black text-on-surface uppercase">Wed</th>
                    <th className="border border-outline-variant p-4 text-[10px] font-black text-on-surface uppercase">Thu</th>
                    <th className="border border-outline-variant p-4 text-[10px] font-black text-on-surface uppercase">Fri</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="h-20">
                    <td className="border border-outline-variant p-4 text-xs font-bold text-outline text-center">09:00 AM</td>
                    <td className="border border-outline-variant p-4 bg-primary/5">
                      <div className="text-sm font-bold text-primary">CSE-301</div>
                      <div className="text-[10px] text-on-surface-variant uppercase">Lab Room 402</div>
                    </td>
                    <td className="border border-outline-variant p-4"></td>
                    <td className="border border-outline-variant p-4 bg-blue-50">
                      <div className="text-sm font-bold text-blue-700">MTH-310</div>
                      <div className="text-[10px] text-on-surface-variant uppercase">Hall A</div>
                    </td>
                    <td className="border border-outline-variant p-4 bg-primary/5">
                      <div className="text-sm font-bold text-primary">CSE-301</div>
                      <div className="text-[10px] text-on-surface-variant uppercase">Hall C</div>
                    </td>
                    <td className="border border-outline-variant p-4"></td>
                  </tr>
                  <tr className="h-20">
                    <td className="border border-outline-variant p-4 text-xs font-bold text-outline text-center">11:00 AM</td>
                    <td className="border border-outline-variant p-4"></td>
                    <td className="border border-outline-variant p-4 bg-blue-50">
                      <div className="text-sm font-bold text-blue-700">CSE-302</div>
                      <div className="text-[10px] text-on-surface-variant uppercase">Room 201</div>
                    </td>
                    <td className="border border-outline-variant p-4"></td>
                    <td className="border border-outline-variant p-4 bg-orange-50">
                      <div className="text-sm font-bold text-orange-700">ENG-204</div>
                      <div className="text-[10px] text-on-surface-variant uppercase">Lecture Hall 3</div>
                    </td>
                    <td className="border border-outline-variant p-4"></td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div className="p-6 bg-surface-container-low border-t border-outline-variant flex justify-end gap-3">
              <button 
                onClick={() => alert("Timetable PDF compiled and downloaded successfully.")}
                className="px-6 py-2.5 text-sm font-bold text-on-surface hover:bg-surface-container-high rounded-lg transition-colors flex items-center gap-2 cursor-pointer border border-outline-variant bg-white"
              >
                <span className="material-symbols-outlined text-lg">download</span>
                Export PDF
              </button>
              <button 
                className="px-8 py-2.5 bg-primary text-white rounded-lg text-sm font-bold institution-shadow hover:opacity-90 transition-all cursor-pointer border-none" 
                onClick={() => setTimetableModalOpen(false)}
              >
                Done
              </button>
            </div>
            
          </div>
        </div>
      )}

      {/* Goal Management Modal */}
      {goalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="modal-overlay absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setGoalModalOpen(false)}></div>
          <div className="bg-white rounded-3xl max-w-md w-full relative z-10 p-8 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            <h2 className="text-xl font-bold text-gray-800 mb-1">{editingGoal ? 'Edit Academic Goal' : 'Add New Academic Goal'}</h2>
            <p className="text-xs text-gray-400 mb-6 uppercase tracking-wider">Exam Prep Planner System</p>
            
            <form onSubmit={async (e) => {
              e.preventDefault();
              if (!goalSubject) return;
              try {
                const method = editingGoal ? 'PUT' : 'POST';
                const url = editingGoal 
                  ? `/api/student/${studentId}/goals/${editingGoal.id}`
                  : `/api/student/${studentId}/goals`;
                
                const res = await fetch(url, {
                  method,
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    subject: goalSubject,
                    progressPercent: Number(goalProgress),
                    focusArea: goalFocus
                  })
                });
                const data = await res.json();
                if (data.success) {
                  setPrepGoals(data.goals);
                  setGoalModalOpen(false);
                  setEditingGoal(null);
                  setGoalSubject('');
                  setGoalProgress(50);
                  setGoalFocus('');
                }
              } catch (err) {
                console.error("Error saving goal:", err);
              }
            }} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Subject / Area Name</label>
                <input 
                  type="text"
                  value={goalSubject}
                  onChange={(e) => setGoalSubject(e.target.value)}
                  placeholder="e.g. Theory of Computation, AI Ethics"
                  className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-red text-sm"
                  required
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-bold text-gray-400 uppercase">Preparation Progress</label>
                  <span className="text-xs font-bold text-brand-red">{goalProgress}%</span>
                </div>
                <input 
                  type="range"
                  min="0"
                  max="100"
                  value={goalProgress}
                  onChange={(e) => setGoalProgress(Number(e.target.value))}
                  className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-red"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Current Focus / Milestones Remaining</label>
                <input 
                  type="text"
                  value={goalFocus}
                  onChange={(e) => setGoalFocus(e.target.value)}
                  placeholder="e.g. 3 topics left, Study Backprop"
                  className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-red text-sm"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setGoalModalOpen(false)}
                  className="flex-1 py-3 border border-gray-200 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-50 cursor-pointer bg-white"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 bg-brand-red text-white rounded-xl font-bold text-sm hover:bg-red-800 cursor-pointer border-none"
                >
                  Save Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Digital Wallet Document Viewer Modal */}
      {walletModalOpen && selectedWalletDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="modal-overlay absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setWalletModalOpen(false)}></div>
          <div className="bg-white rounded-3xl max-w-3xl w-full relative z-10 shadow-2xl border border-gray-100 flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-gray-800">Secure Institutional Document</h2>
                <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">ID: {selectedWalletDoc.id}</p>
              </div>
              <button 
                onClick={() => setWalletModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 transition-colors border-none bg-transparent cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="flex-1 overflow-auto p-8 bg-gray-50/50" id="wallet-document-render-pane">
              {selectedWalletDoc.type === 'grade_report' && (
                <div className="bg-white p-8 border border-gray-100 rounded-2xl shadow-sm max-w-2xl mx-auto font-sans text-gray-800">
                  <div className="text-center border-b-2 border-gray-800 pb-6 mb-6">
                    <h1 className="text-2xl font-black tracking-tight uppercase">K.R. Mangalam University</h1>
                    <p className="text-xs text-gray-500 uppercase tracking-widest font-medium">Sohna Road, Gurugram, Delhi NCR</p>
                    <p className="text-sm font-black text-brand-red mt-3 uppercase tracking-wider">Semester Grade Card</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs mb-6">
                    <div>
                      <p className="font-medium text-gray-400">STUDENT NAME</p>
                      <p className="font-black text-gray-800">{student?.fullName}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-400">REGISTRATION NUMBER</p>
                      <p className="font-mono font-bold text-gray-800">{student?.enrollmentNo}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-400">ROLL NO</p>
                      <p className="font-mono font-bold text-gray-800">{student?.rollNo || '2401730018'}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-400">PROGRAM & SEMESTER</p>
                      <p className="font-bold text-gray-800">B.Tech CSE (AI & ML) - Semester IV</p>
                    </div>
                  </div>

                  <table className="w-full border-collapse text-xs mb-8">
                    <thead>
                      <tr className="bg-gray-100 font-bold border-b border-gray-300 uppercase">
                        <th className="p-3 text-left">Code</th>
                        <th className="p-3 text-left">Course Name</th>
                        <th className="p-3 text-center">Type</th>
                        <th className="p-3 text-center">Credits</th>
                        <th className="p-3 text-center">Grade</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      <tr>
                        <td className="p-3 font-mono font-bold">ENSP202</td>
                        <td className="p-3">Machine Learning</td>
                        <td className="p-3 text-center">Theory</td>
                        <td className="p-3 text-center">4.0</td>
                        <td className="p-3 text-center font-bold text-brand-red">A+</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-mono font-bold">SEC039</td>
                        <td className="p-3">R Programming for Analytics</td>
                        <td className="p-3 text-center">Theory</td>
                        <td className="p-3 text-center">3.0</td>
                        <td className="p-3 text-center font-bold text-brand-red">O</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-mono font-bold">ENCS204</td>
                        <td className="p-3">Database Management Systems</td>
                        <td className="p-3 text-center">Theory</td>
                        <td className="p-3 text-center">4.0</td>
                        <td className="p-3 text-center font-bold text-brand-red">A</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-mono font-bold">ENCS254</td>
                        <td className="p-3">DBMS Laboratory</td>
                        <td className="p-3 text-center">Lab</td>
                        <td className="p-3 text-center">1.5</td>
                        <td className="p-3 text-center font-bold text-brand-red">O</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-mono font-bold">ENSI252</td>
                        <td className="p-3">Minor Project-II</td>
                        <td className="p-3 text-center">Project</td>
                        <td className="p-3 text-center">2.0</td>
                        <td className="p-3 text-center font-bold text-brand-red">A+</td>
                      </tr>
                    </tbody>
                  </table>

                  <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-100 text-xs">
                    <div>
                      <p className="font-bold text-gray-500">Semester SGPA: <span className="font-black text-gray-800">7.09</span></p>
                      <p className="font-bold text-gray-500">Cumulative CGPA: <span className="font-black text-gray-800">7.09</span></p>
                    </div>
                    <div className="text-right text-[10px] text-gray-400">
                      <p>Issued by Office of Registrar</p>
                      <p className="font-bold text-green-600">Verification Hash: SHA-256-KRMU</p>
                    </div>
                  </div>
                </div>
              )}

              {selectedWalletDoc.type === 'fee_receipt' && (
                <div className="bg-white p-8 border border-gray-100 rounded-2xl shadow-sm max-w-2xl mx-auto font-sans text-gray-800">
                  <div className="flex justify-between items-start border-b pb-6 mb-6">
                    <div>
                      <h1 className="text-xl font-black uppercase tracking-tight">K.R. Mangalam University</h1>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">Sohna Road, Gurugram, Delhi NCR</p>
                    </div>
                    <div className="text-right">
                      <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full font-bold text-xs uppercase">Official Receipt</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs mb-6">
                    <div>
                      <p className="font-bold text-gray-400 uppercase">Receipt Number</p>
                      <p className="font-mono font-black text-gray-800">KRMU/2026-2027/00200</p>
                    </div>
                    <div>
                      <p className="font-bold text-gray-400 uppercase">Payment Date</p>
                      <p className="font-bold text-gray-800">25 June 2026</p>
                    </div>
                    <div>
                      <p className="font-bold text-gray-400 uppercase">Student Name</p>
                      <p className="font-black text-gray-800">{student?.fullName}</p>
                    </div>
                    <div>
                      <p className="font-bold text-gray-400 uppercase">Enrollment No</p>
                      <p className="font-mono font-bold text-gray-800">{student?.enrollmentNo}</p>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-xl overflow-hidden mb-6 text-xs">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-gray-100 font-bold">
                          <th className="p-3">Fee Category</th>
                          <th className="p-3 text-right">Amount (INR)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        <tr>
                          <td className="p-3 font-semibold">B.Tech CSE Semester V - Tuition & Development Fee</td>
                          <td className="p-3 text-right font-bold">145,000.00</td>
                        </tr>
                        <tr className="bg-gray-50 font-black">
                          <td className="p-3 text-right">Grand Total Paid:</td>
                          <td className="p-3 text-right text-brand-red text-sm">145,000.00</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 text-xs">
                    <p className="font-bold text-blue-800 mb-1">Transaction Details</p>
                    <p className="text-gray-600">Mode: ICICI Terminal POS Card Swipe (Card ending *5432)</p>
                    <p className="text-gray-600">Ref No: TXN-ICICI-664420199020</p>
                  </div>
                </div>
              )}

              {selectedWalletDoc.type === 'identity_card' && (
                <div className="bg-white p-8 border border-gray-100 rounded-2xl shadow-sm max-w-sm mx-auto font-sans text-gray-800">
                  <div className="bg-brand-red rounded-t-2xl p-4 text-white text-center">
                    <h2 className="text-sm font-black uppercase tracking-widest">K.R. Mangalam University</h2>
                    <p className="text-[9px] font-medium opacity-90 uppercase">Student Digital Identity Card</p>
                  </div>
                  <div className="p-6 border border-t-0 border-gray-200 rounded-b-2xl flex flex-col items-center">
                    <div className="w-24 h-24 bg-gray-100 border border-gray-200 rounded-full mb-4 flex items-center justify-center overflow-hidden">
                      <span className="material-symbols-outlined text-5xl text-gray-400">person</span>
                    </div>
                    <h3 className="text-lg font-black text-gray-800 tracking-tight text-center">{student?.fullName}</h3>
                    <p className="text-xs font-bold text-brand-red uppercase mt-1 tracking-wider">B.Tech CSE (AI & ML)</p>
                    
                    <div className="w-full text-left text-xs space-y-2 mt-6 border-t pt-4">
                      <div className="flex justify-between">
                        <span className="font-semibold text-gray-400">Enrollment No:</span>
                        <span className="font-mono font-bold text-gray-800">{student?.enrollmentNo}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-semibold text-gray-400">Admission No:</span>
                        <span className="font-mono font-bold text-gray-800">{student?.admissionNo}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-semibold text-gray-400">Session Year:</span>
                        <span className="font-bold text-gray-800">{student?.admissionYear || '2024'} - 2028</span>
                      </div>
                    </div>

                    <div className="w-full mt-6 bg-gray-100 p-3 rounded-lg flex flex-col items-center">
                      <div className="font-mono text-lg tracking-widest text-gray-700">||| | | || ||| | |||</div>
                      <p className="text-[9px] text-gray-400 uppercase tracking-widest mt-1 font-mono">{student?.enrollmentNo}</p>
                    </div>
                  </div>
                </div>
              )}

              {['other', 'medical_clearance', 'scanned_marksheet'].includes(selectedWalletDoc.type) && (
                <div className="bg-white p-12 border border-gray-100 rounded-2xl shadow-sm max-w-md mx-auto text-center font-sans text-gray-800">
                  <span className="material-symbols-outlined text-5xl text-brand-red mb-4">verified_user</span>
                  <h3 className="text-lg font-bold text-gray-800">{selectedWalletDoc.name}</h3>
                  <p className="text-xs text-gray-400 mt-1 uppercase">Digital Wallet Approved Document</p>
                  
                  <div className="my-6 p-4 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-xs text-left space-y-1">
                    <p className="text-gray-500">Document ID: <span className="font-bold text-gray-800">{selectedWalletDoc.id}</span></p>
                    <p className="text-gray-500">Registrar Status: <span className="font-bold text-green-600">APPROVED & VERIFIED</span></p>
                    <p className="text-gray-500">Synced On: <span className="font-bold text-gray-800">{selectedWalletDoc.lastUploaded}</span></p>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">This scanned document has been audited and authenticated against the university registrar databases.</p>
                </div>
              )}
            </div>

            <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
              <button 
                onClick={() => handlePrintDoc('wallet-document-render-pane', selectedWalletDoc.name)}
                className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-bold rounded-xl hover:bg-gray-100 cursor-pointer flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">print</span> Print
              </button>
              <button 
                onClick={() => handlePrintDoc('wallet-document-render-pane', selectedWalletDoc.name)}
                className="px-6 py-2.5 bg-brand-red text-white text-sm font-bold rounded-xl hover:bg-red-800 cursor-pointer border-none flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">download</span> Download PDF
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
