import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";

import { MoreHorizontal, ArrowUpDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {useEffect, useLayoutEffect, useRef} from "react";

const getConditionColor = (condition: string) => {
  switch (condition.toLowerCase()) {
    case 'good':
      return 'bg-green-500';
    case 'fair':
      return 'bg-yellow-500';
    case 'poor':
      return 'bg-orange-500';
    case 'bad':
      return 'bg-red-500';
    default:
      return 'bg-gray-500';
  }
};

type ComponentDetails = {
  quantity: number;
  condition: string;
  description: string;
};

export type Pole = {
  id: number;
  status: string;
  date: string;
  components: {
    pole?: ComponentDetails;
    crossarms?: ComponentDetails;
    transformers?: ComponentDetails;
    'primary wires'?: ComponentDetails;
    'guy wires'?: ComponentDetails;
    'street lights'?: ComponentDetails;
    'customer night lights'?: ComponentDetails;
    insulators?: ComponentDetails;
    capacitors?: ComponentDetails;
    'fault indicators'?: ComponentDetails;
  };
  thumbnail?: string;
};

const createComponentColumn = (componentName: keyof Pole['components']) => ({
  accessorKey: `components.${componentName}.condition`,
  header: componentName.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
  cell: ({ row }) => {
    const componentData = row.original.components[componentName];
    if (!componentData) return <div>-</div>;
    
    return (
      <div className="flex items-center space-x-2">
        <Badge className={getConditionColor(componentData.condition)}>
          {componentData.condition}
        </Badge>
        <span className="text-xs text-gray-500">
          (Qty: {componentData.quantity})
        </span>
      </div>
    );
  },
  size: 150,
});

export const columns: ColumnDef<Pole>[] = [
  {
    accessorKey: "id",
    header: "ID",
    size: 10,
  },
  {
    accessorKey: "thumbnail",
    header: "Image",
    cell: ({ row }) => {
      const thumbnail = row.original.thumbnail;
      if (!thumbnail) return <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">No image</div>;
      
      return (
        <div className="relative group">
          <img 
            src={`data:image/jpeg;base64,${thumbnail}`} 
            alt={`Pole ${row.original.id} thumbnail`}
            className="w-12 h-12 object-cover rounded cursor-pointer"
          />
          <div className="absolute hidden group-hover:block top-0 left-0 z-10" style={{width: 500}}>
            <div className="grid grid-cols-2 gap-2">
              <img src={`/api/images/${row.original.id}/data`} style={{width: '100%', height: '100%'}}/>
              <div style={{position: 'relative', width: '100%', height: '100%'}}>
                <img src={`/api/images/${row.original.id}/data`} />
                <p style={{textAlign: 'left', top: 0, left: 0, width: '100%', lineHeight: '12px', textTransform: 'capitalize', height: '100%', position: 'absolute', padding: 5, color: 'orange', textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000', fontWeight: 'bold'}}>
                  {Object.entries(row.original.components).filter(([, data]) => data.quantity > 0).map(([name, data]) => (
                      <>
                        <span style={{margin: 0, }}>{name} ({data.quantity}) - </span>
                        <span style={{margin: 0, color: ({bad: 'oklch(0.637 0.237 25.331)', good: 'oklch(0.723 0.219 149.579)', unknown: 'oklch(0.551 0.027 264.364)'}[data.condition] ?? 'white')}}>{data.condition}</span>
                        <br />
                        <span style={{margin: '0 0 0 20px', fontSize: 8}}>{data.description}</span>
                        <br />
                      </>
                  ))}
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    },
    size: 100,
  },
  {
    accessorKey: "status",
    header: "Status",
    size: 50,
  },
  {
    accessorKey: "date",
    header: ({ column }) => (
      <div 
        className="flex items-center justify-end cursor-pointer" 
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Date Created
        <ArrowUpDown className="ml-1 h-3 w-3" />
      </div>
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue("date"));
      return <div className="text-right">{date.toLocaleDateString("en-US")}</div>;
    },
    size: 50, 
    maxSize: 50,
  },

  createComponentColumn('pole'),
  createComponentColumn('crossarms'),
  createComponentColumn('transformers'),
  createComponentColumn('primary wires'),
  createComponentColumn('guy wires'),
  createComponentColumn('street lights'),
  createComponentColumn('customer night lights'),
  createComponentColumn('insulators'),
  createComponentColumn('capacitors'),
  createComponentColumn('fault indicators'),
  {
    id: "actions",
    cell: ({ row }) => {
      const pole = row.original;

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
              onClick={() => navigator.clipboard.writeText(pole.id.toString())}
            >
              Copy Pole ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />

            <Dialog className = "max-h-[80vh] overflow-scroll">
              <DialogTrigger asChild>
                <span className="">View Image details</span>
              </DialogTrigger>
              <DialogContent className="sm:max-w-2xl ">
                <DialogHeader>
                  <DialogTitle>Component Status for Pole #{pole.id}</DialogTitle>
                  <DialogDescription>
                    Detailed overview of all components and their current status.
                  </DialogDescription>
                </DialogHeader>

                <Card className="w-full shadow">
                  <CardTitle className="text-xl font-bold text-center">
                    Components Status Pole #{pole.id}
                  </CardTitle>

                  <CardContent className="p-6">
                    <div className="grid grid-cols-2 gap-2">
                      <img src={`/api/images/${pole.id}/data`} style={{width: '100%', height: '100%'}}/>
                      <div style={{position: 'relative', width: '100%', height: '100%'}}>
                        <img src={`/api/images/${pole.id}/data`} />
                        <p style={{top: 0, left: 0, width: '100%', lineHeight: '12px', textTransform: 'capitalize', height: '100%', position: 'absolute', padding: 5, color: 'orange', textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000', fontWeight: 'bold'}}>
                          {Object.entries(pole.components).filter(([, data]) => data.quantity > 0).map(([name, data]) => (
                              <>
                                <span style={{margin: 0, }}>{name} ({data.quantity}) - </span>
                                <span style={{margin: 0, color: ({bad: 'oklch(0.637 0.237 25.331)', good: 'oklch(0.723 0.219 149.579)', unknown: 'oklch(0.551 0.027 264.364)'}[data.condition] ?? 'white')}}>{data.condition}</span>
                                <br />
                                <span style={{margin: '0 0 0 20px', fontSize: 8}}>{data.description}</span>
                                <br />
                              </>
                          ))}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {pole.components && Object.entries(pole.components).map(([name, data]) => (
                        <Card key={name} className="overflow-hidden">
                          <div className="p-4 border-b bg-slate-50 flex justify-between items-center">
                            <h3 className="font-medium capitalize">{name}</h3>
                            <Badge className={getConditionColor(data.condition)}>
                              {data.condition}
                            </Badge>
                          </div>
                          <div className="p-4 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-500">Quantity:</span>
                              <span className="font-semibold">{data.quantity}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-500">Description:</span>
                              <span className="text-sm mt-1">{data.description}</span>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <DialogFooter>
                  <Button type="button">Close</Button>
                  <Button type="button" variant="outline">Generate Report</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
    size: 200,
  },
  
];