import React from 'react';

// Common shimmer component helper
export function ShimmerBlock({ className = '', id, style, ...props }: { className?: string; id?: string; style?: React.CSSProperties; [key: string]: any }) {
  return (
    <div 
      id={id}
      className={`skeleton-shimmer rounded ${className}`} 
      style={style}
      {...props}
    />
  );
}

export function ShimmerThemeBlock({ className = '', id, style, ...props }: { className?: string; id?: string; style?: React.CSSProperties; [key: string]: any }) {
  return (
    <div 
      id={id}
      className={`skeleton-shimmer-theme rounded ${className}`} 
      style={style}
      {...props}
    />
  );
}

// 1. Landing Page Skeleton
export function LandingSkeleton() {
  return (
    <div className="relative flex min-h-screen w-full flex-col bg-surface overflow-x-hidden">
      {/* Header: Focused Logo Area */}
      <header className="z-50 flex items-center justify-center bg-white px-6 py-6 border-b border-outline-variant shadow-sm">
        <div className="max-w-[1200px] w-full flex justify-center">
          <ShimmerBlock className="h-14 w-48 rounded-lg" id="landing-logo-skeleton" />
        </div>
      </header>
      
      {/* Main Content Area */}
      <main className="flex-1 flex flex-col">
        {/* Hero Section */}
        <section className="relative w-full h-[60vh] min-h-[500px] flex flex-col items-center justify-center bg-[#151c27] overflow-hidden">
          {/* Subtle shimmer background overlay */}
          <div className="absolute inset-0 z-0 bg-cover bg-center opacity-30 skeleton-shimmer"></div>
          <div className="absolute inset-0 hero-overlay z-10"></div>
          
          {/* Hero Content */}
          <div className="relative z-20 container max-w-[1200px] mx-auto px-6 text-center flex flex-col items-center">
            <ShimmerBlock className="h-16 w-3/4 max-w-2xl mb-6 rounded-xl bg-white/10" id="landing-hero-title-skeleton" />
            <ShimmerBlock className="h-6 w-1/2 max-w-xl rounded-lg bg-white/10" id="landing-hero-desc-skeleton" />
          </div>
        </section>

        {/* Portal Access (Login Cards) */}
        <section className="relative z-30 -mt-24 pb-24 px-6">
          <div className="container max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Student Portal Card Skeleton */}
            <div className="flex flex-col gap-6 rounded-2xl bg-white p-8 md:p-10 portal-card-shadow border-t-[6px] border-secondary overflow-hidden">
              <div className="flex items-center justify-between">
                <ShimmerThemeBlock className="h-16 w-16 rounded-xl" />
                <ShimmerThemeBlock className="h-6 w-6 rounded-full" />
              </div>
              <div className="flex flex-col gap-3">
                <ShimmerBlock className="h-8 w-1/2 rounded-md" />
                <ShimmerBlock className="h-4 w-full rounded-md" />
                <ShimmerBlock className="h-4 w-5/6 rounded-md" />
              </div>
              <div className="mt-4">
                <ShimmerThemeBlock className="h-12 w-full rounded-lg" />
              </div>
            </div>
 
            {/* Faculty Portal Card Skeleton */}
            <div className="flex flex-col gap-6 rounded-2xl bg-white p-8 md:p-10 portal-card-shadow border-t-[6px] border-primary overflow-hidden">
              <div className="flex items-center justify-between">
                <ShimmerThemeBlock className="h-16 w-16 rounded-xl bg-[#9d0518]/10" />
                <ShimmerThemeBlock className="h-6 w-6 rounded-full bg-[#9d0518]/10" />
              </div>
              <div className="flex flex-col gap-3">
                <ShimmerBlock className="h-8 w-1/2 rounded-md" />
                <ShimmerBlock className="h-4 w-full rounded-md" />
                <ShimmerBlock className="h-4 w-5/6 rounded-md" />
              </div>
              <div className="mt-4">
                <ShimmerThemeBlock className="h-12 w-full rounded-lg bg-[#9d0518]/10" />
              </div>
            </div>
 
            {/* Admin Portal Card Skeleton */}
            <div className="flex flex-col gap-6 rounded-2xl bg-white p-8 md:p-10 portal-card-shadow border-t-[6px] border-black overflow-hidden">
              <div className="flex items-center justify-between">
                <ShimmerBlock className="h-16 w-16 rounded-xl bg-black/5" />
                <ShimmerBlock className="h-6 w-6 rounded-full bg-black/5" />
              </div>
              <div className="flex flex-col gap-3">
                <ShimmerBlock className="h-8 w-1/2 rounded-md" />
                <ShimmerBlock className="h-4 w-full rounded-md" />
                <ShimmerBlock className="h-4 w-5/6 rounded-md" />
              </div>
              <div className="mt-4">
                <ShimmerBlock className="h-12 w-full rounded-lg bg-black/10" />
              </div>
            </div>

          </div>
        </section>
      </main>
    </div>
  );
}

