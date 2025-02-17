import { useState } from "react";
import { useMutation, useQuery } from "@apollo/client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { Content } from "@tiptap/react";
import { zodResolver } from "@hookform/resolvers/zod";

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
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import { CREATE_TODO, UPDATE_TODO } from "@/graphql/todo/mutations";
import { GET_USERS_BY_ORG } from "@/graphql/user/queries";

import { DatePicker } from "@/components/date-picker";
import TagsMultiSelect from "@/components/tags-multi-select";
import UsersMultiSelect from "@/components/users-multi-select";
import { MinimalTiptapEditor } from "@/components/minimal-tiptap";
import { Loader2 } from "lucide-react";

const FormSchema = z.object({
  todo: z.string().min(5, {
    message: "Todo must be at least 5 characters.",
  }),
  description: z.string().optional(),
  dueDate: z.date({ required_error: "Due date is required" }),
  isPrivate: z.boolean().default(false).optional(),
  tags: z
    .array(z.string())
    .max(10, { message: "You can provide up to 10 tag values only." }),
  assignedTo: z.array(z.string()).optional(),
});

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  imageUrl: string;
}

interface Tags {
  id: string;
  tag: string;
}

interface TodoFormValues {
  id?: string;
  title?: string;
  description?: string;
  isPrivate?: boolean;
  dueDate?: string;
  status?: string;
  assignedTo?: User[];
  mentions?: User[];
  tags?: Tags[];
}

interface TodoFormProps {
  data?: TodoFormValues;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  refetchTodos: () => void;
  flag: 'create' | 'update';
}

export function TodoInputForm({ data, flag='create', setOpen, refetchTodos }: TodoFormProps) {
  const [createTodo] = useMutation(CREATE_TODO);
  const [updateTodo] = useMutation(UPDATE_TODO);
  const { data: user_data, loading } = useQuery(GET_USERS_BY_ORG);
  const [description, setDescription] = useState<Content>(data?.description ? JSON.parse(data?.description) : "");

  const [submitLoading, setSubmitLoading] = useState(false);

  const [privateTodo, setPrivateTodo] = useState(data?.isPrivate || false);

  const [selectedUsers, setSelectedUsers] = useState(data?.assignedTo?.map((user: any) => user.id) || []);
  const [selectedTags, setSelectedTags] = useState(data?.tags?.map((tag: any) => tag.id) || []);

  const [openAlert, setOpenAlert] = useState(false);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      todo: data?.title || "",
      description: "",
      dueDate: data?.dueDate && new Date(data.dueDate) || undefined,
      isPrivate: data?.isPrivate || false,
      tags: data?.tags?.map((tag: any) => tag.id) || [],
      assignedTo: data?.assignedTo?.map((user: any) => user.id) || [],
    },
  });

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

  function convertMentionsToText(obj: any) {
    const targetKey = "type";
    const targetValue = "mention";
    function traverse(currentObj: any) {
      if (currentObj[targetKey] === targetValue) {
        currentObj["text"] = currentObj.attrs.id;
        currentObj["type"] = "text";
        delete currentObj["attrs"];
      }

      for (const key in currentObj) {
        if (typeof currentObj[key] === "object" && currentObj[key] !== null) {
          traverse(currentObj[key]);
        }
      }
    }

    traverse(obj);
    return obj;
  }

  function onSubmit(formData: z.infer<typeof FormSchema>) {
    let mentions = [...findAllValuesByKey(description)];
    console.log(mentions);
    setSubmitLoading(true);
    if(flag === 'create'){
      createTodo({
        variables: {
          input: {
            ...formData,
            description: JSON.stringify(description),
            assignedTo: selectedUsers,
            tags: selectedTags,
            mentions: mentions,
          },
        },
      }).finally(() => {
        refetchTodos();
        setSubmitLoading(false);
        setOpen(false)}
      );
    }
    else{
      updateTodo({
        variables: {
          input: {
            id: data?.id,
            todo: formData.todo,
            dueDate: formData.dueDate,
            isPrivate: formData.isPrivate,
            status: data?.status,
            description: JSON.stringify(description),
            assignedTo: selectedUsers,
            tags: selectedTags,
            mentions: mentions,
          },
        },
      }).finally(() => {
        refetchTodos();
        setSubmitLoading(false);
        setOpen(false)}
      );
    }
  }

  const handleMentionTextConversion = (cb: any) => {
    let text = convertMentionsToText(description);
    setDescription(text);
    setSelectedUsers([]);
    setPrivateTodo(true);
    cb(true);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="h-full w-full flex flex-col space-y-6 font-poppins"
      >
        <SheetHeader className="px-4 pt-4">
          <SheetTitle>{flag === 'create' ? 'Add' : 'Update'} a Todo</SheetTitle>
          <SheetDescription>
            A task you need to complete or things that you want to do
          </SheetDescription>
        </SheetHeader>
        <div
          className="custom-scrollbar flex-1 overflow-y-auto"
          style={{ scrollbarWidth: "thin" }}
        >
          <div className="space-y-8 px-6">
            <FormField
              control={form.control}
              name="todo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Todo</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your todo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Due Date</FormLabel>
                  <DatePicker
                    selected={field.value}
                    onSelect={(value: string) => {
                      field.onChange(value);
                    }}
                  />
                  <FormDescription>
                    The due date is used to efficiently track your todo progress
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isPrivate"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={(value) => {
                        if (value) {
                          let mentions = [...findAllValuesByKey(description)];
                          if (mentions.length > 0 || selectedUsers.length > 0) {
                            setOpenAlert(true);
                          } else {
                            setPrivateTodo(value as boolean);
                            field.onChange(value);
                          }
                        } else {
                          setPrivateTodo(value as boolean);
                          field.onChange(value);
                        }
                      }}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <AlertDialog open={openAlert} onOpenChange={setOpenAlert}>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Are you absolutely sure?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Private todo cannot have assignees & mentions. The
                            following things will be modified
                            <div>
                              <ul>
                                <li>
                                  &bull; The mentions in description will be
                                  converted to plain text.
                                </li>
                                <li>&bull; The assignees will be cleared.</li>
                              </ul>
                            </div>
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel
                            onClick={() => field.onChange(false)}
                          >
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() =>
                              handleMentionTextConversion(field.onChange)
                            }
                          >
                            Proceed
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    <FormLabel>Save as private</FormLabel>
                    <FormDescription>
                      You can save this todo as private. Only you can see this
                    </FormDescription>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            {!privateTodo ? (
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
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
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : (
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormDescription>
                      Note: Mentions are not available in Private todo
                    </FormDescription>
                    <FormControl>
                      <MinimalTiptapEditor
                        value={field.value || description}
                        onChange={setDescription}
                        className="w-full"
                        editorContentClassName="p-5"
                        output="json"
                        toolBar={true}
                        toolbarType="basic"
                        canMention={false}
                        placeholder="Type your description here..."
                        editable={true}
                        editorClassName="focus:outline-none"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            {!privateTodo && (
              <FormField
                control={form.control}
                name="assignedTo"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Assignees</FormLabel>
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
            )}
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
          </div>
        </div>
        <SheetFooter className="flex-none border-t-6 px-6 pb-6">
          {submitLoading ? (
            <Button disabled>
              <Loader2 className="animate-spin" />
              {flag === 'create' ? "Creating" : "Updating"}
            </Button>
          ) : (
            <Button type="submit">Submit</Button>
          )}
        </SheetFooter>
      </form>
    </Form>
  );
}
