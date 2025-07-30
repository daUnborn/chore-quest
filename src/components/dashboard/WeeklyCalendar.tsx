import { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';

interface CalendarDay {
  date: Date;
  tasksCompleted: number;
  totalTasks: number;
}

interface WeeklyCalendarProps {
  days: CalendarDay[];
  onDayClick?: (date: Date) => void;
}

export function WeeklyCalendar({ days, onDayClick }: WeeklyCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  const handleDayClick = (day: CalendarDay) => {
    setSelectedDate(day.date);
    onDayClick?.(day.date);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date) => {
    return date.toDateString() === selectedDate.toDateString();
  };

  return (
    <div className="bg-white rounded-2xl p-4 shadow-card">
      <h3 className="font-semibold text-dark-slate mb-4">This Week</h3>
      <div className="grid grid-cols-7 gap-2">
        {days.map((day, index) => {
          const completionRate = day.totalTasks > 0 
            ? (day.tasksCompleted / day.totalTasks) * 100 
            : 0;
          
          return (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleDayClick(day)}
              className={cn(
                'relative flex flex-col items-center p-2 rounded-lg cursor-pointer transition-colors',
                isSelected(day.date) && 'bg-pastel-blue text-white',
                !isSelected(day.date) && 'hover:bg-light-gray'
              )}
            >
              <span className="text-xs font-medium mb-1">
                {weekDays[day.date.getDay()]}
              </span>
              <span
                className={cn(
                  'text-lg font-semibold mb-2',
                  isToday(day.date) && !isSelected(day.date) && 'text-pastel-blue'
                )}
              >
                {day.date.getDate()}
              </span>
              
              {/* Completion dots */}
              <div className="flex gap-1">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      'h-1.5 w-1.5 rounded-full',
                      i < Math.ceil(completionRate / 33.33)
                        ? isSelected(day.date)
                          ? 'bg-white'
                          : 'bg-mint-green'
                        : 'bg-medium-gray/30'
                    )}
                  />
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}