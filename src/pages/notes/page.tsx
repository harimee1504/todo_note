import Calendar from "@/pages/notes/components/calendar";
import { EventsProvider, useEvents } from "@/pages/notes/context/events-context";
import RootLayout from "./layout";

export default function NotesComponent() {
  return (
    <RootLayout>
      <EventsProvider>
        <div className="py-4">
          <div className="w-full px-5 space-y-5">
            <Calendar />
          </div>
        </div>
      </EventsProvider>
    </RootLayout>
  );
}
