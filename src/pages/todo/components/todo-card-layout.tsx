import { TodoCard } from "./expandable-card"

interface ExpandableCardLayoutProps {
  data: any;
  refetchTodos: () => void
}

export default function ExpandableCardLayout({ data, refetchTodos }: ExpandableCardLayoutProps) {
  return (
    <div className="flex flex-wrap gap-4 items-center">
      {
        data.map((item: any) => (
          <TodoCard
            id={item.id}
            key={item.id}
            title={item.todo}
            description={item.description}
            createdBy={item.createdBy}
            createdAt={item.createdAt}
            updatedAt={item.updatedAt}
            updatedBy={item.updatedBy}
            isPrivate={item.isPrivate}
            dueDate={item.dueDate}
            status={item.status}
            assignedTo={item.assignedTo}
            mentions={item.mentions}
            comments={item.comments}
            tags={item.tags}
            refetchTodos={refetchTodos}
          />
        ))
      }
    </div>
  )
}