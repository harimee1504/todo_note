import { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  GitBranch,
  MessageSquare,
  Star,
  Users,
  CheckCircle2,
  Calendar,
  Calendar1,
  Calendar1Icon,
  User,
  Pencil,
  Trash,
} from "lucide-react";
import { CommentSection, ACTIONS_TYPE } from "shadcn-comments";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import StatusDropdown from "./status-dropdown";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useExpandable } from "../../../hooks/use-expandable";
import { cn } from "@/lib/utils";
import { MinimalTiptapEditor } from "../../../components/minimal-tiptap";
import { Hint } from "@/components/hint";
import { useMutation } from "@apollo/client";
import { DELETE_TODO } from "@/graphql/todo/mutations";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { UpdateTodo } from "./update-todo";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  imageUrl: string;
}

interface Comment {
  id: string;
  comment: string;
  mentions: User[];
  todo_id: string;
  createdAt: string;
  updatedAt: string;
  updatedBy: User;
  createdBy: User;
}

interface Tags {
  id: string;
  tag: string;
}

interface TodoCardProps {
  id: string;
  title: string;
  description?: string;
  createdBy: User;
  createdAt: string;
  updatedAt: string;
  updatedBy: User;
  isPrivate: boolean;
  dueDate: string;
  status: string;
  assignedTo: User[];
  comments: Comment[];
  mentions: User[];
  tags: Tags[];
  todoStyle?: "list" | "grid";
  refetchTodos: () => void;
}