// 2. Student Dashboard Skeleton
export function StudentDashboardSkeleton() {
  return (
    <div className="space-y-8 animate-in fade-in duration-200" id="student-dashboard-skeleton">
      {/* Hero Greeting Card */}
      <section className="mb-8">
        <div className="bg-[#2d1b5a]/90 rounded-3xl p-8 text-white relative overflow-hidden shadow-md h-[180px] flex flex-col justify-center">
          <div className="relative z-10 max-w-2xl space-y-4">
            <ShimmerBlock className="h-8 w-2/3 bg-white/10" />
            <ShimmerBlock className="h-5 w-1/2 bg-white/5" />
          </div>
          <div className="absolute right-12 top-1/2 -translate-y-1/2 hidden md:block">
            <ShimmerBlock className="h-12 w-36 rounded-xl bg-white/10" />
          </div>
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-white/5 rounded-full"></div>
        </div>
      </section>

      {/* Quick Stats Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Attendance Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-6 h-[116px]">
          <ShimmerThemeBlock className="w-16 h-16 rounded-full" />
          <div className="flex-1 space-y-2">
            <ShimmerBlock className="h-4 w-20" />
            <ShimmerBlock className="h-3 w-16" />
            <ShimmerBlock className="h-5 w-24" />
          </div>
        </div>

        {/* CGPA Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-6 h-[116px]">
          <ShimmerBlock className="w-14 h-14 rounded-xl" />
          <div className="flex-1 space-y-2">
            <ShimmerBlock className="h-4 w-24" />
            <ShimmerBlock className="h-7 w-12" />
          </div>
        </div>

        {/* Requests Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-6 h-[116px]">
          <ShimmerBlock className="w-14 h-14 rounded-xl" />
          <div className="flex-1 space-y-2">
            <ShimmerBlock className="h-4 w-28" />
            <ShimmerBlock className="h-7 w-16" />
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upcoming Lectures */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="flex justify-between items-center mb-8">
            <ShimmerBlock className="h-7 w-48" />
            <ShimmerBlock className="h-4 w-24" />
          </div>
          
          <div className="relative space-y-8">
            <div className="absolute left-[88px] top-4 bottom-4 w-0.5 bg-gray-100"></div>
            
            {[1, 2, 3].map((idx) => (
              <div key={idx} className="flex items-start relative">
                <div className="w-20 flex-shrink-0 text-right pr-6 pt-2">
                  <ShimmerBlock className="h-4 w-12 ml-auto" />
                  <ShimmerBlock className="h-3 w-10 ml-auto mt-1" />
                </div>
                <div className="z-10 w-4 h-4 rounded-full border-4 border-white mt-3.5 bg-gray-200"></div>
                <div className="flex-1 ml-6 p-6 border border-gray-100 rounded-2xl bg-white shadow-sm space-y-3">
                  <div className="flex justify-between items-start">
                    <ShimmerBlock className="h-5 w-44" />
                    <ShimmerBlock className="h-6 w-16 rounded" />
                  </div>
                  <ShimmerBlock className="h-4 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Exam Prep Planner */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-8">
          <ShimmerBlock className="h-7 w-44" />
          
          <div className="space-y-10 pt-4">
            {[1, 2, 3].map((idx) => (
              <div key={idx} className="space-y-3">
                <div className="flex justify-between items-end">
                  <ShimmerBlock className="h-5 w-32" />
                  <ShimmerBlock className="h-4 w-14" />
                </div>
                <ShimmerBlock className="w-full h-2 rounded-full" />
                <ShimmerBlock className="h-3 w-28" />
              </div>
            ))}
          </div>

          <ShimmerBlock className="h-10 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}

// 3. Faculty Dashboard Skeleton
export function FacultyDashboardSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in duration-200 text-left" id="faculty-dashboard-skeleton">
      {/* Page Header Actions */}
      <div className="flex justify-between items-end">
        <div className="space-y-2">
          <ShimmerBlock className="h-8 w-56" />
          <ShimmerBlock className="h-4 w-80" />
        </div>
        <div className="flex gap-3">
          <ShimmerBlock className="h-10 w-32 rounded-lg" />
          <ShimmerBlock className="h-10 w-32 rounded-lg" />
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        
        {/* Attendance Summary Panel */}
        <div className="col-span-12 lg:col-span-8 precision-card rounded-xl overflow-hidden flex flex-col bg-white border border-outline-variant h-[380px]">
          <div className="px-6 py-4 bg-surface-container-low border-b border-outline-variant flex justify-between items-center">
            <div className="flex items-center gap-2">
              <ShimmerThemeBlock className="h-5 w-5" />
              <ShimmerBlock className="h-5 w-48" />
            </div>
            <ShimmerBlock className="h-4 w-24" />
          </div>
          
          <div className="p-6 flex-1 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="border border-green-100 rounded-xl p-4 flex flex-col justify-between h-[100px]">
                <ShimmerBlock className="h-3 w-24" />
                <ShimmerBlock className="h-8 w-16" />
              </div>
              <div className="border border-red-100 rounded-xl p-4 flex flex-col justify-between h-[100px]">
                <ShimmerBlock className="h-3 w-24" />
                <ShimmerBlock className="h-8 w-16" />
              </div>
              <div className="border border-amber-100 rounded-xl p-4 flex flex-col justify-between h-[100px]">
                <ShimmerBlock className="h-3 w-24" />
                <ShimmerBlock className="h-8 w-16" />
              </div>
            </div>

            <div className="p-5 rounded-2xl border border-outline-variant bg-surface-container-low h-[110px] space-y-3">
              <ShimmerBlock className="h-3 w-36" />
              <div className="flex items-center gap-3">
                <ShimmerThemeBlock className="h-12 w-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <ShimmerBlock className="h-4 w-1/3" />
                  <ShimmerBlock className="h-3 w-2/3" />
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-surface-container-low border-t border-outline-variant flex justify-between items-center">
            <ShimmerBlock className="h-4 w-60" />
            <ShimmerBlock className="h-8 w-56 rounded-lg" />
          </div>
        </div>

        {/* Critical Alerts & KPIs */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
          <div className="precision-card rounded-xl overflow-hidden flex flex-col bg-white border border-outline-variant h-[380px]">
            <div className="p-4 bg-error-container border-b border-outline-variant">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-red-500 font-bold">warning</span>
                <ShimmerBlock className="h-4 w-28 bg-red-100" />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[250px]">
              {[1, 2].map((idx) => (
                <div key={idx} className="p-3 border border-outline-variant rounded-lg flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <ShimmerBlock className="h-4 w-32" />
                      <ShimmerBlock className="h-3 w-40" />
                    </div>
                    <ShimmerBlock className="h-5 w-16 rounded" />
                  </div>
                  <ShimmerBlock className="h-3.5 w-5/6" />
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-outline-variant bg-surface-container-low">
              <ShimmerThemeBlock className="h-9 w-full rounded-lg" />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

// 4. Admin Dashboard Skeleton
export function AdminDashboardSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in duration-200 text-left" id="admin-dashboard-skeleton">
      
      {/* Header section with Status message */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-2">
          <ShimmerBlock className="h-8 w-64" />
          <ShimmerBlock className="h-4 w-96" />
        </div>
        <ShimmerBlock className="h-8 w-44 rounded-lg" />
      </div>

      {/* Today's AI Insights banner card */}
      <div className="rounded-2xl border border-red-100 p-6 bg-gradient-to-r from-red-50/40 to-amber-50/40 space-y-4">
        <div className="flex items-center gap-2">
          <ShimmerBlock className="h-4 w-4 bg-red-200 rounded-full animate-pulse" />
          <ShimmerBlock className="h-5 w-60 bg-red-100" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
          {[1, 2, 3, 4, 5, 6].map((idx) => (
            <div key={idx} className="flex items-center gap-2">
              <ShimmerBlock className="h-3 w-3 bg-red-100 rounded-full" />
              <ShimmerBlock className="h-4.5 w-11/12" />
            </div>
          ))}
        </div>
      </div>

      {/* Overview Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((idx) => (
          <div key={idx} className="precision-card p-6 rounded-2xl bg-white border border-gray-150 h-[125px] flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <ShimmerBlock className="h-3 w-28" />
              <ShimmerBlock className="h-8 w-8 rounded-lg" />
            </div>
            <ShimmerBlock className="h-8 w-20" />
            <ShimmerBlock className="h-4 w-32" />
          </div>
        ))}
      </div>

      {/* Two column charts layout or tables */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-8 bg-white p-6 rounded-2xl border border-gray-150 h-[350px] flex flex-col justify-between">
          <ShimmerBlock className="h-6 w-48" />
          <div className="h-[250px] flex items-end justify-between px-4 pb-2">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((idx) => (
              <ShimmerBlock 
                key={idx} 
                className="w-8 rounded-t bg-gray-100" 
                style={{ height: `${20 + (idx * idx * 2.8)}%` }}
              />
            ))}
          </div>
        </div>
        <div className="col-span-12 lg:col-span-4 bg-white p-6 rounded-2xl border border-gray-150 h-[350px] flex flex-col justify-between">
          <ShimmerBlock className="h-6 w-40" />
          <div className="flex items-center justify-center h-[200px]">
            <ShimmerThemeBlock className="h-36 w-36 rounded-full" />
          </div>
          <ShimmerBlock className="h-4 w-3/4 mx-auto" />
        </div>
      </div>

    </div>
  );
}

// 5. Large Data Table Skeleton
export function TableSkeleton({ rowsCount = 6, colsCount = 5 }: { rowsCount?: number; colsCount?: number }) {
  return (
    <div className="space-y-6 animate-in fade-in duration-200 text-left" id="table-skeleton">
      {/* Top Search and Stats indicator */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
        <div className="flex-1 max-w-md">
          <ShimmerBlock className="h-10 w-full rounded-lg" />
        </div>
        <div className="flex gap-2">
          <ShimmerBlock className="h-10 w-24 rounded-lg" />
          <ShimmerBlock className="h-10 w-24 rounded-lg" />
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        {/* Table Head */}
        <div className="bg-gray-50/70 border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          {Array.from({ length: colsCount }).map((_, i) => (
            <ShimmerBlock 
              key={i} 
              className={`h-4 ${i === 0 ? 'w-24' : 'w-20'} bg-gray-200`} 
            />
          ))}
        </div>

        {/* Table Body rows */}
        <div className="divide-y divide-gray-200">
          {Array.from({ length: rowsCount }).map((_, r) => (
            <div key={r} className="px-6 py-5 flex items-center justify-between hover:bg-gray-50/40">
              {Array.from({ length: colsCount }).map((_, c) => {
                // Return different shapes for realistic table items
                if (c === 0) {
                  // Primary column: avatar circle + double line
                  return (
                    <div key={c} className="flex items-center gap-3 w-[220px]">
                      <ShimmerBlock className="h-10 w-10 rounded-full flex-shrink-0" />
                      <div className="space-y-1.5 flex-1">
                        <ShimmerBlock className="h-4 w-32" />
                        <ShimmerBlock className="h-3 w-20" />
                      </div>
                    </div>
                  );
                } else if (c === colsCount - 1) {
                  // Action / Status Badge column
                  return (
                    <div key={c} className="flex justify-end w-[120px]">
                      <ShimmerBlock className="h-7 w-24 rounded-full" />
                    </div>
                  );
                } else if (c === 1) {
                  // Standard textual detail
                  return (
                    <div key={c} className="w-[150px] space-y-1">
                      <ShimmerBlock className="h-4 w-28" />
                    </div>
                  );
                } else {
                  // Random text
                  return (
                    <div key={c} className="w-[120px] space-y-1">
                      <ShimmerBlock className="h-4 w-20" />
                    </div>
                  );
                }
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Pagination placeholder */}
      <div className="flex justify-between items-center px-4">
        <ShimmerBlock className="h-4 w-36" />
        <div className="flex gap-1.5">
          <ShimmerBlock className="h-8 w-8 rounded" />
          <ShimmerBlock className="h-8 w-8 rounded" />
          <ShimmerBlock className="h-8 w-8 rounded" />
        </div>
      </div>
    </div>
  );
}
