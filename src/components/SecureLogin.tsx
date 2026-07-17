import React, { useState, useEffect } from 'react';
import { supabase, isRealSupabase } from '../lib/supabase';

interface SecureLoginProps {
  initialRole: 'student' | 'faculty' | 'admin';
  onLoginSuccess: (user: any) => void;
  onGoBack: () => void;
}

export default function SecureLogin({ initialRole, onLoginSuccess, onGoBack }: SecureLoginProps) {
  const [role, setRole] = useState<'student' | 'faculty' | 'admin'>(initialRole);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [oauthStatus, setOauthStatus] = useState<{ google: boolean; microsoft: boolean }>({
    google: false,
    microsoft: false,
  });

  useEffect(() => {
    fetch('/api/auth/oauth/status')
      .then((res) => res.json())
      .then((data) => {
        setOauthStatus({ google: !!data.google, microsoft: !!data.microsoft });
      })
      .catch(() => {
        setOauthStatus({ google: false, microsoft: false });
      });
  }, []);
  useEffect(() => {
    setRole(initialRole);
  }, [initialRole]);

  // Set initial realistic mock credentials for convenience in testing
  useEffect(() => {
    setErrorMsg(null);
    if (role === 'student') {
      setEmail('piyush.kumar@krmu.ac.in');
      setPassword('password123');
    } else if (role === 'faculty') {
      setEmail('elena.vance@krmangalam.edu.in');
      setPassword('password123');
    } else {
      setEmail('admin.portal@krmangalam.edu.in');
      setPassword('password123');
    }
  }, [role]);

  // Listen for OAuth popup postMessages
  useEffect(() => {
    const persistSession = (userId: string) => {
      sessionStorage.setItem('soet_session', userId);
      if (rememberMe) {
        localStorage.setItem('soet_remember_session', userId);
      } else {
        localStorage.removeItem('soet_remember_session');
      }
    };

    const completeOAuthLogin = async (oauthEmail: string, provider: string, directUser?: any) => {
      setIsLoading(true);
      setErrorMsg(null);
      try {
        if (directUser?.id) {
          persistSession(directUser.id);
          onLoginSuccess(directUser);
          return;
        }

        const res = await fetch('/api/auth/oauth/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: oauthEmail, role }),
        });
        const data = await res.json();
        if (!res.ok || data.error) {
          throw new Error(data.error || 'Authentication failed');
        }
        persistSession(data.user.id);
        onLoginSuccess(data.user);
      } catch (err: any) {
        setErrorMsg(err.message || `An error occurred during ${provider} authentication.`);
      } finally {
        setIsLoading(false);
      }
    };

    const handleOAuthCallbackMessage = async (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;

      if (event.data?.type === 'OAUTH_AUTH_ERROR') {
        setErrorMsg(event.data.error || 'OAuth sign-in was cancelled or failed.');
        setIsLoading(false);
        return;
      }

      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        const { email: oauthEmail, provider, user } = event.data;
        await completeOAuthLogin(oauthEmail, provider, user);
      }
    };

    window.addEventListener('message', handleOAuthCallbackMessage);
    return () => window.removeEventListener('message', handleOAuthCallbackMessage);
  }, [role, onLoginSuccess, rememberMe]);

  const openOAuthWindow = (url: string) => {
    const width = 520;
    const height = 680;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;
    const popup = window.open(
      url,
      'SSO_Login',
      `width=${width},height=${height},top=${top},left=${left},resizable=yes,scrollbars=yes`
    );

    if (!popup) {
      window.location.href = url.replace('&popup=1', '').replace('?popup=1&', '?').replace('?popup=1', '');
    }
  };

  const handleOAuthLogin = async (provider: 'google' | 'microsoft') => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      if (isRealSupabase) {
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: provider === 'microsoft' ? 'azure' : 'google',
          options: {
            redirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        if (data?.url) {
          window.location.href = data.url;
        }
        return;
      }

      const isConfigured = provider === 'google' ? oauthStatus.google : oauthStatus.microsoft;
      if (isConfigured) {
        openOAuthWindow(`/api/auth/oauth/${provider}?role=${role}&popup=1`);
      } else {
        openOAuthWindow(`/auth/sso-picker?provider=${provider}&role=${role}`);
      }
    } catch (err: any) {
      console.error(`${provider} OAuth login failed:`, err);
      setErrorMsg(
        err.message ||
          `Could not start ${provider === 'google' ? 'Google' : 'Microsoft'} sign-in. Check your OAuth credentials in the .env file.`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getPlaceholder = () => {
    if (role === 'student') return 'rollno@krmu.edu.in';
    if (role === 'faculty') return 'faculty.id@krmangalam.edu.in';
    return 'admin.portal@krmangalam.edu.in';
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both your university email and password.');
      return;
    }

    // Validation rules per role
    const emailLower = email.toLowerCase();
    if (role === 'student' && !emailLower.endsWith('@krmu.ac.in') && !emailLower.endsWith('@krmu.edu.in') && !emailLower.endsWith('@gmail.com')) {
      setErrorMsg('Invalid student email format. Must end with @krmu.ac.in, @krmu.edu.in, or @gmail.com.');
      return;
    }
    if (role === 'faculty' && !emailLower.endsWith('@krmangalam.edu.in') && !emailLower.endsWith('@gmail.com') && !/@(outlook|hotmail|live)\.com$/.test(emailLower)) {
      setErrorMsg('Invalid faculty email format. Use @krmangalam.edu.in, @gmail.com, or @outlook.com.');
      return;
    }
    if (role === 'admin' && !emailLower.endsWith('@krmangalam.edu.in') && !emailLower.endsWith('@gmail.com') && !/@(outlook|hotmail|live)\.com$/.test(emailLower)) {
      setErrorMsg('Invalid administrator email format. Use @krmangalam.edu.in, @gmail.com, or @outlook.com.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role })
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Authentication failed');
      }

      // Successful login - save session to storage for persistence
      if (rememberMe) {
        localStorage.setItem('soet_remember_session', data.user.id);
      } else {
        localStorage.removeItem('soet_remember_session');
      }
      sessionStorage.setItem('soet_session', data.user.id);

      onLoginSuccess(data.user);
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during authentication.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen w-full flex items-center justify-center p-4 md:p-8 bg-cover bg-center bg-fixed relative animate-fade-in"
      style={{
        backgroundImage: `linear-gradient(rgba(249, 249, 255, 0.85), rgba(249, 249, 255, 0.85)), url('https://lh3.googleusercontent.com/aida-public/AB6AXuAtChPwMuoOgC5Od5vbg8IuRoriCZiRq_kwICCwzGHETNG4ovynV3FHYlq3CxvSnxX2lGK1gWCrTWW681M_3GljIooSyZx6p3uuNbQ_fdlNaXgV0GgWxxGffIWL5b4NR7NHhq9M2cJv8VCnq0-QgkhEPWlohAEBv1hrw9iire4QIB_C_HxIwveqEpS4B4-bOC6NF1esgvphJpjXjyRMrHR6kzR-LMn9AGHxAIVZhUb_TxZtl4TiTuW93vuzVvharU0uoqmlCYEpKHc')`
      }}
    >
      <button 
        onClick={onGoBack}
        className="absolute top-6 left-6 flex items-center gap-2 text-sm font-semibold text-primary hover:underline cursor-pointer bg-white/80 backdrop-blur-md px-4 py-2 rounded-full shadow-sm border border-outline-variant"
      >
        <span className="material-symbols-outlined text-sm">arrow_back</span> Back to Portals
      </button>

      <div className="w-full max-w-[480px] flex flex-col items-center">
        {/* Logo & Header */}
        <div className="mb-10 text-center">
          <h1 className="font-headline-md text-3xl font-bold text-on-surface mb-1">
            Secure Portal Login
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Access your academic dashboard and institutional resources
          </p>
        </div>

        {/* Login Card */}
        <main className="w-full bg-surface-container-lowest rounded-xl login-card-shadow overflow-hidden border-2 border-on-surface transition-all duration-300">
          <div className="p-8">
            
            {/* Segmented Control */}
            <div className="bg-surface-container-high p-1 rounded-lg flex mb-8">
              <button 
                type="button"
                className={`flex-1 py-2 text-center text-sm rounded-md transition-all cursor-pointer ${role === 'student' ? 'segmented-control-active font-semibold' : 'text-on-surface-variant hover:text-on-surface'}`}
                onClick={() => setRole('student')}
              >
                Student
              </button>
              <button 
                type="button"
                className={`flex-1 py-2 text-center text-sm rounded-md transition-all cursor-pointer ${role === 'faculty' ? 'segmented-control-active font-semibold' : 'text-on-surface-variant hover:text-on-surface'}`}
                onClick={() => setRole('faculty')}
              >
                Faculty
              </button>
              <button 
                type="button"
                className={`flex-1 py-2 text-center text-sm rounded-md transition-all cursor-pointer ${role === 'admin' ? 'segmented-control-active font-semibold' : 'text-on-surface-variant hover:text-on-surface'}`}
                onClick={() => setRole('admin')}
              >
                Admin
              </button>
            </div>

            {/* Notifications and messages */}
            {errorMsg && (
              <div className="mb-6 p-4 bg-error-container text-error rounded-lg text-sm font-medium border border-outline-variant flex items-start gap-2">
                <span className="material-symbols-outlined text-lg mt-0.5">error</span>
                <span>{errorMsg}</span>
              </div>
            )}

            <form className="space-y-5" onSubmit={handleSignIn}>
              <div>
                <label className="block text-sm font-medium text-on-surface mb-1.5" htmlFor="email">University Email</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant text-lg select-none">mail</span>
                  <input 
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" 
                    id="email" 
                    name="email" 
                    placeholder={getPlaceholder()} 
                    required 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-on-surface mb-1.5" htmlFor="password">Password</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant text-lg select-none">lock</span>
                  <input 
                    className="w-full pl-10 pr-12 py-2.5 bg-white border border-outline-variant rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" 
                    id="password" 
                    name="password" 
                    placeholder="••••••••" 
                    required 
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button 
                    className="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant text-lg hover:text-on-surface cursor-pointer" 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </button>
                </div>
                {/* Forgot Password? Link */}
                <div className="flex justify-end mt-1.5">
                  <button 
                    type="button"
                    onClick={() => {
                      setErrorMsg(null);
                      alert("Please contact the university IT administrator to request a password reset.");
                    }}
                    className="text-xs text-[#C0272D] hover:underline font-medium cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
              </div>

              {/* Remember me Checkbox */}
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="remember" 
                  className="rounded border-outline-variant text-primary focus:ring-primary/20 h-4 w-4 cursor-pointer"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label htmlFor="remember" className="text-sm text-on-surface-variant font-medium select-none cursor-pointer">
                  Remember me
                </label>
              </div>

              <button 
                className="w-full bg-[#F87171] text-white py-3 rounded-lg text-sm font-semibold hover:bg-[#C0272D] transition-colors shadow-sm flex items-center justify-center gap-2 group cursor-pointer" 
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-1"></span>
                    Authenticating...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            {/* Horizontal Divider with Label */}
            <div className="flex items-center my-6">
              <div className="flex-grow border-t border-outline-variant"></div>
              <span className="mx-4 text-[10px] md:text-xs font-bold uppercase tracking-wider text-on-surface-variant/70 whitespace-nowrap">
                OR CONTINUE WITH
              </span>
              <div className="flex-grow border-t border-outline-variant"></div>
            </div>

            {/* Social Login Buttons */}
            <div className="space-y-3">
              {/* Google Connection Button */}
              <button
                type="button"
                onClick={() => handleOAuthLogin('google')}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-[#d1e1f8] bg-[#f0f4ff] hover:bg-[#e1ecfe] text-primary rounded-lg text-sm font-semibold transition-colors cursor-pointer"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"></path>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                </svg>
                Continue with Google
              </button>

              {/* Microsoft Connection Button */}
              <button
                type="button"
                onClick={() => handleOAuthLogin('microsoft')}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-outline-variant bg-white hover:bg-surface-container-low text-on-surface rounded-lg text-sm font-semibold transition-colors cursor-pointer"
              >
                <svg className="w-5 h-5" viewBox="0 0 23 23">
                  <path d="M0 0h23v23H0z" fill="#f3f3f3"></path>
                  <path d="M1 1h10v10H1z" fill="#f35325"></path>
                  <path d="M12 1h10v10H12z" fill="#81bc06"></path>
                  <path d="M1 12h10v10H1z" fill="#05a6f0"></path>
                  <path d="M12 12h10v10H12z" fill="#ffba08"></path>
                </svg>
                Continue with Microsoft Outlook
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
