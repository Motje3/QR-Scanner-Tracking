import React, { useState, useRef, useEffect } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';

interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
  placeholder?: string;
}

const DatePicker: React.FC<DatePickerProps> = ({ value, onChange, placeholder = "Selecteer datum" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(value ? new Date(value) : null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const months = [
    'Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni',
    'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December'
  ];

  const daysOfWeek = ['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo'];

  const getDaysInMonth = (date: Date): (Date | null)[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    let startingDayOfWeek = firstDay.getDay();
    startingDayOfWeek = startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1;
    
    const days: (Date | null)[] = [];
    
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const formatDate = (date: Date | null): string => {
    if (!date) return '';
    return date.toLocaleDateString('nl-NL', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    onChange(formatDate(date));
    setIsOpen(false);
  };

  const navigateMonth = (direction: number) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const isToday = (date: Date | null): boolean => {
    const today = new Date();
    return date !== null && 
           date.getDate() === today.getDate() && 
           date.getMonth() === today.getMonth() && 
           date.getFullYear() === today.getFullYear();
  };

  const isSelected = (date: Date | null): boolean => {
    return selectedDate !== null && 
           date !== null &&
           date.getDate() === selectedDate.getDate() && 
           date.getMonth() === selectedDate.getMonth() && 
           date.getFullYear() === selectedDate.getFullYear();
  };

  const days = getDaysInMonth(currentDate);

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <CalendarDays size={20} className="text-gray-400" />
        </div>
        <input
          type="text"
          value={selectedDate ? formatDate(selectedDate) : ''}
          onClick={() => setIsOpen(!isOpen)}
          readOnly
          placeholder={placeholder}
          className="w-full bg-indigo-800 border border-indigo-700 text-white pl-12 pr-4 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-600 placeholder-gray-500 transition-all duration-300 ease-in-out shadow-sm hover:border-indigo-600 cursor-pointer"
        />
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-80 bg-indigo-900 border border-indigo-700 rounded-lg shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between p-4 bg-indigo-800 border-b border-indigo-700">
            <button
              type="button"
              onClick={() => navigateMonth(-1)}
              className="p-1 hover:bg-indigo-700 rounded-md transition-colors"
            >
              <ChevronLeft size={20} className="text-gray-300" />
            </button>
            
            <h3 className="text-lg font-semibold text-white">
              {months[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h3>
            
            <button
              type="button"
              onClick={() => navigateMonth(1)}
              className="p-1 hover:bg-indigo-700 rounded-md transition-colors"
            >
              <ChevronRight size={20} className="text-gray-300" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 p-2 bg-indigo-850">
            {daysOfWeek.map(day => (
              <div key={day} className="text-center text-sm font-medium text-gray-400 py-2">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1 p-2">
            {days.map((date, index) => (
              <button
                key={index}
                type="button"
                onClick={() => date && handleDateSelect(date)}
                disabled={!date}
                className={`
                  h-10 text-sm rounded-md transition-all duration-200 font-medium
                  ${!date ? 'invisible' : ''}
                  ${isSelected(date) 
                    ? 'bg-yellow-400 text-indigo-950 font-bold shadow-lg' 
                    : isToday(date)
                    ? 'bg-indigo-700 text-white border border-yellow-400'
                    : 'text-gray-300 hover:bg-indigo-700 hover:text-white'
                  }
                `}
              >
                {date?.getDate()}
              </button>
            ))}
          </div>

          <div className="flex gap-2 p-3 bg-indigo-850 border-t border-indigo-700">
            <button
              type="button"
              onClick={() => handleDateSelect(new Date())}
              className="flex-1 py-2 px-3 text-sm bg-indigo-700 hover:bg-indigo-600 text-white rounded-md transition-colors"
            >
              Vandaag
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedDate(null);
                onChange('');
                setIsOpen(false);
              }}
              className="flex-1 py-2 px-3 text-sm bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors"
            >
              Wissen
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatePicker;