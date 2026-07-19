export const studentMessages = [
  "Let's make today productive.",
  "Every lecture brings you closer to your goals.",
  "Stay consistent. Small progress creates great results.",
  "Learning today builds tomorrow's opportunities.",
  "Keep moving forward one lecture at a time.",
  "Today's effort becomes tomorrow's achievement.",
  "Stay curious and never stop learning."
];

export const facultyMessages = [
  "Inspire your students today.",
  "Every lecture shapes future professionals.",
  "Education begins with dedication.",
  "Thank you for making a difference.",
  "Knowledge shared today lasts a lifetime.",
  "Your guidance creates future leaders."
];

export const adminMessages = [
  "Welcome back.",
  "Here's today's campus overview.",
  "Every decision contributes to institutional excellence.",
  "Thank you for keeping the university running smoothly.",
  "Let's make today productive for the entire campus."
];

export const messageCollections: Record<'student' | 'faculty' | 'admin', string[]> = {
  student: studentMessages,
  faculty: facultyMessages,
  admin: adminMessages
};

/**
 * Returns a time-based greeting according to local time.
 */
export function getTimeBasedGreeting(date: Date = new Date()): string {
  const hours = date.getHours();
  if (hours >= 5 && hours < 12) {
    return "Good Morning";
  } else if (hours >= 12 && hours < 17) {
    return "Good Afternoon";
  } else {
    return "Good Evening";
  }
}

/**
 * Returns a deterministic motivational message based on the date.
 */
export function getDailyMotivationalMessage(role: 'student' | 'faculty' | 'admin', date: Date = new Date()): string {
  const messages = messageCollections[role] || studentMessages;
  
  const year = date.getFullYear();
  const month = date.getMonth(); // 0-11
  const day = date.getDate(); // 1-31
  
  // A simple hash function to get a stable, positive integer for any date
  const hash = (year * 372) + (month * 31) + day;
  const index = hash % messages.length;
  return messages[index];
}
