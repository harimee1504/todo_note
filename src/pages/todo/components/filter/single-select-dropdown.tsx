import * as React from "react";

import { useMediaQuery } from "@/hooks/use-media-query";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronDown, ChevronUp, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Values = {
  by: string;
  value: string;
  label: string;
};

export default function ComboBoxResponsive({
  label,
  by,
  values,
  setQuery,
  selectedValues,
  setSelectedValues,
}: {
  label: string;
  by: string;
  values: Values[];
  setQuery: React.Dispatch<React.SetStateAction<any>>;
  selectedValues: Values | null;
  setSelectedValues: React.Dispatch<React.SetStateAction<Values | null>>;
}) {
  const [open, setOpen] = React.useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (isDesktop) {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-[150px] justify-start">
            <span className="overflow-hidden text-ellipsis">
              {selectedValues ? <>{selectedValues.label}</> : <>{label}</>}
            </span>
            {open ? (
              <ChevronUp className="ml-auto h-4 w-4" />
            ) : (
              <ChevronDown className="ml-auto h-4 w-4" />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0" align="start">
          <ValuesList
            selectedValues={selectedValues}
            by={by}
            setQuery={setQuery}
            values={values}
            setOpen={setOpen}
            setSelectedValues={setSelectedValues}
          />
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline" className="w-[150px] justify-start">
          <span className="overflow-hidden text-ellipsis">
            {selectedValues ? <>{selectedValues.label}</> : <>{label}</>}
          </span>
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mt-4 border-t">
          <ValuesList
            selectedValues={selectedValues}
            by={by}
            setQuery={setQuery}
            values={values}
            setOpen={setOpen}
            setSelectedValues={setSelectedValues}
          />
        </div>
      </DrawerContent>
    </Drawer>
  );
}

function ValuesList({
  values,
  setOpen,
  selectedValues,
  setSelectedValues,
  by,
  setQuery,
}: {
  values: Values[];
  setOpen: (open: boolean) => void;
  selectedValues: Values | null;
  setSelectedValues: (Values: Values | null) => void;
  by: string;
  setQuery: React.Dispatch<React.SetStateAction<any>>;
}) {
  const handleValueChange = (value: string) => {
    const query = {
      by: by,
      options: {
        [by]: value,
      },
    };
    setSelectedValues(values.find((item) => item.value === value) || null);
    setOpen(false);
    setQuery(query);
  };
  return (
    <Command>
      <CommandInput placeholder="Search here..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup>
          {values.map((value) => (
            <CommandItem
              key={value.value}
              value={value.value}
              onSelect={handleValueChange}
            >
              {value.label}
              <Check
                className={cn(
                  "ml-auto",
                  value.value === selectedValues?.value
                    ? "opacity-100"
                    : "opacity-0"
                )}
              />
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  );
}
