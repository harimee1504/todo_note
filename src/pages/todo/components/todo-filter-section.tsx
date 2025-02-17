import React, { useEffect, useState } from "react";
import SingleSelect from "./filter/single-select-dropdown";
import { Button } from "@/components/ui/button";
import { FilterX } from "lucide-react";
import { Hint } from "@/components/hint";
import { GET_USERS_BY_ORG } from "@/graphql/user/queries";
import { useQuery } from "@apollo/client";

type Values = {
  by: string;
  value: string;
  label: string;
};

const status: Values[] = [
  {
    by: "status",
    value: "notStarted",
    label: "Not Started",
  },
  {
    by: "status",
    value: "active",
    label: "Active",
  },
  {
    by: "status",
    value: "onHold",
    label: "On Hold",
  },
  {
    by: "status",
    value: "overdue",
    label: "Overdue",
  },
  {
    by: "status",
    value: "completed",
    label: "Completed",
  },
];

const TodoFilterSection = ({
  isFilterApplied,
  setIsFilterApplied,
  isFilterOpened,
  setQuery,
}: {
  isFilterApplied: boolean;
  setIsFilterApplied: React.Dispatch<React.SetStateAction<boolean>>;
  isFilterOpened: boolean;
  setQuery: React.Dispatch<React.SetStateAction<any>>;
}) => {
  const DEFAULT_QUERY = { by: "orgId" };
  const [selectedValues, setSelectedValues] =
    React.useState<Values | null>(null);

  const { data: user_data, loading } = useQuery(GET_USERS_BY_ORG);

  return (
    <div>
      {!loading && isFilterOpened ? (
        <div className="flex gap-x-2 items-center">
          <h3 className="font-semibold">Filter By</h3>
          <SingleSelect
            label="Status"
            by="status"
            values={status}
            selectedValues={selectedValues?.by === "status" ? selectedValues : null}
            setSelectedValues={setSelectedValues}
            setQuery={(query) => {
              setIsFilterApplied(true);
              setQuery(query);
            }}
          />
          <SingleSelect
            label="Created By"
            by="createdBy"
            values={user_data?.getUsersByOrg.map((item: any) => ({
              by: "createdBy",
              value: item.id,
              label: `${item.lastName}, ${item.firstName}`,
            }))}
            selectedValues={selectedValues?.by === "createdBy" ? selectedValues : null}
            setSelectedValues={setSelectedValues}
            setQuery={(query) => {
              setIsFilterApplied(true);
              setQuery(query);
            }}
          />
          <SingleSelect
            label="Assigned To"
            by="assignedTo"
            values={user_data?.getUsersByOrg.map((item: any) => ({
              by: "assignedTo",
              value: item.id,
              label: `${item.lastName}, ${item.firstName}`,
            }))}
            selectedValues={selectedValues?.by === "assignedTo" ? selectedValues : null}
            setSelectedValues={setSelectedValues}
            setQuery={(query) => {
              setIsFilterApplied(true);
              query.options.assignedTo = [query.options.assignedTo]
              setQuery(query);
            }}
          />
          <SingleSelect
            label="Mentioned"
            by="mentions"
            values={user_data?.getUsersByOrg.map((item: any) => ({
              by: "mentions",
              value: item.id,
              label: `${item.lastName}, ${item.firstName}`,
            }))}
            selectedValues={selectedValues?.by === "mentions" ? selectedValues : null}
            setSelectedValues={setSelectedValues}
            setQuery={(query) => {
              setIsFilterApplied(true);
              setQuery(query);
            }}
          />
          <Hint label="Clear Filter" side="right">
            {isFilterApplied && (
              <Button
                variant={"outline"}
                onClick={() => {
                  setSelectedValues(null);
                  setQuery(DEFAULT_QUERY);
                  setIsFilterApplied(false);
                }}
              >
                <FilterX />
                Clear Filter
              </Button>
            )}
          </Hint>
        </div>
      ) : (
        <></>
      )}
    </div>
  );
};

export default TodoFilterSection;
