import { useState, useEffect } from 'react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, isToday } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Note } from '@/graphql/notes/types';
import { NoteCard } from './note-card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

const IST_TIMEZONE = "Asia/Kolkata";
const HOUR_HEIGHT = 100; // Height for each hour slot
const HALF_HOUR_HEIGHT = HOUR_HEIGHT / 2; // Height for each 30-minute section

interface CalendarViewProps {
  notes: Note[];
  viewMode: 'week' | 'day';
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  refetchNotes: () => void;
  onTimeSlotSelect: (date: Date, startTime: Date, endTime: Date) => void;
}

export function CalendarView({ notes, viewMode, selectedDate, onDateSelect, refetchNotes, onTimeSlotSelect }: CalendarViewProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [weekDays, setWeekDays] = useState<Date[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const istTime = new Date(now.toLocaleString("en-US", { timeZone: IST_TIMEZONE }));
      setCurrentTime(istTime);
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (viewMode === 'week') {
      const start = startOfWeek(selectedDate);
      const end = endOfWeek(selectedDate);
      const days = eachDayOfInterval({ start, end });
      setWeekDays(days);
    } else {
      setWeekDays([selectedDate]);
    }
  }, [selectedDate, viewMode]);

  const getNotesForDay = (date: Date) => {
    return notes.filter(note => {
      const noteStart = new Date(note.startTime);
      const noteEnd = new Date(note.endTime);
      const noteStartIST = new Date(noteStart.toLocaleString("en-US", { timeZone: IST_TIMEZONE }));
      const noteEndIST = new Date(noteEnd.toLocaleString("en-US", { timeZone: IST_TIMEZONE }));
      const dateIST = new Date(date.toLocaleString("en-US", { timeZone: IST_TIMEZONE }));
      return noteStartIST.toDateString() === dateIST.toDateString();
    });
  };

  const getCurrentTimePosition = () => {
    const hours = currentTime.getHours();
    const minutes = currentTime.getMinutes();
    return (hours * HOUR_HEIGHT) + (minutes * (HALF_HOUR_HEIGHT / 30));
  };

  const handleTimeSlotClick = (day: Date, hour: number, isFirstHalf: boolean) => {
    const startTime = new Date(day);
    startTime.setHours(hour, isFirstHalf ? 0 : 30, 0, 0);
    
    const endTime = new Date(startTime);
    endTime.setMinutes(startTime.getMinutes() + 30);
    
    // Convert to IST
    const startTimeIST = new Date(startTime.toLocaleString("en-US", { timeZone: IST_TIMEZONE }));
    const endTimeIST = new Date(endTime.toLocaleString("en-US", { timeZone: IST_TIMEZONE }));
    const dateIST = new Date(day.toLocaleString("en-US", { timeZone: IST_TIMEZONE }));
    
    onTimeSlotSelect(dateIST, startTimeIST, endTimeIST);
  };

  const renderNotesForDay = (day: Date) => {
    const dayNotes = getNotesForDay(day);
    const maxNotesToShow = viewMode === 'day' ? 10 : 2;

    if (dayNotes.length <= maxNotesToShow) {
      return dayNotes.map((note, index) => {
        const startTime = new Date(note.startTime);
        const endTime = new Date(note.endTime);
        const startHours = startTime.getHours();
        const startMinutes = startTime.getMinutes();
        const durationMinutes = (endTime.getTime() - startTime.getTime()) / (1000 * 60);
        
        const top = (startHours * HOUR_HEIGHT) + (startMinutes * (HALF_HOUR_HEIGHT / 30));
        const height = durationMinutes < 30 ? (durationMinutes / 30) * HALF_HOUR_HEIGHT : HALF_HOUR_HEIGHT;
        const width = viewMode === 'day' ? `${100 / maxNotesToShow}%` : `${100 / maxNotesToShow}%`;
        const left = viewMode === 'day' ? `${(index * 100) / maxNotesToShow}%` : `${(index * 100) / maxNotesToShow}%`;

        return (
          <div
            key={note.id}
            className="absolute pointer-events-auto"
            style={{
              top: `${top}px`,
              height: `${height}px`,
              width,
              left,
            }}
          >
            <NoteCard note={note} />
          </div>
        );
      });
    }

    if (viewMode === 'day') {
      // For day view, show first 10 notes side by side
      return dayNotes.slice(0, 10).map((note, index) => {
        const startTime = new Date(note.startTime);
        const endTime = new Date(note.endTime);
        const startHours = startTime.getHours();
        const startMinutes = startTime.getMinutes();
        const durationMinutes = (endTime.getTime() - startTime.getTime()) / (1000 * 60);
        
        const top = (startHours * HOUR_HEIGHT) + (startMinutes * (HALF_HOUR_HEIGHT / 30));
        const height = durationMinutes < 30 ? (durationMinutes / 30) * HALF_HOUR_HEIGHT : HALF_HOUR_HEIGHT;
        const width = `${100 / maxNotesToShow}%`;
        const left = `${(index * 100) / maxNotesToShow}%`;

        return (
          <div
            key={note.id}
            className="absolute pointer-events-auto"
            style={{
              top: `${top}px`,
              height: `${height}px`,
              width,
              left,
            }}
          >
            <NoteCard note={note} />
          </div>
        );
      });
    } else {
      // For week view, show first note and count
      const note = dayNotes[0];
      const startTime = new Date(note.startTime);
      const endTime = new Date(note.endTime);
      const startHours = startTime.getHours();
      const startMinutes = startTime.getMinutes();
      const durationMinutes = (endTime.getTime() - startTime.getTime()) / (1000 * 60);
      
      const top = (startHours * HOUR_HEIGHT) + (startMinutes * (HALF_HOUR_HEIGHT / 30));
      const height = durationMinutes < 30 ? (durationMinutes / 30) * HALF_HOUR_HEIGHT : HALF_HOUR_HEIGHT;
      const width = '50%';
      const left = '0';

      return (
        <>
          <div
            className="absolute pointer-events-auto"
            style={{
              top: `${top}px`,
              height: `${height}px`,
              width,
              left,
            }}
          >
            <NoteCard note={note} />
          </div>
          <div
            className="absolute pointer-events-auto bg-primary/10 border border-primary/20 rounded-md p-2 cursor-pointer hover:bg-primary/20 transition-colors"
            style={{
              top: `${top}px`,
              height: `${height}px`,
              width: '50%',
              left: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span className="text-xs font-medium">+{dayNotes.length - 1}</span>
          </div>
        </>
      );
    }
  };

  return (
    <div className="flex-1 bg-background rounded-lg border">
      {/* Header */}
      <div className="grid grid-cols-7 gap-px bg-border">
        {weekDays.map((day, index) => (
          <div
            key={day.toISOString()}
            className={`p-2 text-center font-medium ${
              isSameDay(day, selectedDate) ? 'bg-primary text-primary-foreground' : ''
            } ${isToday(day) ? 'bg-accent' : ''}`}
            onClick={() => onDateSelect(day)}
          >
            <div className="text-sm">{format(day, 'EEE')}</div>
            <div className="text-lg">{format(day, 'd')}</div>
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <ScrollArea className="h-[calc(100vh-200px)]">
        <div className="grid grid-cols-[auto_1fr_1fr_1fr_1fr_1fr_1fr_1fr] relative">
          {/* Time Column */}
          <div className="border-r">
            {Array.from({ length: 24 }).map((_, hour) => (
              <div
                key={hour}
                className="border-t border-border text-xs text-muted-foreground p-1"
                style={{ height: `${HOUR_HEIGHT}px` }}
              >
                {formatInTimeZone(new Date(2024, 0, 1, hour), IST_TIMEZONE, 'h a')}
              </div>
            ))}
          </div>

          {/* Days Columns */}
          {weekDays.map((day, dayIndex) => (
            <div key={day.toISOString()} className="relative">
              {/* Time Slots */}
              <div className="grid grid-rows-[repeat(48,50px)]">
                {Array.from({ length: 48 }).map((_, index) => {
                  const hour = Math.floor(index / 2);
                  const isFirstHalf = index % 2 === 0;
                  return (
                    <div
                      key={`${day.toISOString()}-${index}`}
                      className="border border-border/50 cursor-pointer hover:bg-accent/50 transition-colors"
                      onClick={() => handleTimeSlotClick(day, hour, isFirstHalf)}
                    />
                  );
                })}
              </div>

              {/* Notes */}
              <div className="absolute inset-0 pointer-events-none">
                {renderNotesForDay(day)}
              </div>
            </div>
          ))}

          {/* Current Time Indicator */}
          {isToday(selectedDate) && (
            <div
              className="absolute left-0 right-0 h-[2px] bg-black z-10"
              style={{ top: `${getCurrentTimePosition()}px` }}
            >
              <div className="absolute -left-2 -top-1.5 w-3 h-3 bg-black rounded-full" />
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
} 