export function TodoCard({
  id,
  title,
  description,
  createdBy,
  createdAt,
  updatedAt,
  updatedBy,
  isPrivate,
  dueDate,
  status,
  assignedTo,
  mentions,
  comments,
  tags,
  todoStyle = "grid",
  refetchTodos,
}: TodoCardProps) {
  const { isExpanded, toggleExpand, animatedHeight } = useExpandable();
  const contentRef = useRef<HTMLDivElement>(null);
  const [value, setValue] = useState<any[]>([]);
  const [width, setWidth] = useState(0);
  const [commentsOpen, setCommentsOpen] = useState(false);

  const [deleteTodo] = useMutation(DELETE_TODO);
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    console.log(value);
  }, [value]);

  useEffect(() => {
    const updateWidth = () => {
      if (contentRef.current) {
        setWidth(contentRef.current.offsetWidth);
      }
    };
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => {
      window.removeEventListener("resize", updateWidth);
    };
  }, []);
  const [currentStatus, setCurrentStatus] = useState(status);

  useEffect(() => {
    if (contentRef.current) {
      animatedHeight.set(isExpanded ? contentRef.current.scrollHeight : 0);
    }
  }, [isExpanded, animatedHeight]);

  const handleDeleteTodo = () => {
    deleteTodo({
      variables: {
        input: {
          id: id,
        },
      },
    }).then(() => refetchTodos());
  };

  const statusMap = {
    notStarted: {
      label: "Not Started",
      color: "bg-gray-300 text-gray-700",
    },
    active: {
      label: "Active",
      color: "bg-green-100 text-green-600",
    },
    onHold: {
      label: "On Hold",
      color: "bg-yellow-100 text-yellow-600",
    },
    completed: {
      label: "Completed",
      color: "bg-black text-white",
    },
    overdue: {
      label: "Overdue",
      color: "bg-red-100 text-red-600",
    },
  };

  return (
    <Card
      className={
        "w-full h-full max-w-[375px] cursor-pointer transition-all duration-300 hover:shadow-lg"
      }
      onClick={toggleExpand}
    >
      <CardHeader className="space-y-1">
        <div className="flex justify-between items-start w-full">
          <div className="space-y-2 w-full">
            <div className="w-full flex justify-between">
              <Badge
                variant="secondary"
                className={cn(
                  "text-xs",
                  statusMap[currentStatus as keyof typeof statusMap].color
                )}
              >
                {statusMap[currentStatus as keyof typeof statusMap].label}
              </Badge>
              <div className="flex gap-x-4 items-center">
                {isExpanded && (
                  <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                    <AlertDialogTrigger>
                      <Hint label="Delete Todo">
                        <Trash
                          className="h-4 w-4"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteOpen(true);
                          }}
                        />
                      </Hint>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Are you absolutely sure?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          The action cannot be undone. This will permanently
                          delete your todo.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteTodo}>
                          Proceed
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
                {isExpanded && (
                  <UpdateTodo
                    id={id}
                    title={title}
                    description={description}
                    isPrivate={isPrivate}
                    dueDate={dueDate}
                    status={status}
                    assignedTo={assignedTo}
                    mentions={mentions}
                    tags={tags}
                    refetchTodos={refetchTodos}
                  />
                )}
              </div>
            </div>
            <h2 className="text-lg font-semibold">{title}</h2>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              <span className="text-xs">
                Due {`${new Date(dueDate.split("T")[0]).toDateString()}`}
              </span>
            </div>
          </div>

          <motion.div
            style={{ height: `calc(40px + ${animatedHeight}px)` }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="overflow-hidden"
          >
            <div ref={contentRef}>
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4 pt-2"
                  >
                    {!(JSON.parse(description) === "") && (
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">Description</h4>
                        <div className="flex items-center justify-between text-sm overflow-auto">
                          <TooltipProvider>
                            <MinimalTiptapEditor
                              value={JSON.parse(description || "{}")}
                              className="w-full max-h-32"
                              editorContentClassName="p-5"
                              toolBar={false}
                              editable={false}
                              editorClassName="focus:outline-none"
                            />
                          </TooltipProvider>
                        </div>
                      </div>
                    )}
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Status</h4>
                      <div className="flex items-center justify-between text-sm pl-3">
                        <StatusDropdown
                          todo_id={id}
                          status={currentStatus}
                          setStatus={setCurrentStatus}
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex flex-col space-y-2">
                        <h4 className="font-medium text-sm">Created by</h4>
                        <div className="flex items-center text-gray-600">
                          <Avatar className="border-2 border-white h-8 w-8">
                            <AvatarImage
                              src={
                                createdBy.imageUrl ||
                                `/placeholder.svg?height=32&width=32&text=${
                                  createdBy.firstName[0] + createdBy.lastName[0]
                                }`
                              }
                              alt={createdBy.firstName}
                            />
                            <AvatarFallback>
                              {createdBy.firstName[0] + createdBy.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <h4 className="ml-2 font-medium text-sm">
                            {createdBy.lastName + ", " + createdBy.firstName}
                          </h4>
                        </div>
                      </div>
                    </div>

                    {assignedTo.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm flex items-center">
                          {assignedTo.length === 1 ? (
                            <User className="h-4 w-4 mr-2" />
                          ) : (
                            <Users className="h-4 w-4 mr-2" />
                          )}
                          {assignedTo.length === 1
                            ? "Assigned to"
                            : "Assignees"}
                        </h4>
                        <div className="flex -space-x-2">
                          {assignedTo.map((contributor, index) => (
                            <TooltipProvider key={index}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Avatar className="border-2 border-white">
                                    <AvatarImage
                                      src={
                                        contributor.imageUrl ||
                                        `/placeholder.svg?height=32&width=32&text=${
                                          contributor.firstName[0] +
                                          contributor.lastName[0]
                                        }`
                                      }
                                      alt={contributor.firstName}
                                    />
                                    <AvatarFallback>
                                      {contributor.firstName[0] +
                                        contributor.lastName[0]}
                                    </AvatarFallback>
                                  </Avatar>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>
                                    {contributor.lastName +
                                      ", " +
                                      contributor.firstName}
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="space-y-2">
                      <Dialog
                        open={commentsOpen}
                        onOpenChange={setCommentsOpen}
                      >
                        <DialogTrigger>
                          <Button
                            className="w-full"
                            onClick={(e) => {
                              e.stopPropagation();
                              setCommentsOpen(true);
                            }}
                          >
                            <MessageSquare className="h-4 w-4 mr-2" />
                            View Discussion
                          </Button>
                        </DialogTrigger>
                        <DialogContent onClick={(e) => e.stopPropagation()}>
                          <div className="h-[80vh] w-[80vh] p-4 flex">
                            <CommentSection
                              theme="light"
                              currentUser={{
                                id: "1",
                                fullName: "Me",
                                avatarUrl: "https://github.com/shadcn.png",
                              }}
                              value={value}
                              onChange={(val) => {
                                setValue(val);
                              }}
                              className={""}
                              allowUpVote={true}
                            />
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </CardContent>

      <CardFooter>
        <div className="flex w-full text-sm gap-3 text-gray-600 flex-wrap">
          {tags.map((tag, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="bg-blue-100 font-normal"
            >
              {tag.tag}
            </Badge>
          ))}
        </div>
      </CardFooter>
    </Card>
  );
}
