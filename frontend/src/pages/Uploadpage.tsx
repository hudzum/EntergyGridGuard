import { useState } from "react";
import UploadProcessing from "../components/fileUploadComps/UploadProcessing";
import UploadResult from "../components/fileUploadComps/UploadResult";
import UploadFileDrop from "../components/fileUploadComps/UploadFileDrop";
import { Navbar } from "@/components/NavBar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
type Status = "upload" | "processing" | "result";

export default function UploadPage() {
  const [files, setFiles] = useState([]);

  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>("upload");
  const handleRealUpload = async () => {
    if (!files) {
      setMessage("No files added");
      return;
    }

    const formData = new FormData();

    files.forEach((file, index) => {
      formData.append(`file-${index}`, file);
    });

    try {
      const response = await fetch("http://localhost:80/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        setMessage(`✅ Upload successful! Saved as: ${data.filename}`);
        setStatus("processing");
      } else {
        setMessage(`❌ Upload failed: ${data.error}`);
      }
    } catch (error) {
      console.error("Error uploading files:", error);
      alert("Upload error");
    }
  };
  const handleUpload = () => {
    setStatus("processing");
    const element = document.querySelector("#upBut");
    if (element) {
      element.className = "hidden";
    }
    // Simulate processing
    setTimeout(() => {
      setStatus("result");
      
    }, 3200);
  };

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
          {status === "upload" && (
            <>
              {" "}
              <UploadFileDrop onUpload={handleUpload} />
            </>
          )}
          {status === "processing" && <UploadProcessing />}
          {status === "result" && <UploadResult />}
        </Card>

        <Button
          id="upBut"
          className="bg-rose-500 text-white"
          onClick={handleUpload}
        >
          Upload Files
        </Button>

      </main>
    </div>
  );
}
