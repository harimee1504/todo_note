import { useLazyQuery, useQuery } from "@apollo/client";
import ExpandableCardLayout from "./components/todo-card-layout";
import { GET_TODO } from "@/graphql/todo/queries";
import { Button } from "@/components/ui/button";
import {
  Filter,
  FilterX,
  ListFilter,
  ListFilterPlus,
  Plus,
} from "lucide-react";
import { AddTodo } from "./components/add-todo";
import { useEffect, useState } from "react";
import { Hint } from "@/components/hint";
import { motion, AnimatePresence } from "framer-motion";
import TodoFilterSection from "./components/todo-filter-section";

const TodoComponment = () => {
  const [isFilterOpened, setFilterOpened] = useState(true);
  const [getTodo, { loading, error, data, refetch }] = useLazyQuery(GET_TODO);
  const DEFAULT_QUERY = { by: "orgId" };
  const [query, setQuery] = useState(DEFAULT_QUERY);
  const [isFilterApplied, setIsFilterApplied] = useState(false);

  useEffect(() => {
    if(!query) return;
    getTodo({
      variables: {
        input: query,
      },
    });
  }, [query]);

  const handleFilterToggle = () => {
    setFilterOpened((prevState) => !prevState);
  };

  if (error) return `Error! ${error.message}`;

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex justify-between items-center">
        <AnimatePresence>
            <TodoFilterSection isFilterApplied={isFilterApplied} setIsFilterApplied={setIsFilterApplied} setQuery={setQuery} isFilterOpened={isFilterOpened} />
        </AnimatePresence>
        
          <div className="flex gap-x-8 items-center">
            {isFilterOpened ? (
              <Hint label="Hide Filters" side="left" sideOffset={10}>
                <ListFilter
                  className="h-6 w-6 cursor-pointer"
                  onClick={handleFilterToggle}
                />
              </Hint>
            ) : (
              <Hint label="Show Filters" side="left" sideOffset={10}>
                <ListFilterPlus
                  className="h-6 w-6 cursor-pointer"
                  onClick={handleFilterToggle}
                />
              </Hint>
            )}
            {data && data.getTodo.length > 0 && (
            <AddTodo refetchTodos={refetch} />
          )}
          </div>
      </div>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {loading ? 
            <div>Loading...</div> : 
            (data && data.getTodo.length > 0) ? (
              <ExpandableCardLayout data={data.getTodo} refetchTodos={refetch} />
            ) : 
            (
              <div className="w-full h-full flex flex-col gap-4 items-center">
              <p>No todo found. Get started by creating the todo</p>
              <AddTodo refetchTodos={refetch} />
              </div>
            )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default TodoComponment;
