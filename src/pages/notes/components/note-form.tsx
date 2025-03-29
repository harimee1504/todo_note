import { useState, useEffect } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format, addHours } from 'date-fns';
import { Content } from '@tiptap/react';
import { useQuery } from '@apollo/client';
import { GET_USERS_BY_ORG } from '@/graphql/user/queries';
import { Note } from '@/graphql/notes/types';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MinimalTiptapEditor } from '@/components/minimal-tiptap';
import { DateTimePicker } from '@/components/date-time-picker';
import TagsMultiSelect from '@/components/tags-multi-select';
import UsersMultiSelect from '@/components/users-multi-select';
import { Loader2 } from 'lucide-react';

const IST_TIMEZONE = "Asia/Kolkata";

const FormSchema = z.object({
  title: z.string().min(1, {
    message: 'Title is required',
  }),
  note: z.string().min(1, {
    message: 'Note content is required',
  }),
  startTime: z.date({
    required_error: 'Start time is required',
  }),
  endTime: z.date({
    required_error: 'End time is required',
  }),
  attendees: z.array(z.string()).min(1, {
    message: 'At least one attendee is required',
  }),
  tags: z.array(z.string()).optional(),
});

interface NoteFormProps {
  onSubmit: (data: any) => void;
  setOpen: (open: boolean) => void;
  selectedDate: Date;
  defaultStartTime?: Date;
  defaultEndTime?: Date;
  mode?: 'add' | 'edit';
  initialNote?: Note;
}

export function NoteForm({ onSubmit, setOpen, selectedDate, defaultStartTime, defaultEndTime, mode = 'add', initialNote }: NoteFormProps) {
  // Parse the initial note content if it exists
  const initialContent = initialNote?.note ? JSON.parse(initialNote.note) : '';
  const [description, setDescription] = useState<Content>(initialContent);
  const [selectedUsers, setSelectedUsers] = useState<string[]>(initialNote?.attendees.map(user => user.id) || []);
  const [selectedTags, setSelectedTags] = useState<string[]>(initialNote?.tags?.map(tag => tag.id) || []);
  const [submitLoading, setSubmitLoading] = useState(false);
  const { data: user_data, loading: user_loading } = useQuery(GET_USERS_BY_ORG);

  // Convert selected date to IST
  const istSelectedDate = new Date(selectedDate.toLocaleString("en-US", { timeZone: IST_TIMEZONE }));
  const istEndDate = addHours(istSelectedDate, 1);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      title: initialNote?.title || '',
      note: initialNote?.note || '',
      startTime: defaultStartTime || istSelectedDate,
      endTime: defaultEndTime || istEndDate,
      attendees: initialNote?.attendees.map(user => user.id) || [],
      tags: initialNote?.tags?.map(tag => tag.id) || [],
    },
  });

  // Update form when initialNote changes
  useEffect(() => {
    if (initialNote) {
      form.reset({
        title: initialNote.title,
        note: initialNote.note,
        startTime: new Date(initialNote.startTime),
        endTime: new Date(initialNote.endTime),
        attendees: initialNote.attendees.map(user => user.id),
        tags: initialNote.tags?.map(tag => tag.id) || [],
      });
      setDescription(JSON.parse(initialNote.note));
      setSelectedUsers(initialNote.attendees.map(user => user.id));
      setSelectedTags(initialNote.tags?.map(tag => tag.id) || []);
    }
  }, [initialNote, form]);

  const handleSubmit = async (formData: z.infer<typeof FormSchema>) => {
    setSubmitLoading(true);
    try {
      await onSubmit({
        ...formData,
        note: JSON.stringify(description),
        attendees: selectedUsers.length > 0 ? selectedUsers : formData.attendees,
        tags: selectedTags,
      });
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter note title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <FormField
            control={form.control}
            name="startTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Time</FormLabel>
                <FormControl>
                  <DateTimePicker
                    date={field.value}
                    setDate={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="endTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Time</FormLabel>
                <FormControl>
                  <DateTimePicker
                    date={field.value}
                    setDate={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="note"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Note</FormLabel>
              <FormControl>
                <MinimalTiptapEditor
                  value={description}
                  onChange={(value) => {
                    setDescription(value);
                    field.onChange(JSON.stringify(value));
                  }}
                  className="min-h-[200px]"
                  editorContentClassName="p-5"
                  output="json"
                  toolBar={true}
                  toolbarType="basic"
                  placeholder="Type your note content here..."
                  editable={true}
                  editorClassName="focus:outline-none"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="attendees"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Attendees</FormLabel>
              <FormControl>
                <UsersMultiSelect
                  data={user_data}
                  loading={user_loading}
                  selected={selectedUsers}
                  setSelectedUsers={(users: string[]) => {
                    setSelectedUsers(users);
                    field.onChange(users);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tags</FormLabel>
              <FormControl>
                <TagsMultiSelect
                  selected={selectedTags}
                  setSelectedTags={setSelectedTags}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={submitLoading}>
            {submitLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {mode === 'edit' ? 'Save Changes' : 'Create Note'}
          </Button>
        </div>
      </form>
    </Form>
  );
} 