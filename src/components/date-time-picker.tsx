import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { FormControl } from "./ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { format, formatInTimeZone } from "date-fns-tz";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "./ui/calendar";
import { SelectSingleEventHandler } from "react-day-picker";
import { useState } from "react";
import { TimePicker } from "./ui/time-picker/time-picker";

interface DateTimePickerProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  showTime?: boolean;
}

const IST_TIMEZONE = "Asia/Kolkata";

export function DateTimePicker({ date, setDate, showTime = true }: DateTimePickerProps) {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const handleOnSelect: SelectSingleEventHandler = (selectedDate) => {
    if (selectedDate) {
      // Convert the selected date to IST
      const istDate = new Date(selectedDate.toLocaleString("en-US", { timeZone: IST_TIMEZONE }));
      if (date) {
        // Preserve the time when changing the date
        istDate.setHours(date.getHours());
        istDate.setMinutes(date.getMinutes());
      }
      setDate(istDate);
    }
    setIsPopoverOpen(false);
  };

  const handleTimeChange = (newDate: Date | undefined) => {
    if (newDate && date) {
      // Convert the new time to IST
      const istDate = new Date(newDate.toLocaleString("en-US", { timeZone: IST_TIMEZONE }));
      // Preserve the date when changing the time
      istDate.setFullYear(date.getFullYear());
      istDate.setMonth(date.getMonth());
      istDate.setDate(date.getDate());
      setDate(istDate);
    }
  };

  // Convert UTC date to IST for display
  const displayDate = date ? new Date(date.toLocaleString("en-US", { timeZone: IST_TIMEZONE })) : undefined;

  return (
    <div className="flex gap-2">
      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <PopoverTrigger asChild>
          <FormControl>
            <Button
              variant={"outline"}
              className={cn(
                "w-[240px] pl-3 text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              {date ? formatInTimeZone(date, IST_TIMEZONE, "PPP") : <span>Pick a date</span>}
              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
            </Button>
          </FormControl>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={displayDate}
            onSelect={handleOnSelect}
            disabled={(date) =>
              date < new Date() || date > new Date("2100-01-01")
            }
            initialFocus
          />
        </PopoverContent>
      </Popover>
      {showTime && (
        <TimePicker
          date={displayDate}
          setDate={handleTimeChange}
          defaultPeriod={displayDate?.getHours() >= 12 ? "PM" : "AM"}
        />
      )}
    </div>
  );
} 