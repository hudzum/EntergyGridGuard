import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from './ui/separator';
interface ImageTextDescriptionProps {
  imagePath?: string;
  initialTitle?: string;
  initialDescription?: string;
  onTitleChange?: (title: string) => void;
  onDescriptionChange?: (description: string) => void;
}

export const CarChild: React.FC<ImageTextDescriptionProps> = ({
  imagePath,
  initialTitle = '',
  initialDescription = '',
  onTitleChange,
  onDescriptionChange
}) => {
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    onTitleChange?.(newTitle);
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDescription = e.target.value;
    setDescription(newDescription);
    onDescriptionChange?.(newDescription);
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardContent className="grid md:grid-cols-2 gap-6 p-6">
        {/* Image Section */}
        <div className="flex items-center justify-center bg-gray-100 ">
          {imagePath ? (
            <img 
              src={imagePath} 
              alt="Description" 
              className="max-h-[400px] max-w-full object-contain"
            />
          ) : (
            <div className="text-gray-500 text-center p-6">
              No image selected
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="space-y-2 text-black font-bold">
            <Label className = "text-black font-bold" htmlFor="title" >{title}</Label>
          </div>
          <Separator className='bg-purple-500 '/>
          <div className="space-y-2">
            <Label className = "font-semibold" htmlFor="description">{description}</Label>
           
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CarChild;