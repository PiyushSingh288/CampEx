import React, { useState } from 'react';

interface AcademicPlannerProps {
  student: any;
}

export default function AcademicPlanner({ student }: AcademicPlannerProps) {
  // 1. Attendance Forecast State
  const [classesAttended, setClassesAttended] = useState<number>(student?.classesAttended || 80);
  const [totalClasses, setTotalClasses] = useState<number>(student?.totalClasses || 100);
  const [plannedFuture, setPlannedFuture] = useState<number>(20);
  const [classesToMiss, setClassesToMiss] = useState<number>(2);
  const [minRequired, setMinRequired] = useState<number>(75);

  // 2. Grade Predictor State
  const [obInternal, setObInternal] = useState<number>(22);
  const [maxInternal, setMaxInternal] = useState<number>(30);
  const [wtInternal, setWtInternal] = useState<number>(15);

  const [obAssignment, setObAssignment] = useState<number>(16);
  const [maxAssignment, setMaxAssignment] = useState<number>(20);
  const [wtAssignment, setWtAssignment] = useState<number>(10);

  const [obQuiz, setObQuiz] = useState<number>(8);
  const [maxQuiz, setMaxQuiz] = useState<number>(10);
  const [wtQuiz, setWtQuiz] = useState<number>(5);

  const [obMidSem, setObMidSem] = useState<number>(24);
  const [maxMidSem, setMaxMidSem] = useState<number>(30);
  const [wtMidSem, setWtMidSem] = useState<number>(20);

  const [hasPractical, setHasPractical] = useState<boolean>(true);
  const [obPractical, setObPractical] = useState<number>(9);
  const [maxPractical, setMaxPractical] = useState<number>(10);
  const [wtPractical, setWtPractical] = useState<number>(10);

  const [targetGrade, setTargetGrade] = useState<string>('A');
  const [wtFinalExam, setWtFinalExam] = useState<number>(40);

  // 1. Attendance Forecast Calculations
  const currentAttendancePct = totalClasses > 0 ? (classesAttended / totalClasses) * 100 : 0;
  
  // Projected Attendance
  const projectedTotal = totalClasses + plannedFuture;
  const projectedAttended = Math.max(0, classesAttended + (plannedFuture - classesToMiss));
  const projectedAttendancePct = projectedTotal > 0 ? (projectedAttended / projectedTotal) * 100 : 0;

  // Safe / Warning / Critical Status
  let attendanceStatus: 'Safe' | 'Warning' | 'Critical' = 'Safe';
  let statusColor = 'bg-green-50 text-green-700 border-green-200';
  let statusText = 'Safe';

  if (projectedAttendancePct < minRequired) {
    attendanceStatus = 'Critical';
    statusColor = 'bg-red-50 text-red-700 border-red-200';
    statusText = 'Critical';
  } else if (projectedAttendancePct < minRequired + 5) {
    attendanceStatus = 'Warning';
    statusColor = 'bg-amber-50 text-amber-700 border-amber-200';
    statusText = 'Warning';
  }

  // Number of consecutive classes required to attend to return above minRequired
  const getRequiredClassesToRecover = () => {
    if (projectedAttendancePct >= minRequired) return 0;
    const reqPct = minRequired / 100;
    // (projectedAttended + X) / (projectedTotal + X) >= reqPct
    // projectedAttended + X >= reqPct * projectedTotal + reqPct * X
    // X * (1 - reqPct) >= reqPct * projectedTotal - projectedAttended
    // X >= (reqPct * projectedTotal - projectedAttended) / (1 - reqPct)
    const needed = Math.ceil((reqPct * projectedTotal - projectedAttended) / (1 - reqPct));
    return Math.max(0, needed);
  };

  // Maximum leaves that can still be taken safely from future classes
  const getMaxSafeLeaves = () => {
    const reqPct = minRequired / 100;
    // (classesAttended + plannedFuture - L) / (totalClasses + plannedFuture) >= reqPct
    // classesAttended + plannedFuture - L >= reqPct * (totalClasses + plannedFuture)
    // L <= classesAttended + plannedFuture - reqPct * (totalClasses + plannedFuture)
    const maxLeaves = Math.floor((classesAttended + plannedFuture) - reqPct * (totalClasses + plannedFuture));
    return Math.max(0, maxLeaves);
  };

  const recoveryClassesNeeded = getRequiredClassesToRecover();
  const maxSafeLeaves = getMaxSafeLeaves();

  // Dynamic Suggestion Message for Attendance
  const getAttendanceSuggestion = () => {
    if (projectedAttendancePct < minRequired) {
      return `If you miss ${classesToMiss} lectures, your attendance will fall to ${projectedAttendancePct.toFixed(1)}%. You must attend the next ${recoveryClassesNeeded} lectures continuously to return above the university's ${minRequired}% requirement.`;
    } else {
      return `You remain safe! You can miss up to ${maxSafeLeaves} lectures from your planned window and still maintain a projected attendance of ${projectedAttendancePct.toFixed(1)}% (above the ${minRequired}% threshold).`;
    }
  };

  // 2. Grade Predictor Calculations
  const activeWeightsTotal = wtInternal + wtAssignment + wtQuiz + wtMidSem + (hasPractical ? wtPractical : 0) + wtFinalExam;
  
  // Normalize weightages if they do not sum to 100%
  const normFactor = activeWeightsTotal > 0 ? 100 / activeWeightsTotal : 1;

  // Completed weighted score out of 100 (normalized)
  const calcCompletedWeightedScore = () => {
    let score = 0;
    score += (obInternal / maxInternal) * wtInternal;
    score += (obAssignment / maxAssignment) * wtAssignment;
    score += (obQuiz / maxQuiz) * wtQuiz;
    score += (obMidSem / maxMidSem) * wtMidSem;
    if (hasPractical) {
      score += (obPractical / maxPractical) * wtPractical;
    }
    return score * normFactor;
  };

  const currentWeightedScore = calcCompletedWeightedScore();
  const completedWeight = (wtInternal + wtAssignment + wtQuiz + wtMidSem + (hasPractical ? wtPractical : 0)) * normFactor;
  const finalExamWeightNormalized = wtFinalExam * normFactor;

  // Target thresholds out of 100
  const gradeThresholds: Record<string, number> = {
    'A+': 90,
    'A': 80,
    'B+': 70,
    'B': 60,
    'C': 50
  };

  const targetThreshold = gradeThresholds[targetGrade] || 80;

  // Required final exam marks (out of 100)
  // currentWeightedScore + (Y / 100) * finalExamWeightNormalized >= targetThreshold
  // (Y / 100) * finalExamWeightNormalized >= targetThreshold - currentWeightedScore
  // Y >= ((targetThreshold - currentWeightedScore) / finalExamWeightNormalized) * 100
  const requiredFinalExamPct = finalExamWeightNormalized > 0 
    ? ((targetThreshold - currentWeightedScore) / finalExamWeightNormalized) * 100 
    : 0;

  const requiredFinalMarks = Math.max(0, Math.ceil(requiredFinalExamPct));
  const isFeasible = requiredFinalMarks <= 100;

  // Probability Meter & Text
  let probability = 0;
  let probabilityText = 'High';
  let probabilityColor = 'text-green-600 bg-green-50 border-green-100';

  if (!isFeasible) {
    probability = 0;
    probabilityText = 'Impossible';
    probabilityColor = 'text-red-600 bg-red-50 border-red-100';
  } else if (requiredFinalMarks <= 40) {
    probability = 95;
    probabilityText = 'Very High';
    probabilityColor = 'text-green-600 bg-green-50 border-green-100';
  } else if (requiredFinalMarks <= 60) {
    probability = 85;
    probabilityText = 'High';
    probabilityColor = 'text-green-600 bg-green-50 border-green-100';
  } else if (requiredFinalMarks <= 75) {
    probability = 65;
    probabilityText = 'Moderate';
    probabilityColor = 'text-amber-600 bg-amber-50 border-amber-100';
  } else if (requiredFinalMarks <= 90) {
    probability = 35;
    probabilityText = 'Challenging';
    probabilityColor = 'text-orange-600 bg-orange-50 border-orange-100';
  } else {
    probability = 12;
    probabilityText = 'Low Chance';
    probabilityColor = 'text-red-600 bg-red-50 border-red-100';
  }

  // Difficulty Indicator
  let difficulty = 'Easy';
  let diffColor = 'text-green-700 bg-green-50 border-green-100';
  if (!isFeasible) {
    difficulty = 'Not Feasible';
    diffColor = 'text-red-700 bg-red-50 border-red-100';
  } else if (requiredFinalMarks > 85) {
    difficulty = 'Extreme';
    diffColor = 'text-red-700 bg-red-50 border-red-200 animate-pulse';
  } else if (requiredFinalMarks > 70) {
    difficulty = 'Hard';
    diffColor = 'text-orange-700 bg-orange-50 border-orange-100';
  } else if (requiredFinalMarks > 50) {
    difficulty = 'Moderate';
    diffColor = 'text-amber-700 bg-amber-50 border-amber-100';
  }

  // Recommended Daily Study Hours
  const getRecommendedHours = () => {
    if (!isFeasible) return 'N/A';
    if (requiredFinalMarks <= 40) return '1.5 Hours';
    if (requiredFinalMarks <= 60) return '2.5 Hours';
    if (requiredFinalMarks <= 80) return '3.5 Hours';
    return '4.5 Hours';
  };

  // Expected GPA/SGPA based on predicting targetGrade or slightly lower
  const getExpectedSGPA = () => {
    if (!isFeasible) return '6.0 (Pass)';
    const gradePoints: Record<string, number> = { 'A+': 10, 'A': 9, 'B+': 8, 'B': 7, 'C': 6 };
    const pt = gradePoints[targetGrade] || 8.0;
    return (pt - (requiredFinalMarks > 90 ? 0.5 : 0)).toFixed(2);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200 text-left">
      {/* Header Banner */}
      <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
        <h2 className="text-2xl font-bold text-gray-800">Academic & Growth Planner</h2>
        <p className="text-sm text-gray-500">
          Simulate attendance buffers and predict end-term final exam requirements with dynamic predictive modeling.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* MODULE 1: Attendance Forecast */}
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 border-b border-gray-100 pb-4 mb-6">
              <span className="material-symbols-outlined text-brand-red text-2xl">calendar_month</span>
              <h3 className="text-lg font-bold text-gray-800">Attendance Risk Forecast</h3>
            </div>

            <p className="text-xs text-gray-400 mb-6 uppercase tracking-wider font-bold">Simulation Controls</p>

            {/* Inputs Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase">Classes Attended</label>
                <input
                  type="number"
                  min="0"
                  max={totalClasses}
                  value={classesAttended}
                  onChange={(e) => setClassesAttended(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-800 focus:outline-none focus:ring-1 focus:ring-brand-red"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase">Total Conducted</label>
                <input
                  type="number"
                  min="1"
                  value={totalClasses}
                  onChange={(e) => setTotalClasses(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-800 focus:outline-none focus:ring-1 focus:ring-brand-red"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase">Planned Future Classes</label>
                <input
                  type="number"
                  min="0"
                  value={plannedFuture}
                  onChange={(e) => setPlannedFuture(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-800 focus:outline-none focus:ring-1 focus:ring-brand-red"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase">Minimum Required %</label>
                <input
                  type="number"
                  min="10"
                  max="100"
                  value={minRequired}
                  onChange={(e) => setMinRequired(Math.max(10, Math.min(100, parseInt(e.target.value) || 75)))}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-800 focus:outline-none focus:ring-1 focus:ring-brand-red"
                />
              </div>
            </div>

            {/* Slider for Classes to Miss */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold text-gray-500 uppercase">Classes to Miss in Future Window</label>
                <span className="text-sm font-black text-brand-red">{classesToMiss} lectures missed</span>
              </div>
              <input
                type="range"
                min="0"
                max={plannedFuture}
                value={classesToMiss}
                onChange={(e) => setClassesToMiss(parseInt(e.target.value) || 0)}
                className="w-full accent-brand-red"
              />
              <div className="flex justify-between text-[10px] text-gray-400 font-bold uppercase mt-1">
                <span>0 Missed (100% Future Attendance)</span>
                <span>{plannedFuture} Max Missed (0% Future Attendance)</span>
              </div>
            </div>

            {/* Live Analytics Dashboard */}
            <p className="text-xs text-gray-400 mb-4 uppercase tracking-wider font-bold">Predictive Forecast Analytics</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              
              {/* Circular projection meter */}
              <div className="p-4 bg-gray-50 border border-gray-100 rounded-2xl flex items-center space-x-4">
                <div className="relative flex items-center justify-center flex-shrink-0">
                  <svg className="w-16 h-16 transform -rotate-90">
                    <circle className="text-gray-200" cx="32" cy="32" fill="transparent" r="28" stroke="currentColor" strokeWidth="4"></circle>
                    <circle 
                      className={projectedAttendancePct >= minRequired ? "text-green-600" : "text-brand-red"} 
                      cx="32" 
                      cy="32" 
                      fill="transparent" 
                      r="28" 
                      stroke="currentColor" 
                      strokeWidth="4"
                      strokeDasharray="175" 
                      strokeDashoffset={175 - (175 * Math.min(100, projectedAttendancePct)) / 100}
                    ></circle>
                  </svg>
                  <span className="absolute text-xs font-black text-gray-800">{projectedAttendancePct.toFixed(1)}%</span>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Projected Attendance</p>
                  <p className="text-lg font-black text-gray-800 mt-0.5">{projectedAttended} / {projectedTotal}</p>
                  <p className="text-[10px] text-gray-400">Current: {currentAttendancePct.toFixed(1)}%</p>
                </div>
              </div>

              {/* Status Indicator Card */}
              <div className={`p-4 rounded-2xl border flex flex-col justify-between ${statusColor}`}>
                <div>
                  <p className="text-[10px] font-bold uppercase opacity-80">Safety Status</p>
                  <h4 className="text-lg font-black uppercase tracking-wider mt-1">{statusText}</h4>
                </div>
                <span className="text-[10px] font-medium opacity-90">
                  {projectedAttendancePct >= minRequired ? 'Eligible for examinations.' : 'Risk of administrative detention.'}
                </span>
              </div>

            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl text-center">
                <p className="text-[10px] text-gray-400 font-bold uppercase">Safe Leaves Left</p>
                <p className="text-2xl font-black text-gray-800 mt-1">{maxSafeLeaves}</p>
                <p className="text-[9px] text-gray-400 mt-0.5">Classes you can safely miss</p>
              </div>

              <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl text-center">
                <p className="text-[10px] text-gray-400 font-bold uppercase">Recovery Required</p>
                <p className={`text-2xl font-black mt-1 ${recoveryClassesNeeded > 0 ? 'text-brand-red' : 'text-green-600'}`}>
                  {recoveryClassesNeeded}
                </p>
                <p className="text-[9px] text-gray-400 mt-0.5">Classes to attend consecutively</p>
              </div>
            </div>

          </div>

          {/* Action Suggestions Block */}
          <div className="p-4 bg-red-50/40 border border-red-100/60 rounded-xl flex items-start gap-3 mt-4">
            <span className="material-symbols-outlined text-brand-red text-lg mt-0.5">smart_toy</span>
            <div className="flex-1 text-xs text-gray-700 leading-relaxed font-medium">
              <strong>Smart Recommendation:</strong> {getAttendanceSuggestion()}
            </div>
          </div>
        </div>

        {/* MODULE 2: Grade Predictor */}
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 border-b border-gray-100 pb-4 mb-6">
              <span className="material-symbols-outlined text-brand-red text-2xl">analytics</span>
              <h3 className="text-lg font-bold text-gray-800">Dynamic Grade Predictor</h3>
            </div>

            <p className="text-xs text-gray-400 mb-4 uppercase tracking-wider font-bold">Step 1: Mark & Weightage Configurations</p>

            {/* Marks Rows */}
            <div className="space-y-3 mb-6">
              
              {/* Internal */}
              <div className="grid grid-cols-12 gap-3 items-center">
                <span className="col-span-4 text-xs font-bold text-gray-600 uppercase">Class Internals</span>
                <div className="col-span-4 flex items-center gap-1.5">
                  <input
                    type="number"
                    min="0"
                    max={maxInternal}
                    value={obInternal}
                    onChange={(e) => setObInternal(Math.min(maxInternal, Math.max(0, parseInt(e.target.value) || 0)))}
                    className="w-16 bg-gray-50 border border-gray-200 rounded px-2 py-1 text-center text-xs font-bold text-gray-800"
                  />
                  <span className="text-xs text-gray-400">/</span>
                  <input
                    type="number"
                    min="1"
                    value={maxInternal}
                    onChange={(e) => setMaxInternal(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-16 bg-gray-50 border border-gray-200 rounded px-2 py-1 text-center text-xs font-bold text-gray-800"
                  />
                </div>
                <div className="col-span-4 flex items-center gap-1 justify-end">
                  <span className="text-[10px] text-gray-400 uppercase font-bold">Weight:</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={wtInternal}
                    onChange={(e) => setWtInternal(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-12 bg-gray-50 border border-gray-200 rounded px-1.5 py-1 text-center text-xs font-bold text-gray-800"
                  />
                  <span className="text-xs text-gray-400">%</span>
                </div>
              </div>

              {/* Assignment */}
              <div className="grid grid-cols-12 gap-3 items-center">
                <span className="col-span-4 text-xs font-bold text-gray-600 uppercase">Assignments</span>
                <div className="col-span-4 flex items-center gap-1.5">
                  <input
                    type="number"
                    min="0"
                    max={maxAssignment}
                    value={obAssignment}
                    onChange={(e) => setObAssignment(Math.min(maxAssignment, Math.max(0, parseInt(e.target.value) || 0)))}
                    className="w-16 bg-gray-50 border border-gray-200 rounded px-2 py-1 text-center text-xs font-bold text-gray-800"
                  />
                  <span className="text-xs text-gray-400">/</span>
                  <input
                    type="number"
                    min="1"
                    value={maxAssignment}
                    onChange={(e) => setMaxAssignment(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-16 bg-gray-50 border border-gray-200 rounded px-2 py-1 text-center text-xs font-bold text-gray-800"
                  />
                </div>
                <div className="col-span-4 flex items-center gap-1 justify-end">
                  <span className="text-[10px] text-gray-400 uppercase font-bold">Weight:</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={wtAssignment}
                    onChange={(e) => setWtAssignment(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-12 bg-gray-50 border border-gray-200 rounded px-1.5 py-1 text-center text-xs font-bold text-gray-800"
                  />
                  <span className="text-xs text-gray-400">%</span>
                </div>
              </div>

              {/* Quizzes */}
              <div className="grid grid-cols-12 gap-3 items-center">
                <span className="col-span-4 text-xs font-bold text-gray-600 uppercase">Quizzes</span>
                <div className="col-span-4 flex items-center gap-1.5">
                  <input
                    type="number"
                    min="0"
                    max={maxQuiz}
                    value={obQuiz}
                    onChange={(e) => setObQuiz(Math.min(maxQuiz, Math.max(0, parseInt(e.target.value) || 0)))}
                    className="w-16 bg-gray-50 border border-gray-200 rounded px-2 py-1 text-center text-xs font-bold text-gray-800"
                  />
                  <span className="text-xs text-gray-400">/</span>
                  <input
                    type="number"
                    min="1"
                    value={maxQuiz}
                    onChange={(e) => setMaxQuiz(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-16 bg-gray-50 border border-gray-200 rounded px-2 py-1 text-center text-xs font-bold text-gray-800"
                  />
                </div>
                <div className="col-span-4 flex items-center gap-1 justify-end">
                  <span className="text-[10px] text-gray-400 uppercase font-bold">Weight:</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={wtQuiz}
                    onChange={(e) => setWtQuiz(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-12 bg-gray-50 border border-gray-200 rounded px-1.5 py-1 text-center text-xs font-bold text-gray-800"
                  />
                  <span className="text-xs text-gray-400">%</span>
                </div>
              </div>

              {/* Mid Sem */}
              <div className="grid grid-cols-12 gap-3 items-center">
                <span className="col-span-4 text-xs font-bold text-gray-600 uppercase">Mid-Sem Exam</span>
                <div className="col-span-4 flex items-center gap-1.5">
                  <input
                    type="number"
                    min="0"
                    max={maxMidSem}
                    value={obMidSem}
                    onChange={(e) => setObMidSem(Math.min(maxMidSem, Math.max(0, parseInt(e.target.value) || 0)))}
                    className="w-16 bg-gray-50 border border-gray-200 rounded px-2 py-1 text-center text-xs font-bold text-gray-800"
                  />
                  <span className="text-xs text-gray-400">/</span>
                  <input
                    type="number"
                    min="1"
                    value={maxMidSem}
                    onChange={(e) => setMaxMidSem(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-16 bg-gray-50 border border-gray-200 rounded px-2 py-1 text-center text-xs font-bold text-gray-800"
                  />
                </div>
                <div className="col-span-4 flex items-center gap-1 justify-end">
                  <span className="text-[10px] text-gray-400 uppercase font-bold">Weight:</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={wtMidSem}
                    onChange={(e) => setWtMidSem(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-12 bg-gray-50 border border-gray-200 rounded px-1.5 py-1 text-center text-xs font-bold text-gray-800"
                  />
                  <span className="text-xs text-gray-400">%</span>
                </div>
              </div>

              {/* Optional Practical toggle and row */}
              <div className="grid grid-cols-12 gap-3 items-center">
                <div className="col-span-4 flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={hasPractical}
                    onChange={(e) => setHasPractical(e.target.checked)}
                    className="rounded accent-brand-red"
                  />
                  <span className="text-xs font-bold text-gray-600 uppercase cursor-pointer" onClick={() => setHasPractical(!hasPractical)}>
                    Practicals
                  </span>
                </div>
                <div className="col-span-4 flex items-center gap-1.5">
                  <input
                    type="number"
                    min="0"
                    max={maxPractical}
                    disabled={!hasPractical}
                    value={obPractical}
                    onChange={(e) => setObPractical(Math.min(maxPractical, Math.max(0, parseInt(e.target.value) || 0)))}
                    className="w-16 bg-gray-50 border border-gray-200 rounded px-2 py-1 text-center text-xs font-bold text-gray-800 disabled:opacity-50"
                  />
                  <span className="text-xs text-gray-400">/</span>
                  <input
                    type="number"
                    min="1"
                    disabled={!hasPractical}
                    value={maxPractical}
                    onChange={(e) => setMaxPractical(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-16 bg-gray-50 border border-gray-200 rounded px-2 py-1 text-center text-xs font-bold text-gray-800 disabled:opacity-50"
                  />
                </div>
                <div className="col-span-4 flex items-center gap-1 justify-end">
                  <span className="text-[10px] text-gray-400 uppercase font-bold">Weight:</span>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    disabled={!hasPractical}
                    value={wtPractical}
                    onChange={(e) => setWtPractical(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-12 bg-gray-50 border border-gray-200 rounded px-1.5 py-1 text-center text-xs font-bold text-gray-800 disabled:opacity-50"
                  />
                  <span className="text-xs text-gray-400">%</span>
                </div>
              </div>

              {/* End term Final exam weight config */}
              <div className="grid grid-cols-12 gap-3 items-center pt-2 border-t border-gray-100">
                <span className="col-span-8 text-xs font-black text-gray-800 uppercase">End-Term Final Exam Weightage</span>
                <div className="col-span-4 flex items-center gap-1 justify-end">
                  <span className="text-[10px] text-gray-400 uppercase font-bold">Weight:</span>
                  <input
                    type="number"
                    min="10"
                    max="90"
                    value={wtFinalExam}
                    onChange={(e) => setWtFinalExam(Math.max(10, Math.min(90, parseInt(e.target.value) || 40)))}
                    className="w-12 bg-gray-50 border border-gray-200 rounded px-1.5 py-1 text-center text-xs font-bold text-gray-800"
                  />
                  <span className="text-xs text-gray-400">%</span>
                </div>
              </div>

            </div>

            <div className="flex justify-between items-center text-[10px] text-gray-400 font-bold uppercase mb-6 bg-gray-50 px-3 py-1.5 rounded-lg border">
              <span>Config Total Weight: <strong className={activeWeightsTotal === 100 ? "text-green-600" : "text-orange-500"}>{activeWeightsTotal}%</strong></span>
              {activeWeightsTotal !== 100 && (
                <span className="text-[9px] text-orange-500 normal-case font-medium">Auto-normalizing to 100% of final marks</span>
              )}
            </div>

            {/* Target Select and Predicted Outcomes */}
            <p className="text-xs text-gray-400 mb-4 uppercase tracking-wider font-bold">Step 2: Predicted Outcomes</p>

            <div className="flex gap-4 items-center mb-6">
              <span className="text-xs font-bold text-gray-500 uppercase">Target Grade Selection</span>
              <div className="flex-1 flex gap-1 bg-gray-50 p-1 rounded-xl border">
                {['A+', 'A', 'B+', 'B', 'C'].map((g) => (
                  <button
                    key={g}
                    onClick={() => setTargetGrade(g)}
                    className={`flex-1 text-xs font-bold py-1.5 rounded-lg transition-all cursor-pointer border-none ${
                      targetGrade === g 
                        ? 'bg-brand-red text-white' 
                        : 'text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Prediction Display Blocks */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              
              {/* Target Grade Block */}
              <div className="p-4 bg-gray-50 border border-gray-100 rounded-2xl flex flex-col justify-between">
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">Required Score in Final Exam</p>
                  <h4 className={`text-2xl font-black mt-2 ${isFeasible ? 'text-gray-800' : 'text-red-500'}`}>
                    {isFeasible ? `${requiredFinalMarks} / 100` : 'NOT POSSIBLE'}
                  </h4>
                </div>
                <p className="text-[10px] text-gray-400 mt-2">
                  {isFeasible 
                    ? `Minimum of ${requiredFinalMarks}% on exam paper to secure Grade ${targetGrade}.` 
                    : `Threshold is ${targetThreshold} marks; current cumulative cap is ${(currentWeightedScore).toFixed(1)}%.`
                  }
                </p>
              </div>

              {/* Probability Block */}
              <div className={`p-4 rounded-2xl border flex flex-col justify-between ${probabilityColor}`}>
                <div>
                  <p className="text-[10px] font-bold uppercase opacity-80">Predictive Probability</p>
                  <h4 className="text-2xl font-black mt-2">{probabilityText}</h4>
                </div>
                <div className="w-full mt-3">
                  <div className="relative w-full h-1.5 bg-gray-200/50 rounded-full overflow-hidden">
                    <div className="absolute h-full bg-current rounded-full" style={{ width: `${probability}%` }}></div>
                  </div>
                  <span className="text-[9px] font-bold mt-1 block uppercase opacity-80">{probability}% Success likelihood</span>
                </div>
              </div>

            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="p-3 bg-gray-50 border rounded-xl text-center">
                <p className="text-[9px] text-gray-400 font-bold uppercase">Difficulty</p>
                <span className={`text-xs font-black inline-block px-2 py-0.5 rounded uppercase mt-1 ${diffColor}`}>
                  {difficulty}
                </span>
              </div>
              <div className="p-3 bg-gray-50 border rounded-xl text-center">
                <p className="text-[9px] text-gray-400 font-bold uppercase">Study Hours</p>
                <p className="text-xs font-black text-gray-800 mt-1.5">{getRecommendedHours()}</p>
                <p className="text-[8px] text-gray-400 uppercase mt-0.5">recommended daily</p>
              </div>
              <div className="p-3 bg-gray-50 border rounded-xl text-center">
                <p className="text-[9px] text-gray-400 font-bold uppercase">Expected GPA</p>
                <p className="text-xs font-black text-gray-800 mt-1.5">{getExpectedSGPA()}</p>
                <p className="text-[8px] text-gray-400 uppercase mt-0.5">predicted semester</p>
              </div>
            </div>

          </div>

          {/* Insights Panel */}
          <div className="border-t pt-4 space-y-2 mt-4 text-xs font-medium text-gray-600">
            <div className="flex items-center gap-2 bg-gray-50 p-2.5 rounded-lg border border-dashed">
              <span className="material-symbols-outlined text-sm text-brand-red">info</span>
              <span>Scoring <strong className="text-gray-800">{requiredFinalMarks}%</strong> in the final exam will secure Grade <strong className="text-gray-800">{targetGrade}</strong>.</span>
            </div>
            <div className="flex items-center gap-2 bg-gray-50 p-2.5 rounded-lg border border-dashed">
              <span className="material-symbols-outlined text-sm text-brand-red">menu_book</span>
              <span>A minimum of <strong className="text-gray-800">{getRecommendedHours()}</strong> of study per day is recommended.</span>
            </div>
            {isFeasible && requiredFinalMarks <= 75 && (
              <div className="flex items-center gap-2 bg-gray-50 p-2.5 rounded-lg border border-dashed">
                <span className="material-symbols-outlined text-sm text-green-600">check_circle</span>
                <span className="text-green-700">Strong chance of achieving the target grade! Maintain study hours.</span>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
