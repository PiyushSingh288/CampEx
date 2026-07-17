import React, { useState, useEffect } from 'react';
import PortalLanding from './components/PortalLanding';
import SecureLogin from './components/SecureLogin';
import StudentPortal from './components/StudentPortal';
import FacultyPortal from './components/FacultyPortal';
import AdminPortal from './components/AdminPortal';
import { supabase, determineUserRoleAndProfile } from './lib/supabase';
import { LandingSkeleton } from './components/Skeletons';

export default function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'login' | 'student-dashboard' | 'faculty-dashboard' | 'admin-dashboard'>('landing');
  const [selectedRole, setSelectedRole] = useState<'student' | 'faculty' | 'admin'>('student');
  const [user, setUser] = useState<any>(null);
  const [apiLive, setApiLive] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  // Check and restore active sessions on mount (Persistent Authentication / Remember Me)
  useEffect(() => {
    // 1. Perform server status diagnostic check on load
    fetch('/api/status')
      .then(res => res.json())
      .then(data => {
        if (data.status === 'ok') {
          setApiLive(true);
          console.log("University administrative API is active.");
        }
      })
      .catch(err => {
        console.warn("Diagnostics check failed. Running offline client fallback.", err);
      });

    // 2. Load active session
    const loadActiveSession = async () => {
      try {
        // Try real Supabase Session
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { role, profile } = await determineUserRoleAndProfile(session.user.email);
          if (role && profile) {
            setUser({ ...profile, role });
            setCurrentView(`${role}-dashboard` as any);
            return;
          }
        }
        
        // Try Mock / Local Storage Persistence
        const savedSessionId = localStorage.getItem('soet_remember_session') || sessionStorage.getItem('soet_session');
        if (savedSessionId) {
          const allRoles = ['student', 'faculty', 'admin'];
          for (const r of allRoles) {
            const tableName = r === 'student' ? 'students' : r === 'faculty' ? 'faculty' : 'admin_profiles';
            const { data } = await supabase.from(tableName).select('*').eq('id', savedSessionId).single();
            if (data) {
              setUser({ ...data, role: r });
              setCurrentView(`${r}-dashboard` as any);
              break;
            }
          }
        }
      } catch (err) {
        console.warn("Could not reload active session:", err);
      }
    };

    loadActiveSession();

    // Handle OAuth redirect completion (when popup is blocked)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('oauth') === 'success') {
      const oauthUserRaw = sessionStorage.getItem('soet_oauth_user');
      if (oauthUserRaw) {
        try {
          const oauthUser = JSON.parse(oauthUserRaw);
          sessionStorage.removeItem('soet_oauth_user');
          sessionStorage.setItem('soet_session', oauthUser.id);
          setUser(oauthUser);
          setCurrentView(`${oauthUser.role}-dashboard` as any);
        } catch (err) {
          console.warn('Could not parse OAuth session:', err);
        }
      }
      window.history.replaceState({}, '', window.location.pathname);
    } else if (urlParams.get('oauth') === 'error') {
      const oauthError = sessionStorage.getItem('soet_oauth_error');
      if (oauthError) {
        console.warn('OAuth error:', oauthError);
        sessionStorage.removeItem('soet_oauth_error');
        setCurrentView('login');
      }
      window.history.replaceState({}, '', window.location.pathname);
    }

    // Ensure checking is set to false after 1.5 seconds so user always gets a high-fidelity experience
    const timer = setTimeout(() => {
      setIsAuthChecking(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  // Route Protection & Authorization Enforcer
  useEffect(() => {
    const isDashboardView = ['student-dashboard', 'faculty-dashboard', 'admin-dashboard'].includes(currentView);
    if (isDashboardView) {
      if (!user) {
        // Unauthenticated -> redirect to login page
        setCurrentView('login');
      } else {
        // Authenticated but unauthorized role -> redirect to their designated dashboard
        const expectedDashboard = `${user.role}-dashboard`;
        if (currentView !== expectedDashboard) {
          setCurrentView(expectedDashboard as any);
        }
      }
    }
  }, [currentView, user]);

  const handleSelectRoleFromLanding = (role: 'student' | 'faculty' | 'admin') => {
    setSelectedRole(role);
    setCurrentView('login');
  };

  const handleLoginSuccess = (authenticatedUser: any) => {
    setUser(authenticatedUser);
    // Route to appropriate dashboard depending on role
    if (authenticatedUser.role === 'student') {
      setCurrentView('student-dashboard');
    } else if (authenticatedUser.role === 'faculty') {
      setCurrentView('faculty-dashboard');
    } else if (authenticatedUser.role === 'admin') {
      setCurrentView('admin-dashboard');
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn("Supabase signOut error:", e);
    }
    localStorage.removeItem('soet_remember_session');
    sessionStorage.removeItem('soet_session');
    setUser(null);
    setCurrentView('login');
  };

  if (isAuthChecking) {
    return <LandingSkeleton />;
  }

  return (
    <div className="min-h-screen text-on-surface bg-background">
      {/* Dynamic Route Switching based on session state */}
      {currentView === 'landing' && (
        <PortalLanding onSelectRole={handleSelectRoleFromLanding} />
      )}

      {currentView === 'login' && (
        <SecureLogin 
          initialRole={selectedRole} 
          onLoginSuccess={handleLoginSuccess}
          onGoBack={() => setCurrentView('landing')}
        />
      )}

      {currentView === 'student-dashboard' && user && (
        <StudentPortal user={user} onLogout={handleLogout} />
      )}

      {currentView === 'faculty-dashboard' && user && (
        <FacultyPortal user={user} onLogout={handleLogout} />
      )}

      {currentView === 'admin-dashboard' && user && (
        <AdminPortal user={user} onLogout={handleLogout} />
      )}
    </div>
  );
}
