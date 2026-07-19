import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || '';

export const isRealSupabase = !!(supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('placeholder'));

const supabaseInstance = isRealSupabase ? createClient(supabaseUrl, supabaseAnonKey) : null as any;

// Stateful Local Mock for local testing & preview compatibility
class MockAuthService {
  private listeners: Array<(event: string, session: any) => void> = [];
  private currentUser: any = null;

  constructor() {
    this.initializeMockData();
    this.restoreSession();
  }

  private initializeMockData() {
    // Simulated Supabase Auth User Database in localStorage
    if (!localStorage.getItem('soet_mock_auth_users')) {
      const initialUsers = [
        {
          id: 'piyush-kumar',
          email: 'piyush.kumar@krmu.ac.in',
          passwordHash: this.simpleHash('tempPass123'), // Temporary Password
          is_first_login: true,
          fullName: 'Piyush Kumar',
          role: 'student',
          google_linked: false,
          microsoft_linked: false,
          photoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuASInz3fouGCVLXLiMDjuPIO5hsZXNfB2qlfAg8AzuesXkvN92i3TPJ3B4bQ72Hq1eXNxEnKDh2EPb_AV7oacPba73KP8V0OHyMTKrnU3d4w65J9sEiW1nwzHQwiIuEWoY4bzwVl0suLWVyJFCZ5Nat4P7l2dlKPIiFB0_cO0Xixnj9PtQuvClvU9oNN08LtGVWfp6c7-PUwJX6pyULZOzIx1LcRbEeSe2CrKzTTCqGiJYEDNfVkGfit1HOxPUErUR87IMWtDn8_kw',
          enrollmentNo: 'KRMU-23-45210',
          program: 'B.Tech CSE',
          branch: 'Computer Science & Engineering',
          currentSemester: 'Semester 6',
          dob: '23 May 2004',
          mobileNumber: '+91 99999 88888',
          bloodGroup: 'B+',
          emergencyContact: '+91 99999 11111 (Father - Mr. Rajesh Kumar)'
        },
        {
          id: 'alex-sterling',
          email: 'alex.sterling@krmu.edu.in',
          passwordHash: this.simpleHash('password123'),
          is_first_login: false,
          fullName: 'Alex Sterling',
          role: 'student',
          google_linked: false,
          microsoft_linked: false,
          photoUrl: '',
          enrollmentNo: 'KRMU-21-98765',
          program: 'B.Tech CSE',
          branch: 'Computer Science & Engineering',
          currentSemester: 'Semester 8',
          dob: '14 May 2005',
          mobileNumber: '+91 98123 45678',
          bloodGroup: 'O+',
          emergencyContact: '+91 98123 45670 (Mother - Mrs. Sterling)'
        },
        {
          id: 'elena-vance',
          email: 'elena.vance@krmangalam.edu.in',
          passwordHash: this.simpleHash('tempPass456'), // Temporary Password
          is_first_login: true,
          fullName: 'Dr. Elena Vance',
          role: 'faculty',
          google_linked: false,
          microsoft_linked: false,
          photoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuASInz3fouGCVLXLiMDjuPIO5hsZXNfB2qlfAg8AzuesXkvN92i3TPJ3B4bQ72Hq1eXNxEnKDh2EPb_AV7oacPba73KP8V0OHyMTKrnU3d4w65J9sEiW1nwzHQwiIuEWoY4bzwVl0suLWVyJFCZ5Nat4P7l2dlKPIiFB0_cO0Xixnj9PtQuvClvU9oNN08LtGVWfp6c7-PUwJX6pyULZOzIx1LcRbEeSe2CrKzTTCqGiJYEDNfVkGfit1HOxPUErUR87IMWtDn8_kw',
          employeeId: 'EMP-2045',
          department: 'CSE Department',
          officeHours: 'Mon, Wed, Fri (02:00 PM - 04:00 PM)',
          cabin: 'Cabin C-412A'
        },
        {
          id: 'admin-governance',
          email: 'admin.portal@krmangalam.edu.in',
          passwordHash: this.simpleHash('tempPass789'), // Temporary Password
          is_first_login: true,
          fullName: 'Registrar General',
          role: 'admin',
          google_linked: false,
          microsoft_linked: false,
          photoUrl: '',
          employeeId: 'ADM-0001',
          department: 'Institutional Administration'
        }
      ];
      localStorage.setItem('soet_mock_auth_users', JSON.stringify(initialUsers));
    }
  }

  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return 'hash_' + hash.toString(16);
  }

  private restoreSession() {
    const sessionToken = localStorage.getItem('soet_remember_session') || sessionStorage.getItem('soet_session');
    if (sessionToken) {
      const users = JSON.parse(localStorage.getItem('soet_mock_auth_users') || '[]');
      const found = users.find((u: any) => u.id === sessionToken);
      if (found) {
        this.currentUser = found;
      }
    }
  }

  getUsers(): any[] {
    return JSON.parse(localStorage.getItem('soet_mock_auth_users') || '[]');
  }

  saveUsers(users: any[]) {
    localStorage.setItem('soet_mock_auth_users', JSON.stringify(users));
  }

  async getSession() {
    if (this.currentUser) {
      return { data: { session: { user: this.currentUser } }, error: null };
    }
    return { data: { session: null }, error: null };
  }

  async signInWithPassword({ email, password }: any) {
    const users = this.getUsers();
    const user = users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
    
    if (!user) {
      return { data: { user: null }, error: { message: 'Invalid university credentials' } };
    }

    if (user.passwordHash !== this.simpleHash(password)) {
      return { data: { user: null }, error: { message: 'Incorrect password' } };
    }

    this.currentUser = user;
    return { data: { user }, error: null };
  }

  async signUp({ email, password, options }: any) {
    const users = this.getUsers();
    if (users.some((u: any) => u.email.toLowerCase() === email.toLowerCase())) {
      return { data: { user: null }, error: { message: 'Account already exists' } };
    }

    const newUser = {
      id: 'usr_' + Math.random().toString(36).substr(2, 9),
      email,
      passwordHash: this.simpleHash(password),
      is_first_login: false,
      fullName: options?.data?.fullName || email.split('@')[0],
      role: options?.data?.role || 'student',
      google_linked: false,
      microsoft_linked: false,
      photoUrl: ''
    };

    users.push(newUser);
    this.saveUsers(users);
    return { data: { user: newUser }, error: null };
  }

  async updateUser({ password, data }: any) {
    if (!this.currentUser) {
      return { data: { user: null }, error: { message: 'No active session' } };
    }

    const users = this.getUsers();
    const idx = users.findIndex((u: any) => u.id === this.currentUser.id);
    if (idx !== -1) {
      if (password) {
        users[idx].passwordHash = this.simpleHash(password);
        users[idx].is_first_login = false;
      }
      if (data) {
        users[idx] = { ...users[idx], ...data };
      }
      this.currentUser = users[idx];
      this.saveUsers(users);
      this.notifyListeners('USER_UPDATED', { user: this.currentUser });
      return { data: { user: this.currentUser }, error: null };
    }

    return { data: { user: null }, error: { message: 'User not found in registry' } };
  }

  async resetPasswordForEmail(email: string, options?: any) {
    const users = this.getUsers();
    const user = users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return { data: null, error: { message: 'University email not found in records' } };
    }
    // Simulate reset link code
    const resetCode = 'reset_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('soet_reset_code', JSON.stringify({ email, code: resetCode, expires: Date.now() + 3600000 }));
    console.log(`Password reset code generated for ${email}: ${resetCode}`);
    return { data: { resetCode }, error: null };
  }

  async signOut() {
    this.currentUser = null;
    localStorage.removeItem('soet_remember_session');
    sessionStorage.removeItem('soet_session');
    this.notifyListeners('SIGNED_OUT', null);
    return { error: null };
  }

  onAuthStateChange(callback: (event: string, session: any) => void) {
    this.listeners.push(callback);
    // Initial emission
    if (this.currentUser) {
      callback('SIGNED_IN', { user: this.currentUser });
    } else {
      callback('SIGNED_OUT', null);
    }
    return {
      data: {
        subscription: {
          unsubscribe: () => {
            this.listeners = this.listeners.filter(l => l !== callback);
          }
        }
      }
    };
  }

  private notifyListeners(event: string, session: any) {
    this.listeners.forEach(l => l(event, session));
  }

  // Handle SSO OAuth Mocks
  async signInWithOAuth({ provider, options }: any) {
    // Opens OAuth popup simulator URL or triggers callback immediately
    const redirectUrl = options?.redirectTo || window.location.origin;
    
    // Simulate accounts selector and redirect
    const state = 'sso_' + Math.random().toString(36).substr(2, 9);
    const authUrl = `${window.location.origin}/auth/callback?provider=${provider}&state=${state}&redirect=${encodeURIComponent(redirectUrl)}`;
    
    return { data: { url: authUrl }, error: null };
  }
}

