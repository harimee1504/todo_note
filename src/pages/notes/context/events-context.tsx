
import { GET_NOTE } from "@/graphql/note/queries";
import { CalendarEvent, initialEvents } from "@/pages/notes/utils/data";
import { useLazyQuery } from "@apollo/client";
import React, { createContext, ReactNode, useContext, useEffect, useState } from "react";

interface Event {
  id: string;
  title: string;
  note: any;
  start: Date;
  end: Date;
  color?: string;
}

interface EventsContextType {
  events: CalendarEvent[];
  setEvents: React.Dispatch<React.SetStateAction<CalendarEvent[]>>;
  addEvent: (event: Event) => void;
  addEvents: (events: Event[]) => void;
  deleteEvent: (id: string) => void;
  eventViewOpen: boolean;
  setEventViewOpen: (value: boolean) => void;
  eventAddOpen: boolean;
  setEventAddOpen: (value: boolean) => void;
  eventEditOpen: boolean;
  setEventEditOpen: (value: boolean) => void;
  eventDeleteOpen: boolean;
  setEventDeleteOpen: (value: boolean) => void;
}

const EventsContext = createContext<EventsContextType | undefined>(undefined);

export const useEvents = () => {
  const context = useContext(EventsContext);
  if (!context) {
    throw new Error("useEvents must be used within an EventsProvider");
  }
  return context;
};

export const EventsProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {

  const [events, setEvents] = useState<CalendarEvent[]>([]);

  const [eventViewOpen, setEventViewOpen] = useState(false);
  const [eventAddOpen, setEventAddOpen] = useState(false);
  const [eventEditOpen, setEventEditOpen] = useState(false);
  const [eventDeleteOpen, setEventDeleteOpen] = useState(false);

  const addEvent = (event: CalendarEvent) => {
    setEvents((prevEvents) => [...prevEvents, event]);
  };

  const addEvents = (event: CalendarEvent[]) => {
    setEvents((prevEvents) => [...prevEvents, ...event]);
  };

  const deleteEvent = (id: string) => {
    setEvents((prevEvents) =>
      prevEvents.filter((event) => Number(event.id) !== Number(id))
    );
  };

  return (
    <EventsContext.Provider
      value={{
        events,
        setEvents,
        addEvents,
        addEvent,
        deleteEvent,
        eventViewOpen,
        setEventViewOpen,
        eventAddOpen,
        setEventAddOpen,
        eventEditOpen,
        setEventEditOpen,
        eventDeleteOpen,
        setEventDeleteOpen
      }}
    >
      {children}
    </EventsContext.Provider>
  );
};
