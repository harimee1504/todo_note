import { format } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { Card } from '@/components/ui/card';
import { Note } from '@/graphql/notes/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { TooltipProvider } from '@/components/ui/tooltip';
import { MinimalTiptapEditor } from '@/components/minimal-tiptap';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Pencil, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AddNote } from './add-note';
import { Button } from '@/components/ui/button';

const IST_TIMEZONE = "Asia/Kolkata";

interface NoteCardProps {
  note: Note;
  onDelete: (noteId: string) => void;
  onEdit: (note: Note) => void;
  refetchNotes?: () => void;
}

export function NoteCard({ note, onDelete, onEdit, refetchNotes }: NoteCardProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditSheet, setShowEditSheet] = useState(false);

  const getNotePosition = () => {
    const startTime = new Date(note.startTime);
    const endTime = new Date(note.endTime);
    
    // Calculate start position
    const startHour = startTime.getHours();
    const startMinute = startTime.getMinutes();
    const startPercentage = (startHour + startMinute / 60) * 100;
    
    // Calculate end position
    const endHour = endTime.getHours();
    const endMinute = endTime.getMinutes();
    const endPercentage = (endHour + endMinute / 60) * 100;
    // Calculate height as the difference between end and start positions
    const height = endPercentage - startPercentage;
    
    return {
      top: `${0}px`,
      height: `${height}px`,
    };
  };

  const position = getNotePosition();

  // Calculate duration in hours and minutes
  const startTime = new Date(note.startTime);
  const endTime = new Date(note.endTime);
  const durationMs = endTime.getTime() - startTime.getTime();
  const hours = Math.floor(durationMs / (1000 * 60 * 60));
  const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
  const durationText = `${hours}h ${minutes}m`;

  // Parse the note content
  const parsedNoteContent = typeof note.note === 'string' ? JSON.parse(note.note) : note.note;

  const handleDelete = () => {
    onDelete(note.id);
    setShowDeleteDialog(false);
  };

  const handleEdit = () => {
    onEdit(note);
    setShowDialog(false);
  };

  return (
    <>
      <div
        className="absolute left-0 right-0 bg-primary/10 border border-primary/20 rounded-md p-2 cursor-pointer hover:bg-primary/20 transition-colors"
        style={{
          top: position.top,
          height: position.height,
        }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setShowDialog(true)
        }}
      >
        <div className="text-xs font-medium truncate">{note.title}</div>
        <div className="text-xs text-muted-foreground truncate">
          {formatInTimeZone(new Date(note.startTime), IST_TIMEZONE, 'h:mm a')} - {formatInTimeZone(new Date(note.endTime), IST_TIMEZONE, 'h:mm a')}
        </div>
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>{note.title}</DialogTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleEdit}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setShowDialog(false);
                    setShowDeleteDialog(true);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </DialogHeader>
          <ScrollArea className="max-h-[80vh]">
            <div className="space-y-4">
              {/* Time and Duration */}
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div>
                  {formatInTimeZone(new Date(note.startTime), IST_TIMEZONE, 'h:mm a')} - {formatInTimeZone(new Date(note.endTime), IST_TIMEZONE, 'h:mm a')}
                </div>
                <div>•</div>
                <div>{durationText}</div>
              </div>

              {/* Created By */}
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={note.createdBy?.imageUrl} />
                  <AvatarFallback>
                    {note.createdBy?.firstName?.[0]}
                    {note.createdBy?.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm">
                  Created by {note.createdBy?.firstName} {note.createdBy?.lastName}
                </span>
              </div>

              {/* Attendees */}
              {note.attendees && note.attendees.length > 0 && (
                <div className="space-y-2">
                  <div className="text-sm font-medium">Attendees</div>
                  <div className="flex flex-wrap gap-2">
                    {note.attendees.map((attendee) => (
                      <div key={attendee.id} className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={attendee.imageUrl} />
                          <AvatarFallback>
                            {attendee.firstName[0]}
                            {attendee.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">
                          {attendee.firstName} {attendee.lastName}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags */}
              {note.tags && note.tags.length > 0 && (
                <div className="space-y-2">
                  <div className="text-sm font-medium">Tags</div>
                  <div className="flex flex-wrap gap-2">
                    {note.tags.map((tag) => (
                      <Badge key={tag.id} variant="secondary">
                        {tag.tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Note Content */}
              <div className="mt-4">
                <MinimalTiptapEditor
                  value={parsedNoteContent}
                  editable={false}
                  className="prose max-w-none"
                  toolBar={false}
                  output="json"
                  editorClassName="focus:outline-none"
                />
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Note</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this note? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
} 