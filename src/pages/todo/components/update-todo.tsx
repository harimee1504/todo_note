import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Pencil, Plus } from "lucide-react";
import { TodoInputForm } from "./todo-form";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import { useState } from "react";
import { Hint } from "@/components/hint";

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

interface UpdateTodoProps {
  id: string;
  title: string;
  description?: string;
  isPrivate: boolean;
  dueDate: string;
  status: string;
  assignedTo: User[];
  mentions: User[];
  tags: Tags[];
  refetchTodos: () => void;
}

export const UpdateTodo = ({ id, title, description, isPrivate, dueDate, status, assignedTo, mentions, tags, refetchTodos }: UpdateTodoProps) => {
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger>
          <Pencil
            className="h-4 w-4"
            onClick={(e) => {
              e.stopPropagation();
              setOpen(true);
            }}
          />
      </SheetTrigger>
      <SheetContent side="right" className="p-0" onClick={(e) => e.stopPropagation()}>
        <TooltipProvider>
          <TodoInputForm 
          flag="update"
           data={{ id, title, description, isPrivate, dueDate, status, assignedTo, mentions, tags }}
          setOpen={setOpen} 
          refetchTodos={refetchTodos} />
        </TooltipProvider>
      </SheetContent>
    </Sheet>
  );
};
