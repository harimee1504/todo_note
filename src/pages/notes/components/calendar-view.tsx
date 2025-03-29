import { useState, useEffect } from 'react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, isToday, addDays, subDays, addWeeks, subWeeks } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Note } from '@/graphql/notes/types';
import { NoteCard } from './note-card';
import { Button } from '@/components/ui/button';
import { Plus, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useMutation } from '@apollo/client';
import { DELETE_NOTE, UPDATE_NOTE } from '@/graphql/notes/mutations';

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
  const [deleteNote] = useMutation(DELETE_NOTE);
  const [updateNote] = useMutation(UPDATE_NOTE);

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
    }).sort((a, b) => {
      const aStart = new Date(a.startTime);
      const bStart = new Date(b.startTime);
      return aStart.getTime() - bStart.getTime();
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

  const handleNoteDelete = async (noteId: string) => {
    try {
      await deleteNote({
        variables: {
          input: {
            id: noteId
          }
        },
      });
      refetchNotes();
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const handleNoteEdit = async (updatedNote: Note) => {
    try {
      await updateNote({
        variables: {
          input: {
            id: updatedNote.id,
            title: updatedNote.title,
            note: updatedNote.note,
            startTime: updatedNote.startTime,
            endTime: updatedNote.endTime,
            attendees: updatedNote.attendees.map(user => user.id),
            tags: updatedNote.tags?.map(tag => tag.id),
          },
        },
      });
      refetchNotes();
    } catch (error) {
      console.error('Error updating note:', error);
    }
  };

  const renderNotesForDay = (day: Date) => {
    const dayNotes = getNotesForDay(day);
    const maxNotesToShow = viewMode === 'day' ? 10 : 2;

    // Group notes by overlapping time ranges
    const groupOverlappingNotes = (notes: Note[]) => {
      const groups: Note[][] = [];
      
      notes.forEach(note => {
        const noteStart = new Date(note.startTime).getTime();
        const noteEnd = new Date(note.endTime).getTime();
        
        // Find a group where this note overlaps
        let foundGroup = false;
        for (const group of groups) {
          // Check if this note overlaps with any note in the group
          const hasOverlap = group.some(existingNote => {
            const existingStart = new Date(existingNote.startTime).getTime();
            const existingEnd = new Date(existingNote.endTime).getTime();
            return (noteStart <= existingEnd && noteEnd >= existingStart);
          });
          
          if (hasOverlap) {
            group.push(note);
            foundGroup = true;
            break;
          }
        }
        
        // If no overlapping group found, create a new group
        if (!foundGroup) {
          groups.push([note]);
        }
      });
      
      return groups;
    };

    const renderNote = (note: Note, index: number, totalSlots: number) => {
      const startTime = new Date(note.startTime);
      const endTime = new Date(note.endTime);

      // Calculate start position
      const startHour = startTime.getHours();
      const startMinute = startTime.getMinutes();
      const startPixels = (startHour * HOUR_HEIGHT) + ((startMinute / 60) * HOUR_HEIGHT);

      // Calculate end position
      const endHour = endTime.getHours();
      const endMinute = endTime.getMinutes();
      const endPixels = (endHour * HOUR_HEIGHT) + ((endMinute / 60) * HOUR_HEIGHT);

      // Calculate height as the difference between end and start positions
      const height = endPixels - startPixels;

      // Calculate width and position for multiple events
      const width = `${100 / totalSlots}%`;
      const left = `${(index * 100) / totalSlots}%`;

      return (
        <div
          key={note.id}
          className="absolute pointer-events-auto"
          style={{
            top: `${startPixels}px`,
            height: `${height}px`,
            width,
            left,
          }}
        >
          <NoteCard 
            note={note} 
            onDelete={handleNoteDelete}
            onEdit={handleNoteEdit}
            refetchNotes={refetchNotes}
          />
        </div>
      );
    };

    // Update the +X indicator rendering to use the same calculation
    const renderMoreIndicator = (note: Note, count: number) => {
      const startTime = new Date(note.startTime);
      const endTime = new Date(note.endTime);

      // Calculate start position
      const startHour = startTime.getHours();
      const startMinute = startTime.getMinutes();
      const startPixels = (startHour * HOUR_HEIGHT) + ((startMinute / 60) * HOUR_HEIGHT);

      // Calculate end position
      const endHour = endTime.getHours();
      const endMinute = endTime.getMinutes();
      const endPixels = (endHour * HOUR_HEIGHT) + ((endMinute / 60) * HOUR_HEIGHT);

      // Calculate height as the difference between end and start positions
      const height = endPixels - startPixels;

      return (
        <div
          className="absolute pointer-events-auto bg-primary/10 border border-primary/20 rounded-md p-2 cursor-pointer hover:bg-primary/20 transition-colors"
          style={{
            top: `${startPixels}px`,
            height: `${height}px`,
            width: '50%',
            left: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span className="text-xs font-medium">+{count}</span>
        </div>
      );
    };

    if (viewMode === 'day') {
      return dayNotes.map((note, index) => renderNote(note, index, dayNotes.length));
    }

    // For week view, handle overlapping notes
    const timeGroups = groupOverlappingNotes(dayNotes);
    
    return timeGroups.map(group => {
      if (group.length <= maxNotesToShow) {
        // If group has 2 or fewer notes, show them all
        return group.map((note, index) => renderNote(note, index, group.length));
      } else {
        // Find the note with maximum duration
        const maxDurationNote = group.reduce((maxNote, currentNote) => {
          const maxDuration = new Date(maxNote.endTime).getTime() - new Date(maxNote.startTime).getTime();
          const currentDuration = new Date(currentNote.endTime).getTime() - new Date(currentNote.startTime).getTime();
          return currentDuration > maxDuration ? currentNote : maxNote;
        }, group[0]);

        return (
          <>
            {renderNote(maxDurationNote, 0, 2)}
            {renderMoreIndicator(maxDurationNote, group.length - 1)}
          </>
        );
      }
    });
  };

  return (
    <div className="flex-1 bg-background rounded-lg border">
      {/* Header */}
      <div className={cn("grid gap-px bg-border", viewMode === "day" ? "grid-cols-1" : "grid-cols-7")}>
        {viewMode === "day" ? (
          <div className="flex items-center justify-between p-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDateSelect(subDays(selectedDate, 1))}
              className="h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "text-center font-medium cursor-pointer",
                  isToday(selectedDate) && "bg-blue-500 text-white rounded-md px-4 py-2"
                )}
                onClick={() => onDateSelect(selectedDate)}
              >
                <div className="text-sm">{format(selectedDate, 'EEE')}</div>
                <div className="text-lg">{format(selectedDate, 'd')}</div>
                <div className="text-xs text-muted-foreground">{format(selectedDate, 'MMMM yyyy')}</div>
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Calendar className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="center">
                  <CalendarComponent
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && onDateSelect(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDateSelect(addDays(selectedDate, 1))}
              className="h-8 w-8"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <>
            <div className="col-span-7 flex items-center justify-between p-2 border-b">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDateSelect(subWeeks(selectedDate, 1))}
                className="h-8 w-8"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-2">
                <div className="text-sm font-medium">
                  {format(startOfWeek(selectedDate), 'MMM d')} - {format(endOfWeek(selectedDate), 'MMM d, yyyy')}
                </div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Calendar className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="center">
                    <CalendarComponent
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => date && onDateSelect(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDateSelect(addWeeks(selectedDate, 1))}
                className="h-8 w-8"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="col-span-7 grid grid-cols-7">
              {weekDays.map((day, index) => (
                <div
                  key={day.toISOString()}
                  className={cn(
                    "p-2 text-center font-medium",
                    isSameDay(day, selectedDate) && "bg-primary text-primary-foreground",
                    isToday(day) && "bg-blue-500 text-white"
                  )}
                  onClick={() => onDateSelect(day)}
                >
                  <div className="text-sm">{format(day, 'EEE')}</div>
                  <div className="text-lg">{format(day, 'd')}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Calendar Grid */}
      <ScrollArea className="h-[calc(100vh-200px)]">
        <div className={cn(
          "grid relative",
          viewMode === "day" ? "grid-cols-[auto_1fr]" : "grid-cols-[auto_1fr_1fr_1fr_1fr_1fr_1fr_1fr]"
        )}>
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
            <div 
              key={day.toISOString()} 
              className={cn("relative", viewMode === "day" && "w-full")}
            >
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