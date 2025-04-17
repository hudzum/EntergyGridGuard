import React from "react";
import { useEffect } from "react";
import { Table } from "@tanstack/react-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export function ColumnVisibilityToggle({ table }: { table: Table<any> }) {
  const defaultHiddenColumns = [
    'components_customer night lights_condition',
    'components_fault indicators_condition',
    'components_guy wires_condition',
    
  ];

  useEffect(() => {
    defaultHiddenColumns.forEach(columnId => {
      const column = table.getColumn(columnId);
      if (column) {
        column.toggleVisibility(false);
      }
    });
  }, [table]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="ml-auto">
          Edit Columns
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {table
          .getAllColumns()
          .filter((column) => column.getCanHide())
          .map((column) => (
            <DropdownMenuCheckboxItem
              key={column.id}
              className="capitalize"
              checked={column.getIsVisible()}
              onCheckedChange={(value) =>
                column.toggleVisibility(!!value)
              }
            >
              {column.id}
            </DropdownMenuCheckboxItem>
          ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}