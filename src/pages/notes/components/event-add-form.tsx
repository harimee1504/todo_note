import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PlusIcon } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { DateTimePicker } from "./date-picker";
import { useEvents } from "@/pages/notes/context/events-context";
import { ToastAction } from "@/components/ui/toast";
import { Content } from "tippy.js";
import { MinimalTiptapEditor } from "@/components/minimal-tiptap";
import { TooltipProvider } from "@/components/ui/tooltip";
import UsersMultiSelect from "@/components/users-multi-select";
import TagsMultiSelect from "@/components/tags-multi-select";
import { useMutation, useQuery } from "@apollo/client";
import { GET_USERS_BY_ORG } from "@/graphql/user/queries";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { CREATE_NOTE } from "@/graphql/note/mutations";

const eventAddFormSchema = z.object({
  title: z
    .string({ required_error: "Please enter a title." })
    .min(1, { message: "Must provide a title for this event." }),
  note: z.optional(z.string()),
  startTime: z.date({
    required_error: "Please select a start time",
    invalid_type_error: "That's not a date!",
  }),
  endTime: z.date({
    required_error: "Please select an end time",
    invalid_type_error: "That's not a date!",
  }),
    attendees: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
});

type EventAddFormValues = z.infer<typeof eventAddFormSchema>;

interface EventAddFormProps {
  start: Date;
  end: Date;
}

export function EventAddForm({ start, end }: EventAddFormProps) {
  const { events, addEvent } = useEvents();
  const { eventAddOpen, setEventAddOpen } = useEvents();

  const [createNote] = useMutation(CREATE_NOTE);

  const { toast } = useToast();

  const [description, setDescription] = useState<Content>("");

  const form = useForm<z.infer<typeof eventAddFormSchema>>({
    resolver: zodResolver(eventAddFormSchema),
  });

  const { data: user_data, loading } = useQuery(GET_USERS_BY_ORG);

  const [selectedUsers, setSelectedUsers] = useState(form.attendees?.map((user: any) => user.id) || []);
  const [selectedTags, setSelectedTags] = useState(form.tags?.map((tag: any) => tag.id) || []);

  useEffect(() => {
    form.reset({
      title: "",
      note: "",
      startTime: start,
      endTime: end,
      attendees: [],
      tags: []
    });
  }, [form, start, end]);

  function findAllValuesByKey(obj: Content) {
    const results = new Set();

    function search(obj: any) {
      if (typeof obj !== "object" || obj === null) {
        return;
      }

      for (const [key, value] of Object.entries(obj)) {
        if (key === "type" && value === "mention") {
          results.add(obj.attrs.user_id);
        }

        if (typeof value === "object") {
          search(value);
        }
      }
    }

    search(obj);
    return results;
  }

  async function onSubmit(data: EventAddFormValues) {
    let mentions = [...findAllValuesByKey(description)];
    const newEvent = {
      title: data.title,
      note: JSON.stringify(description) || data?.note || "",
      startTime: data.startTime,
      endTime: data.endTime,
      attendees: selectedUsers,
      tags: selectedTags,
      mentions: mentions,
    };

    createNote({ variables: { input: newEvent } })
    .then((data)=>{
      newEvent.id = data.data.createNote.id
      addEvent(newEvent);
      setEventAddOpen(false);
      toast({
        title: "Event added!",
        action: (
          <ToastAction altText={"Click here to dismiss notification"}>
            Dismiss
          </ToastAction>
        ),
      });
    });
  }

  return (
    <Sheet open={eventAddOpen} onOpenChange={setEventAddOpen}>
      <SheetTrigger className="flex">
        <Button
          className="w-24 md:w-28 text-xs md:text-sm"
          variant="default"
          onClick={() => setEventAddOpen(true)}
        >
          <PlusIcon className="md:h-5 md:w-5 h-3 w-3" />
          <p>Add Note</p>
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Add Note</SheetTitle>
          <SheetDescription>
            Save the minutes of meeting
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2.5">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Meeting Title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Note</FormLabel>
                  <FormControl>
                    <TooltipProvider>
                      <MinimalTiptapEditor
                        value={field.value || description}
                        onChange={setDescription}
                        className="w-full"
                        editorContentClassName="p-5"
                        output="json"
                        toolBar={true}
                        toolbarType="basic"
                        placeholder="Type your description here..."
                        editable={true}
                        editorClassName="focus:outline-none"
                      />
                    </TooltipProvider>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="startTime"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel htmlFor="datetime">Start Time</FormLabel>
                  <FormControl>
                    <DateTimePicker
                      value={field.value}
                      onChange={field.onChange}
                      hourCycle={12}
                      granularity="minute"
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
                <FormItem className="flex flex-col">
                  <FormLabel htmlFor="datetime">End Time</FormLabel>
                  <FormControl>
                    <DateTimePicker
                      value={field.value}
                      onChange={field.onChange}
                      hourCycle={12}
                      granularity="minute"
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
                <FormItem className="flex flex-col">
                  <FormLabel>Attendees</FormLabel>
                  <FormControl>
                    <UsersMultiSelect
                      data={user_data}
                      loading={loading}
                      selected={field.value}
                      setSelectedUsers={setSelectedUsers}
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
                <FormItem className="flex flex-col">
                  <FormLabel>Tags</FormLabel>
                  <FormControl>
                    <TagsMultiSelect
                      selected={field.value}
                      setSelectedTags={setSelectedTags}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <SheetFooter className="pt-2">
              <Button type="submit">Submit</Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
