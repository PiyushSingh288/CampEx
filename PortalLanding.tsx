import React from 'react';

interface PortalLandingProps {
  onSelectRole: (role: 'student' | 'faculty' | 'admin') => void;
}

export default function PortalLanding({ onSelectRole }: PortalLandingProps) {
  return (
    <div className="relative flex min-h-screen w-full flex-col bg-surface overflow-x-hidden">
      {/* Header: Focused Logo Area */}
      <header className="z-50 flex items-center justify-center bg-white px-6 py-6 border-b border-outline-variant shadow-sm">
        <div className="max-w-[1200px] w-full flex justify-center">
          <img 
            alt="University Logo" 
            className="h-12 md:h-16 object-contain" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAS3Au-doG2J_RPHYY_PZl0HGD9k15TK7EwShHAbm-POqUAwZj1DQpYw4g0ZlvOiFpvkPTdFP9KaXrJf4zGa1VYZYmuALd1CXN2lRRFCy99LLqZxkVsh7gLz4b5fqhBT93GdKQcmzcy5_BYHu2o0Dx_qlexCG3cS3OBDVZ1tnxEQ0eB9CD6m2AHrA8HsIpbPtakvy34cRTcYHkc5JMOC6clX4f_nUVYNbkfvBSLCfNwqiQ4QhfUQ0NXz1tX9cLQvvQffNTcFOdBReM"
          />
        </div>
      </header>
      
      {/* Main Content Area */}
      <main className="flex-1 flex flex-col">
        {/* Hero Section */}
        <section className="relative w-full h-[60vh] min-h-[500px] flex flex-col items-center justify-center overflow-hidden">
          {/* Full-Width Hero Background */}
          <div 
            className="absolute inset-0 z-0 bg-cover bg-center" 
            style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDrzTx58cmpNc6WOODI_8_WJYAyl7Xf0jPSpxxSgxcA-MvLdEmL15p3K84yrrE7an5tDt7IQWtZ85HT6jIAHLfoucQQY9dAW-R-aau1zzTBg84UeToxhvButG65S5krijgKm0KnritgliklRNNdPMn7iJFr0D3AUhWEzTLohW9MDXTGN1LhL5apcKqPq780s3Qj1Zsr-OwLElJyXL-vUGBZ-XqodQFXhecbdCTYiG8jlmtO2qeLwMSdoVlpeuAvY_8GLk9CTTVfWuI")' }}
          ></div>
          <div className="absolute inset-0 hero-overlay z-10"></div>
          
          {/* Hero Content */}
          <div className="relative z-20 container max-w-[1200px] mx-auto px-6 text-center">
            <h1 className="text-white text-4xl md:text-6xl lg:text-7xl font-black leading-tight tracking-tight mb-6 drop-shadow-xl">
              Your Future in <span className="text-white">Engineering</span> Starts Here
            </h1>
            <p className="text-white/90 text-lg md:text-xl font-medium max-w-3xl mx-auto leading-relaxed">
              Empowering the next generation of innovators with world-class facilities and expert-led technical education. Select your portal to begin.
            </p>
          </div>
        </section>

        {/* Portal Access (Login Cards) */}
        <section className="relative z-30 -mt-24 pb-24 px-6">
          <div className="container max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Student Portal Card */}
            <div 
              onClick={() => onSelectRole('student')}
              className="group relative flex flex-col gap-6 rounded-2xl bg-white p-8 md:p-10 portal-card-shadow transition-all hover:-translate-y-3 cursor-pointer border-t-[6px] border-secondary overflow-hidden"
              id="student-portal-card"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
              <div className="flex items-center justify-between relative z-10">
                <div className="p-4 bg-secondary/10 rounded-xl text-secondary">
                  <span className="material-symbols-outlined text-4xl font-light">school</span>
                </div>
                <span className="material-symbols-outlined text-secondary opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all">arrow_forward</span>
              </div>
              <div className="flex flex-col gap-3 relative z-10">
                <h2 className="text-on-surface text-2xl font-bold leading-tight">Student Portal</h2>
                <p className="text-on-surface-variant text-base font-normal leading-relaxed">
                  Access academic records, course registrations, fee payments, and personalized learning materials.
                </p>
              </div>
              <div className="mt-4 relative z-10">
                <button className="w-full py-3 bg-secondary text-white font-bold rounded-lg group-hover:shadow-lg transition-all active:scale-95 flex items-center justify-center">
                  Access Student Login
                </button>
              </div>
            </div>
 
            {/* Faculty Portal Card */}
            <div 
              onClick={() => onSelectRole('faculty')}
              className="group relative flex flex-col gap-6 rounded-2xl bg-white p-8 md:p-10 portal-card-shadow transition-all hover:-translate-y-3 cursor-pointer border-t-[6px] border-primary overflow-hidden"
              id="faculty-portal-card"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
              <div className="flex items-center justify-between relative z-10">
                <div className="p-4 bg-primary/10 rounded-xl text-primary">
                  <span className="material-symbols-outlined text-4xl font-light">account_balance</span>
                </div>
                <span className="material-symbols-outlined text-primary opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all">arrow_forward</span>
              </div>
              <div className="flex flex-col gap-3 relative z-10">
                <h2 className="text-on-surface text-2xl font-bold leading-tight">Faculty Portal</h2>
                <p className="text-on-surface-variant text-base font-normal leading-relaxed">
                  Manage classroom attendance, evaluate student performance, and coordinate research initiatives.
                </p>
              </div>
              <div className="mt-4 relative z-10">
                <button className="w-full py-3 bg-primary text-white font-bold rounded-lg group-hover:shadow-lg transition-all active:scale-95 flex items-center justify-center">
                  Access Faculty Login
                </button>
              </div>
            </div>
 
            {/* Admin Portal Card */}
            <div 
              onClick={() => onSelectRole('admin')}
              className="group relative flex flex-col gap-6 rounded-2xl bg-white p-8 md:p-10 portal-card-shadow transition-all hover:-translate-y-3 cursor-pointer border-t-[6px] border-black overflow-hidden"
              id="admin-portal-card"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-on-surface/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
              <div className="flex items-center justify-between relative z-10">
                <div className="p-4 bg-on-surface/5 rounded-xl text-on-surface">
                  <span className="material-symbols-outlined text-4xl font-light">admin_panel_settings</span>
                </div>
                <span className="material-symbols-outlined text-on-surface opacity-40 group-hover:opacity-100 group-hover:translate-x-1 transition-all">arrow_forward</span>
              </div>
              <div className="flex flex-col gap-3 relative z-10">
                <h2 className="text-on-surface text-2xl font-bold leading-tight">Admin Portal</h2>
                <p className="text-on-surface-variant text-base font-normal leading-relaxed">
                  Centralized dashboard for institutional governance, HR management, and infrastructure logistics.
                </p>
              </div>
              <div className="mt-4 relative z-10">
                <button className="w-full py-3 bg-on-surface text-white font-bold rounded-lg group-hover:shadow-lg transition-all active:scale-95 flex items-center justify-center">
                  Access Admin Login
                </button>
              </div>
            </div>

          </div>
        </section>
      </main>
    </div>
  );
}
