import React, { useState, useRef, ChangeEvent } from "react";
import { useDropzone, FileRejection, Accept } from "react-dropzone";
import { Upload } from "lucide-react";
import { Button } from "../ui/button";

interface UploadResponse {
  message?: string;
  error?: string;
  image_id?: string;
}

export default function UploadFileDrop({setImageId, setStatus}): JSX.Element {
  const hiddenInputRef = useRef<HTMLInputElement | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [message, setMessage] = useState<string>("");

  const handleUpload = async (): Promise<void> => {
    if (files.length === 0) {
      setMessage("Please select at least one file first!");
      return;
    }

    const formData = new FormData();
    files.forEach((file) => {
      formData.append("file", file);
    });

    try {
      setStatus("processing")
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data: UploadResponse = await response.json();
      if (response.ok) {
        setMessage(`✅ Upload successful! Saved ${files.length} file(s)`);
        console.log("Printing Data")
        console.log(data);
        console.log("ImageID is this:", data.image_id);
        setImageId(data.image_id)
        
      } else {
        setMessage(`❌ Upload failed: ${data.error || "Unknown error"}`);
      }
    } catch (error) {
      setMessage(`❌ Error: ${error instanceof Error ? error.message : "Unknown error occurred"}`);
    }
  };

  const { getRootProps, getInputProps, open, acceptedFiles } = useDropzone({
    onDrop: (incomingFiles: File[], fileRejections: FileRejection[]) => {
      setFiles(incomingFiles);
      
      // Handle file rejections if needed
      if (fileRejections.length > 0) {
        setMessage(`Some files were rejected: ${fileRejections.map(r => r.file.name).join(', ')}`);
      }
      
      // Update the hidden input if needed
      if (hiddenInputRef.current) {
        const dataTransfer = new DataTransfer();
        incomingFiles.forEach((file) => {
          dataTransfer.items.add(file);
        });
        hiddenInputRef.current.files = dataTransfer.files;
      }
    },
    multiple: true,
    maxFiles: 20,
    accept: {
      "image/*": [".png", ".jpeg", ".jpg"],
    } as Accept,
  });

  const fileItems = acceptedFiles.map((file: File) => (
    <li key={file.name} className="text-sm text-gray-700">
      📄 {file.name} - {(file.size / 1024).toFixed(2)} KB
    </li>
  ));

  return (
    <div className="container">
      <div
        {...getRootProps()}
        className="border-2 border-dashed border-blue-500 rounded-lg p-6 text-center cursor-pointer hover:bg-blue-50"
      >
        <Upload className="w-12 h-12 mb-4 mx-auto text-gray-600" />
        <input {...getInputProps()} ref={hiddenInputRef} />
        <p className="text-gray-600">
          Drag & drop some files here or{" "}
          <span className="text-blue-500 underline">click to select</span>.
        </p>
      </div>
      
      {acceptedFiles.length > 0 && (
        <aside className="mt-4">
          <h4 className="text-lg font-semibold text-gray-800">
            Files Selected
          </h4>
          <ul className="list-disc pl-5 mt-1">{fileItems}</ul>
        </aside>
      )}
      
      <div className="mt-4">
     
        <Button onClick={handleUpload} className="mr-2 bg-rose-500 text-white">Upload Files</Button>
        {message && <p className="mt-2">{message}</p>}
      </div>
    </div>
  );
}