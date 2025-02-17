import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CalendarEvent } from "@/pages/notes/utils/data";
import { EventDeleteForm } from "./event-delete-form";
import { EventEditForm } from "./event-edit-form";
import { useEvents } from "@/pages/notes/context/events-context";
import { X } from "lucide-react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { MinimalTiptapEditor } from "@/components/minimal-tiptap";

interface EventViewProps {
  event?: CalendarEvent;
}

export function EventView({ event }: EventViewProps) {
  const { eventViewOpen, setEventViewOpen } = useEvents();

  return (
    <>
      <AlertDialog open={eventViewOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex flex-row justify-between items-center">
              <h1>{event?.title}</h1>
              <AlertDialogCancel onClick={() => setEventViewOpen(false)}>
                <X className="h-5 w-5" />
              </AlertDialogCancel>
            </AlertDialogTitle>
            <table>
              <tr>
                <th>Time:</th>
                <td>{`${event?.start.toLocaleTimeString()} - ${event?.end.toLocaleTimeString()}`}</td>
              </tr>
              <tr>
                <th>Description:</th>
                <td>
                  <TooltipProvider>
                    <MinimalTiptapEditor
                      value={JSON.parse(event?.note || "{}")}
                      className="w-full max-h-32"
                      editorContentClassName="p-5"
                      toolBar={false}
                      editable={false}
                      editorClassName="focus:outline-none"
                    />
                  </TooltipProvider>
                </td>
              </tr>
            </table>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <EventDeleteForm id={event?.id} title={event?.title} />
            <EventEditForm
              oldEvent={event}
              event={event}
              isDrag={false}
              displayButton={true}
            />
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
