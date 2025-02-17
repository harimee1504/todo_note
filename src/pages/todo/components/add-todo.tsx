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
import { Plus } from "lucide-react";
import { TodoInputForm } from "./todo-form";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import { useState } from "react";

export const AddTodo = ({refetchTodos}: {refetchTodos: () => void}) => {
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger>
        <Button className="text-sm">
          <Plus className="mr-1 h-4 w-4" />
          Add Todo
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="p-0">
        <TooltipProvider>
          <TodoInputForm flag="create" setOpen={setOpen} refetchTodos={refetchTodos}/>
        </TooltipProvider>
      </SheetContent>
    </Sheet>
  );
};
