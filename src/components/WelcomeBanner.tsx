import React from 'react';
import { getTimeBasedGreeting, getDailyMotivationalMessage } from '../lib/welcomeUtils';

interface WelcomeBannerProps {
  userName: string;
  userRole: 'student' | 'faculty' | 'admin';
  greeting?: string;
  dailyMessage?: string;
  contextInfo?: string | React.ReactNode;
  actionButton?: React.ReactNode;
  actionLabel?: string;
  onActionClick?: () => void;
}

export default function WelcomeBanner({
  userName,
  userRole,
  greeting,
  dailyMessage,
  contextInfo,
  actionButton,
  actionLabel,
  onActionClick
}: WelcomeBannerProps) {
  const currentGreeting = greeting || getTimeBasedGreeting();
  const currentMessage = dailyMessage || getDailyMotivationalMessage(userRole);

  const renderActionButton = () => {
    if (actionButton) {
      return actionButton;
    }
    if (actionLabel && onActionClick) {
      return (
        <button 
          onClick={onActionClick}
          className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/30 px-8 py-3 rounded-xl font-semibold transition-all cursor-pointer flex items-center justify-center"
        >
          {actionLabel}
        </button>
      );
    }
    return null;
  };

  const buttonElement = renderActionButton();

  return (
    <section className="mb-8" data-purpose="hero-section">
      <div className="bg-[#2d1b5a] rounded-3xl p-8 text-white relative overflow-hidden shadow-xl">
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-3xl font-bold mb-4">
            {currentGreeting}, {userName}. {currentMessage}
          </h1>
          {contextInfo && (
            <p className="text-indigo-100 text-lg opacity-90 leading-relaxed">
              {contextInfo}
            </p>
          )}
        </div>
        {buttonElement && (
          <div className="absolute right-12 top-1/2 -translate-y-1/2">
            {buttonElement}
          </div>
        )}
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-white/5 rounded-full"></div>
      </div>
    </section>
  );
}
