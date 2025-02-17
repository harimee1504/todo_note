import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { FormControl } from "./ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "./ui/calendar";
import { SelectSingleEventHandler } from "react-day-picker";
import { useState } from "react";

export function DatePicker({ selected, onSelect }) {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const handleOnSelect: SelectSingleEventHandler = (date) => {
    onSelect?.(date);
    setIsPopoverOpen(false);
  };

  return (
    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
      <PopoverTrigger asChild>
        <FormControl>
          <Button
            variant={"outline"}
            className={cn(
              "w-full pl-3 text-left font-normal",
              !selected && "text-muted-foreground"
            )}
          >
            {selected ? format(selected, "PPP") : <span>Pick a date</span>}
            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
          </Button>
        </FormControl>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={handleOnSelect}
          disabled={(date) =>
            date < new Date() || date > new Date("2100-01-01")
          }
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
