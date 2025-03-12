import { useState } from "react";
import UploadProcessing from "../components/fileUploadComps/UploadProcessing";
import UploadResult from "../components/fileUploadComps/UploadResult";
import UploadFileDrop from "../components/fileUploadComps/UploadFileDrop";
import { Navbar } from "@/components/NavBar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
type Status = "upload" | "processing" | "result";

export default function UploadPage() {
  const [imageId, setImageId] = useState<number | null>(null);
  const [imageDetails, setImageDetails] = useState<{
    id: number;
    image: string;
    components: object;
    time_created: string;
  } | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("upload");
  

 

  const statusImages = {
    upload: "./uploadingImages/SelectFiles.png", // Placeholder for Upload
    processing: "./uploadingImages/Processing.png", // Placeholder for Processing
    result: "./uploadingImages/Results.png", // Placeholder for Result
  };

  return (
    <div className="min-h-screen bg-zinc-300 flex flex-col w-full ">
      <Navbar />

      <main className=" flex flex-col items-center  w-full px-4 py-8">
        <img src={statusImages[status]} alt="Status" className="w-150" />

        <Card className="bg-zinc-50 m-19 p-10 border-violet-700 border-l-5 w-200">
          Goo Goo Gaa Gaa 5
          {status === "upload" && (
            <>
              {" "}
              <UploadFileDrop setImageId ={setImageId} setStatus = {setStatus}/>
            </>
          )}
          {status === "processing" && <UploadProcessing imageId = {imageId} setStatus = {setStatus} setImageDetails= {setImageDetails} setImageSrc={setImageSrc}/>}
          {status === "result" && <UploadResult imageDetails = {imageDetails} imageSrc = {imageSrc}/>}
        </Card>

      
      </main>
    </div>
  );
}
