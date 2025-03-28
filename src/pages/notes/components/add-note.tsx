import { useState } from 'react';
import { useMutation } from '@apollo/client';
import { CREATE_NOTE } from '@/graphql/notes/mutations';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { NoteForm } from './note-form';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import * as React from 'react';
import { Note } from '@/graphql/notes/types';

interface AddNoteProps {
  refetchNotes: () => void;
  selectedDate: Date;
  defaultStartTime?: Date;
  defaultEndTime?: Date;
  onClose?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const AddNote = React.forwardRef<HTMLButtonElement, AddNoteProps>(
  ({ refetchNotes, selectedDate, defaultStartTime, defaultEndTime, onClose, open, onOpenChange }, ref) => {
    const [internalOpen, setInternalOpen] = useState(false);
    const [createNote] = useMutation(CREATE_NOTE);

    const handleOpenChange = (newOpen: boolean) => {
      if (onOpenChange) {
        onOpenChange(newOpen);
      } else {
        setInternalOpen(newOpen);
      }
      if (!newOpen && onClose) {
        onClose();
      }
    };

    const isControlled = open !== undefined && onOpenChange !== undefined;
    const isOpen = isControlled ? open : internalOpen;

    const handleSubmit = async (formData: any) => {
      try {
        await createNote({
          variables: {
            input: formData,
          },
        });
        refetchNotes();
        handleOpenChange(false);
      } catch (error) {
        console.error('Error creating note:', error);
      }
    };

    return (
      <Sheet open={isOpen} onOpenChange={handleOpenChange}>
        <SheetContent className="w-full sm:max-w-[540px] bg-white">
          <SheetHeader>
            <SheetTitle>Add Note</SheetTitle>
            <SheetDescription>
              Create a new note for your meeting or event
            </SheetDescription>
          </SheetHeader>
          <ScrollArea className="h-[calc(100vh-8rem)]">
            <div className="pr-4">
              <NoteForm
                onSubmit={handleSubmit}
                setOpen={() => handleOpenChange(false)}
                selectedDate={selectedDate}
                defaultStartTime={defaultStartTime}
                defaultEndTime={defaultEndTime}
              />
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    );
  }
);

AddNote.displayName = 'AddNote'; 