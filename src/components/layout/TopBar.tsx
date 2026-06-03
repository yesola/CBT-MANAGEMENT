import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';

export const TopBar: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const saved = localStorage.getItem('selectedCalendarDate');
    return saved ? new Date(saved) : new Date();
  });
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState<Date>(() => new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('selectedCalendarDate', selectedDate.toISOString());
  }, [selectedDate]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setIsOpen(false);
  };

  const handleGoToToday = () => {
    const today = new Date();
    setSelectedDate(today);
    setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
  };

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDaysInMonth = new Date(year, month, 0).getDate();

  const daysArray = [];

  // Pad previous month days
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    daysArray.push({
      date: new Date(year, month - 1, prevMonthDaysInMonth - i),
      isCurrentMonth: false,
    });
  }

  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    daysArray.push({
      date: new Date(year, month, i),
      isCurrentMonth: true,
    });
  }

  // Next month padding to complete standard 42 cell grid
  const remainingCells = 42 - daysArray.length;
  for (let i = 1; i <= remainingCells; i++) {
    daysArray.push({
      date: new Date(year, month + 1, i),
      isCurrentMonth: false,
    });
  }

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10">
      <div className="flex items-center flex-1 max-w-xl">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="훈련생, 기록 또는 세션 검색..." 
            className="w-full bg-slate-50 border-none rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-4 relative">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:bg-slate-50 border border-slate-100 rounded-lg transition-colors"
        >
          <Calendar className="w-4 h-4 text-blue-500" />
          <span className="text-xs font-semibold">
            {selectedDate.getFullYear()}년 {selectedDate.getMonth() + 1}월 {selectedDate.getDate()}일
          </span>
        </button>

        {isOpen && (
          <div 
            ref={popoverRef}
            className="absolute top-12 right-0 mt-1 w-72 bg-white rounded-xl shadow-xl border border-slate-200 p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
          >
            {/* Header / Nav */}
            <div className="flex items-center justify-between mb-4">
              <button 
                onClick={() => setCurrentMonth(new Date(year, month - 1, 1))}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-bold text-sm text-slate-800">
                {year}년 {month + 1}월
              </span>
              <button 
                onClick={() => setCurrentMonth(new Date(year, month + 1, 1))}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Days of Week */}
            <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-slate-400 mb-2">
              {['일', '월', '화', '수', '목', '금', '토'].map((d, idx) => (
                <div key={d} className={cn(idx === 0 ? "text-rose-500" : idx === 6 ? "text-blue-500" : "text-slate-400")}>
                  {d}
                </div>
              ))}
            </div>

            {/* Day grid */}
            <div className="grid grid-cols-7 gap-1">
              {daysArray.map(({ date, isCurrentMonth }, idx) => {
                const isSelected = 
                  date.getDate() === selectedDate.getDate() &&
                  date.getMonth() === selectedDate.getMonth() &&
                  date.getFullYear() === selectedDate.getFullYear();
                
                const isToday = () => {
                  const today = new Date();
                  return date.getDate() === today.getDate() &&
                    date.getMonth() === today.getMonth() &&
                    date.getFullYear() === today.getFullYear();
                };

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleDateClick(date)}
                    className={cn(
                      "h-8 w-8 text-xs rounded-lg flex items-center justify-center transition-all",
                      !isCurrentMonth && "text-slate-300 pointer-events-none",
                      isCurrentMonth && "text-slate-700 hover:bg-slate-100",
                      isToday() && "ring-1 ring-blue-500 font-bold",
                      isSelected && "bg-blue-600 text-white font-bold hover:bg-blue-700 hover:text-white"
                    )}
                  >
                    {date.getDate()}
                  </button>
                );
              })}
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between border-t border-slate-100 mt-3 pt-3">
              <button
                type="button"
                onClick={handleGoToToday}
                className="text-xs text-blue-600 hover:text-blue-700 font-semibold px-2 py-1 rounded hover:bg-blue-50 transition-colors"
              >
                오늘
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-xs text-slate-500 hover:text-slate-600 font-medium px-2 py-1 rounded hover:bg-slate-50 transition-colors"
              >
                닫기
              </button>
            </div>
          </div>
        )}
        
        <div className="h-8 w-[1px] bg-slate-200 mx-2" />

        <button className="relative p-2 text-slate-600 hover:bg-slate-50 rounded-full transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
        </button>
      </div>
    </header>
  );
};
