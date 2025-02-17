import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UPDATE_TODO_STATUS } from "@/graphql/todo/mutations";
import { useMutation } from "@apollo/client";
import { useId } from "react";

function StatusDot({ className }: { className?: string }) {
  return (
    <svg
      width="8"
      height="8"
      fill="currentColor"
      viewBox="0 0 8 8"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <circle cx="4" cy="4" r="4" />
    </svg>
  );
}


export default function Component({todo_id, status, setStatus}: {todo_id: string, status: string, setStatus: (status: string) => void}) {
  const id = useId();
  const [updateTodoStatus] = useMutation(UPDATE_TODO_STATUS);
  const statusMap = {
    notStarted : {
      completed: true,
      active: true
    },
    active: {
      onHold: true,
      completed: true
    },
    onHold: {
      active: true,
      completed: true
    },
    overdue: {
      completed: true
    },
    completed:{}
  }

  const handleStatusSelect = (value: string) => {
    updateTodoStatus({variables: {
      input: {
        id:todo_id, 
        status: value
      }
    }}).then(() => setStatus(value));
  };

  return (
    <div className="space-y-2">
      <Select defaultValue={status} onValueChange={handleStatusSelect}>
        <SelectTrigger
          id={id}
          className="[&>span]:flex [&>span]:items-center [&>span]:gap-2 [&>span_svg]:shrink-0"
        >
          <SelectValue placeholder="Select status" />
        </SelectTrigger>
        <SelectContent className="[&_*[role=option]>span>svg]:shrink-0 [&_*[role=option]>span>svg]:text-muted-foreground/80 [&_*[role=option]>span]:end-2 [&_*[role=option]>span]:start-auto [&_*[role=option]>span]:flex [&_*[role=option]>span]:items-center [&_*[role=option]>span]:gap-2 [&_*[role=option]]:pe-8 [&_*[role=option]]:ps-2">
          <SelectItem value="completed" disabled={!statusMap[status].completed}>
            <span className="flex items-center gap-2">
              <StatusDot className="text-black" />
              <span className="truncate">Completed</span>
            </span>
          </SelectItem>
          <SelectItem value="active" disabled={!statusMap[status].active}>
            <span className="flex items-center gap-2">
              <StatusDot className="text-green-500" />
              <span className="truncate">Active</span>
            </span>
          </SelectItem>
          <SelectItem value="onHold" disabled={!statusMap[status].onHold}>
            <span className="flex items-center gap-2">
              <StatusDot className="text-yellow-500" />
              <span className="truncate">On Hold</span>
            </span>
          </SelectItem>
          <SelectItem value="notStarted" disabled={!statusMap[status].notStarted}>
            <span className="flex items-center gap-2">
              <StatusDot className="text-gray-500" />
              <span className="truncate">Not Started</span>
            </span>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
