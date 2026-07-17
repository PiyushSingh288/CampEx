import React, { useState, useEffect } from 'react';
import Header from './Header';
import { AdminDashboardSkeleton, TableSkeleton } from './Skeletons';

interface AdminPortalProps {
  user: any;
  onLogout: () => void;
}

export default function AdminPortal({ user, onLogout }: AdminPortalProps) {
  const [activeTab, _setActiveTab] = useState<'dashboard' | 'grievances' | 'faculty' | 'services' | 'fees' | 'notifications' | 'email_center' | 'audit_logs' | 'gate_pass_mgmt'>('dashboard');
  const [tabLoading, setTabLoading] = useState(true);

  const setActiveTab = (tab: typeof activeTab) => {
    _setActiveTab(tab);
    setTabLoading(true);
    const timer = setTimeout(() => {
      setTabLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  };

  // Initial trigger
  useEffect(() => {
    setTabLoading(true);
    const timer = setTimeout(() => {
      setTabLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  // Live collections from server
  const [grievances, setGrievances] = useState<any[]>([]);
  const [facultyLeaves, setFacultyLeaves] = useState<any[]>([]);
  const [studentServices, setStudentServices] = useState<any[]>([]);
  const [feePayments, setFeePayments] = useState<any[]>([]);
  const [gatePasses, setGatePasses] = useState<any[]>([]);
  const [emails, setEmails] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);

  // Extra Admin Command Center States
  const [students, setStudents] = useState<any[]>([]);
  const [faculty, setFaculty] = useState<any[]>([]);
  const [classActivities, setClassActivities] = useState<any[]>([]);
  const [selectedFacultyHistory, setSelectedFacultyHistory] = useState<any | null>(null);

  // Modals & Action Statuses
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [showAddFacultyModal, setShowAddFacultyModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [dashboardStatusMsg, setDashboardStatusMsg] = useState<string | null>(null);

  // Form States
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentEmail, setNewStudentEmail] = useState('');
  const [newStudentProgram, setNewStudentProgram] = useState('B.Tech Computer Science & Engineering');

  const [newFacultyName, setNewFacultyName] = useState('');
  const [newFacultyEmail, setNewFacultyEmail] = useState('');
  const [newFacultyDesignation, setNewFacultyDesignation] = useState('Assistant Professor');

  // Search/Filters states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  
  // Gate Pass Specific Filter States
  const [gpSearchTerm, setGpSearchTerm] = useState('');
  const [gpStatusFilter, setGpStatusFilter] = useState('All');
  const [gpEditReturnDate, setGpEditReturnDate] = useState('');
  const [gpEditReturnTime, setGpEditReturnTime] = useState('');
  const [isEditingTime, setIsEditingTime] = useState(false);
  
  // Grievance response chat text
  const [replyText, setReplyText] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');

  // Notice composer states
  const [notifType, setNotifType] = useState('Notice');
  const [notifTitle, setNotifTitle] = useState('');
  const [notifBody, setNotifBody] = useState('');
  const [notifSender, setNotifSender] = useState('SOET Registrar General');

  // Email composer states
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [emailTemplate, setEmailTemplate] = useState('Fee Reminder');
  const [emailRecipient, setEmailRecipient] = useState('');
  const [emailScope, setEmailScope] = useState('All Students');

  // Load stats & unified databases on boot and interval
  const loadAdminData = async () => {
    try {
      const [gRes, lRes, sRes, pRes, gpRes, eRes, nRes, stRes, facRes, actRes] = await Promise.all([
        fetch('/api/grievances'),
        fetch('/api/faculty-leaves'),
        fetch('/api/student-services'),
        fetch('/api/fee-payments'),
        fetch('/api/gate-passes'),
        fetch('/api/emails'),
        fetch('/api/notifications'),
        fetch('/api/students'),
        fetch('/api/faculty'),
        fetch('/api/attendance/activity')
      ]);

      const [g, l, s, p, gp, em, n, st, fac, act] = await Promise.all([
        gRes.json(),
        lRes.json(),
        sRes.json(),
        pRes.json(),
        gpRes.json(),
        eRes.json(),
        nRes.json(),
        stRes.json(),
        facRes.json(),
        actRes.json()
      ]);

      setGrievances(g || []);
      setFacultyLeaves(l || []);
      setStudentServices(s || []);
      setFeePayments(p || []);
      setGatePasses(gp || []);
      setEmails(em || []);
      setNotifications(n || []);
      setStudents(st || []);
      setFaculty(fac || []);
      setClassActivities(act || []);
    } catch (err) {
      console.error("Error loading admin ERP databases:", err);
    }
  };

  useEffect(() => {
    loadAdminData();
    const interval = setInterval(loadAdminData, 10000);
    return () => clearInterval(interval);
  }, []);

  // Update grievance status
  const handleGrievanceAction = async (id: string, status: string, notes: string) => {
    try {
      const res = await fetch(`/api/grievances/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          actorName: 'Registrar General',
          actorRole: 'Admin',
          notes: notes || `Grievance status marked as ${status} by Dean's Office.`
        })
      });
      if (res.ok) {
        setResolutionNotes('');
        loadAdminData();
        setSelectedItem(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Reply to grievance chat
  const handleGrievanceReply = async (id: string) => {
    if (!replyText.trim()) return;
    try {
      const res = await fetch(`/api/grievances/${id}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author: 'Registrar General',
          role: 'Admin',
          text: replyText
        })
      });
      if (res.ok) {
        setReplyText('');
        const data = await res.json();
        setSelectedItem(data.grievance);
        loadAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Student Service Actions (Approve/Reject/Changes)
  const handleServiceAction = async (id: string, status: string, remarks: string) => {
    try {
      const res = await fetch(`/api/student-services/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, remarks })
      });
      if (res.ok) {
        loadAdminData();
        setSelectedItem(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Faculty Leave Action
  const handleLeaveAction = async (id: string, status: string, remarks: string) => {
    try {
      const res = await fetch(`/api/faculty-leaves/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, remarks })
      });
      if (res.ok) {
        loadAdminData();
        setSelectedItem(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Gate Pass Action
  const handleGatePassAction = async (id: string, status: string, remarks: string, returnDate?: string, returnTime?: string) => {
    try {
      const res = await fetch(`/api/gate-passes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, remarks, returnDate, returnTime })
      });
      if (res.ok) {
        loadAdminData();
        setSelectedItem(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Student Enrollment Action
  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim() || !newStudentEmail.trim()) return;
    try {
      const res = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName: newStudentName, email: newStudentEmail, program: newStudentProgram })
      });
      if (res.ok) {
        setNewStudentName('');
        setNewStudentEmail('');
        setShowAddStudentModal(false);
        setDashboardStatusMsg("Student successfully enrolled and registered into KRMU Academic Records!");
        setTimeout(() => setDashboardStatusMsg(null), 5000);
        loadAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Faculty Onboarding Action
  const handleAddFaculty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFacultyName.trim() || !newFacultyEmail.trim()) return;
    try {
      const res = await fetch('/api/faculty', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName: newFacultyName, email: newFacultyEmail, designation: newFacultyDesignation })
      });
      if (res.ok) {
        setNewFacultyName('');
        setNewFacultyEmail('');
        setShowAddFacultyModal(false);
        setDashboardStatusMsg("Faculty record created. Biometric ID and SSO account synchronized!");
        setTimeout(() => setDashboardStatusMsg(null), 5000);
        loadAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Broadcast Notice
  const handleBroadcastNotif = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifTitle.trim() || !notifBody.trim()) return;
    try {
      const res = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: notifType,
          title: notifTitle,
          body: notifBody,
          sender: notifSender
        })
      });
      if (res.ok) {
        setNotifTitle('');
        setNotifBody('');
        alert(`Announcement broadcasted successfully to all Student and Faculty dashboards!`);
        loadAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Email Send
  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailSubject.trim() || !emailBody.trim()) return;
    try {
      const res = await fetch('/api/emails/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: emailSubject,
          body: emailBody,
          template: emailTemplate,
          recipient: emailRecipient || 'All Members',
          scope: emailScope
        })
      });
      if (res.ok) {
        setEmailSubject('');
        setEmailBody('');
        setEmailRecipient('');
        alert("Official dispatches completed! Email logged into system registry.");
        loadAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Load template into email composer
  const handleApplyTemplate = (type: string) => {
    setEmailTemplate(type);
    if (type === 'Fee Reminder') {
      setEmailSubject("URGENT: Autumn Semester Academic Fee Installment Balance Alert");
      setEmailBody("Dear Student,\n\nOur accounts registry shows an outstanding balance on your term fee profile. Please clear all dues before the generation of mid-semester grade report and digital admit cards.\n\nBest Regards,\nAccounts & Finance Department\nK.R. Mangalam University");
    } else if (type === 'Exam Seating') {
      setEmailSubject("Notification: End Semester Seating Plan & Admit Card Availability");
      setEmailBody("Dear Students,\n\nThe academic registrar board has released the classroom seating arrangement for the final exams. Verify your session timings and collect your authenticated hall ticket from Block B room 211.\n\nBest Regards,\nOffice of Controller of Examinations");
    } else {
      setEmailSubject("Invitation: National Science Exhibition & TechFest 2026");
      setEmailBody("Dear Faculty and Students,\n\nWe cordially invite you to showcase your research prototypes and projects at the annual engineering symposium at the university auditorium starting this Friday.\n\nBest Regards,\nEngineering Student Welfare Cell");
    }
  };

  // Helper to trigger receipt printing
  const handlePrintDoc = (elementId: string, title: string) => {
    const content = document.getElementById(elementId)?.innerHTML;
    const win = window.open('', '_blank');
    if (win && content) {
      win.document.write(`
        <html>
          <head>
            <title>${title}</title>
            <style>
              body { font-family: sans-serif; padding: 40px; color: #333; line-height: 1.6; }
              .border { border: 1px solid #ddd; padding: 20px; border-radius: 8px; }
              .text-right { text-align: right; }
              .font-bold { font-weight: bold; }
            </style>
          </head>
          <body>${content}</body>
        </html>
      `);
      win.document.close();
      win.print();
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-800 font-sans">
      
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col flex-shrink-0 fixed h-full z-50">
        <div className="p-6 flex flex-col gap-8">
          <div className="flex items-center justify-center py-2 border-b border-gray-100 pb-4">
            <img 
              alt="K.R. Mangalam University Logo" 
              className="h-10 w-auto object-contain" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCun7sPexucqbeRn5jjWPkAqJg84aQMczqkd6g5LGHkgaalRv4E49HnsUh0U7hDRCuVrUH25hdg_G5Xeyf8kaVoiYHZzLryDpAnqQooaSloZYGWAlsnaYAi984HLzfX5u_ELsDFiAEnNt2qewoUYWic5Kn6SrWsLg2vEaUjHrKP9xbu_JVL6PoZaA_oReyHj0DngXIkjyyF3CvmD3WImuX2z4Du8wzmKdEMUXMJmkcZJT48LhyzaFx4dYuBT9NYz1-f_jzBS881O6s"
            />
          </div>
          <nav className="flex flex-col gap-1">
            <button 
              onClick={() => { setActiveTab('dashboard'); setSelectedItem(null); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-colors text-left cursor-pointer ${activeTab === 'dashboard' ? 'bg-red-50 text-brand-red font-bold' : 'text-gray-600 hover:bg-gray-50 hover:text-brand-red'}`}
            >
              <span className="material-symbols-outlined text-lg">analytics</span>
              <span className="text-sm">Governance KPI</span>
            </button>
            
            <button 
              onClick={() => { setActiveTab('grievances'); setSelectedItem(null); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-colors text-left cursor-pointer ${activeTab === 'grievances' ? 'bg-red-50 text-brand-red font-bold' : 'text-gray-600 hover:bg-gray-50 hover:text-brand-red'}`}
            >
              <span className="material-symbols-outlined text-lg">report_problem</span>
              <span className="text-sm">Grievances ({grievances.filter(g => g.status !== 'Resolved').length})</span>
            </button>

            <button 
              onClick={() => { setActiveTab('services'); setSelectedItem(null); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-colors text-left cursor-pointer ${activeTab === 'services' ? 'bg-red-50 text-brand-red font-bold' : 'text-gray-600 hover:bg-gray-50 hover:text-brand-red'}`}
            >
              <span className="material-symbols-outlined text-lg">room_service</span>
              <span className="text-sm">Student Administration ({studentServices.filter(s => s.status === 'Pending').length})</span>
            </button>

            <button 
              onClick={() => { setActiveTab('gate_pass_mgmt'); setSelectedItem(null); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-colors text-left cursor-pointer ${activeTab === 'gate_pass_mgmt' ? 'bg-red-50 text-brand-red font-bold' : 'text-gray-600 hover:bg-gray-50 hover:text-brand-red'}`}
            >
              <span className="material-symbols-outlined text-lg">door_open</span>
              <span className="text-sm">Gate Pass Management ({gatePasses.filter(g => g.status === 'Pending').length})</span>
            </button>

            <button 
              onClick={() => { setActiveTab('fees'); setSelectedItem(null); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-colors text-left cursor-pointer ${activeTab === 'fees' ? 'bg-red-50 text-brand-red font-bold' : 'text-gray-600 hover:bg-gray-50 hover:text-brand-red'}`}
            >
              <span className="material-symbols-outlined text-lg">payments</span>
              <span className="text-sm">Term Fee Records</span>
            </button>

            <button 
              onClick={() => { setActiveTab('faculty'); setSelectedItem(null); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-colors text-left cursor-pointer ${activeTab === 'faculty' ? 'bg-red-50 text-brand-red font-bold' : 'text-gray-600 hover:bg-gray-50 hover:text-brand-red'}`}
            >
              <span className="material-symbols-outlined text-lg">badge</span>
              <span className="text-sm">Faculty Leaves ({facultyLeaves.filter(l => l.status === 'Pending').length})</span>
            </button>

            <button 
              onClick={() => { setActiveTab('notifications'); setSelectedItem(null); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-colors text-left cursor-pointer ${activeTab === 'notifications' ? 'bg-red-50 text-brand-red font-bold' : 'text-gray-600 hover:bg-gray-50 hover:text-brand-red'}`}
            >
              <span className="material-symbols-outlined text-lg">campaign</span>
              <span className="text-sm">Notice Bulletin</span>
            </button>

            <button 
              onClick={() => { setActiveTab('email_center'); setSelectedItem(null); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-colors text-left cursor-pointer ${activeTab === 'email_center' ? 'bg-red-50 text-brand-red font-bold' : 'text-gray-600 hover:bg-gray-50 hover:text-brand-red'}`}
            >
              <span className="material-symbols-outlined text-lg">mail_outline</span>
              <span className="text-sm">Email Center</span>
            </button>

            <button 
              onClick={() => { setActiveTab('audit_logs'); setSelectedItem(null); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-colors text-left cursor-pointer ${activeTab === 'audit_logs' ? 'sidebar-active-indicator bg-red-50 text-brand-red font-bold' : 'text-gray-600 hover:bg-gray-50 hover:text-brand-red'}`}
            >
              <span className="material-symbols-outlined text-lg">history</span>
              <span className="text-sm">Security Log Trail</span>
            </button>
          </nav>
        </div>
        
        <div className="mt-auto p-6 border-t border-gray-100 space-y-1">
          <button 
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-red-50 text-brand-red font-bold text-sm hover:bg-red-100 transition-colors cursor-pointer border-none"
          >
            <span className="material-symbols-outlined text-sm">logout</span>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-64 flex flex-col min-h-screen">
        {/* Top Header */}
        <Header 
          role="admin" 
          user={user} 
          onLogout={onLogout} 
          activeTab={activeTab} 
          setActiveTab={setActiveTab}
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
        />

        {/* Main Canvas */}
        <div className="p-8 max-w-[1440px] mx-auto space-y-6 w-full flex-1">
          {tabLoading ? (
            activeTab === 'dashboard' ? (
              <AdminDashboardSkeleton />
            ) : (
              <TableSkeleton colsCount={6} rowsCount={7} />
            )
          ) : (
            <>
              {/* TAB 1: GOVERNANCE KPI */}
              {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-in fade-in duration-200 text-left">
              
              {/* Header section with Status message */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-black text-gray-800 tracking-tight">University Command Center</h2>
                  <p className="text-sm text-gray-500">Real-time governance dashboard, live academic tracking, and multi-module institutional approvals.</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-mono text-gray-400 bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200 inline-block">
                    SYSTEM SYNCED • LIVE UTC 2026
                  </p>
                </div>
              </div>

              {dashboardStatusMsg && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3 text-green-800 text-xs font-semibold animate-bounce shadow-sm">
                  <span className="material-symbols-outlined text-green-600">check_circle</span>
                  <span>{dashboardStatusMsg}</span>
                </div>
              )}

              {/* P. AI University Insights (New) */}
              <div className="bg-gradient-to-r from-red-50 to-amber-50 rounded-2xl border border-red-100 p-6 shadow-sm relative overflow-hidden">
                <div className="absolute right-0 top-0 h-full w-32 bg-radial-gradient from-red-200/20 to-transparent pointer-events-none"></div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-red opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-red"></span>
                  </span>
                  <h3 className="font-bold text-sm text-brand-red uppercase tracking-wider flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-lg">psychology</span>
                    Today's AI ERP Synthesis &amp; Insights
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-xs text-gray-700">
                  <div className="flex items-center gap-2.5 py-1">
                    <span className="text-brand-red font-black">•</span>
                    <span>
                      <strong>{(facultyLeaves.filter((l: any) => l.status === 'Pending').length + studentServices.filter((s: any) => s.status === 'Pending').length + gatePasses.filter((gp: any) => gp.status === 'Pending').length)} approvals</strong> require immediate administrative attention in the Approval Center.
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5 py-1">
                    <span className="text-brand-red font-black">•</span>
                    <span>
                      <strong>{grievances.filter((g: any) => g.priority === 'Critical' && g.status !== 'Resolved').length} critical grievances</strong> remain unresolved at the registrar level.
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5 py-1">
                    <span className="text-brand-red font-black">•</span>
                    <span>
                      <strong>24 students</strong> have pending autumn semester dues. Late fine calculations synchronized.
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5 py-1">
                    <span className="text-brand-red font-black">•</span>
                    <span>
                      <strong>{38 + (classActivities.filter((c: any) => c.status === 'Uploaded').length - 1)} of 44 classes</strong> have finalized and uploaded today's attendance sheets.
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5 py-1">
                    <span className="text-brand-red font-black">•</span>
                    <span>
                      Faculty attendance compliance average is stabilized at <strong>94%</strong>.
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5 py-1">
                    <span className="text-brand-red font-black">•</span>
                    <span>
                      National Placement Drive for SOET Block B candidates commences <strong>tomorrow morning</strong>.
                    </span>
                  </div>
                </div>
              </div>

              {/* A. University Overview Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                
                <div 
                  onClick={() => setActiveTab('services')}
                  className="precision-card p-6 rounded-2xl bg-white border border-gray-150 shadow-sm hover:shadow-md hover:border-blue-300 transition-all cursor-pointer text-left group"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Total Active Students</span>
                    <span className="material-symbols-outlined text-blue-500 bg-blue-50 p-1.5 rounded-lg text-lg group-hover:scale-110 transition-transform">group</span>
                  </div>
                  <p className="text-3xl font-black text-gray-850 mt-1">
                    {students.length > 0 ? 1420 + students.length : 1422}
                  </p>
                  <div className="flex items-center gap-1.5 mt-2 text-xs text-blue-600 font-semibold">
                    <span className="material-symbols-outlined text-sm font-black">trending_up</span>
                    <span>+4.2% vs last semester</span>
                  </div>
                </div>

                <div 
                  onClick={() => setActiveTab('faculty')}
                  className="precision-card p-6 rounded-2xl bg-white border border-gray-150 shadow-sm hover:shadow-md hover:border-green-300 transition-all cursor-pointer text-left group"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Active Faculty</span>
                    <span className="material-symbols-outlined text-green-500 bg-green-50 p-1.5 rounded-lg text-lg group-hover:scale-110 transition-transform">badge</span>
                  </div>
                  <p className="text-3xl font-black text-gray-850 mt-1">
                    {faculty.length > 0 ? 120 + faculty.length : 124}
                  </p>
                  <div className="flex items-center gap-1.5 mt-2 text-xs text-green-600 font-semibold">
                    <span className="material-symbols-outlined text-sm font-black">trending_up</span>
                    <span>+2.4% vs last year</span>
                  </div>
                </div>

                <a 
                  href="#approval-center-section"
                  className="precision-card p-6 rounded-2xl bg-white border border-gray-150 shadow-sm hover:shadow-md hover:border-amber-300 transition-all cursor-pointer text-left group block animate-pulse hover:animate-none"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Pending Approvals</span>
                    <span className="material-symbols-outlined text-amber-500 bg-amber-50 p-1.5 rounded-lg text-lg group-hover:scale-110 transition-transform">pending_actions</span>
                  </div>
                  <p className="text-3xl font-black text-gray-850 mt-1">
                    {(facultyLeaves.filter((l: any) => l.status === 'Pending').length + studentServices.filter((s: any) => s.status === 'Pending').length + gatePasses.filter((gp: any) => gp.status === 'Pending').length)}
                  </p>
                  <div className="flex items-center gap-1.5 mt-2 text-xs text-amber-600 font-semibold">
                    <span className="material-symbols-outlined text-sm font-black">hourglass_empty</span>
                    <span>Requires attention</span>
                  </div>
                </a>

                <div 
                  onClick={() => setActiveTab('grievances')}
                  className="precision-card p-6 rounded-2xl bg-white border border-gray-150 shadow-sm hover:shadow-md hover:border-red-300 transition-all cursor-pointer text-left group"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Critical Alerts</span>
                    <span className="material-symbols-outlined text-brand-red bg-red-50 p-1.5 rounded-lg text-lg group-hover:scale-110 transition-transform">warning</span>
                  </div>
                  <p className="text-3xl font-black text-brand-red mt-1">
                    {grievances.filter((g: any) => g.priority === 'Critical' && g.status !== 'Resolved').length + classActivities.filter((c: any) => c.status === 'Missing Upload').length}
                  </p>
                  <div className="flex items-center gap-1.5 mt-2 text-xs text-brand-red font-semibold">
                    <span className="material-symbols-outlined text-sm font-black">gavel</span>
                    <span>Immediate response needed</span>
                  </div>
                </div>

              </div>

              {/* O. Quick Actions Grid */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <h3 className="font-bold text-sm text-gray-700 mb-4 uppercase tracking-wider flex items-center gap-2">
                  <span className="material-symbols-outlined text-gray-500">bolt</span>
                  Governance Quick Actions
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
                  <button 
                    onClick={() => setActiveTab('notifications')}
                    className="flex flex-col items-center justify-center p-3 rounded-xl border border-gray-150 hover:bg-red-50 hover:border-brand-red text-center transition-all cursor-pointer text-gray-600 hover:text-brand-red group"
                  >
                    <span className="material-symbols-outlined text-xl mb-1 group-hover:scale-110 transition-transform">campaign</span>
                    <span className="text-[10px] font-bold">Create Notice</span>
                  </button>

                  <button 
                    onClick={() => {
                      setEmailTemplate('Fee Reminder');
                      handleApplyTemplate('Fee Reminder');
                      setActiveTab('email_center');
                    }}
                    className="flex flex-col items-center justify-center p-3 rounded-xl border border-gray-150 hover:bg-blue-50 hover:border-blue-400 text-center transition-all cursor-pointer text-gray-600 hover:text-blue-600 group"
                  >
                    <span className="material-symbols-outlined text-xl mb-1 group-hover:scale-110 transition-transform">payments</span>
                    <span className="text-[10px] font-bold">Fee Reminder</span>
                  </button>

                  <button 
                    onClick={() => {
                      setEmailTemplate('Exam Seating');
                      handleApplyTemplate('Exam Seating');
                      setActiveTab('email_center');
                    }}
                    className="flex flex-col items-center justify-center p-3 rounded-xl border border-gray-150 hover:bg-indigo-50 hover:border-indigo-400 text-center transition-all cursor-pointer text-gray-600 hover:text-indigo-600 group"
                  >
                    <span className="material-symbols-outlined text-xl mb-1 group-hover:scale-110 transition-transform">event_seat</span>
                    <span className="text-[10px] font-bold">Seating Mail</span>
                  </button>

                  <button 
                    onClick={() => setShowAddStudentModal(true)}
                    className="flex flex-col items-center justify-center p-3 rounded-xl border border-gray-150 hover:bg-green-50 hover:border-green-400 text-center transition-all cursor-pointer text-gray-600 hover:text-green-600 group"
                  >
                    <span className="material-symbols-outlined text-xl mb-1 group-hover:scale-110 transition-transform">person_add</span>
                    <span className="text-[10px] font-bold">Add Student</span>
                  </button>

                  <button 
                    onClick={() => setShowAddFacultyModal(true)}
                    className="flex flex-col items-center justify-center p-3 rounded-xl border border-gray-150 hover:bg-purple-50 hover:border-purple-400 text-center transition-all cursor-pointer text-gray-600 hover:text-purple-600 group"
                  >
                    <span className="material-symbols-outlined text-xl mb-1 group-hover:scale-110 transition-transform">group_add</span>
                    <span className="text-[10px] font-bold">Add Faculty</span>
                  </button>

                  <button 
                    onClick={() => {
                      setDashboardStatusMsg("Generating daily performance dispatch. Report compiled in background...");
                      setTimeout(() => {
                        setShowReportModal(true);
                        setDashboardStatusMsg(null);
                      }, 1000);
                    }}
                    className="flex flex-col items-center justify-center p-3 rounded-xl border border-gray-150 hover:bg-amber-50 hover:border-amber-400 text-center transition-all cursor-pointer text-gray-600 hover:text-amber-600 group"
                  >
                    <span className="material-symbols-outlined text-xl mb-1 group-hover:scale-110 transition-transform">article</span>
                    <span className="text-[10px] font-bold">Daily Report</span>
                  </button>

                  <button 
                    onClick={() => {
                      setDashboardStatusMsg("Automated backup synchronization triggered. Synced 3,842 tables.");
                      setTimeout(() => setDashboardStatusMsg(null), 4000);
                    }}
                    className="flex flex-col items-center justify-center p-3 rounded-xl border border-gray-150 hover:bg-emerald-50 hover:border-emerald-400 text-center transition-all cursor-pointer text-gray-600 hover:text-emerald-600 group"
                  >
                    <span className="material-symbols-outlined text-xl mb-1 group-hover:scale-110 transition-transform">backup</span>
                    <span className="text-[10px] font-bold">Backup Database</span>
                  </button>

                  <button 
                    onClick={() => {
                      setDashboardStatusMsg("Exporting institutional ERP analytical tables to XLSX. Download triggered.");
                      setTimeout(() => setDashboardStatusMsg(null), 4000);
                    }}
                    className="flex flex-col items-center justify-center p-3 rounded-xl border border-gray-150 hover:bg-teal-50 hover:border-teal-400 text-center transition-all cursor-pointer text-gray-600 hover:text-teal-600 group"
                  >
                    <span className="material-symbols-outlined text-xl mb-1 group-hover:scale-110 transition-transform">analytics</span>
                    <span className="text-[10px] font-bold">Export Analytics</span>
                  </button>
                </div>
              </div>

              {/* TWO COLUMN GRID: TODAY'S APPROVAL CENTER & ATTENDANCE PANEL */}
              <div id="approval-center-section" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* B. Today's Approval Center (Largest Section) */}
                <div className="lg:col-span-8 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
                  <div className="flex justify-between items-center border-b pb-3 border-gray-100">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-amber-500 font-black">gavel</span>
                      <h3 className="font-bold text-base text-gray-800">Today's Administrative Approval Center</h3>
                    </div>
                    <span className="text-xs bg-red-50 text-brand-red px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
                      {(facultyLeaves.filter((l: any) => l.status === 'Pending').length + studentServices.filter((s: any) => s.status === 'Pending').length + gatePasses.filter((gp: any) => gp.status === 'Pending').length)} Pending
                    </span>
                  </div>

                  <div className="space-y-4 max-h-[550px] overflow-y-auto pr-1">
                    {[
                      ...studentServices.filter((s: any) => s.status === 'Pending').map((s: any) => ({
                        id: s.id,
                        name: s.studentName,
                        identifier: s.rollNumber || 'N/A',
                        type: `Student Service: ${s.type}`,
                        module: 'student-service',
                        priority: s.type === 'Refund' || s.type === 'Scholarship Status' ? 'High' : 'Medium',
                        details: s.details,
                        raw: s
                      })),
                      ...facultyLeaves.filter((l: any) => l.status === 'Pending').map((l: any) => ({
                        id: l.id,
                        name: l.facultyName,
                        identifier: l.employeeId || l.id,
                        type: `Faculty Leave: ${l.leaveType} (${l.days} days)`,
                        module: 'faculty-leave',
                        priority: 'Critical',
                        details: l.reason,
                        raw: l
                      })),
                      ...gatePasses.filter((gp: any) => gp.status === 'Pending').map((gp: any) => ({
                        id: gp.id,
                        name: gp.studentName,
                        identifier: gp.rollNo || 'N/A',
                        type: `Gate Pass & Hostel Leave`,
                        module: 'gate-pass',
                        priority: 'High',
                        details: gp.reason,
                        raw: gp
                      }))
                    ].length === 0 ? (
                      <div className="py-12 text-center text-gray-400 flex flex-col items-center justify-center gap-2">
                        <span className="material-symbols-outlined text-4xl text-gray-300">verified</span>
                        <p className="text-sm font-semibold">All approvals completed! Registrar tray is clear.</p>
                      </div>
                    ) : (
                      [
                        ...studentServices.filter((s: any) => s.status === 'Pending').map((s: any) => ({
                          id: s.id,
                          name: s.studentName,
                          identifier: s.rollNumber || 'N/A',
                          type: s.type,
                          category: 'Student Service',
                          module: 'student-service',
                          priority: s.type === 'Refund' || s.type === 'Scholarship Status' ? 'High' : 'Medium',
                          details: s.details,
                          time: 'Today'
                        })),
                        ...facultyLeaves.filter((l: any) => l.status === 'Pending').map((l: any) => ({
                          id: l.id,
                          name: l.facultyName,
                          identifier: l.id || 'N/A',
                          type: l.leaveType,
                          category: 'Faculty Leave',
                          module: 'faculty-leave',
                          priority: 'Critical',
                          details: l.reason,
                          time: 'Just now'
                        })),
                        ...gatePasses.filter((gp: any) => gp.status === 'Pending').map((gp: any) => ({
                          id: gp.id,
                          name: gp.studentName,
                          identifier: gp.rollNo || 'N/A',
                          type: 'Gate Pass / Leave',
                          category: 'Gate Pass',
                          module: 'gate-pass',
                          priority: 'High',
                          details: gp.reason,
                          time: 'Today'
                        }))
                      ].map((req: any) => (
                        <div key={req.id} className="p-4 bg-gray-50 border border-gray-150 rounded-xl text-left space-y-3 relative hover:shadow-sm transition-all">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="text-[10px] font-black uppercase text-gray-400 bg-gray-200 px-2 py-0.5 rounded mr-2">{req.category}</span>
                              <span className="text-[10px] font-mono text-gray-400">ID: {req.id}</span>
                            </div>
                            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                              req.priority === 'Critical' ? 'bg-red-50 text-brand-red border border-red-100' :
                              req.priority === 'High' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                              'bg-blue-50 text-blue-700'
                            }`}>
                              {req.priority}
                            </span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 border-t border-b border-gray-150 py-2.5">
                            <div>
                              <p className="text-xs font-black text-gray-800">{req.name}</p>
                              <p className="text-[11px] text-gray-400">Roll/Emp ID: <span className="font-semibold">{req.identifier}</span></p>
                            </div>
                            <div>
                              <p className="text-xs font-black text-gray-800">{req.type}</p>
                              <p className="text-[11px] text-gray-400">Submission: <span className="font-semibold">{req.time}</span></p>
                            </div>
                          </div>
                          <div>
                            <p className="text-[11px] text-gray-500 italic">" {req.details} "</p>
                          </div>
                          <div className="flex gap-2 justify-end pt-1">
                            <button 
                              onClick={() => {
                                if (req.module === 'student-service') {
                                  handleServiceAction(req.id, 'Rejected', 'Rejected by Registrar Board.');
                                } else if (req.module === 'faculty-leave') {
                                  handleLeaveAction(req.id, 'Rejected', 'Rejected by Dean Office.');
                                } else if (req.module === 'gate-pass') {
                                  handleGatePassAction(req.id, 'Rejected', 'Rejected by Registrar Board.');
                                }
                                setDashboardStatusMsg(`Request ${req.id} rejected.`);
                                setTimeout(() => setDashboardStatusMsg(null), 4000);
                              }}
                              className="px-4 py-2 border border-red-250 hover:bg-red-50 text-brand-red text-xs font-bold rounded-xl cursor-pointer"
                            >
                              Reject
                            </button>
                            <button 
                              onClick={() => {
                                if (req.module === 'student-service') {
                                  handleServiceAction(req.id, 'Approved', 'Approved by Registrar Board.');
                                } else if (req.module === 'faculty-leave') {
                                  handleLeaveAction(req.id, 'Approved', 'Approved by Dean Office.');
                                } else if (req.module === 'gate-pass') {
                                  handleGatePassAction(req.id, 'Approved', 'Approved by Registrar Board.');
                                }
                                setDashboardStatusMsg(`Request ${req.id} approved successfully.`);
                                setTimeout(() => setDashboardStatusMsg(null), 4000);
                              }}
                              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-xl border-none cursor-pointer"
                            >
                              Approve
                            </button>
                            <button 
                              onClick={() => {
                                if (req.module === 'student-service') {
                                  setActiveTab('services');
                                  setSelectedItem(studentServices.find(s => s.id === req.id));
                                } else if (req.module === 'faculty-leave') {
                                  setActiveTab('faculty');
                                  setSelectedItem(facultyLeaves.find(l => l.id === req.id));
                                } else if (req.module === 'gate-pass') {
                                  setActiveTab('gate_pass_mgmt');
                                  setSelectedItem(gatePasses.find(g => g.id === req.id));
                                }
                              }}
                              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-bold rounded-xl border-none cursor-pointer"
                            >
                              View Details
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Right Column: Attendance & Compliance */}
                <div className="lg:col-span-4 space-y-6">
                  
                  {/* C. Live Attendance Monitoring & D. Progress bar */}
                  <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4 text-left">
                    <div className="flex justify-between items-center border-b pb-3 border-gray-100">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-green-600">how_to_reg</span>
                        <h4 className="font-bold text-sm text-gray-800">Class Attendance Uploads</h4>
                      </div>
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                      </span>
                    </div>

                    {/* D. Attendance Completion Progress */}
                    <div className="bg-gray-50 border border-gray-150 rounded-xl p-4 text-left space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-black text-gray-700">Today's Progress</span>
                        <span className="text-xs font-black text-brand-red">
                          {38 + (classActivities.filter((c: any) => c.status === 'Uploaded').length - 1)} of 44 Classes Uploaded
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-brand-red h-full transition-all duration-500" 
                          style={{ width: `${Math.round(((38 + (classActivities.filter((c: any) => c.status === 'Uploaded').length - 1)) / 44) * 100)}%` }}
                        ></div>
                      </div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">
                        {Math.round(((38 + (classActivities.filter((c: any) => c.status === 'Uploaded').length - 1)) / 44) * 100)}% SYSTEM ATTENDANCE INDEX
                      </p>
                    </div>

                    {/* Today's Class Activity List */}
                    <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                      {classActivities.map((act: any) => (
                        <div key={act.id} className="p-3 bg-gray-50 border border-gray-150 rounded-xl text-xs space-y-1.5 hover:bg-gray-100/50 transition-colors">
                          <div className="flex justify-between items-center">
                            <span className="font-mono text-[10px] text-gray-400">{act.time}</span>
                            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                              act.status === 'Uploaded' ? 'bg-green-50 text-green-700' :
                              act.status === 'Pending Upload' ? 'bg-amber-50 text-amber-700' :
                              act.status === 'Missing Upload' ? 'bg-red-50 text-brand-red' :
                              act.status === 'Ongoing' ? 'bg-indigo-50 text-indigo-700 animate-pulse' :
                              'bg-gray-100 text-gray-500'
                            }`}>
                              {act.status}
                            </span>
                          </div>
                          <div>
                            <h5 className="font-bold text-gray-800 line-clamp-1">{act.subject}</h5>
                            <p className="text-[10px] text-gray-500 flex justify-between mt-0.5">
                              <span>Sec: <span className="font-semibold text-gray-700">{act.section}</span></span>
                              <span>By: <span className="font-semibold text-gray-700">{act.faculty}</span></span>
                            </p>
                          </div>
                          {act.status === 'Uploaded' && (
                            <div className="text-[10px] text-gray-400 flex justify-between border-t pt-1.5 border-gray-150">
                              <span className="text-green-600 font-bold">✓ {act.present} / {(act.present + act.absent)} Present</span>
                              <span>Synced: {act.uploadTime}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* E. Faculty Attendance Compliance */}
                  <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4 text-left">
                    <div className="flex items-center gap-2 border-b pb-3 border-gray-100">
                      <span className="material-symbols-outlined text-indigo-500">military_tech</span>
                      <h4 className="font-bold text-sm text-gray-800">Faculty Upload Compliance</h4>
                    </div>
                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Click faculty to view histories</p>
                    <div className="space-y-3">
                      {[
                        { name: 'Dr. Elena Vance', dept: 'CSE Department', compliance: 100, color: 'bg-green-500', bio: 'Specialist in Distributed Systems' },
                        { name: 'Dr. Sarah Jenkins', dept: 'CSE Department', compliance: 98, color: 'bg-blue-500', bio: 'AI Research Lead' },
                        { name: 'Dr. Amit Shah', dept: 'CSE Department', compliance: 94, color: 'bg-indigo-500', bio: 'Networks Instructor' },
                        { name: 'Dr. Robert Chen', dept: 'CSE Department', compliance: 82, color: 'bg-amber-500', bio: 'Cyber Security Expert' }
                      ].map((fac: any) => (
                        <div 
                          key={fac.name} 
                          onClick={() => setSelectedFacultyHistory(fac)}
                          className="p-3 border border-gray-150 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer text-left"
                        >
                          <div className="flex justify-between items-center mb-1">
                            <div>
                              <h5 className="font-bold text-xs text-gray-800">{fac.name}</h5>
                              <p className="text-[10px] text-gray-400">{fac.dept}</p>
                            </div>
                            <span className="text-xs font-black text-gray-700">{fac.compliance}%</span>
                          </div>
                          <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                            <div className={`${fac.color} h-full`} style={{ width: `${fac.compliance}%` }}></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </div>

              {/* DENSE BENTO-LIKE SUB GRID: PORTAL STATS */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {/* H. Student Requests Summary */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4 text-left flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-gray-700 border-b pb-2 border-gray-100 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-blue-600 text-lg">room_service</span>
                      Student Requests Registry
                    </h4>
                    <p className="text-xs text-gray-400 mb-4">Click counts to access dedicated service workflows</p>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: 'Bonafide', count: studentServices.filter((s: any) => s.type === 'Bonafide').length, icon: 'assignment' },
                        { label: 'Scholarship', count: studentServices.filter((s: any) => s.type.includes('Scholarship')).length, icon: 'school' },
                        { label: 'Hostel Leave', count: gatePasses.length, icon: 'apartment' },
                        { label: 'Bus Pass', count: studentServices.filter((s: any) => s.type.includes('Bus')).length, icon: 'directions_bus' },
                        { label: 'ID Card', count: studentServices.filter((s: any) => s.type.includes('ID')).length, icon: 'badge' },
                        { label: 'Gate Pass', count: gatePasses.filter((g: any) => g.status === 'Approved').length, icon: 'door_open' },
                        { label: 'Refund Dues', count: studentServices.filter((s: any) => s.type.includes('Refund')).length, icon: 'currency_exchange' }
                      ].map(item => (
                        <div 
                          key={item.label}
                          onClick={() => setActiveTab('services')}
                          className="p-3 bg-gray-50 border border-gray-150 hover:border-blue-400 transition-colors rounded-xl cursor-pointer flex justify-between items-center"
                        >
                          <div>
                            <p className="text-[10px] text-gray-400 uppercase font-bold">{item.label}</p>
                            <p className="text-lg font-black text-gray-800 mt-0.5">{item.count}</p>
                          </div>
                          <span className="material-symbols-outlined text-blue-500 text-lg bg-blue-50/50 p-1 rounded-md">{item.icon}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* I. Faculty & Academic Summary */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4 text-left">
                  <h4 className="font-bold text-sm text-gray-700 border-b pb-2 border-gray-100 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-amber-500 text-lg">school</span>
                    Faculty &amp; Academic Logs
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100 text-xs">
                      <span className="text-gray-500 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-gray-400 text-base">flight_takeoff</span>
                        Faculty On Approved Leave
                      </span>
                      <span className="font-bold text-gray-800">
                        {facultyLeaves.filter((l: any) => l.status === 'Approved').length} Leaves
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100 text-xs">
                      <span className="text-gray-500 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-gray-400 text-base">hourglass_empty</span>
                        Pending Leave Requests
                      </span>
                      <span className="font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                        {facultyLeaves.filter((l: any) => l.status === 'Pending').length} Pending
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100 text-xs">
                      <span className="text-gray-500 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-gray-400 text-base">work_history</span>
                        OD (On-Duty) Requests
                      </span>
                      <span className="font-bold text-gray-800">2 Requests</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100 text-xs">
                      <span className="text-gray-500 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-gray-400 text-base">task_alt</span>
                        Lectures Delivered Today
                      </span>
                      <span className="font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded">
                        {classActivities.filter((c: any) => c.status === 'Uploaded').length} Classes
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 text-xs">
                      <span className="text-gray-500 flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-gray-400 text-base">report</span>
                        Attendance Pending Upload
                      </span>
                      <span className="font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">
                        {classActivities.filter((c: any) => c.status === 'Pending Upload' || c.status === 'Missing Upload').length} Pending
                      </span>
                    </div>
                  </div>
                </div>

                {/* J. Financial Snapshot */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4 text-left flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-gray-700 border-b pb-2 border-gray-100 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-emerald-600 text-lg">payments</span>
                      Institutional Financial Books
                    </h4>
                    <p className="text-xs text-gray-400 mb-4">Real-time tuition fees receipts balances</p>
                    <div className="space-y-2.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-500">Today's Fee Collection</span>
                        <span className="font-bold text-gray-800">₹ 1,25,000</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-500">Monthly Dues Cleared</span>
                        <span className="font-bold text-emerald-600">₹ 18,45,000</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-500">Pending Tuition Balance</span>
                        <span className="font-bold text-brand-red bg-red-50 px-2 py-0.5 rounded">
                          ₹ {feePayments.reduce((acc, curr) => acc + (curr.outstandingFees || 0), 0) + 400000}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-500">Refund Claims</span>
                        <span className="font-bold text-gray-800">
                          {studentServices.filter((s: any) => s.type === 'Refund').length} Applications
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-500">Late Fines Collected</span>
                        <span className="font-bold text-gray-800">₹ 12,500</span>
                      </div>
                    </div>
                  </div>
                  <div className="border-t border-gray-100 pt-3 flex justify-between items-center text-[10px] text-gray-400 uppercase font-black">
                    <span>Revenue Trend</span>
                    <span className="text-green-600 font-bold flex items-center gap-0.5">
                      <span className="material-symbols-outlined text-sm">trending_up</span>
                      +8.4% YoY
                    </span>
                  </div>
                </div>

              </div>

              {/* SECOND BENTO SUB GRID: GRIEVANCES & CAMPUS HEALTH & NOTICE PREVIEW */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* K. Grievance Snapshot */}
                <div 
                  onClick={() => setActiveTab('grievances')}
                  className="lg:col-span-4 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4 text-left hover:border-red-300 transition-colors cursor-pointer group flex flex-col justify-between"
                >
                  <div>
                    <h4 className="font-bold text-sm text-gray-700 border-b pb-2 border-gray-100 flex items-center gap-1.5 group-hover:text-brand-red transition-colors">
                      <span className="material-symbols-outlined text-brand-red text-lg">gavel</span>
                      Grievance Snapshot
                    </h4>
                    <p className="text-[10px] text-gray-400 uppercase font-bold mb-4 font-sans">Centralized Student Grievance Desk</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-red-50/40 rounded-xl border border-red-100">
                        <p className="text-[10px] text-gray-400 font-bold uppercase font-sans">Critical</p>
                        <p className="text-xl font-black text-brand-red mt-1">
                          {grievances.filter((g: any) => g.priority === 'Critical' && g.status !== 'Resolved').length} Active
                        </p>
                      </div>
                      <div className="p-3 bg-amber-50/40 rounded-xl border border-amber-100">
                        <p className="text-[10px] text-gray-400 font-bold uppercase font-sans">Pending</p>
                        <p className="text-xl font-black text-amber-700 mt-1">
                          {grievances.filter((g: any) => g.status !== 'Resolved').length} Total
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2 mt-4 text-xs">
                      <div className="flex justify-between py-1 border-b border-gray-50">
                        <span className="text-gray-500">Resolved Today</span>
                        <span className="font-bold text-green-700">{grievances.filter((g: any) => g.status === 'Resolved').length} cases</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-gray-50">
                        <span className="text-gray-500">Average Resolution</span>
                        <span className="font-bold text-gray-800">14 Hours</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-gray-500 font-bold text-brand-red flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm animate-pulse">crisis_alert</span>
                          Oldest Pending Case
                        </span>
                        <span className="font-mono font-bold text-gray-700">#GR-102</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-400 font-bold text-right pt-2 border-t border-gray-100">Click to open Redressal module →</p>
                </div>

                {/* G. Gate Pass Overview & Security Command */}
                <div 
                  onClick={() => setActiveTab('gate_pass_mgmt')}
                  className="lg:col-span-4 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4 text-left hover:border-blue-400 transition-colors cursor-pointer group flex flex-col justify-between"
                >
                  <div>
                    <h4 className="font-bold text-sm text-gray-700 border-b pb-2 border-gray-100 flex items-center gap-1.5 group-hover:text-brand-red transition-colors">
                      <span className="material-symbols-outlined text-blue-500 text-lg">door_open</span>
                      Gate Pass Live Registry
                    </h4>
                    <p className="text-[10px] text-gray-400 uppercase font-bold mb-4 font-sans font-black">Active Student Transit Controls</p>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-2 border-b border-gray-50 text-xs">
                        <span className="text-gray-500 flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                          Pending Approvals
                        </span>
                        <span className="font-bold text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full text-[10px]">
                          {gatePasses.filter((g: any) => g.status === 'Pending').length} Pending
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-50 text-xs">
                        <span className="text-gray-500 flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-green-500"></span>
                          Approved Today
                        </span>
                        <span className="font-bold text-green-700 bg-green-50 px-2.5 py-0.5 rounded-full text-[10px]">
                          {gatePasses.filter((g: any) => g.status === 'Approved').length} Approved
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-50 text-xs">
                        <span className="text-gray-500 flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                          Students Currently Outside
                        </span>
                        <span className="font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full text-[10px]">
                          {gatePasses.filter((g: any) => g.status === 'Outside').length} Outside
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-50 text-xs">
                        <span className="text-gray-500 flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-gray-500"></span>
                          Returned Today
                        </span>
                        <span className="font-bold text-gray-700 bg-gray-100 px-2.5 py-0.5 rounded-full text-[10px]">
                          {gatePasses.filter((g: any) => g.status === 'Returned').length} Returned
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 text-xs">
                        <span className="text-gray-500 flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
                          Overdue Returns
                        </span>
                        <span className="font-bold text-brand-red bg-red-50 px-2.5 py-0.5 rounded-full text-[10px]">
                          {gatePasses.filter((g: any) => g.status === 'Overdue').length} Overdue
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-400 font-bold text-right pt-2 border-t border-gray-100">Click to open Gate Pass module →</p>
                </div>

                {/* L. Notice Center Preview */}
                <div 
                  onClick={() => setActiveTab('notifications')}
                  className="lg:col-span-4 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4 text-left hover:border-red-300 transition-colors cursor-pointer group flex flex-col justify-between"
                >
                  <div>
                    <h4 className="font-bold text-sm text-gray-700 border-b pb-2 border-gray-100 flex items-center gap-1.5 group-hover:text-brand-red transition-colors">
                      <span className="material-symbols-outlined text-indigo-500 text-lg">campaign</span>
                      Notice Bulletin Board
                    </h4>
                    <p className="text-[10px] text-gray-400 uppercase font-bold mb-4 font-sans">Latest published announcements</p>
                    <div className="space-y-3">
                      {notifications.slice(0, 2).map((notif: any, index: number) => (
                        <div key={notif.id || index} className="p-3 bg-gray-50 border border-gray-150 rounded-xl space-y-1">
                          <div className="flex justify-between text-[9px] text-indigo-700 font-black uppercase">
                            <span>{notif.type}</span>
                            <span className="text-gray-400 font-normal">{notif.date ? new Date(notif.date).toLocaleDateString() : 'Today'}</span>
                          </div>
                          <h5 className="font-bold text-xs text-gray-800 line-clamp-1">{notif.title}</h5>
                          <p className="text-[10px] text-gray-400 flex justify-between pt-1 border-t border-gray-100 mt-1">
                            <span>Broadcast: <span className="font-bold text-green-600">Dispatched</span></span>
                            <span>Read count: {notif.readBy?.length || 2}</span>
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-400 font-bold text-right pt-2 border-t border-gray-150">Click to compose announcement →</p>
                </div>

              </div>

              {/* THREE COLUMN DETAILS ROW: EMAIL PREVIEW & EVENTS TIMELINE & LIVE NOTIFICATIONS */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* M. Email Center Preview */}
                <div 
                  onClick={() => setActiveTab('email_center')}
                  className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm text-left hover:border-red-300 transition-colors cursor-pointer group flex flex-col justify-between"
                >
                  <div>
                    <h4 className="font-bold text-sm text-gray-700 border-b pb-2 border-gray-100 flex items-center gap-1.5 group-hover:text-brand-red transition-colors">
                      <span className="material-symbols-outlined text-teal-600 text-lg">mail_outline</span>
                      Official Email Registry
                    </h4>
                    <p className="text-[10px] text-gray-400 uppercase font-bold mb-4 font-sans">Last dispatches &amp; schedulers</p>
                    
                    <div className="space-y-2.5 text-xs">
                      {emails.slice(0, 3).map((em: any, idx: number) => (
                        <div key={em.id || idx} className="py-1.5 border-b border-gray-50 space-y-0.5">
                          <p className="font-bold text-gray-800 truncate">{em.subject}</p>
                          <div className="flex justify-between text-[10px] text-gray-400">
                            <span>Scope: {em.scope}</span>
                            <span className="text-green-600 font-semibold font-mono">Dispatched</span>
                          </div>
                        </div>
                      ))}
                      <div className="py-1 text-[10px] text-gray-400 flex justify-between border-t border-gray-100 mt-2">
                        <span>Scheduled Reminders: <span className="font-bold text-gray-700 font-sans">4 Pending</span></span>
                        <span>Queue: Sync Active</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-400 font-bold text-right pt-2 border-t border-gray-100 mt-2">Access email dispatch center →</p>
                </div>

                {/* N. Upcoming University Events */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm text-left flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-gray-700 border-b pb-2 border-gray-100 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-purple-600 text-lg">event_upcoming</span>
                      Institutional Events
                    </h4>
                    <p className="text-[10px] text-gray-400 uppercase font-bold mb-4 font-sans">Official ERP Academic Calendar</p>
                    
                    <div className="space-y-3">
                      {[
                        { title: 'Autumn Mid Semester Exams', date: 'July 10, 2026', badge: 'Examination' },
                        { title: 'Block B Placement Drive', date: 'July 06, 2026', badge: 'Placement' },
                        { title: 'National IoT Hackathon 2026', date: 'July 18, 2026', badge: 'Hackathon' },
                        { title: 'Orientation & Sports Meet', date: 'August 02, 2026', badge: 'Event' }
                      ].map(ev => (
                        <div key={ev.title} className="text-xs flex gap-3 items-start">
                          <span className="bg-purple-50 text-purple-700 font-black text-[8px] uppercase tracking-wide px-2 py-0.5 rounded flex-shrink-0 mt-0.5">
                            {ev.badge}
                          </span>
                          <div>
                            <p className="font-bold text-gray-850 leading-tight">{ev.title}</p>
                            <p className="text-[10px] text-gray-400 mt-0.5">{ev.date}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-400 font-bold text-right pt-2 border-t border-gray-100 mt-2">View complete academic calendar</p>
                </div>

                {/* Q. Live Notifications Broadcast */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm text-left flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-gray-700 border-b pb-2 border-gray-100 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-indigo-600 text-lg">notifications_active</span>
                      Live Dashboard Broadcasts
                    </h4>
                    <p className="text-[10px] text-gray-400 uppercase font-bold mb-4 font-sans">Live student &amp; faculty alerts feed</p>
                    
                    <div className="space-y-3 overflow-y-auto max-h-[220px]">
                      {notifications.slice(0, 3).map((n: any, idx: number) => (
                        <div key={n.id || idx} className="text-xs space-y-1 border-l-2 border-indigo-500 pl-3 py-0.5">
                          <div className="flex justify-between items-center text-[10px] text-gray-400">
                            <span className="font-bold text-gray-700">{n.sender}</span>
                            <span>{n.date ? new Date(n.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Today'}</span>
                          </div>
                          <p className="font-bold text-gray-800 leading-tight">{n.title}</p>
                          <p className="text-[10px] text-gray-500 line-clamp-2">{n.body}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-400 font-bold text-right pt-2 border-t border-gray-100 mt-2 font-sans">Active stream syncing...</p>
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: DEAN'S CENTRAL GRIEVANCES */}
          {activeTab === 'grievances' && (
            <div className="grid grid-cols-12 gap-6 text-left animate-in fade-in duration-200">
              <div className="col-span-12">
                <h2 className="text-2xl font-black text-gray-800">Centralized Grievance Redressal Desk</h2>
                <p className="text-sm text-gray-500">Live monitoring across all portals. Action requests, reply to messages and resolve student complaints.</p>
              </div>

              {/* Grievance directory listing */}
              <div className="col-span-12 md:col-span-6 bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Search complaints by name, title, or ID..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 p-2.5 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-brand-red focus:border-brand-red bg-gray-50"
                  />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="p-2 border border-gray-200 rounded-xl text-xs focus:outline-none"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Escalated">Escalated</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </div>

                <div className="space-y-3 overflow-y-auto max-h-[500px]">
                  {grievances
                    .filter(g => {
                      const matchesSearch = g.studentName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                            g.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                            g.id.toLowerCase().includes(searchTerm.toLowerCase());
                      const matchesStatus = statusFilter === 'All' || g.status === statusFilter;
                      return matchesSearch && matchesStatus;
                    })
                    .map(g => (
                      <div 
                        key={g.id}
                        onClick={() => setSelectedItem(g)}
                        className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedItem?.id === g.id ? 'border-brand-red bg-red-50/20 shadow-sm' : 'border-gray-100 bg-gray-50 hover:bg-gray-100/50'}`}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-[10px] font-bold uppercase bg-red-50 text-brand-red px-2 py-0.5 rounded-md">{g.id}</span>
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                            g.status === 'Pending' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                            g.status === 'Resolved' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-brand-red'
                          }`}>
                            {g.status}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-gray-800 line-clamp-1">{g.title}</h4>
                        <p className="text-[11px] text-gray-500 mt-1">Student: <span className="font-semibold">{g.studentName}</span> ({g.rollNumber})</p>
                        <div className="flex justify-between items-center mt-2.5 text-[10px] text-gray-400">
                          <span>Priority: <span className="font-bold text-gray-700">{g.priority}</span></span>
                          <span>{g.date}</span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Grievance actions panel */}
              <div className="col-span-12 md:col-span-6 bg-white rounded-2xl border border-gray-200 p-6 flex flex-col min-h-[500px]">
                {selectedItem ? (
                  <div className="space-y-6 flex-1 flex flex-col justify-between">
                    <div className="space-y-4">
                      <div className="border-b pb-4">
                        <span className="text-[10px] bg-gray-100 text-gray-500 font-bold px-2.5 py-0.5 rounded-full">{selectedItem.category}</span>
                        <h3 className="text-lg font-black text-gray-800 mt-1.5">{selectedItem.title}</h3>
                        <p className="text-xs text-gray-600 leading-relaxed mt-2">{selectedItem.description}</p>
                      </div>

                      {/* Chat replies */}
                      <div className="space-y-3">
                        <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Communication Logs</h5>
                        <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                          {selectedItem.replies?.length === 0 ? (
                            <p className="text-xs text-gray-400 italic">No communications logged yet.</p>
                          ) : (
                            selectedItem.replies?.map((rep: any, idx: number) => (
                              <div key={idx} className="p-3 bg-gray-50 rounded-lg text-xs">
                                <div className="flex justify-between font-bold text-gray-700 mb-0.5">
                                  <span>{rep.author} ({rep.role})</span>
                                  <span className="text-[10px] text-gray-400 font-normal">{rep.timestamp}</span>
                                </div>
                                <p className="text-gray-600">{rep.text}</p>
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                      {/* Timeline */}
                      <div className="space-y-3">
                        <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Audit Timeline</h5>
                        <div className="space-y-1.5 text-[11px] max-h-[100px] overflow-y-auto">
                          {selectedItem.timeline?.map((evt: any, idx: number) => (
                            <div key={idx} className="flex gap-2">
                              <span className="font-bold text-brand-red">✓</span>
                              <span className="text-gray-500 font-mono">{evt.date}:</span>
                              <span className="text-gray-700">{evt.description} ({evt.actor})</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-4 space-y-4">
                      {/* Reply field */}
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          placeholder="Type response to student portal..." 
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          className="flex-1 p-2 border border-gray-200 rounded-xl text-xs focus:outline-none"
                        />
                        <button 
                          onClick={() => handleGrievanceReply(selectedItem.id)}
                          className="px-4 py-2 bg-brand-red text-white text-xs font-bold rounded-xl hover:bg-red-800 transition-colors border-none cursor-pointer"
                        >
                          Send
                        </button>
                      </div>

                      {/* Resolution controls */}
                      <div className="flex flex-wrap gap-2 pt-2">
                        <button 
                          onClick={() => handleGrievanceAction(selectedItem.id, 'Under Review', 'Dean of Engineering placed under review')}
                          className="px-4 py-2 border border-gray-200 text-gray-700 text-xs font-bold rounded-lg hover:bg-gray-50 bg-white cursor-pointer"
                          disabled={selectedItem.status === 'Resolved'}
                        >
                          Review
                        </button>
                        <button 
                          onClick={() => handleGrievanceAction(selectedItem.id, 'Escalated', 'Escalated to Registrar board for high priority investigation')}
                          className="px-4 py-2 border border-red-200 text-brand-red text-xs font-bold rounded-lg hover:bg-red-50 bg-white cursor-pointer"
                          disabled={selectedItem.status === 'Resolved' || selectedItem.status === 'Escalated'}
                        >
                          Escalate
                        </button>
                        <button 
                          onClick={() => handleGrievanceAction(selectedItem.id, 'Resolved', 'Dean closed the ticket with satisfactory resolution notes')}
                          className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-lg border-none cursor-pointer ml-auto"
                          disabled={selectedItem.status === 'Resolved'}
                        >
                          Approve &amp; Resolve
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col justify-center items-center text-center text-gray-400 p-8">
                    <span className="material-symbols-outlined text-5xl mb-3 text-gray-300">gavel</span>
                    <h3 className="font-bold text-gray-700 text-sm">Select Grievance Ticket</h3>
                    <p className="text-xs max-w-xs mt-1">Review live student petitions, compose chats, audit progress logs and resolve concerns instantly.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: STUDENT SERVICES */}
          {activeTab === 'services' && (
            <div className="grid grid-cols-12 gap-6 text-left animate-in fade-in duration-200">
              <div className="col-span-12">
                <h2 className="text-2xl font-black text-gray-800">Student Services &amp; Requests Desk</h2>
                <p className="text-sm text-gray-500">Manage Hostel Allocations, Bus Pass Requests, Scholarship verification, Identity Card replacement and Refunds.</p>
              </div>

              {/* Directory */}
              <div className="col-span-12 md:col-span-7 bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-sm text-gray-700">Official Student Petitions</h4>
                  <span className="text-xs font-bold text-brand-red uppercase">{studentServices.filter(s => s.status === 'Pending').length} Pending</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-gray-50 uppercase text-[9px] font-black text-gray-400 border-b">
                        <th className="p-3">ID</th>
                        <th className="p-3">Student Name</th>
                        <th className="p-3">Category</th>
                        <th className="p-3">Applied Date</th>
                        <th className="p-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {studentServices.map((req) => (
                        <tr 
                          key={req.id} 
                          onClick={() => setSelectedItem(req)}
                          className={`hover:bg-gray-50/50 cursor-pointer transition-colors ${selectedItem?.id === req.id ? 'bg-red-50/10' : ''}`}
                        >
                          <td className="p-3 font-bold text-brand-red font-mono">{req.id}</td>
                          <td className="p-3">
                            <p className="font-bold text-gray-800">{req.studentName}</p>
                            <p className="text-[10px] text-gray-400 font-mono">{req.rollNumber}</p>
                          </td>
                          <td className="p-3 font-semibold text-gray-700">{req.type}</td>
                          <td className="p-3 text-gray-500">{req.date}</td>
                          <td className="p-3 text-center">
                            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                              req.status === 'Approved' ? 'bg-green-50 text-green-700' :
                              req.status === 'Rejected' ? 'bg-red-50 text-brand-red' : 'bg-amber-50 text-amber-700'
                            }`}>
                              {req.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Action and remarks */}
              <div className="col-span-12 md:col-span-5 bg-white rounded-2xl border border-gray-200 p-6 flex flex-col justify-between min-h-[420px]">
                {selectedItem ? (
                  <div className="space-y-6 flex-1 flex flex-col justify-between">
                    <div className="space-y-4">
                      <div className="border-b pb-4">
                        <span className="text-[10px] font-bold uppercase bg-red-50 text-brand-red px-2 py-0.5 rounded-md">{selectedItem.id}</span>
                        <h4 className="text-base font-black text-gray-800 mt-2">{selectedItem.type} request</h4>
                        <p className="text-xs text-gray-400 mt-1">Student: <span className="font-semibold text-gray-700">{selectedItem.studentName}</span> ({selectedItem.rollNumber})</p>
                      </div>

                      <div className="space-y-2">
                        <h5 className="text-[10px] font-bold text-gray-400 uppercase">Description Details</h5>
                        <p className="text-xs text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-100">{selectedItem.details}</p>
                      </div>

                      <div className="space-y-1 text-xs">
                        <p className="text-gray-400">Current Status: <span className="font-bold text-brand-red uppercase">{selectedItem.status}</span></p>
                        {selectedItem.remarks && (
                          <p className="text-gray-500 bg-amber-50/40 p-2.5 rounded-lg border border-amber-100 mt-1">Remarks: {selectedItem.remarks}</p>
                        )}
                      </div>
                    </div>

                    <div className="border-t pt-4 space-y-4">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Administrative Remarks / Response Notes</label>
                        <input 
                          type="text" 
                          id="service-remarks"
                          placeholder="e.g. Cleared pending dues. Request processed."
                          className="w-full p-2.5 border border-gray-200 rounded-xl text-xs focus:outline-none"
                        />
                      </div>

                      <div className="flex gap-2">
                        <button 
                          onClick={() => {
                            const rem = (document.getElementById('service-remarks') as HTMLInputElement)?.value;
                            handleServiceAction(selectedItem.id, 'Changes Requested', rem);
                          }}
                          className="flex-1 py-2 bg-amber-50 text-amber-700 hover:bg-amber-100 text-xs font-bold rounded-lg border border-amber-200 cursor-pointer"
                        >
                          Request Changes
                        </button>
                        <button 
                          onClick={() => {
                            const rem = (document.getElementById('service-remarks') as HTMLInputElement)?.value;
                            handleServiceAction(selectedItem.id, 'Rejected', rem);
                          }}
                          className="flex-1 py-2 bg-red-50 text-brand-red hover:bg-red-100 text-xs font-bold rounded-lg border border-red-200 cursor-pointer"
                        >
                          Reject
                        </button>
                        <button 
                          onClick={() => {
                            const rem = (document.getElementById('service-remarks') as HTMLInputElement)?.value;
                            handleServiceAction(selectedItem.id, 'Approved', rem || 'Verified against student profile records.');
                          }}
                          className="flex-1 py-2 bg-green-600 text-white hover:bg-green-700 text-xs font-bold rounded-lg border-none cursor-pointer"
                        >
                          Approve
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col justify-center items-center text-center text-gray-400 p-8">
                    <span className="material-symbols-outlined text-5xl mb-3 text-gray-300">room_service</span>
                    <h3 className="font-bold text-gray-700 text-sm">Select Student Request</h3>
                    <p className="text-xs max-w-xs mt-1">Review official student requests, verify qualifications, and approve dispatches instantly.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: TERM FEE RECORDS */}
          {activeTab === 'fees' && (
            <div className="space-y-6 text-left animate-in fade-in duration-200">
              <div className="flex justify-between items-end">
                <div>
                  <h2 className="text-2xl font-black text-gray-800">Student Tuition &amp; Term Fees Registry</h2>
                  <p className="text-sm text-gray-500">Live transaction history, payment audits, receipt generation, and fine ledger.</p>
                </div>
                <button 
                  onClick={() => handlePrintDoc('fee-registry-table', 'KRMU Fee Registry Audit')}
                  className="px-5 py-2 border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 text-xs font-bold rounded-xl cursor-pointer flex items-center gap-1.5 shadow-sm"
                >
                  <span className="material-symbols-outlined text-sm">print</span> Print Registry
                </button>
              </div>

              {/* Transactions list */}
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm p-6 space-y-4" id="fee-registry-table">
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Search by student name or roll number..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-md p-2.5 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-brand-red focus:border-brand-red bg-gray-50"
                  />
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-gray-50 uppercase text-[9px] font-black text-gray-400 border-b">
                      <tr>
                        <th className="p-4">Receipt ID</th>
                        <th className="p-4">Student Roll</th>
                        <th className="p-4">Name &amp; Course</th>
                        <th className="p-4 text-right">Amount Received</th>
                        <th className="p-4">Paid On</th>
                        <th className="p-4">Payment Mode</th>
                        <th className="p-4 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {feePayments
                        .filter(p => p.studentName.toLowerCase().includes(searchTerm.toLowerCase()) || p.rollNo.toLowerCase().includes(searchTerm.toLowerCase()))
                        .map((p) => (
                          <tr key={p.id} className="hover:bg-gray-50/50">
                            <td className="p-4 font-bold text-gray-700 font-mono">{p.receiptNumber}</td>
                            <td className="p-4 font-mono text-gray-500">{p.rollNo}</td>
                            <td className="p-4">
                              <p className="font-bold text-gray-800">{p.studentName}</p>
                              <p className="text-[10px] text-gray-400">{p.course} • Semester {p.semester}</p>
                            </td>
                            <td className="p-4 text-right font-black text-gray-800 font-mono">₹{p.amount?.toLocaleString()}</td>
                            <td className="p-4 text-gray-500">{p.paymentDate}</td>
                            <td className="p-4 text-gray-500">{p.mode}</td>
                            <td className="p-4 text-center">
                              <span className="px-2.5 py-0.5 bg-green-50 text-green-700 text-[9px] font-bold rounded-full uppercase border border-green-100">
                                {p.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: FACULTY MANAGEMENT & LEAVES */}
          {activeTab === 'faculty' && (
            <div className="grid grid-cols-12 gap-6 text-left animate-in fade-in duration-200">
              <div className="col-span-12">
                <h2 className="text-2xl font-black text-gray-800">Faculty Leaves &amp; Academic Approvals</h2>
                <p className="text-sm text-gray-500">Approve duty leaves, research OD, casual leaves, and track department syllabus/workload balance.</p>
              </div>

              {/* Directory */}
              <div className="col-span-12 md:col-span-7 bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
                <h4 className="font-bold text-sm text-gray-700">Faculty Leave Applications</h4>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-gray-50 uppercase text-[9px] font-black text-gray-400 border-b">
                        <th className="p-3">ID</th>
                        <th className="p-3">Faculty Name</th>
                        <th className="p-3">Leave Type</th>
                        <th className="p-3">Days</th>
                        <th className="p-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {facultyLeaves.map((leave) => (
                        <tr 
                          key={leave.id} 
                          onClick={() => setSelectedItem(leave)}
                          className={`hover:bg-gray-50/50 cursor-pointer transition-colors ${selectedItem?.id === leave.id ? 'bg-red-50/10' : ''}`}
                        >
                          <td className="p-3 font-bold text-brand-red font-mono">{leave.id}</td>
                          <td className="p-3">
                            <p className="font-bold text-gray-800">{leave.facultyName}</p>
                            <p className="text-[10px] text-gray-400">{leave.department}</p>
                          </td>
                          <td className="p-3 font-semibold text-gray-700">{leave.leaveType}</td>
                          <td className="p-3 font-mono text-gray-600">{leave.days} Days</td>
                          <td className="p-3 text-center">
                            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                              leave.status === 'Approved' ? 'bg-green-50 text-green-700' :
                              leave.status === 'Rejected' ? 'bg-red-50 text-brand-red' : 'bg-amber-50 text-amber-700'
                            }`}>
                              {leave.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Action and remarks */}
              <div className="col-span-12 md:col-span-5 bg-white rounded-2xl border border-gray-200 p-6 flex flex-col justify-between min-h-[420px]">
                {selectedItem ? (
                  <div className="space-y-6 flex-1 flex flex-col justify-between">
                    <div className="space-y-4">
                      <div className="border-b pb-4">
                        <span className="text-[10px] font-bold uppercase bg-red-50 text-brand-red px-2 py-0.5 rounded-md">{selectedItem.id}</span>
                        <h4 className="text-base font-black text-gray-800 mt-2">{selectedItem.leaveType} Application</h4>
                        <p className="text-xs text-gray-400 mt-1">Instructor: <span className="font-semibold text-gray-700">{selectedItem.facultyName}</span> ({selectedItem.department})</p>
                      </div>

                      <div className="space-y-2">
                        <h5 className="text-[10px] font-bold text-gray-400 uppercase">Reason / Justification</h5>
                        <p className="text-xs text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-100">{selectedItem.reason}</p>
                        <p className="text-[11px] text-gray-400">Duration: <span className="font-bold text-gray-700">{selectedItem.startDate}</span> to <span className="font-bold text-gray-700">{selectedItem.endDate}</span> ({selectedItem.days} days)</p>
                      </div>

                      <div className="space-y-1 text-xs">
                        <p className="text-gray-400">Status: <span className="font-bold text-brand-red uppercase">{selectedItem.status}</span></p>
                        {selectedItem.remarks && (
                          <p className="text-gray-500 bg-amber-50/40 p-2.5 rounded-lg border border-amber-100 mt-1">Remarks: {selectedItem.remarks}</p>
                        )}
                      </div>
                    </div>

                    <div className="border-t pt-4 space-y-4">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Approval Comments / Remarks</label>
                        <input 
                          type="text" 
                          id="leave-remarks"
                          placeholder="e.g. Approved under Department OD budget limits."
                          className="w-full p-2.5 border border-gray-200 rounded-xl text-xs focus:outline-none"
                        />
                      </div>

                      <div className="flex gap-2">
                        <button 
                          onClick={() => {
                            const rem = (document.getElementById('leave-remarks') as HTMLInputElement)?.value;
                            handleLeaveAction(selectedItem.id, 'Rejected', rem);
                          }}
                          className="flex-1 py-2 bg-red-50 text-brand-red hover:bg-red-100 text-xs font-bold rounded-lg border border-red-200 cursor-pointer"
                        >
                          Reject Leave
                        </button>
                        <button 
                          onClick={() => {
                            const rem = (document.getElementById('leave-remarks') as HTMLInputElement)?.value;
                            handleLeaveAction(selectedItem.id, 'Approved', rem || 'Authorized by Dean office.');
                          }}
                          className="flex-1 py-2 bg-green-600 text-white hover:bg-green-700 text-xs font-bold rounded-lg border-none cursor-pointer"
                        >
                          Approve Leave
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col justify-center items-center text-center text-gray-400 p-8">
                    <span className="material-symbols-outlined text-5xl mb-3 text-gray-300">badge</span>
                    <h3 className="font-bold text-gray-700 text-sm">Select Leave Request</h3>
                    <p className="text-xs max-w-xs mt-1">Verify faculty leave balances, OD reason details, and process official leaves instantly.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 6: NOTICE BOARD COMPOSER */}
          {activeTab === 'notifications' && (
            <div className="grid grid-cols-12 gap-6 text-left animate-in fade-in duration-200">
              <div className="col-span-12">
                <h2 className="text-2xl font-black text-gray-800">Global Notice Board &amp; Notification Composer</h2>
                <p className="text-sm text-gray-500">Send urgent alerts, fee notices, exams timetables, and placements updates directly to student/faculty dashboards.</p>
              </div>

              {/* Compose form */}
              <div className="col-span-12 md:col-span-5 bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
                <h3 className="font-bold text-base text-gray-800 mb-4 uppercase tracking-wider">Broadcast Notice</h3>
                
                <form onSubmit={handleBroadcastNotif} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Notice Category</label>
                    <select
                      value={notifType}
                      onChange={(e) => setNotifType(e.target.value)}
                      className="w-full p-2.5 border border-gray-200 rounded-xl text-xs focus:outline-none"
                    >
                      <option value="Notice">Notice</option>
                      <option value="Exam">Exam Alert</option>
                      <option value="Fee">Fee Clearance Notice</option>
                      <option value="Placement">Placement Update</option>
                      <option value="Hostel">Hostel Announcement</option>
                      <option value="Event">Event Circular</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Announcement Title</label>
                    <input 
                      type="text" 
                      placeholder="e.g. End Semester Exam Registration Dates" 
                      value={notifTitle}
                      onChange={(e) => setNotifTitle(e.target.value)}
                      className="w-full p-2.5 border border-gray-200 rounded-xl text-xs focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Official Body Content</label>
                    <textarea 
                      rows={5}
                      placeholder="Type details..." 
                      value={notifBody}
                      onChange={(e) => setNotifBody(e.target.value)}
                      className="w-full p-2.5 border border-gray-200 rounded-xl text-xs focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Sender Tag / Department</label>
                    <input 
                      type="text" 
                      value={notifSender}
                      onChange={(e) => setNotifSender(e.target.value)}
                      className="w-full p-2.5 border border-gray-200 rounded-xl text-xs focus:outline-none"
                      required
                    />
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-3 bg-brand-red hover:bg-red-800 text-white font-bold text-xs rounded-xl border-none cursor-pointer transition-colors shadow-sm uppercase tracking-wider"
                  >
                    Broadcast to Portal Bulletin
                  </button>
                </form>
              </div>

              {/* Notice history list */}
              <div className="col-span-12 md:col-span-7 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col h-[550px]">
                <h3 className="font-bold text-sm text-gray-700 mb-4">University Announcement History</h3>
                <div className="space-y-3 overflow-y-auto flex-1 pr-2">
                  {notifications.map((notif) => (
                    <div key={notif.id} className="p-4 bg-gray-50 border border-gray-100 rounded-xl text-xs">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-bold uppercase bg-red-100 text-brand-red px-2 py-0.5 rounded">{notif.category || "Announcement"}</span>
                        <span className="text-[10px] text-gray-400 font-mono">{notif.date}</span>
                      </div>
                      <h4 className="font-bold text-gray-800 text-sm">{notif.title}</h4>
                      <p className="text-gray-500 mt-1">{notif.text || notif.body}</p>
                      <div className="flex justify-between items-center mt-3 text-[10px] text-gray-400 border-t pt-2 border-gray-100">
                        <span>Issued: {notif.sender}</span>
                        <span>Audited Read Count: {notif.readBy?.length || 0} clicks</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: EMAIL CENTER */}
          {activeTab === 'email_center' && (
            <div className="grid grid-cols-12 gap-6 text-left animate-in fade-in duration-200">
              <div className="col-span-12">
                <h2 className="text-2xl font-black text-gray-800">University Mass Mail &amp; Email Center</h2>
                <p className="text-sm text-gray-500">Dispatch structured email notifications with templates regarding examinations, seating and fees.</p>
              </div>

              {/* Compose panel */}
              <div className="col-span-12 md:col-span-7 bg-white rounded-2xl border border-gray-200 p-8 shadow-sm space-y-6">
                <div className="flex justify-between items-center border-b pb-3">
                  <h3 className="font-bold text-sm text-gray-700 uppercase">Mass Dispatch Composer</h3>
                  
                  {/* Presets */}
                  <div className="flex gap-1">
                    {['Fee Reminder', 'Exam Seating', 'Invitation'].map(tpl => (
                      <button
                        key={tpl}
                        type="button"
                        onClick={() => handleApplyTemplate(tpl)}
                        className={`px-3 py-1 text-[10px] font-bold rounded-lg border cursor-pointer ${emailTemplate === tpl ? 'bg-brand-red text-white border-brand-red' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'}`}
                      >
                        {tpl}
                      </button>
                    ))}
                  </div>
                </div>

                <form onSubmit={handleSendEmail} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Target Group</label>
                      <select
                        value={emailScope}
                        onChange={(e) => setEmailScope(e.target.value)}
                        className="w-full p-2.5 border border-gray-200 rounded-xl text-xs focus:outline-none"
                      >
                        <option value="All Students">All Students</option>
                        <option value="All Faculty">All Faculty</option>
                        <option value="Department Wise">Department (SOET)</option>
                        <option value="Individual Member">Individual Member</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Recipient / Specific Email</label>
                      <input 
                        type="text" 
                        placeholder="e.g. elena.vance@krmu.edu.in or 'All'" 
                        value={emailRecipient}
                        onChange={(e) => setEmailRecipient(e.target.value)}
                        className="w-full p-2.5 border border-gray-200 rounded-xl text-xs focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Subject Line</label>
                    <input 
                      type="text" 
                      placeholder="Email subject..." 
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      className="w-full p-2.5 border border-gray-200 rounded-xl text-xs focus:outline-none font-bold"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Mail Body</label>
                    <textarea 
                      rows={8}
                      placeholder="Type body details..." 
                      value={emailBody}
                      onChange={(e) => setEmailBody(e.target.value)}
                      className="w-full p-2.5 border border-gray-200 rounded-xl text-xs focus:outline-none font-sans"
                      required
                    />
                  </div>

                  <div className="flex gap-3 justify-end pt-2">
                    <button 
                      type="button"
                      onClick={() => alert("Draft saved successfully!")}
                      className="px-6 py-2.5 border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 text-xs font-bold rounded-xl cursor-pointer"
                    >
                      Save Draft
                    </button>
                    <button 
                      type="submit"
                      className="px-8 py-2.5 bg-brand-red text-white hover:bg-red-800 text-xs font-bold rounded-xl border-none cursor-pointer uppercase shadow-sm"
                    >
                      Dispatch Mail
                    </button>
                  </div>
                </form>
              </div>

              {/* Dispatched logs */}
              <div className="col-span-12 md:col-span-5 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col h-[550px]">
                <h3 className="font-bold text-sm text-gray-700 mb-4">Official Mail Dispatched History</h3>
                <div className="space-y-3 overflow-y-auto flex-1 pr-2">
                  {emails.map((em) => (
                    <div key={em.id} className="p-4 bg-gray-50 border border-gray-100 rounded-xl text-xs space-y-1.5">
                      <div className="flex justify-between items-center text-[10px] text-gray-400">
                        <span className="font-mono text-brand-red font-bold">{em.id}</span>
                        <span>{em.sentAt}</span>
                      </div>
                      <h4 className="font-bold text-gray-800 line-clamp-1">{em.subject}</h4>
                      <p className="text-gray-500 line-clamp-2">{em.body}</p>
                      <div className="text-[10px] text-gray-400 flex justify-between border-t pt-2 border-gray-100">
                        <span>Scope: {em.scope}</span>
                        <span className="text-green-600 font-bold">✓ Dispatched</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: AUDIT TRAIL */}
          {activeTab === 'audit_logs' && (
            <div className="space-y-6 text-left animate-in fade-in duration-200">
              <div>
                <h2 className="text-2xl font-black text-gray-800">Security Audit Trails</h2>
                <p className="text-sm text-gray-500">Immutably track all operations, data modifications, or fee approvals performed on the ERP server.</p>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm p-6">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-gray-50 uppercase text-[9px] font-black text-gray-400 border-b">
                      <tr>
                        <th className="p-4">Timestamp</th>
                        <th className="p-4">User Agent / Actor</th>
                        <th className="p-4">Operation Performed</th>
                        <th className="p-4 text-right">Integrity Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      <tr className="hover:bg-gray-50/50">
                        <td className="p-4 text-gray-500 font-mono">Today, 11:32 AM</td>
                        <td className="p-4 font-bold text-gray-800">Dean office (Registrar General)</td>
                        <td className="p-4 text-gray-600">Dispatched end-semester hall ticket notifications</td>
                        <td className="p-4 text-right">
                          <span className="px-2.5 py-0.5 bg-green-50 text-green-700 text-[9px] font-bold rounded-full border border-green-100 uppercase">Verified</span>
                        </td>
                      </tr>
                      <tr className="hover:bg-gray-50/50">
                        <td className="p-4 text-gray-500 font-mono">Today, 09:45 AM</td>
                        <td className="p-4 font-bold text-gray-800">Dr. Elena Vance (Faculty)</td>
                        <td className="p-4 text-gray-600">Uploaded attendance spreadsheet CS-601 Section A</td>
                        <td className="p-4 text-right">
                          <span className="px-2.5 py-0.5 bg-green-50 text-green-700 text-[9px] font-bold rounded-full border border-green-100 uppercase">Verified</span>
                        </td>
                      </tr>
                      <tr className="hover:bg-gray-50/50">
                        <td className="p-4 text-gray-500 font-mono">Yesterday, 04:15 PM</td>
                        <td className="p-4 font-bold text-gray-800">Systems administrator</td>
                        <td className="p-4 text-gray-600">Database backup schedule synchronization successfully verified</td>
                        <td className="p-4 text-right">
                          <span className="px-2.5 py-0.5 bg-green-50 text-green-700 text-[9px] font-bold rounded-full border border-green-100 uppercase">Verified</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: GATE PASS MANAGEMENT */}
          {activeTab === 'gate_pass_mgmt' && (
            <div className="grid grid-cols-12 gap-6 text-left animate-in fade-in duration-200">
              <div className="col-span-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-black text-gray-800">Gate Pass &amp; Transit Authorization Desk</h2>
                  <p className="text-sm text-gray-500">Monitor student outstation requests, approve leaving logs, generate scannable security codes, and track overdue returns.</p>
                </div>
                {/* Metrics ribbon */}
                <div className="flex gap-4">
                  <div className="bg-red-50/50 border border-red-100 px-3 py-1.5 rounded-xl text-center">
                    <p className="text-[10px] text-gray-400 uppercase font-black">Outside Campus</p>
                    <p className="text-sm font-black text-brand-red">{gatePasses.filter(g => g.status === 'Outside').length}</p>
                  </div>
                  <div className="bg-amber-50 border border-amber-100 px-3 py-1.5 rounded-xl text-center">
                    <p className="text-[10px] text-amber-700 uppercase font-black">Overdue Returns</p>
                    <p className="text-sm font-black text-amber-700">{gatePasses.filter(g => g.status === 'Overdue').length}</p>
                  </div>
                  <div className="bg-green-50 border border-green-100 px-3 py-1.5 rounded-xl text-center">
                    <p className="text-[10px] text-green-700 uppercase font-black">Approved Today</p>
                    <p className="text-sm font-black text-green-700">{gatePasses.filter(g => g.status === 'Approved').length}</p>
                  </div>
                </div>
              </div>

              {/* SEARCH & FILTERS BAR */}
              <div className="col-span-12 bg-white rounded-2xl border border-gray-200 p-4 flex flex-col md:flex-row gap-3 shadow-sm">
                <div className="flex-1 relative">
                  <span className="material-symbols-outlined text-gray-400 absolute left-3 top-3 text-lg">search</span>
                  <input 
                    type="text"
                    placeholder="Search by student name, roll number, or gate pass ID..."
                    value={gpSearchTerm}
                    onChange={(e) => setGpSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-brand-red"
                  />
                </div>
                <div className="flex gap-2">
                  <select
                    value={gpStatusFilter}
                    onChange={(e) => { setGpStatusFilter(e.target.value); setSelectedItem(null); }}
                    className="p-2.5 border border-gray-200 rounded-xl text-xs bg-white text-gray-700 focus:outline-none"
                  >
                    <option value="All">All Requests</option>
                    <option value="Pending">Pending Approval</option>
                    <option value="Approved">Approved / Active</option>
                    <option value="Outside">Currently Outside</option>
                    <option value="Returned">Returned Today</option>
                    <option value="Overdue">Overdue returns</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Today">Transit Today</option>
                    <option value="This Week">Applied This Week</option>
                    <option value="Weekend Leave">Weekend Leave</option>
                    <option value="Emergency Leave">Emergency Leave</option>
                  </select>
                </div>
              </div>

              {/* DIRECTORY LIST */}
              <div className="col-span-12 md:col-span-7 bg-white rounded-2xl border border-gray-200 p-6 space-y-4 shadow-sm">
                <div className="flex justify-between items-center pb-2 border-b">
                  <h4 className="font-bold text-sm text-gray-700">Student Transit Log</h4>
                  <span className="text-xs font-bold text-brand-red uppercase">
                    {gatePasses.filter((gp: any) => {
                      const matchesSearch = gpSearchTerm === '' || 
                        gp.studentName.toLowerCase().includes(gpSearchTerm.toLowerCase()) ||
                        (gp.rollNo && gp.rollNo.toLowerCase().includes(gpSearchTerm.toLowerCase())) ||
                        gp.id.toLowerCase().includes(gpSearchTerm.toLowerCase());
                      if (!matchesSearch) return false;
                      if (gpStatusFilter === 'All') return true;
                      if (gpStatusFilter === 'Pending') return gp.status === 'Pending';
                      if (gpStatusFilter === 'Approved') return gp.status === 'Approved';
                      if (gpStatusFilter === 'Rejected') return gp.status === 'Rejected';
                      if (gpStatusFilter === 'Outside') return gp.status === 'Outside';
                      if (gpStatusFilter === 'Returned') return gp.status === 'Returned';
                      if (gpStatusFilter === 'Overdue') return gp.status === 'Overdue';
                      if (gpStatusFilter === 'Today') {
                        const todayStr = new Date().toISOString().split('T')[0];
                        return gp.leavingDate === todayStr || gp.returnDate === todayStr;
                      }
                      if (gpStatusFilter === 'This Week') {
                        return true;
                      }
                      if (gpStatusFilter === 'Weekend Leave') {
                        return gp.reason.toLowerCase().includes('weekend') || gp.leavingDate.includes('Sat') || gp.leavingDate.includes('Sun');
                      }
                      if (gpStatusFilter === 'Emergency Leave') {
                        return gp.reason.toLowerCase().includes('emergency') || gp.reason.toLowerCase().includes('urgent') || gp.reason.toLowerCase().includes('medical');
                      }
                      return true;
                    }).length} Record(s)
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-gray-50 uppercase text-[9px] font-black text-gray-400 border-b">
                        <th className="p-3">Gate Pass ID</th>
                        <th className="p-3">Student Name</th>
                        <th className="p-3">Transit Dates</th>
                        <th className="p-3">Destination</th>
                        <th className="p-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {gatePasses.filter((gp: any) => {
                        const matchesSearch = gpSearchTerm === '' || 
                          gp.studentName.toLowerCase().includes(gpSearchTerm.toLowerCase()) ||
                          (gp.rollNo && gp.rollNo.toLowerCase().includes(gpSearchTerm.toLowerCase())) ||
                          gp.id.toLowerCase().includes(gpSearchTerm.toLowerCase());
                        if (!matchesSearch) return false;
                        if (gpStatusFilter === 'All') return true;
                        if (gpStatusFilter === 'Pending') return gp.status === 'Pending';
                        if (gpStatusFilter === 'Approved') return gp.status === 'Approved';
                        if (gpStatusFilter === 'Rejected') return gp.status === 'Rejected';
                        if (gpStatusFilter === 'Outside') return gp.status === 'Outside';
                        if (gpStatusFilter === 'Returned') return gp.status === 'Returned';
                        if (gpStatusFilter === 'Overdue') return gp.status === 'Overdue';
                        if (gpStatusFilter === 'Today') {
                          const todayStr = new Date().toISOString().split('T')[0];
                          return gp.leavingDate === todayStr || gp.returnDate === todayStr;
                        }
                        if (gpStatusFilter === 'This Week') {
                          return true;
                        }
                        if (gpStatusFilter === 'Weekend Leave') {
                          return gp.reason.toLowerCase().includes('weekend') || gp.leavingDate.includes('Sat') || gp.leavingDate.includes('Sun');
                        }
                        if (gpStatusFilter === 'Emergency Leave') {
                          return gp.reason.toLowerCase().includes('emergency') || gp.reason.toLowerCase().includes('urgent') || gp.reason.toLowerCase().includes('medical');
                        }
                        return true;
                      }).length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-12 text-center text-gray-400 italic">No transit authorizations match the query.</td>
                        </tr>
                      ) : (
                        gatePasses.filter((gp: any) => {
                          const matchesSearch = gpSearchTerm === '' || 
                            gp.studentName.toLowerCase().includes(gpSearchTerm.toLowerCase()) ||
                            (gp.rollNo && gp.rollNo.toLowerCase().includes(gpSearchTerm.toLowerCase())) ||
                            gp.id.toLowerCase().includes(gpSearchTerm.toLowerCase());
                          if (!matchesSearch) return false;
                          if (gpStatusFilter === 'All') return true;
                          if (gpStatusFilter === 'Pending') return gp.status === 'Pending';
                          if (gpStatusFilter === 'Approved') return gp.status === 'Approved';
                          if (gpStatusFilter === 'Rejected') return gp.status === 'Rejected';
                          if (gpStatusFilter === 'Outside') return gp.status === 'Outside';
                          if (gpStatusFilter === 'Returned') return gp.status === 'Returned';
                          if (gpStatusFilter === 'Overdue') return gp.status === 'Overdue';
                          if (gpStatusFilter === 'Today') {
                            const todayStr = new Date().toISOString().split('T')[0];
                            return gp.leavingDate === todayStr || gp.returnDate === todayStr;
                          }
                          if (gpStatusFilter === 'This Week') {
                            return true;
                          }
                          if (gpStatusFilter === 'Weekend Leave') {
                            return gp.reason.toLowerCase().includes('weekend') || gp.leavingDate.includes('Sat') || gp.leavingDate.includes('Sun');
                          }
                          if (gpStatusFilter === 'Emergency Leave') {
                            return gp.reason.toLowerCase().includes('emergency') || gp.reason.toLowerCase().includes('urgent') || gp.reason.toLowerCase().includes('medical');
                          }
                          return true;
                        }).map((gp: any) => (
                          <tr 
                            key={gp.id}
                            onClick={() => {
                              setSelectedItem(gp);
                              setGpEditReturnDate(gp.returnDate);
                              setGpEditReturnTime(gp.returnTime);
                              setIsEditingTime(false);
                            }}
                            className={`hover:bg-gray-50/50 cursor-pointer transition-all text-xs ${selectedItem?.id === gp.id ? 'bg-red-50/10 font-bold border-l-2 border-brand-red' : ''}`}
                          >
                            <td className="p-3 font-bold text-brand-red font-mono">{gp.id}</td>
                            <td className="p-3">
                              <p className="font-bold text-gray-850">{gp.studentName}</p>
                              <p className="text-[10px] text-gray-400 font-mono">{gp.rollNo || '2401730018'}</p>
                            </td>
                            <td className="p-3 text-gray-600">
                              <div className="flex flex-col text-[11px]">
                                <span className="font-semibold text-emerald-700">Out: {gp.leavingDate} {gp.leavingTime}</span>
                                <span className="text-amber-700">In: {gp.returnDate} {gp.returnTime}</span>
                              </div>
                            </td>
                            <td className="p-3 text-gray-500 max-w-[120px] truncate">{gp.destination}</td>
                            <td className="p-3 text-center">
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border ${
                                gp.status === 'Approved' ? 'bg-green-50 text-green-700 border-green-100' :
                                gp.status === 'Outside' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                gp.status === 'Overdue' ? 'bg-red-50 text-brand-red border-red-200' :
                                gp.status === 'Returned' ? 'bg-gray-100 text-gray-700 border-gray-200' :
                                gp.status === 'Rejected' ? 'bg-red-50 text-brand-red border-red-100' :
                                gp.status === 'More Info Required' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                'bg-amber-50 text-amber-700 border-amber-100'
                              }`}>
                                {gp.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* DETAILED REQUEST PANEL */}
              <div className="col-span-12 md:col-span-5 bg-white rounded-2xl border border-gray-200 p-6 flex flex-col justify-between min-h-[480px] shadow-sm">
                {selectedItem ? (
                  <div className="space-y-5 flex-1 flex flex-col justify-between text-xs">
                    <div className="space-y-5">
                      {/* Student Card Heading */}
                      <div className="border-b pb-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[9px] font-black uppercase bg-red-50 text-brand-red px-2 py-0.5 rounded border border-red-100 font-mono">{selectedItem.id}</span>
                            <h4 className="text-base font-black text-gray-800 mt-1">{selectedItem.studentName}</h4>
                            <p className="text-[10px] text-gray-400 font-mono mt-0.5">Roll No: {selectedItem.rollNo || '2401730018'} • Room {selectedItem.roomNumber || 'A-102'}</p>
                          </div>
                          <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase border ${
                            selectedItem.status === 'Approved' ? 'bg-green-50 text-green-700 border-green-100' :
                            selectedItem.status === 'Outside' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                            selectedItem.status === 'Overdue' ? 'bg-red-50 text-brand-red border-red-200' :
                            selectedItem.status === 'Returned' ? 'bg-gray-100 text-gray-700 border-gray-200' :
                            selectedItem.status === 'Rejected' ? 'bg-red-50 text-brand-red border-red-100' :
                            'bg-amber-50 text-amber-700 border-amber-100'
                          }`}>
                            {selectedItem.status}
                          </span>
                        </div>
                      </div>

                      {/* Academic & Attendance Snapshot */}
                      <div className="grid grid-cols-2 gap-3 bg-gray-50 p-3 rounded-xl border border-gray-150">
                        <div>
                          <p className="text-[10px] text-gray-400 font-bold uppercase">Academic Snapshot</p>
                          <p className="text-xs font-bold text-gray-700 mt-1">CGPA: <span className="text-brand-red">9.1 / 10</span></p>
                          <p className="text-[10px] text-gray-500 mt-0.5">Program: CSE (Sem V)</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-400 font-bold uppercase">Attendance Index</p>
                          <p className="text-xs font-bold text-gray-700 mt-1">Average: <span className="text-green-600">91%</span></p>
                          <p className="text-[10px] text-gray-500 mt-0.5">Status: Excellent</p>
                        </div>
                      </div>

                      {/* Guardian & Emergency Contacts */}
                      <div className="space-y-1.5">
                        <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Parent / Guardian Information</h5>
                        <div className="bg-gray-50/50 p-3 rounded-xl border border-gray-100 space-y-1">
                          <p className="text-gray-750"><span className="font-semibold text-gray-500">Guardian Name:</span> {selectedItem.guardianName || 'Rakesh Singh'}</p>
                          <p className="text-gray-750"><span className="font-semibold text-gray-500">Primary Contact:</span> <span className="font-mono">{selectedItem.guardianContact || '+91 98111 22233'}</span></p>
                          <p className="text-gray-750"><span className="font-semibold text-gray-500">Emergency Number:</span> <span className="font-mono text-brand-red font-semibold">{selectedItem.emergencyContact || '+91 98765 43210'}</span></p>
                        </div>
                      </div>

                      {/* Leave & Destination Details */}
                      <div className="space-y-1.5">
                        <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Leave &amp; Transit Details</h5>
                        <div className="bg-gray-50/50 p-3 rounded-xl border border-gray-100 space-y-1.5">
                          <p className="text-gray-750"><span className="font-semibold text-gray-500">Destination Address:</span> {selectedItem.destination}</p>
                          <p className="text-gray-750"><span className="font-semibold text-gray-500">Transport Method:</span> {selectedItem.transport || 'Metro / Public Cab'}</p>
                          <p className="text-gray-750"><span className="font-semibold text-gray-500">Reason for Leave:</span> "{selectedItem.reason}"</p>
                          <p className="text-gray-750"><span className="font-semibold text-gray-500">Applied Date:</span> {selectedItem.appliedDate || selectedItem.leavingDate}</p>
                        </div>
                      </div>

                      {/* QR Display for approved passes */}
                      {(selectedItem.status === 'Approved' || selectedItem.status === 'Outside' || selectedItem.status === 'Overdue') && selectedItem.qrCode && (
                        <div className="bg-blue-50/30 p-3 rounded-xl border border-blue-100 flex items-center gap-3">
                          <img src={selectedItem.qrCode} alt="Security Transit QR" className="h-16 w-16 border p-1 bg-white rounded-lg" />
                          <div className="flex-1">
                            <p className="text-[10px] font-black text-blue-800 uppercase">Authorized Digital Pass</p>
                            <p className="text-[10px] text-gray-500 mt-0.5">Scannable at security gates for checking out and check-in logs.</p>
                            <button 
                              onClick={() => {
                                const printWindow = window.open('', '_blank');
                                if (printWindow) {
                                  printWindow.document.write(`
                                    <html>
                                      <head>
                                        <title>Campus Outstation Gate Pass - \${selectedItem.studentName}</title>
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
                                          <div class="row"><span>Pass ID:</span><span>\${selectedItem.id}</span></div>
                                          <div class="row"><span>Student Name:</span><span>\${selectedItem.studentName}</span></div>
                                          <div class="row"><span>Roll Number:</span><span>\${selectedItem.rollNo || '2401730018'}</span></div>
                                          <div class="row"><span>Hostel Block:</span><span>\${selectedItem.hostelBlock || 'A'} - Room \${selectedItem.roomNumber || '102'}</span></div>
                                          <div class="row"><span>Leaving Date:</span><span>\${selectedItem.leavingDate}</span></div>
                                          <div class="row"><span>Expected Return:</span><span>\${selectedItem.returnDate} @ \${selectedItem.returnTime}</span></div>
                                          <div class="row"><span>Destination:</span><span>\${selectedItem.destination}</span></div>
                                          <div class="row"><span>Authorized By:</span><span>\${selectedItem.approvedBy || 'Registrar Board'}</span></div>
                                          <div class="row"><span>Pass Status:</span><span>\${selectedItem.status}</span></div>
                                          <div class="qr">
                                            <img src="\${selectedItem.qrCode}" alt="Security QR"/>
                                            <div style="font-size:10px; margin-top: 5px;">SCANNABLE GATE TRANSIT SECURITY ID</div>
                                          </div>
                                          <div class="footer">This digital authorization is cryptographically verified on the university ERP mainframe.</div>
                                        </div>
                                        <script>window.print();</script>
                                      </body>
                                    </html>
                                  `);
                                  printWindow.document.close();
                                }
                              }}
                              className="text-[10px] text-blue-700 font-bold underline hover:text-blue-900 mt-1 cursor-pointer block border-none bg-transparent p-0 text-left"
                            >
                              Print Secure Slip
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Documents Section */}
                      <div className="space-y-1.5">
                        <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Attached Verification Documents</h5>
                        <div className="p-3 bg-gray-50 rounded-xl border border-gray-150 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-gray-500">picture_as_pdf</span>
                            <div>
                              <p className="font-bold text-gray-850">Parent_Consent_Slip.pdf</p>
                              <p className="text-[9px] text-gray-400">Cryptographically Signed Consent</p>
                            </div>
                          </div>
                          <button 
                            onClick={(e) => { e.preventDefault(); alert("Parent_Consent_Slip.pdf is verified and validated via SMS OTP.")}}
                            className="text-xs text-brand-red font-bold hover:underline cursor-pointer bg-transparent border-none p-0"
                          >
                            View
                          </button>
                        </div>
                      </div>

                      {/* Inline Return Date/Time Editor */}
                      {isEditingTime ? (
                        <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-200 space-y-2.5">
                          <h6 className="text-[10px] font-black text-amber-800 uppercase">Modify Return Schedule</h6>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[9px] text-gray-400 block mb-0.5">Return Date</label>
                              <input 
                                type="date" 
                                value={gpEditReturnDate} 
                                onChange={(e) => setGpEditReturnDate(e.target.value)} 
                                className="p-2 border border-gray-200 rounded-lg text-xs w-full bg-white text-gray-700 focus:outline-none" 
                              />
                            </div>
                            <div>
                              <label className="text-[9px] text-gray-400 block mb-0.5">Return Time</label>
                              <input 
                                type="text" 
                                value={gpEditReturnTime} 
                                onChange={(e) => setGpEditReturnTime(e.target.value)} 
                                placeholder="e.g. 08:00 PM"
                                className="p-2 border border-gray-200 rounded-lg text-xs w-full bg-white text-gray-700 focus:outline-none" 
                              />
                            </div>
                          </div>
                          <div className="flex gap-2 justify-end pt-1">
                            <button 
                              onClick={() => setIsEditingTime(false)}
                              className="px-2.5 py-1.5 bg-gray-200 text-gray-700 rounded-lg text-[10px] font-bold border-none cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button 
                              onClick={() => {
                                handleGatePassAction(selectedItem.id, selectedItem.status, selectedItem.remarks, gpEditReturnDate, gpEditReturnTime);
                                setIsEditingTime(false);
                              }}
                              className="px-2.5 py-1.5 bg-green-600 text-white rounded-lg text-[10px] font-bold border-none cursor-pointer"
                            >
                              Save Return Schedule
                            </button>
                          </div>
                        </div>
                      ) : null}

                      {/* Remarks Log */}
                      {selectedItem.remarks && (
                        <div className="p-2.5 bg-amber-50/30 border border-amber-100 rounded-lg text-gray-600">
                          <p className="font-bold text-[9px] text-amber-800 uppercase mb-0.5">Administrative Remarks</p>
                          <p className="text-[10px]">{selectedItem.remarks}</p>
                        </div>
                      )}
                    </div>

                    {/* Action Bar */}
                    <div className="border-t pt-4 space-y-4">
                      {/* Text remark input */}
                      <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Response Comment / Audit Reason</label>
                        <input 
                          type="text" 
                          id="gatepass-remarks"
                          placeholder="Provide reasoning for approval, rejection or info requests..."
                          className="w-full p-2.5 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-brand-red text-gray-800 bg-white"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        {/* Primary action row */}
                        {selectedItem.status === 'Pending' || selectedItem.status === 'More Info Required' ? (
                          <>
                            <button 
                              onClick={() => {
                                const rem = (document.getElementById('gatepass-remarks') as HTMLInputElement)?.value;
                                handleGatePassAction(selectedItem.id, 'Rejected', rem || 'Does not fulfill student profile safety mandates.');
                              }}
                              className="py-2.5 bg-red-50 text-brand-red hover:bg-red-100 text-[11px] font-black uppercase rounded-xl border border-red-200 cursor-pointer text-center"
                            >
                              Reject Request
                            </button>
                            <button 
                              onClick={() => {
                                const rem = (document.getElementById('gatepass-remarks') as HTMLInputElement)?.value;
                                handleGatePassAction(selectedItem.id, 'Approved', rem || 'Verified against student profile records.');
                              }}
                              className="py-2.5 bg-green-600 hover:bg-green-700 text-white text-[11px] font-black uppercase rounded-xl border-none cursor-pointer text-center"
                            >
                              Approve Request
                            </button>
                          </>
                        ) : null}

                        {/* Secondary utility actions */}
                        {selectedItem.status === 'Approved' ? (
                          <>
                            <button 
                              onClick={() => {
                                const rem = (document.getElementById('gatepass-remarks') as HTMLInputElement)?.value;
                                handleGatePassAction(selectedItem.id, 'Outside', rem || 'Checked out at main campus security gate.');
                              }}
                              className="py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-black uppercase rounded-xl border-none cursor-pointer text-center col-span-2"
                            >
                              Mark Out (Manual Security Dispatch)
                            </button>
                          </>
                        ) : null}

                        {selectedItem.status === 'Outside' || selectedItem.status === 'Overdue' ? (
                          <>
                            <button 
                              onClick={() => {
                                const rem = (document.getElementById('gatepass-remarks') as HTMLInputElement)?.value;
                                handleGatePassAction(selectedItem.id, 'Returned', rem || 'Returned and verified at main campus security gate.');
                              }}
                              className="py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-black uppercase rounded-xl border-none cursor-pointer text-center col-span-2"
                            >
                              Mark Returned (Security Check-In)
                            </button>
                          </>
                        ) : null}
                      </div>

                      <div className="flex gap-2 justify-between text-[10px]">
                        {selectedItem.status === 'Pending' && (
                          <button 
                            onClick={() => {
                              const rem = (document.getElementById('gatepass-remarks') as HTMLInputElement)?.value;
                              if (!rem) {
                                alert("Remarks are required to request more information.");
                                return;
                              }
                              handleGatePassAction(selectedItem.id, 'More Info Required', rem);
                            }}
                            className="text-amber-700 hover:underline font-bold bg-transparent border-none cursor-pointer"
                          >
                            ❓ Request More Info
                          </button>
                        )}

                        {(selectedItem.status === 'Approved' || selectedItem.status === 'Outside' || selectedItem.status === 'Overdue') && !isEditingTime && (
                          <button 
                            onClick={() => setIsEditingTime(true)}
                            className="text-amber-700 hover:underline font-bold bg-transparent border-none cursor-pointer"
                          >
                            ⏰ Edit Return Schedule
                          </button>
                        )}

                        {selectedItem.status !== 'Cancelled' && selectedItem.status !== 'Returned' && (
                          <button 
                            onClick={() => {
                              const rem = (document.getElementById('gatepass-remarks') as HTMLInputElement)?.value;
                              handleGatePassAction(selectedItem.id, 'Cancelled', rem || 'Cancelled by administration authority.');
                            }}
                            className="text-gray-500 hover:text-brand-red hover:underline font-bold bg-transparent border-none cursor-pointer ml-auto"
                          >
                            ✕ Cancel Pass
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col justify-center items-center text-center text-gray-400 p-8">
                    <span className="material-symbols-outlined text-5xl mb-3 text-gray-300">door_open</span>
                    <h3 className="font-bold text-gray-700 text-sm">Select Student Transit Request</h3>
                    <p className="text-xs max-w-xs mt-1">Review pending outstation requests, edit expected schedules, view attached parent consents, and issue digitally signed QR passes instantly.</p>
                  </div>
                )}
              </div>
            </div>
          )}
          </>
          )}

        </div>

        <footer className="py-6 px-8 border-t border-gray-200 text-center text-gray-400 text-xs bg-white mt-auto">
          © 2026 K.R. Mangalam University Precision ERP Administration. All rights reserved.
        </footer>
      </main>
    </div>
  );
}
