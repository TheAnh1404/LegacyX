import React, { useState, useEffect } from 'react';

interface CountdownTimerProps {
  targetDate: string;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({ targetDate }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = +new Date(targetDate) - +new Date();
      
      if (difference <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
        isExpired: false
      };
    };

    // Calculate once on mount
    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  if (timeLeft.isExpired) {
    return (
      <div className="flex flex-col items-center justify-center p-3 border border-red-500/20 bg-red-500/5 rounded-lg text-red-400 font-semibold text-center text-sm w-full">
        <span>UNLOCK CONDITION MET</span>
        <span className="text-[10px] text-red-400/70 font-mono mt-0.5">ESTATE IS NOW CLAIMABLE BY THE BENEFICIARY</span>
      </div>
    );
  }

  const pad = (num: number) => String(num).padStart(2, '0');

  return (
    <div className="flex gap-2 justify-center w-full">
      <div className="time-segment">
        <span className="time-val">{pad(timeLeft.days)}</span>
        <span className="time-lbl">Days</span>
      </div>
      <div className="time-segment">
        <span className="time-val">{pad(timeLeft.hours)}</span>
        <span className="time-lbl">Hrs</span>
      </div>
      <div className="time-segment">
        <span className="time-val">{pad(timeLeft.minutes)}</span>
        <span className="time-lbl">Mins</span>
      </div>
      <div className="time-segment">
        <span className="time-val">{pad(timeLeft.seconds)}</span>
        <span className="time-lbl">Secs</span>
      </div>
    </div>
  );
};
