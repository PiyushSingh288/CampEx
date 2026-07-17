import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Bell, 
  HelpCircle, 
  LogOut, 
  User, 
  Edit2, 
  Settings, 
  Mail, 
  Phone, 
  MapPin, 
  Building, 
  ChevronDown, 
  Check, 
  X, 
  Upload, 
  Trash, 
  Plus, 
  ArrowLeft,
  Camera,
  Info,
  Shield,
  Clock,
  AlertTriangle,
  BookOpen
} from 'lucide-react';

interface HeaderProps {
  role: 'student' | 'faculty' | 'admin';
  user: any;
  onLogout: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  // Search parameters
  searchValue: string;
  onSearchChange: (value: string) => void;
}

export default function Header({ 
  role, 
  user, 
  onLogout, 
  activeTab, 
  setActiveTab,
  searchValue,
  onSearchChange
}: HeaderProps) {
  // Dropdown States
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  // Modal States
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [helpCenterOpen, setHelpCenterOpen] = useState(false);
  const [activeHelpTab, setActiveHelpTab] = useState<'faq' | 'contact' | 'report' | 'guide'>('faq');

  // Profile data fetched from backend
  const [profile, setProfile] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Edit form states
  const [editForm, setEditForm] = useState<any>({});
  const [editPhotoPreview, setEditPhotoPreview] = useState<string | null>(null);
  const [zoomScale, setZoomScale] = useState<number>(1.0); // simple representation of Crop

  // Notification states
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);

  // Support/Bug Report form state
  const [bugReportText, setBugReportText] = useState('');
  const [bugReportCategory, setBugReportCategory] = useState('UI Glitch');
  const [bugReportSuccess, setBugReportSuccess] = useState(false);

  // Refs for closing on outside click
  const profileRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const helpRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initial load of profile & notifications
  const loadProfileAndNotifs = async () => {
    if (!user) return;
    try {
      setLoadingProfile(true);
      // Fetch dynamic profile
      const res = await fetch(`/api/profile/${role}/${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setEditForm(data);
        setEditPhotoPreview(data.photoUrl || null);
      }

      // Fetch dynamic notifications
      const notifRes = await fetch('/api/notifications');
      if (notifRes.ok) {
        const notifData = await notifRes.json();
        setNotifications(notifData);
        // Calculate unread count
        const unreadCount = notifData.filter((n: any) => !n.readBy.includes(user.id)).length;
        setUnreadNotifCount(unreadCount);
      }
    } catch (err) {
      console.error("Error loading profile/notifications inside Header:", err);
    } finally {
      setLoadingProfile(false);
    }
  };

  useEffect(() => {
    loadProfileAndNotifs();
  }, [role, user]);

  // Handle outside clicks to close dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
      if (helpRef.current && !helpRef.current.contains(event.target as Node)) {
        setHelpOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Format Display Initials
  const getInitials = (fullName: string) => {
    if (!fullName) return "U";
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // Profile image upload handler
  const handlePhotoUploadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
        alert("Supported formats are PNG, JPG, and JPEG only.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit Profile Form
  const handleProfileSaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      // First save profile image if changed
      let finalPhotoUrl = profile?.photoUrl || "";
      if (editPhotoPreview !== profile?.photoUrl) {
        // Upload base64 or photo URL to server
        const uploadRes = await fetch(`/api/profile/${role}/${user.id}/upload`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ photoUrl: editPhotoPreview })
        });
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          finalPhotoUrl = uploadData.photoUrl;
        }
      }

      // Reconstruct first & last name into fullName if they were input
      let updatedFullName = profile?.fullName || "";
      if (editForm.firstName || editForm.lastName) {
        updatedFullName = `${editForm.firstName || ''} ${editForm.lastName || ''}`.trim();
      }

      // Save rest of profile fields
      const saveRes = await fetch(`/api/profile/${role}/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editForm,
          fullName: updatedFullName || editForm.fullName || profile?.fullName,
          photoUrl: finalPhotoUrl
        })
      });

      if (saveRes.ok) {
        const saveData = await saveRes.json();
        setProfile(saveData.profile);
        // Refresh header and trigger parent sync if any
        setEditProfileOpen(false);
        // Dispatch custom event to let panels know profile was updated
        window.dispatchEvent(new CustomEvent('soet-profile-updated', { detail: saveData.profile }));
        alert("Profile updated successfully!");
      }
    } catch (err) {
      console.error("Failed to save profile changes:", err);
      alert("Error occurred while saving your changes. Please try again.");
    }
  };

  // Mark all notifications as read
  const handleMarkAllNotificationsRead = async () => {
    if (!user) return;
    try {
      const res = await fetch('/api/notifications/mark-all-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications);
        setUnreadNotifCount(0);
        // Dispatch custom event for portals
        window.dispatchEvent(new CustomEvent('soet-notifications-updated', { detail: data.notifications }));
      }
    } catch (err) {
      console.error("Error marking read:", err);
    }
  };

  // Support/Bug report submit
  const handleBugReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bugReportText.trim()) return;

    // Simulate sending report
    setTimeout(() => {
      setBugReportText('');
      setBugReportSuccess(true);
      setTimeout(() => setBugReportSuccess(false), 4000);
    }, 800);
  };

  // Helper displays
  const getSearchPlaceholder = () => {
    if (role === 'student') return "Search courses, documents...";
    if (role === 'faculty') return "Search academic records...";
    return "Search students, faculty, payments, grievances...";
  };

  const getProfileHeaderDisplay = () => {
    if (loadingProfile || !profile) {
      return {
        fullName: user?.fullName || "SOET User",
        subline: role === 'student' ? "SOET Student" : role === 'faculty' ? "Faculty Member" : "Administrator"
      };
    }

    if (role === 'student') {
      return {
        fullName: profile.fullName || "Student",
        subline: `${profile.enrollmentNo || profile.rollNo || "KRMU2426118"} • ${profile.program || "B.Tech CSE"} • ${profile.currentSemester || "Semester 5"}`
      };
    } else if (role === 'faculty') {
      return {
        fullName: `${profile.fullName || "Dr. Elena Vance"}`,
        subline: `${profile.designation || "Associate Professor"} • ${profile.employeeId || "EMP-2045"} • ${profile.department || "CSE Department"}`
      };
    } else {
      return {
        fullName: profile.fullName || "Registrar General",
        subline: `${profile.designation || "Dean"} • ${profile.employeeId || "ADM-0001"} • ${profile.department || "Institutional Administration"}`
      };
    }
  };

  const { fullName: displayName, subline: displaySubline } = getProfileHeaderDisplay();

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-40 w-full" id="global-soet-header" data-purpose="top-header">
      
      {/* 1 & 2. Global Search Bar */}
      <div className="flex-1 max-w-xl pr-4">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 select-none">
            <Search className="w-4 h-4 text-gray-400" />
          </span>
          <input 
            type="text"
            className="block w-full pl-10 pr-4 py-2 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-brand-red/20 focus:border-brand-red bg-gray-50 text-gray-700 transition-all placeholder:text-gray-400" 
            placeholder={getSearchPlaceholder()} 
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>
      
      {/* Right Actions Block */}
      <div className="flex items-center space-x-6">
        
        {/* 7. Notification Integration */}
        <div className="relative" ref={notificationsRef}>
          <button 
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="text-gray-500 hover:text-brand-red relative cursor-pointer p-1 rounded-full hover:bg-gray-100 transition-colors flex items-center justify-center focus:outline-none"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadNotifCount > 0 && (
              <span className="absolute top-0 right-0 flex items-center justify-center bg-brand-red text-white text-[9px] font-black px-1 rounded-full min-w-[16px] h-4 leading-none ring-2 ring-white">
                {unreadNotifCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 text-left animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-semibold text-gray-800 text-sm">Recent Notifications</h3>
                {unreadNotifCount > 0 && (
                  <button 
                    onClick={handleMarkAllNotificationsRead}
                    className="text-xs text-brand-red hover:underline font-bold focus:outline-none cursor-pointer"
                  >
                    Mark All Read
                  </button>
                )}
              </div>
              
              <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-gray-400 text-xs">
                    No notifications available
                  </div>
                ) : (
                  notifications.slice(0, 5).map((notif) => {
                    const isUnread = user && !notif.readBy.includes(user.id);
                    return (
                      <div 
                        key={notif.id} 
                        className={`p-3 text-xs hover:bg-gray-50 transition-colors cursor-pointer ${isUnread ? 'bg-red-50/40 font-medium border-l-2 border-brand-red' : ''}`}
                        onClick={() => {
                          setActiveTab('notification');
                          setNotificationsOpen(false);
                        }}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-gray-500 text-[10px] uppercase font-bold tracking-wider">{notif.type}</span>
                          <span className="text-[10px] text-gray-400">{new Date(notif.date).toLocaleDateString()}</span>
                        </div>
                        <p className="text-gray-800 font-semibold mb-0.5">{notif.title}</p>
                        <p className="text-gray-500 line-clamp-2">{notif.body}</p>
                      </div>
                    );
                  })
                )}
              </div>
              
              <div className="p-3 bg-gray-50 text-center border-t border-gray-100">
                <button 
                  onClick={() => {
                    setActiveTab('notification');
                    setNotificationsOpen(false);
                  }}
                  className="text-xs font-bold text-gray-600 hover:text-brand-red cursor-pointer focus:outline-none"
                >
                  View All Notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 8. Help Center */}
        <div className="relative" ref={helpRef}>
          <button 
            onClick={() => setHelpOpen(!helpOpen)}
            className="text-gray-500 hover:text-brand-red cursor-pointer p-1 rounded-full hover:bg-gray-100 transition-colors flex items-center justify-center focus:outline-none"
            title="Help & Support"
          >
            <HelpCircle className="w-5 h-5" />
          </button>

          {/* Help Dropdown Menu */}
          {helpOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-100 py-1.5 z-50 text-left animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3.5 py-1 text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50 pb-1.5 mb-1.5">
                Support &amp; Guides
              </div>
              <button 
                onClick={() => { setHelpCenterOpen(true); setActiveHelpTab('faq'); setHelpOpen(false); }}
                className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 hover:text-brand-red flex items-center gap-2.5 cursor-pointer"
              >
                <BookOpen className="w-4 h-4 text-gray-400" /> Support Center / FAQs
              </button>
              <button 
                onClick={() => { setHelpCenterOpen(true); setActiveHelpTab('contact'); setHelpOpen(false); }}
                className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 hover:text-brand-red flex items-center gap-2.5 cursor-pointer"
              >
                <Mail className="w-4 h-4 text-gray-400" /> Contact Administration
              </button>
              <button 
                onClick={() => { setHelpCenterOpen(true); setActiveHelpTab('report'); setHelpOpen(false); }}
                className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 hover:text-brand-red flex items-center gap-2.5 cursor-pointer"
              >
                <AlertTriangle className="w-4 h-4 text-gray-400" /> Report System Issue
              </button>
              <button 
                onClick={() => { setHelpCenterOpen(true); setActiveHelpTab('guide'); setHelpOpen(false); }}
                className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 hover:text-brand-red flex items-center gap-2.5 cursor-pointer"
              >
                <Info className="w-4 h-4 text-gray-400" /> Portal User Guide
              </button>
            </div>
          )}
        </div>
        
        {/* 3. Dynamic User Profile - Split-display details */}
        <div className="flex items-center space-x-3 border-l pl-6 border-gray-200 relative" ref={profileRef}>
          
          {/* Main click zone for Profile panel */}
          <button 
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex items-center text-right space-x-3 group focus:outline-none cursor-pointer"
          >
            {/* Responsiveness: Desktop show details, tablet/mobile hide them */}
            <div className="text-right hidden md:block select-none max-w-[200px]">
              <p className="text-sm font-semibold text-gray-800 line-clamp-1 group-hover:text-brand-red transition-colors">
                {displayName}
              </p>
              {/* Desktop shows full second-line details, tablet compacts it */}
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider line-clamp-1 truncate block max-w-xs">
                {displaySubline.split(' • ').slice(0, 2).join(' • ')}
              </p>
            </div>

            {/* Avatar / Profile photo display */}
            <div className="relative">
              {profile?.photoUrl ? (
                <img 
                  src={profile.photoUrl} 
                  alt={displayName} 
                  className="h-10 w-10 rounded-full object-cover border border-outline-variant shadow-sm transition-transform group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-brand-red text-white flex items-center justify-center text-sm font-black border border-outline-variant select-none shadow-sm transition-transform group-hover:scale-105">
                  {getInitials(displayName)}
                </div>
              )}
              {/* Online indicator */}
              <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
            </div>
            
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600 transition-colors hidden sm:block" />
          </button>

          {/* 4. Clickable Profile Dropdown Panel */}
          {profileDropdownOpen && (
            <div className="absolute right-0 mt-2 top-12 w-72 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 text-left animate-in fade-in slide-in-from-top-2 duration-150">
              
              {/* Dropdown Header Card */}
              <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center space-x-3.5">
                {profile?.photoUrl ? (
                  <img 
                    src={profile.photoUrl} 
                    alt={displayName} 
                    className="h-14 w-14 rounded-full object-cover border-2 border-white shadow-md"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="h-14 w-14 rounded-full bg-brand-red text-white flex items-center justify-center text-lg font-black border border-outline shadow-md select-none">
                    {getInitials(displayName)}
                  </div>
                )}
                <div>
                  <h4 className="font-bold text-gray-800 text-sm leading-tight">{displayName}</h4>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">{role}</p>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <span className="block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    <span className="text-[10px] font-semibold text-emerald-600 tracking-wider">ONLINE</span>
                  </div>
                </div>
              </div>

              {/* Dynamic Key Information List */}
              <div className="p-4 space-y-2.5 text-xs text-gray-600 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                  <span className="truncate" title={profile?.email || user?.email}>{profile?.email || user?.email}</span>
                </div>
                {profile?.mobileNumber || profile?.phone ? (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                    <span>{profile?.mobileNumber || profile?.phone}</span>
                  </div>
                ) : null}
                <div className="flex items-center gap-2">
                  <Building className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                  <span className="truncate">{profile?.department || profile?.branch || "Institutional Operations"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Settings className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                  <span>
                    {role === 'student' ? 'Roll No: ' : 'Emp ID: '}
                    <strong>{profile?.enrollmentNo || profile?.rollNo || profile?.employeeId || "ADM-0001"}</strong>
                  </span>
                </div>
              </div>

              {/* Quick Actions Buttons */}
              <div className="p-2 bg-white flex flex-col space-y-0.5">
                <button 
                  onClick={() => { 
                    if (role !== 'admin') {
                      setActiveTab('profile'); 
                    } else {
                      alert("Admin Console does not have a separate profile tab, you can view & edit everything here!");
                    }
                    setProfileDropdownOpen(false); 
                  }}
                  className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 hover:text-brand-red rounded-lg transition-colors flex items-center gap-2 cursor-pointer focus:outline-none"
                >
                  <User className="w-3.5 h-3.5" /> My Profile
                </button>
                <button 
                  onClick={() => { setEditProfileOpen(true); setProfileDropdownOpen(false); }}
                  className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 hover:text-brand-red rounded-lg transition-colors flex items-center gap-2 cursor-pointer focus:outline-none"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Edit Profile
                </button>
                <button 
                  onClick={() => { 
                    alert("Change Password validation. A temporary code has been sent to your institutional email."); 
                    setProfileDropdownOpen(false); 
                  }}
                  className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 hover:text-brand-red rounded-lg transition-colors flex items-center gap-2 cursor-pointer focus:outline-none"
                >
                  <Shield className="w-3.5 h-3.5" /> Change Password
                </button>
                
                <div className="border-t border-gray-100 my-1" />
                
                <button 
                  onClick={() => { setProfileDropdownOpen(false); onLogout(); }}
                  className="w-full text-left px-3 py-2 text-xs text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2 cursor-pointer font-semibold focus:outline-none"
                >
                  <LogOut className="w-3.5 h-3.5" /> Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 5 & 6. Edit Profile Modal (Role-Based Fields & Pictures) */}
      {editProfileOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-xs text-left animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-gray-100">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div>
                <h3 className="font-bold text-gray-800 text-base">Edit Institutional Profile</h3>
                <p className="text-xs text-gray-500 mt-0.5">Maintain your administrative records & authentication credentials</p>
              </div>
              <button 
                onClick={() => setEditProfileOpen(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer p-1 rounded-full hover:bg-gray-100 focus:outline-none"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Content */}
            <form onSubmit={handleProfileSaveSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              
              {/* Profile Photo Upload Panel */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex flex-col sm:flex-row items-center gap-6">
                
                <div className="relative group">
                  {editPhotoPreview ? (
                    <img 
                      src={editPhotoPreview} 
                      alt="Avatar Preview" 
                      className="h-24 w-24 rounded-full object-cover border-2 border-brand-red/20 shadow-md"
                      style={{ transform: `scale(${zoomScale})` }}
                    />
                  ) : (
                    <div className="h-24 w-24 rounded-full bg-brand-red text-white flex items-center justify-center text-2xl font-black border shadow-md select-none">
                      {getInitials(displayName)}
                    </div>
                  )}
                  <button 
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 bg-brand-red text-white p-1.5 rounded-full hover:bg-red-700 shadow-md transition-colors cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex-1 text-center sm:text-left space-y-2">
                  <h4 className="font-bold text-gray-800 text-xs">Profile Picture</h4>
                  <p className="text-[11px] text-gray-500">Supports PNG, JPG, or JPEG formats. Size limit 2MB.</p>
                  
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                    <button 
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 bg-brand-red hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" /> Upload File
                    </button>
                    {editPhotoPreview && (
                      <>
                        <button 
                          type="button"
                          onClick={() => {
                            // Simple visual zoom representation of Crop
                            const scale = zoomScale >= 1.5 ? 1.0 : zoomScale + 0.25;
                            setZoomScale(scale);
                          }}
                          className="px-3 py-1.5 border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                        >
                          Crop/Zoom ({zoomScale}x)
                        </button>
                        <button 
                          type="button"
                          onClick={() => {
                            setEditPhotoPreview(null);
                            setZoomScale(1.0);
                          }}
                          className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <Trash className="w-3.5 h-3.5" /> Remove
                        </button>
                      </>
                    )}
                  </div>
                  
                  {/* Hidden Input File */}
                  <input 
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept=".png, .jpg, .jpeg"
                    onChange={handlePhotoUploadChange}
                  />
                </div>
              </div>

              {/* Standard Personal Information fields */}
              <div className="space-y-4">
                <h4 className="font-bold text-xs text-gray-400 uppercase tracking-wider border-b pb-1.5">Personal Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">First Name</label>
                    <input 
                      type="text" 
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-brand-red focus:border-brand-red outline-none" 
                      placeholder="e.g., Piyush"
                      value={editForm.firstName || ''} 
                      onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Last Name</label>
                    <input 
                      type="text" 
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-brand-red focus:border-brand-red outline-none" 
                      placeholder="e.g., Singh"
                      value={editForm.lastName || ''} 
                      onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Institutional Email</label>
                    <input 
                      type="email" 
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs bg-gray-50 text-gray-500 cursor-not-allowed outline-none" 
                      value={editForm.email || ''} 
                      disabled 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Mobile / Phone Number</label>
                    <input 
                      type="text" 
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-brand-red focus:border-brand-red outline-none" 
                      value={editForm.mobileNumber || editForm.phone || ''} 
                      onChange={(e) => setEditForm({ ...editForm, mobileNumber: e.target.value, phone: e.target.value })}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-600 mb-1">Permanent Residential Address</label>
                    <textarea 
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-brand-red focus:border-brand-red outline-none min-h-[60px]" 
                      value={editForm.address || ''} 
                      onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-600 mb-1">Emergency Contact Details</label>
                    <input 
                      type="text" 
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-brand-red focus:border-brand-red outline-none" 
                      value={editForm.emergencyContact || ''} 
                      onChange={(e) => setEditForm({ ...editForm, emergencyContact: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Role-Specific Fields */}
              {role === 'student' && (
                <div className="space-y-4">
                  <h4 className="font-bold text-xs text-gray-400 uppercase tracking-wider border-b pb-1.5">Student Enrollment Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">Course / Program</label>
                      <input 
                        type="text" 
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-brand-red focus:border-brand-red outline-none" 
                        value={editForm.program || ''} 
                        onChange={(e) => setEditForm({ ...editForm, program: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">Current Semester</label>
                      <input 
                        type="text" 
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-brand-red focus:border-brand-red outline-none" 
                        value={editForm.currentSemester || ''} 
                        onChange={(e) => setEditForm({ ...editForm, currentSemester: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">Section</label>
                      <input 
                        type="text" 
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-brand-red focus:border-brand-red outline-none" 
                        placeholder="e.g., Section A"
                        value={editForm.section || 'Section A'} 
                        onChange={(e) => setEditForm({ ...editForm, section: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">Roll / Enrollment Number</label>
                      <input 
                        type="text" 
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs bg-gray-50 text-gray-500 cursor-not-allowed outline-none" 
                        value={editForm.enrollmentNo || editForm.rollNo || ''} 
                        disabled 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">Hostel Block / Status</label>
                      <input 
                        type="text" 
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-brand-red focus:border-brand-red outline-none" 
                        value={editForm.hostel || ''} 
                        onChange={(e) => setEditForm({ ...editForm, hostel: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">Transport Route</label>
                      <input 
                        type="text" 
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-brand-red focus:border-brand-red outline-none" 
                        value={editForm.transportRoute || ''} 
                        onChange={(e) => setEditForm({ ...editForm, transportRoute: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              )}

              {role === 'faculty' && (
                <div className="space-y-4">
                  <h4 className="font-bold text-xs text-gray-400 uppercase tracking-wider border-b pb-1.5">Academic Faculty Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">Designation</label>
                      <input 
                        type="text" 
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-brand-red focus:border-brand-red outline-none" 
                        value={editForm.designation || ''} 
                        onChange={(e) => setEditForm({ ...editForm, designation: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">Department</label>
                      <input 
                        type="text" 
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-brand-red focus:border-brand-red outline-none" 
                        value={editForm.department || ''} 
                        onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">Highest Qualification</label>
                      <input 
                        type="text" 
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-brand-red focus:border-brand-red outline-none" 
                        value={editForm.qualification || editForm.highestQualification || ''} 
                        onChange={(e) => setEditForm({ ...editForm, qualification: e.target.value, highestQualification: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">Professional Experience</label>
                      <input 
                        type="text" 
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-brand-red focus:border-brand-red outline-none" 
                        value={editForm.experience || ''} 
                        onChange={(e) => setEditForm({ ...editForm, experience: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">Core Research Area</label>
                      <input 
                        type="text" 
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-brand-red focus:border-brand-red outline-none" 
                        value={editForm.researchArea || editForm.specialization || ''} 
                        onChange={(e) => setEditForm({ ...editForm, researchArea: e.target.value, specialization: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">Office Cabin / Room</label>
                      <input 
                        type="text" 
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-brand-red focus:border-brand-red outline-none" 
                        value={editForm.officeRoom || editForm.officeLocation || ''} 
                        onChange={(e) => setEditForm({ ...editForm, officeRoom: e.target.value, officeLocation: e.target.value })}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-gray-600 mb-1">Office Consultation Hours</label>
                      <input 
                        type="text" 
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-brand-red focus:border-brand-red outline-none" 
                        value={editForm.officeHours || ''} 
                        onChange={(e) => setEditForm({ ...editForm, officeHours: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              )}

              {role === 'admin' && (
                <div className="space-y-4">
                  <h4 className="font-bold text-xs text-gray-400 uppercase tracking-wider border-b pb-1.5">Administrative Office Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">Designation</label>
                      <input 
                        type="text" 
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-brand-red focus:border-brand-red outline-none" 
                        value={editForm.designation || ''} 
                        onChange={(e) => setEditForm({ ...editForm, designation: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">Administrative Department</label>
                      <input 
                        type="text" 
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-brand-red focus:border-brand-red outline-none" 
                        value={editForm.department || ''} 
                        onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">Employee ID Number</label>
                      <input 
                        type="text" 
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs bg-gray-50 text-gray-500 cursor-not-allowed outline-none" 
                        value={editForm.employeeId || 'ADM-0001'} 
                        disabled 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-600 mb-1">Office Room Number</label>
                      <input 
                        type="text" 
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-brand-red focus:border-brand-red outline-none" 
                        value={editForm.officeNumber || ''} 
                        onChange={(e) => setEditForm({ ...editForm, officeNumber: e.target.value })}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-gray-600 mb-1">Governance / Administration Role</label>
                      <input 
                        type="text" 
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-brand-red focus:border-brand-red outline-none" 
                        value={editForm.administrationRole || ''} 
                        onChange={(e) => setEditForm({ ...editForm, administrationRole: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              )}
            </form>

            {/* Modal Actions Footer */}
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-2.5">
              <button 
                type="button"
                onClick={() => setEditProfileOpen(false)}
                className="px-4 py-2 border border-gray-200 hover:bg-gray-100 text-gray-600 rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="submit"
                onClick={handleProfileSaveSubmit}
                className="px-5 py-2 bg-brand-red hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-colors shadow-sm cursor-pointer"
              >
                Save Changes
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Support & Help Center modal */}
      {helpCenterOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-xs text-left animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl border border-gray-100">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div>
                <h3 className="font-bold text-gray-800 text-base flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-brand-red" /> SOET Institutional Help Desk
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">Find documentation, get system guides, or contact support</p>
              </div>
              <button 
                onClick={() => setHelpCenterOpen(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer p-1 rounded-full hover:bg-gray-100 focus:outline-none"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Navigation Segmented Control */}
            <div className="bg-white px-6 py-3 border-b border-gray-100 flex gap-2">
              <button 
                type="button" 
                onClick={() => setActiveHelpTab('faq')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${activeHelpTab === 'faq' ? 'bg-brand-red text-white' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                FAQs
              </button>
              <button 
                type="button" 
                onClick={() => setActiveHelpTab('contact')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${activeHelpTab === 'contact' ? 'bg-brand-red text-white' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                Contact Administration
              </button>
              <button 
                type="button" 
                onClick={() => setActiveHelpTab('report')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${activeHelpTab === 'report' ? 'bg-brand-red text-white' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                Report Issue
              </button>
              <button 
                type="button" 
                onClick={() => setActiveHelpTab('guide')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${activeHelpTab === 'guide' ? 'bg-brand-red text-white' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                User Guide
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar text-xs leading-relaxed text-gray-600">
              
              {activeHelpTab === 'faq' && (
                <div className="space-y-4">
                  <h4 className="font-bold text-sm text-gray-800">Frequently Asked Questions</h4>
                  <div className="space-y-3.5">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="font-bold text-gray-800 mb-1">Q: How is my overall attendance calculated?</p>
                      <p>Your attendance is logged daily by classroom faculty and synced instantly with our backend. You require a minimum of 75% attendance to qualify for terminal exams.</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="font-bold text-gray-800 mb-1">Q: Where can I download my Semester Grade Sheet?</p>
                      <p>Go to the <strong>Grades</strong> tab in your navigation panel, look for your semesters and click on the 'Export PDF Report' button.</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="font-bold text-gray-800 mb-1">Q: How do I submit a grievance ticket?</p>
                      <p>Select the <strong>Grievance</strong> option from your main sidebar. Type your issue title, category, and select priorities, then submit the complaint immediately to administration.</p>
                    </div>
                  </div>
                </div>
              )}

              {activeHelpTab === 'contact' && (
                <div className="space-y-4">
                  <h4 className="font-bold text-sm text-gray-800">Contact Administrative Offices</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border border-gray-100 rounded-xl space-y-2">
                      <h5 className="font-bold text-gray-800 text-xs uppercase text-brand-red">SOET Registrar General</h5>
                      <p>Office Room: Room B-101, Main Building</p>
                      <p>Email: <a href="mailto:registrar@krmangalam.edu.in" className="text-brand-red font-semibold hover:underline">registrar@krmangalam.edu.in</a></p>
                      <p>Phone: +91 99999 11111</p>
                    </div>
                    <div className="p-4 border border-gray-100 rounded-xl space-y-2">
                      <h5 className="font-bold text-gray-800 text-xs uppercase text-brand-red">Technical Support Desk</h5>
                      <p>Office Room: Room C-204, IT Block</p>
                      <p>Email: <a href="mailto:tech.support@krmangalam.edu.in" className="text-brand-red font-semibold hover:underline">tech.support@krmangalam.edu.in</a></p>
                      <p>Phone: +91 99999 22222</p>
                    </div>
                  </div>
                </div>
              )}

              {activeHelpTab === 'report' && (
                <div className="space-y-4">
                  <h4 className="font-bold text-sm text-gray-800">Report System Issue</h4>
                  {bugReportSuccess ? (
                    <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-700 font-bold flex items-center gap-2">
                      <Check className="w-5 h-5" /> Ticket created! The institutional IT desk will inspect your submission.
                    </div>
                  ) : (
                    <form onSubmit={handleBugReportSubmit} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1">Issue Category</label>
                        <select 
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none"
                          value={bugReportCategory}
                          onChange={(e) => setBugReportCategory(e.target.value)}
                        >
                          <option value="UI Glitch">UI Alignment / Interface Glitch</option>
                          <option value="Network Timeout">Slow Sync / Network Timeout</option>
                          <option value="Profile Update">Profile Information Saving Error</option>
                          <option value="Database">Wrong Attendance or Grades Displayed</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-600 mb-1">Description of Issue</label>
                        <textarea 
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none min-h-[100px]"
                          placeholder="Provide steps to reproduce the issue..."
                          value={bugReportText}
                          onChange={(e) => setBugReportText(e.target.value)}
                          required
                        />
                      </div>
                      <button 
                        type="submit" 
                        className="px-4 py-2 bg-brand-red hover:bg-red-700 text-white font-bold rounded-lg transition-colors cursor-pointer"
                      >
                        Submit IT Support Ticket
                      </button>
                    </form>
                  )}
                </div>
              )}

              {activeHelpTab === 'guide' && (
                <div className="space-y-4">
                  <h4 className="font-bold text-sm text-gray-800">Academic Portal User Guide</h4>
                  <div className="space-y-3">
                    <p>Welcome to the School of Engineering &amp; Technology (SOET) unified governance system. This portal connects academic registries, attendance records, financial books, and grievance desks into a single high-performance interface.</p>
                    <div className="space-y-2 pl-4 border-l-2 border-brand-red">
                      <p><strong>Students:</strong> Monitor continuous assessments, view grading sheets, verify document wallets, request gate passes, and check fee installments.</p>
                      <p><strong>Faculty:</strong> Input attendance lists, configure academic syllabus progress, review research approvals, and manage leave balances.</p>
                      <p><strong>Administrators:</strong> Audit enrollment counts, verify fee transactions, moderate active grievances, post board notifications, and track live security logs.</p>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
              <button 
                type="button"
                onClick={() => setHelpCenterOpen(false)}
                className="px-4 py-2 bg-brand-red hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-colors shadow-sm cursor-pointer"
              >
                Done
              </button>
            </div>

          </div>
        </div>
      )}

    </header>
  );
}
