import { ImageDown } from "lucide-react";
import { Button } from "../ui/button";
import React from 'react';
import { CardContent, CardHeader,Card,CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";

export default function UploadResult ({ imageDetails, imageSrc}) {

  const getConditionColor = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'good':
        return 'bg-green-500';
      case 'fair':
        return 'bg-yellow-500';
      case 'poor':
        return 'bg-orange-500';
      case 'critical':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };
  return (
    
    <div className="flex flex-col items-center justify-center space-y-6 p-8">
     
      
      <div className="text-lg font-semibold">
        <h2 className="text-2xl font-bold text-center mb-4">Image {imageDetails.id} Details</h2>
        <img 
          src={imageSrc} 
          alt={`Image ${imageDetails.id}`} 
          className="rounded-lg shadow-md mb-6 max-w-full h-auto"
          width="400" 
        />
      </div>
      
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader className="bg-slate-50 border-b">
          <CardTitle className="text-xl">Components</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(imageDetails.components).map(([name, data]) => (
              <Card key={name} className="overflow-hidden">
                <div className="p-4 border-b bg-slate-50 flex justify-between items-center">
                  <h3 className="font-medium capitalize">{name}</h3>
                  <Badge className={`${getConditionColor(data.condition)}`}>
                    {data.condition}
                  </Badge>
                </div>
                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Quantity:</span>
                    <span className="font-semibold">{data.quantity}</span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Description:</span>
                    <p className="text-sm mt-1">{data.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <p className="text-sm text-gray-500">
        <strong>Created At:</strong> {new Date(imageDetails.time_created).toLocaleString()}
        
      </p>
      
      
    </div>
  );
}
