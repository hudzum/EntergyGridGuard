import { ImageDown } from "lucide-react";
import { Button } from "../ui/button";
export default function UploadResult() {
  return (
    <div className="text-black  flex flex-col items-center justify-center space-y-4 p-8">
      <ImageDown className="h-24 w-24 text-violet-700" />

      <div className="text-lg font-semibold">
        {" "}
        
      </div>
      <Button id="upBut" className="bg-rose-500 text-white">
        Download Files
      </Button>
    </div>
  );
}
