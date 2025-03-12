 import { ColumnDef } from "@tanstack/react-table"
 import { Button } from "@/components/ui/button"

 import { MoreHorizontal } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.

export type Pole ={
    id: number,
    status: string,
    date: string,
    components:{},
}

export const columns: ColumnDef<Pole>[] = [
      {
        accessorKey: "id",
        header: "ID",
      },
      {
        accessorKey: "status",
        header: "Status",
      },
      {
        accessorKey: "date",
        header: () => <div className ="text-right">Date Created</div>,
        cell: ({row}) =>{
          const date = new Date(row.getValue("date"))
         
          let formatedDate = date.toLocaleDateString('en-US');
          return <div className = "text-right">{formatedDate}</div>
        }
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const payment = row.original
     
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => navigator.clipboard.writeText(payment.id)}
                >
                  Copy payment ID
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>View customer</DropdownMenuItem>
                <DropdownMenuItem>View Image details</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )
        },
      },


    
]