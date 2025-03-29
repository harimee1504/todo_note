import { useLazyQuery } from "@apollo/client";
import { GET_NOTES } from "@/graphql/notes/queries";
import { Button } from "@/components/ui/button";
import { Calendar, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarView } from "./components/calendar-view";
import { AddNote } from "./components/add-note";
import { format } from "date-fns";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useMutation } from '@apollo/client';
import { CREATE_NOTE, UPDATE_NOTE, DELETE_NOTE } from '@/graphql/notes/mutations';
import { Note } from '@/graphql/notes/types';

const NotesComponent = () => {
  const [getNotes, { loading, error, data, refetch }] = useLazyQuery(GET_NOTES);
  const DEFAULT_QUERY = { by: "orgId" };
  const [query, setQuery] = useState(DEFAULT_QUERY);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'week' | 'day'>('week');
  const [showAddNote, setShowAddNote] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<{
    date: Date;
    startTime: Date;
    endTime: Date;
  } | null>(null);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  const [createNote] = useMutation(CREATE_NOTE, {
    onCompleted: () => {
      refetch();
      setShowAddNote(false);
      setSelectedTimeSlot(null);
    },
  });

  const [updateNote] = useMutation(UPDATE_NOTE, {
    onCompleted: () => {
      refetch();
      setShowAddNote(false);
      setEditingNote(null);
    },
  });

  const [deleteNote] = useMutation(DELETE_NOTE, {
    onCompleted: () => {
      refetch();
    },
  });

  useEffect(() => {
    if(!query) return;
    getNotes({
      variables: {
        input: query,
      },
    });
  }, [query]);

  if (error) return `Error! ${error.message}`;

  const handleTimeSlotSelect = (date: Date, startTime: Date, endTime: Date) => {
    setSelectedTimeSlot({ date, startTime, endTime });
    setShowAddNote(true);
  };

  const handleAddNoteClose = () => {
    setShowAddNote(false);
    setSelectedTimeSlot(null);
    setEditingNote(null);
  };

  const handleAddNoteClick = () => {
    setSelectedTimeSlot(null);
    setEditingNote(null);
    setShowAddNote(true);
  };

  const handleCreateNote = async (noteData: any) => {
    try {
      await createNote({
        variables: {
          input: {
            title: noteData.title,
            note: noteData.note,
            startTime: noteData.startTime,
            endTime: noteData.endTime,
            attendees: noteData.attendees,
            tags: noteData.tags,
          },
        },
      });
    } catch (error) {
      console.error('Error creating note:', error);
    }
  };

  const handleUpdateNote = async (noteData: any) => {
    try {
      await updateNote({
        variables: {
          input: {
            id: noteData.id,
            title: noteData.title,
            note: noteData.note,
            startTime: noteData.startTime,
            endTime: noteData.endTime,
            attendees: noteData.attendees,
            tags: noteData.tags,
          },
        },
      });
    } catch (error) {
      console.error('Error updating note:', error);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      await deleteNote({
        variables: {
          input: {
            id: noteId
          }
        },
      });
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const handleNoteEdit = (note: Note) => {
    setEditingNote(note);
    setShowAddNote(true);
  };

  return (
    <TooltipProvider>
      <div className="flex flex-col gap-4 p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">Notes</h1>
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'week' ? 'default' : 'outline'}
                onClick={() => setViewMode('week')}
              >
                Week
              </Button>
              <Button
                variant={viewMode === 'day' ? 'default' : 'outline'}
                onClick={() => setViewMode('day')}
              >
                Day
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setSelectedDate(new Date())}
            >
              Today
            </Button>
            <Button onClick={handleAddNoteClick}>
              <Plus className="w-4 h-4 mr-2" />
              Add Note
            </Button>
          </div>
        </div>
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1"
          >
            {loading ? (
              <div>Loading...</div>
            ) : (
              <CalendarView
                notes={data?.getNotes || []}
                viewMode={viewMode}
                selectedDate={selectedDate}
                onDateSelect={setSelectedDate}
                refetchNotes={refetch}
                onTimeSlotSelect={handleTimeSlotSelect}
                onNoteEdit={handleNoteEdit}
                onNoteDelete={handleDeleteNote}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Add Note Dialog */}
        <AddNote
          refetchNotes={refetch}
          selectedDate={selectedTimeSlot?.date || selectedDate}
          defaultStartTime={selectedTimeSlot?.startTime}
          defaultEndTime={selectedTimeSlot?.endTime}
          onClose={handleAddNoteClose}
          open={showAddNote}
          onOpenChange={setShowAddNote}
          onSubmit={editingNote ? handleUpdateNote : handleCreateNote}
          mode={editingNote ? 'edit' : 'add'}
          initialNote={editingNote}
        />
      </div>
    </TooltipProvider>
  );
};

export default NotesComponent; 