const mockAuthInstance = new MockAuthService();

export const supabase = isRealSupabase ? supabaseInstance : {
  auth: {
    getSession: () => mockAuthInstance.getSession(),
    signInWithPassword: (credentials: any) => mockAuthInstance.signInWithPassword(credentials),
    signUp: (credentials: any) => mockAuthInstance.signUp(credentials),
    updateUser: (attributes: any) => mockAuthInstance.updateUser(attributes),
    resetPasswordForEmail: (email: string, options?: any) => mockAuthInstance.resetPasswordForEmail(email, options),
    signOut: () => mockAuthInstance.signOut(),
    onAuthStateChange: (callback: any) => mockAuthInstance.onAuthStateChange(callback),
    signInWithOAuth: (options: any) => mockAuthInstance.signInWithOAuth(options),
  },
  from: (tableName: string) => {
    return {
      select: (fields?: string) => {
        return {
          eq: (field: string, value: any) => {
            const execute = async () => {
              const users = mockAuthInstance.getUsers();
              const u = users.find((user: any) => {
                if (field === 'id') return user.id === value;
                if (field === 'email') return user.email.toLowerCase() === value.toLowerCase();
                return false;
              });

              if (u) {
                return { data: u, error: null };
              }
              return { data: null, error: { message: 'No record found' } };
            };
            return {
              then: (onfulfilled?: any, onrejected?: any) => {
                return execute().then(onfulfilled, onrejected);
              },
              single: execute
            };
          }
        };
      },
      update: (data: any) => {
        return {
          eq: (field: string, value: any) => {
            const execute = async () => {
              const users = mockAuthInstance.getUsers();
              const idx = users.findIndex((user: any) => user[field] === value);
              if (idx !== -1) {
                users[idx] = { ...users[idx], ...data };
                mockAuthInstance.saveUsers(users);
                return { data: users[idx], error: null };
              }
              return { data: null, error: { message: 'No record found to update' } };
            };
            return {
              then: (onfulfilled?: any, onrejected?: any) => {
                return execute().then(onfulfilled, onrejected);
              },
              single: execute
            };
          }
        };
      }
    };
  }
};

// Auto-determine role and profile details
export async function determineUserRoleAndProfile(email: string) {
  // Normalize email
  const lowerEmail = email.toLowerCase();

  // 1. Try student
  let { data: student } = await supabase.from('students').select('*').eq('email', lowerEmail).single();
  if (student) {
    return { role: 'student', profile: student };
  }

  // 2. Try faculty
  let { data: faculty } = await supabase.from('faculty').select('*').eq('email', lowerEmail).single();
  if (faculty) {
    return { role: 'faculty', profile: faculty };
  }

  // 3. Try admin
  let { data: admin } = await supabase.from('admin_profiles').select('*').eq('email', lowerEmail).single();
  if (admin) {
    return { role: 'admin', profile: admin };
  }

  // Fallback check on mock user db directly if not found in tables
  if (!isRealSupabase) {
    const users = mockAuthInstance.getUsers();
    const found = users.find((u: any) => u.email.toLowerCase() === lowerEmail);
    if (found) {
      return { role: found.role, profile: found };
    }
  }

  return { role: null, profile: null };
}

